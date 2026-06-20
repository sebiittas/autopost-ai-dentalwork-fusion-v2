// api/generarImagenPixazo.js
// Endpoint para generar imágenes usando Pixazo (Flux Schnell - FREE)
// Soporta polling asíncrono para obtener el resultado

const PIXAZO_API_KEY = process.env.PIXAZO_API_KEY;
const PIXAZO_GATEWAY = "https://gateway.pixazo.ai";
const MAX_POLLING_ATTEMPTS = 120; // 10 minutos (5 segundos x 120)
const POLLING_INTERVAL = 5000; // 5 segundos

/**
 * Espera hasta que la imagen esté lista usando polling
 * @param {string} requestId - ID de la solicitud retornado por Pixazo
 * @param {number} maxAttempts - Número máximo de intentos
 * @returns {Promise<{status: string, imageUrl?: string, error?: string}>}
 */
async function pollForCompletion(requestId, maxAttempts = MAX_POLLING_ATTEMPTS) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(
        `${PIXAZO_GATEWAY}/v2/requests/status/${requestId}`,
        {
          method: "GET",
          headers: {
            "Ocp-Apim-Subscription-Key": PIXAZO_API_KEY,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error al consultar estado de Pixazo:", data);
        return { status: "ERROR", error: data.error?.message || "Error desconocido" };
      }

      console.log(`[Polling ${attempts + 1}/${maxAttempts}] Estado: ${data.status}`);

      // Estados posibles: QUEUED, PROCESSING, COMPLETED, FAILED, ERROR
      if (data.status === "COMPLETED") {
        return {
          status: "COMPLETED",
          imageUrl: data.output?.media_url || data.output?.url,
        };
      }

      if (data.status === "FAILED" || data.status === "ERROR") {
        return {
          status: "ERROR",
          error: data.error?.message || `La generación falló: ${data.status}`,
        };
      }

      // Si aún está procesando, esperar y reintentar
      if (data.status === "QUEUED" || data.status === "PROCESSING") {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
        attempts++;
        continue;
      }

      // Estado desconocido
      return { status: "ERROR", error: `Estado desconocido: ${data.status}` };
    } catch (err) {
      console.error("Error de red durante polling:", err);
      return { status: "ERROR", error: "Error de conexión al verificar estado" };
    }
  }

  return {
    status: "ERROR",
    error: "Timeout: La imagen tardó demasiado en generarse",
  };
}

/**
 * Genera una imagen usando Pixazo Flux Schnell (FREE)
 * @param {string} prompt - Descripción de la imagen en inglés
 * @returns {Promise<{requestId: string, status: string, pollingUrl: string, imageUrl?: string, error?: string}>}
 */
async function generateImageWithPixazo(prompt) {
  if (!PIXAZO_API_KEY) {
    return {
      status: "ERROR",
      error: "PIXAZO_API_KEY no está configurada en variables de entorno",
    };
  }

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return { status: "ERROR", error: "El prompt no puede estar vacío" };
  }

  try {
    // Paso 1: Enviar solicitud de generación
    console.log(`Enviando solicitud a Pixazo con prompt: ${prompt.substring(0, 100)}...`);

    const generateResponse = await fetch(
      `${PIXAZO_GATEWAY}/flux-1-schnell/v1/getData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": PIXAZO_API_KEY,
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          num_steps: 4, // Flux Schnell es rápido, 4 pasos es suficiente
          height: 512,
          width: 512,
          seed: Math.floor(Math.random() * 1000000), // Seed aleatorio para variedad
        }),
      }
    );

    const generateData = await generateResponse.json();

    if (!generateResponse.ok) {
      console.error("Error de Pixazo en generación:", generateData);
      return {
        status: "ERROR",
        error: generateData.error?.message || "Error al generar imagen con Pixazo",
      };
    }

    // Pixazo puede devolver la imagen directamente (sync_mode=true) o un request_id
    // Si devuelve output.media_url directamente, retornar inmediatamente
    if (generateData.output?.media_url || generateData.output?.url) {
      return {
        status: "COMPLETED",
        imageUrl: generateData.output.media_url || generateData.output.url,
        requestId: generateData.request_id || "sync",
      };
    }

    // Si devuelve un request_id, usar polling
    const requestId = generateData.request_id;
    if (!requestId) {
      return {
        status: "ERROR",
        error: "Pixazo no retornó request_id ni imagen directa",
      };
    }

    console.log(`Request enviado a Pixazo. ID: ${requestId}`);

    // Paso 2: Hacer polling hasta que esté lista
    const pollResult = await pollForCompletion(requestId);

    if (pollResult.status === "COMPLETED") {
      return {
        status: "COMPLETED",
        imageUrl: pollResult.imageUrl,
        requestId: requestId,
      };
    }

    return {
      status: "ERROR",
      error: pollResult.error || "Error desconocido durante polling",
      requestId: requestId,
    };
  } catch (err) {
    console.error("Error de red al generar imagen con Pixazo:", err);
    return {
      status: "ERROR",
      error: "No se pudo conectar con Pixazo. Intenta de nuevo.",
    };
  }
}

/**
 * Handler de Vercel para generar imágenes
 * Endpoint: POST /api/generarImagenPixazo
 * Body: { visualPrompt: "..." }
 */
export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { visualPrompt } = req.body;

  // Validar entrada
  if (!visualPrompt || typeof visualPrompt !== "string" || visualPrompt.trim().length === 0) {
    return res.status(400).json({ error: "El campo 'visualPrompt' es requerido y no puede estar vacío." });
  }

  // Generar imagen
  const result = await generateImageWithPixazo(visualPrompt);

  // Retornar resultado
  if (result.status === "COMPLETED") {
    return res.status(200).json({
      status: "success",
      imageUrl: result.imageUrl,
      requestId: result.requestId,
    });
  }

  // Error
  return res.status(500).json({
    status: "error",
    error: result.error,
    requestId: result.requestId || null,
  });
}

// Exportar función para uso interno (si es necesario)
export { generateImageWithPixazo, pollForCompletion };
