// client/api/generarPost.js
// Gemini 2.5 Flash — Multimodal + 3 variantes de caption

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

  const tonosDescripcion = {
    casual:     "amigable, cercano, como si hablaras con un amigo. Usa lenguaje natural latinoamericano.",
    formal:     "profesional, serio, para una empresa o marca corporativa.",
    humor:      "gracioso, con un toque de humor, sin ser vulgar.",
    inspirador: "motivador, positivo, que genere emoción y querer actuar.",
  };

  const tonoTexto = tonosDescripcion[tono] || tonosDescripcion.formal;
  const hayImagenes = Array.isArray(images) && images.length > 0;

  // ── INSTRUCCIÓN CRÍTICA DE FOTOGRAFÍA REAL ──────────────────────────────
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
  "variants": [
    "Caption opción 1 — directo y claro, máx 220 caracteres, 2 emojis máx",
    "Caption opción 2 — emocional y aspiracional, máx 220 caracteres, 2 emojis máx",
    "Caption opción 3 — educativo con dato de valor, máx 220 caracteres, 2 emojis máx"
  ],
  "visual_prompt": "${hayImagenes
    ? "Descripción en inglés (60-90 palabras) de cómo usar la foto real adjunta como base. Indicar: mantener la fotografía original sin retoques digitales agresivos, construir composición con overlay tipográfico premium, paleta dorada y turquesa sutil, logo corporativo en esquina inferior derecha como marca de agua discreta a 15% opacidad. El resultado debe verse como fotografía clínica auténtica con diseño editorial superpuesto, no como imagen de stock."
    : "Descripción en inglés (60-90 palabras) para generador de imágenes. Estética clínica premium con paleta dorada y turquesa. Logo corporativo en esquina inferior derecha como marca de agua discreta."
  }",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "compliance_notes": "Observaciones legales o éticas relevantes para odontología colombiana, o null"
}

Reglas generales:
- Las 3 variantes deben diferir en tono y estructura
- Hashtags populares en odontología latinoamericana
- No mencionar que el contenido fue generado por IA
- SOLO responde con el JSON válido`;

  // ── CONSTRUIR PARTES DEL MENSAJE (multimodal) ───────────────────────────
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

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.82,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de Gemini API:", data);
      return res.status(500).json({
        error: `Error de la IA: ${data.error?.message || JSON.stringify(data)}`,
      });
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!responseText) {
      return res.status(500).json({ error: "La IA no devolvió una respuesta válida." });
    }

    let postData;
    try {
      const clean = responseText.replace(/```json|```/g, "").trim();
      postData = JSON.parse(clean);
    } catch (_) {
      console.error("JSON parse error:", responseText);
      return res.status(500).json({ error: "La IA devolvió un formato inválido. Intenta de nuevo." });
    }

    if (!Array.isArray(postData.variants) || postData.variants.length === 0) {
      return res.status(500).json({ error: "La IA devolvió datos incompletos." });
    }

    return res.status(200).json(postData);

  } catch (err) {
    console.error("Error de red:", err);
    return res.status(500).json({ error: "No se pudo conectar con la IA. Intenta de nuevo." });
  }
}
