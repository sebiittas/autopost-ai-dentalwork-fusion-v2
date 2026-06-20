// client/api/generarPost.js
// Gemini 2.5 Flash — con reintentos automáticos y modelo de respaldo

// ── MODELOS en orden de preferencia ─────────────────────────────────────────
// IMPORTANTE: gemini-1.5-flash, gemini-2.0-flash y gemini-2.0-flash-lite
// fueron retirados por Google (shut down) — ya no existen en v1beta.
// "gemini-3.5-flash" NO es un nombre de modelo público confirmado en la
// documentación oficial de Gemini API — se quitó para evitar otro 404.
// Lista verificada contra ai.google.dev/gemini-api/docs/models (junio 2026).
const MODELOS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
];

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_REINTENTOS = 2;      // reintentos por modelo ante 503/429
const ESPERA_MS      = 1500;   // espera entre reintentos

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Llamada a un modelo específico ──────────────────────────────────────────
async function llamarGemini(modelo, parts, apiKey) {
  const url = `${GEMINI_BASE}/${modelo}:generateContent`;
  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.82,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1500,
    },
  };

  for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) return { ok: true, data };

    const status  = res.status;
    const mensaje = data?.error?.message || "";

    // 503 / 429 → modelo saturado, reintentar o pasar al siguiente
    if ((status === 503 || status === 429) && intento < MAX_REINTENTOS) {
      console.warn(`[${modelo}] intento ${intento} → ${status}. Esperando ${ESPERA_MS}ms...`);
      await sleep(ESPERA_MS);
      continue;
    }

    // Otro error → no reintentar este modelo
    return { ok: false, status, mensaje };
  }

  return { ok: false, status: 503, mensaje: "Modelo sin respuesta tras reintentos" };
}

// ── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { tema, tono, contexto, images } = req.body;

  if (!tema || typeof tema !== "string" || tema.trim().length === 0) {
    return res.status(400).json({ error: "El campo 'tema' es requerido." });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "La IA no está configurada. Agrega GEMINI_API_KEY en Vercel → Settings → Environment Variables.",
    });
  }

  // ── Prompt ────────────────────────────────────────────────────────────────
  const tonosDescripcion = {
    casual:     "amigable, cercano, como si hablaras con un amigo. Usa lenguaje natural latinoamericano.",
    formal:     "profesional, serio, para una empresa o marca corporativa.",
    humor:      "gracioso, con un toque de humor, sin ser vulgar.",
    inspirador: "motivador, positivo, que genere emoción y querer actuar.",
  };

  const tonoTexto   = tonosDescripcion[tono] || tonosDescripcion.formal;
  const hayImagenes = Array.isArray(images) && images.length > 0;

  const instruccionFoto = hayImagenes ? `
INSTRUCCIÓN CRÍTICA SOBRE LAS IMÁGENES ADJUNTAS:
Las imágenes enviadas son fotografías clínicas REALES tomadas en el consultorio.
Son el activo más importante del post. El visual_prompt debe construir la composición
ALREDEDOR de esa foto real, no reemplazarla ni generar una imagen artificial similar.

Reglas absolutas para el visual_prompt cuando hay fotos reales:
- Describir la foto real como el elemento central de la composición
- Indicar que se debe usar "as-is" o con ajuste mínimo de luz/contraste natural
- NUNCA sugerir retoques agresivos, piel perfecta digital, dientes excesivamente blancos o artificiales
- El aspecto debe ser clínico-real, no publicitario artificial
- Se puede agregar: fondo con gradiente sutil, tipografía superpuesta, logo en esquina, overlay de color ligero (máx 10% opacidad)
- El resultado final debe verse como una foto real bien encuadrada, no como un render 3D o publicidad de stock
- Estilo: "editorial dental real", "fotografía clínica auténtica con diseño premium superpuesto"
` : "";

  const prompt = `Eres un experto en marketing dental premium para redes sociales en español latinoamericano.

Tema: "${tema.trim()}"
${contexto ? `Contexto: ${contexto}` : ""}
Tono: ${tonoTexto}
${hayImagenes ? `Imágenes de referencia clínica adjuntas: ${images.length}. Analízalas cuidadosamente.` : ""}

${instruccionFoto}

Devuelve EXACTAMENTE este JSON (sin markdown ni bloques de código):
{
  "caption": "Un único caption final, listo para publicar — máx 220 caracteres, 2 emojis máx, tono ${tono}",
  "visual_prompt": "${hayImagenes
    ? "Descripción en inglés (60-90 palabras) de cómo usar la foto real adjunta como base. Indicar: mantener la fotografía original sin retoques digitales agresivos, construir composición con overlay tipográfico premium, paleta dorada y turquesa sutil, logo corporativo en esquina inferior derecha como marca de agua discreta a 15% opacidad. El resultado debe verse como fotografía clínica auténtica con diseño editorial superpuesto, no como imagen de stock."
    : "Descripción en inglés (60-90 palabras) para generador de imágenes. Estética clínica premium con paleta dorada y turquesa. Logo corporativo en esquina inferior derecha como marca de agua discreta."
  }",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "compliance_notes": "Observaciones legales o éticas relevantes para odontología colombiana, o null"
}

Reglas generales:
- Un solo caption, definitivo, sin variantes ni opciones alternativas
- Hashtags populares en odontología latinoamericana
- No mencionar que el contenido fue generado por IA
- SOLO responde con el JSON válido`;

  // ── Construir partes del mensaje (multimodal) ────────────────────────────
  const parts = [];

  if (hayImagenes) {
    for (const dataUrl of images) {
      try {
        const [header, b64data] = dataUrl.split(",");
        const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
        parts.push({ inline_data: { mime_type: mimeType, data: b64data } });
      } catch (_) {
        // ignorar imágenes malformadas
      }
    }
  }

  parts.push({ text: prompt });

  // ── Iterar por modelos hasta encontrar uno disponible ───────────────────
  let ultimoError = "Todos los modelos de IA están ocupados en este momento.";

  for (const modelo of MODELOS) {
    console.log(`[generarPost] Intentando con modelo: ${modelo}`);
    let resultado;

    try {
      resultado = await llamarGemini(modelo, parts, GEMINI_API_KEY);
    } catch (err) {
      console.error(`[${modelo}] Error de red:`, err.message);
      ultimoError = "Error de conexión con la IA.";
      continue;
    }

    if (!resultado.ok) {
      console.warn(`[${modelo}] Falló con ${resultado.status}: ${resultado.mensaje}`);
      ultimoError = resultado.mensaje;
      continue; // probar siguiente modelo
    }

    // ✅ Respuesta exitosa
    const responseText =
      resultado.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!responseText) {
      ultimoError = "La IA no devolvió texto.";
      continue;
    }

    let postData;
    try {
      const clean = responseText.replace(/```json|```/g, "").trim();
      postData = JSON.parse(clean);
    } catch (_) {
      console.error(`[${modelo}] JSON inválido:`, responseText.slice(0, 200));
      ultimoError = "La IA devolvió un formato inválido.";
      continue;
    }

    if (!postData.caption || typeof postData.caption !== "string" || !postData.caption.trim()) {
      ultimoError = "La IA devolvió datos incompletos.";
      continue;
    }

    // Agregar qué modelo respondió (útil para debug)
    postData._modelo = modelo;
    return res.status(200).json(postData);
  }

  // Todos los modelos fallaron
  return res.status(503).json({
    error: `Los modelos de IA están saturados en este momento. Por favor intenta en unos segundos. (${ultimoError})`,
  });
}
