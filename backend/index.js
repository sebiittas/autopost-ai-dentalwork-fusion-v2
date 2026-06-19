const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

setGlobalOptions({ maxInstances: 10 });

/**
 * 🤖 generarCaption
 * 
 * Cloud Function que llama a Claude API para generar captions de posts.
 * El frontend la llama con { tema: "...", tono: "casual|formal|humor|inspirador" }
 * y devuelve { caption: "texto generado" }
 * 
 * Para configurar la API key de Claude, ejecuta en terminal:
 *   firebase functions:secrets:set CLAUDE_API_KEY
 *   (pega tu API key cuando te la pida)
 */
exports.generarCaption = onCall({ secrets: ["CLAUDE_API_KEY"], invoker: "public" }, async (request) => {
  // 1. Verificar que el usuario esté autenticado
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión para usar esta función.");
  }

  const { tema, tono } = request.data;

  // 2. Validar los datos de entrada
  if (!tema || typeof tema !== "string" || tema.trim().length === 0) {
    throw new HttpsError("invalid-argument", "El campo 'tema' es requerido.");
  }

  if (!tono || !["casual", "formal", "humor", "inspirador"].includes(tono)) {
    throw new HttpsError("invalid-argument", "El campo 'tono' debe ser: casual, formal, humor o inspirador.");
  }

  // 3. Leer la API key desde los secretos de Firebase
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

  if (!CLAUDE_API_KEY) {
    logger.error("CLAUDE_API_KEY no está configurada en Firebase Secrets");
    throw new HttpsError(
      "internal",
      "La IA no está configurada aún. El administrador debe agregar la API key."
    );
  }

  // 4. Construir el prompt para Claude
  const tonosDescripcion = {
    casual: "amigable, cercano, como si hablaras con un amigo. Usa lenguaje natural latinoamericano.",
    formal: "profesional, serio, para una empresa o marca corporativa.",
    humor: "gracioso, con un toque de humor, sin ser vulgar.",
    inspirador: "motivador, positivo, que genere emoción y querer actuar.",
  };

  const prompt = `Eres un experto en marketing digital para redes sociales en español latinoamericano.

Genera un caption para Instagram/Twitter sobre este tema: "${tema.trim()}"

Tono: ${tonosDescripcion[tono]}

Reglas:
- Máximo 280 caracteres (ideal para Twitter/X e Instagram)
- Máximo 3 hashtags relevantes al final
- Escrito en español natural de Latinoamérica
- Sin emojis excesivos (máximo 2-3)
- No menciones que fuiste generado por IA
- Solo responde con el caption, sin explicaciones ni comillas`;

  // 5. Llamar a Claude API
  logger.info(`Generando caption para tema: "${tema}", tono: ${tono}`);

  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (fetchError) {
    logger.error("Error de red al llamar Claude API:", fetchError);
    throw new HttpsError("unavailable", "No se pudo conectar con la IA. Intenta de nuevo.");
  }

  const data = await response.json();

  if (!response.ok) {
    logger.error("Error de Claude API:", data);
    throw new HttpsError("internal", `Error de la IA: ${data.error?.message || "error desconocido"}`);
  }

  const caption = data.content?.[0]?.text?.trim();

  if (!caption) {
    throw new HttpsError("internal", "La IA no devolvió un caption válido.");
  }

  logger.info("Caption generado exitosamente");
  return { caption };
});
