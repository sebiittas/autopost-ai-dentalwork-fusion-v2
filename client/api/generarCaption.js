// client/api/generarCaption.js
// Endpoint compatible que ahora usa Gemini internamente
// Devuelve { caption, visual_prompt, hashtags, compliance_notes } cuando el frontend lo solicita

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { tema, tono, extendido } = req.body;

  if (!tema || typeof tema !== "string" || tema.trim().length === 0) {
    return res.status(400).json({ error: "El campo 'tema' es requerido." });
  }

  const tonosValidos = ["casual", "formal", "humor", "inspirador"];
  if (!tono || !tonosValidos.includes(tono)) {
    return res.status(400).json({ error: "El 'tono' debe ser: casual, formal, humor o inspirador." });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "La IA no está configurada. Agrega GEMINI_API_KEY en Vercel → Settings → Environment Variables.",
    });
  }

  const tonosDescripcion = {
    casual: "amigable, cercano, como si hablaras con un amigo. Usa lenguaje natural latinoamericano.",
    formal: "profesional, serio, para una empresa o marca corporativa.",
    humor: "gracioso, con un toque de humor, sin ser vulgar.",
    inspirador: "motivador, positivo, que genere emoción y querer actuar.",
  };

  // Prompt base para caption simple
  const promptBase = `Eres un experto en marketing digital para redes sociales en español latinoamericano.

Genera un caption para Instagram/Twitter sobre este tema: "${tema.trim()}"

Tono: ${tonosDescripcion[tono]}

Reglas:
- Máximo 280 caracteres (ideal para Twitter/X e Instagram)
- Máximo 3 hashtags relevantes al final
- Escrito en español natural de Latinoamérica
- Sin emojis excesivos (máximo 2-3)
- No menciones que fuiste generado por IA
- Solo responde con el caption, sin explicaciones ni comillas`;

  // Prompt extendido para salida estructurada
  const promptExtendido = `Eres un experto en marketing digital para redes sociales en español latinoamericano.

Genera un post completo para Instagram/Twitter sobre este tema: "${tema.trim()}"

Tono: ${tonosDescripcion[tono]}

Devuelve EXACTAMENTE un JSON con esta estructura (sin markdown, sin comillas de bloque):
{
  "caption": "El caption del post (máximo 280 caracteres, máximo 3 hashtags al final)",
  "visual_prompt": "Descripción detallada de imagen para generar visualmente (en inglés, 50-80 palabras)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "compliance_notes": "Notas sobre cumplimiento normativo o consideraciones legales si aplica, o null si no hay"
}

Reglas:
- El caption debe sonar natural, sin mencionar que fue generado por IA
- Máximo 2-3 emojis en el caption
- Los hashtags deben ser relevantes y populares en Instagram/Twitter
- El visual_prompt debe ser descriptivo y en inglés para usar con generadores de imágenes
- Si no hay consideraciones de cumplimiento, compliance_notes debe ser null
- Responde SOLO con el JSON válido, sin explicaciones adicionales`;

  const prompt = extendido ? promptExtendido : promptBase;

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de Gemini API:", data);
      return res.status(500).json({ 
        error: `Error de la IA: ${data.error?.message || JSON.stringify(data)}` 
      });
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!responseText) {
      return res.status(500).json({ error: "La IA no devolvió una respuesta válida." });
    }

    // Si es modo simple, devolver solo el caption
    if (!extendido) {
      return res.status(200).json({ caption: responseText });
    }

    // Si es modo extendido, parsear JSON
    let postData;
    try {
      postData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error al parsear JSON de Gemini:", responseText);
      return res.status(500).json({ 
        error: "La IA devolvió un formato inválido. Intenta de nuevo." 
      });
    }

    // Validar estructura
    if (!postData.caption || !postData.visual_prompt || !Array.isArray(postData.hashtags)) {
      return res.status(500).json({ 
        error: "La IA devolvió datos incompletos." 
      });
    }

    return res.status(200).json(postData);
  } catch (err) {
    console.error("Error de red:", err);
    return res.status(500).json({ error: "No se pudo conectar con la IA. Intenta de nuevo." });
  }
}
