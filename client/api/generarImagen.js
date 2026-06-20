// client/api/generarImagen.js
// Genera la imagen real del post a partir del visual_prompt, usando los
// modelos de generación de imagen de Gemini ("Nano Banana"), con cascada
// de respaldo igual que generarPost.js.

// IMPORTANTE: "gemini-3.1-flash-image" (sin "-preview") NO existe — por eso
// fallaba. El nombre real del modelo es "gemini-3.1-flash-image-preview".
// "gemini-2.0-flash-preview-image-generation" fue retirado por Google y se
// reemplaza por "gemini-3-pro-image-preview" (Nano Banana Pro) como tercer
// respaldo de mayor calidad. Verificado contra la documentación oficial de
// Gemini API (ai.google.dev/gemini-api/docs/image-generation), junio 2026.
const MODELOS_IMAGEN = [
  "gemini-2.5-flash-image",          // Nano Banana — rápido y económico
  "gemini-3.1-flash-image-preview",  // Nano Banana 2 — más nuevo, respaldo
  "gemini-3-pro-image-preview",      // Nano Banana Pro — mayor calidad, último respaldo
];

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { prompt, aspectRatio, images } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "El campo 'prompt' es requerido." });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "La IA no está configurada. Agrega GEMINI_API_KEY en Vercel → Settings → Environment Variables.",
    });
  }

  // Construimos las partes: el texto primero, y luego las imágenes de
  // referencia (foto real del paciente y/o logo corporativo) en base64.
  // Pasarlas como "objetos de alta fidelidad" hace que el modelo las use
  // tal cual en vez de inventar una versión genérica del logo o la foto.
  const parts = [{ text: prompt }];
  if (Array.isArray(images)) {
    for (const dataUrl of images) {
      if (typeof dataUrl !== "string") continue;
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
      if (match) {
        parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
      }
    }
  }

  let ultimoError = "Los modelos de imagen están ocupados en este momento.";

  for (const modelo of MODELOS_IMAGEN) {
    console.log(`[generarImagen] Intentando con modelo: ${modelo}`);

    try {
const response = await fetch(
  `${GEMINI_BASE}/${modelo}:generateContent`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts,
        },
      ],
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        ultimoError = data?.error?.message || `Error ${response.status}`;
        console.warn(`[${modelo}] Falló: ${ultimoError}`);
        continue; // probar siguiente modelo
      }

      const respuestaParts = data?.candidates?.[0]?.content?.parts || [];
      const imagePart = respuestaParts.find((p) => p.inline_data || p.inlineData);
      const inline = imagePart?.inline_data || imagePart?.inlineData;

      if (!inline?.data) {
        ultimoError = "La IA no devolvió ninguna imagen.";
        continue;
      }

      const mime = inline.mime_type || inline.mimeType || "image/png";
      return res.status(200).json({
        image: `data:${mime};base64,${inline.data}`,
        _modelo: modelo,
      });
    } catch (err) {
      console.error(`[${modelo}] Error de red:`, err.message);
      ultimoError = "Error de conexión con la IA.";
    }
  }

  return res.status(503).json({
    error: `No se pudo generar la imagen en este momento. (${ultimoError})`,
  });
}
