# Integración Gemini - AutoPost AI

## Resumen

Se ha reemplazado el motor de IA de **Groq** por **Google Gemini 2.0 Flash** en ambos endpoints de generación de contenido. La integración mantiene compatibilidad hacia atrás mientras añade capacidades estructuradas.

## Cambios Realizados

### 1. Limpieza de Restos de Pagos
- ✅ Eliminada sección de planes (Free/Starter/Pro) en `Landing.jsx`
- ✅ Eliminada sección comparativa de precios
- ✅ Actualizado texto de "Sin tarjeta de crédito" a "Acceso instantáneo"
- ✅ Verificado: No hay dependencias de Stripe en `package.json`

### 2. Build Validado
- ✅ Cliente: Build exitoso con Vite
- ✅ Dependencias: Firebase, React, React Router instaladas correctamente
- ✅ Advertencia de chunk size (821KB) - considerar code-splitting en futuro

### 3. Nuevos Endpoints

#### `/api/generarPost` (Nuevo)
Endpoint especializado para generación estructurada con salida JSON.

**Request:**
```json
{
  "tema": "Limpieza dental profesional",
  "tono": "formal",
  "contexto": "Promoción de servicios dentales" // opcional
}
```

**Response:**
```json
{
  "caption": "Mantén tu sonrisa radiante con nuestros servicios de limpieza profesional. #DentalCare #Salud #Sonrisa",
  "visual_prompt": "Professional dental clinic setting with dentist performing teeth cleaning on patient, bright white lighting, modern equipment, close-up of healthy smile",
  "hashtags": ["DentalCare", "Salud", "Sonrisa"],
  "compliance_notes": "Asegurar cumplimiento con regulaciones de publicidad médica en tu país"
}
```

#### `/api/generarCaption` (Actualizado)
Endpoint compatible que ahora usa Gemini internamente.

**Modo Simple (Compatibilidad):**
```json
{
  "tema": "Limpieza dental",
  "tono": "casual"
}
```

Response:
```json
{
  "caption": "¡Sonrisa limpia, vida feliz! 😁 Visita nuestro consultorio para una limpieza profesional. #Dental #Sonrisa"
}
```

**Modo Extendido (Nuevo):**
```json
{
  "tema": "Limpieza dental",
  "tono": "casual",
  "extendido": true
}
```

Response: (igual a `/api/generarPost`)
```json
{
  "caption": "...",
  "visual_prompt": "...",
  "hashtags": [...],
  "compliance_notes": "..."
}
```

## Configuración Requerida

### Variables de Entorno

En **Vercel** (o tu plataforma de deployment):

```
GEMINI_API_KEY=tu_api_key_aqui
```

**Cómo obtener la API Key:**
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crea una nueva API Key
3. Copia y pega en Vercel → Settings → Environment Variables

## Características de Gemini 2.0 Flash

- **Modelo**: `gemini-2.0-flash`
- **Velocidad**: Respuestas en <1s
- **Costo**: Muy económico (~$0.075 por millón de tokens)
- **Salida Estructurada**: Soporte nativo para JSON
- **Multimodal**: Preparado para futuras expansiones con imágenes

## Uso en Frontend

### Ejemplo: Generar Caption Simple
```javascript
const response = await fetch("/api/generarCaption", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    tema: "Limpieza dental", 
    tono: "casual" 
  }),
});
const { caption } = await response.json();
```

### Ejemplo: Generar Post Completo
```javascript
const response = await fetch("/api/generarPost", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    tema: "Limpieza dental", 
    tono: "casual",
    contexto: "Promoción de verano"
  }),
});
const { caption, visual_prompt, hashtags, compliance_notes } = await response.json();
```

### Ejemplo: Usar Modo Extendido de generarCaption
```javascript
const response = await fetch("/api/generarCaption", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    tema: "Limpieza dental", 
    tono: "casual",
    extendido: true  // ← Activa modo estructurado
  }),
});
const { caption, visual_prompt, hashtags, compliance_notes } = await response.json();
```

## Próximos Pasos Sugeridos

1. **Integración Visual**: Usar `visual_prompt` con API de generación de imágenes (ej: Replicate, Stability AI)
2. **Validación Compliance**: Implementar lógica para mostrar `compliance_notes` en UI
3. **Caché**: Guardar prompts generados para evitar llamadas repetidas
4. **Analytics**: Trackear qué tonos y temas generan mejor engagement
5. **A/B Testing**: Comparar Gemini vs otros modelos

## Troubleshooting

### Error: "GEMINI_API_KEY no está configurada"
→ Verifica que la variable de entorno esté en Vercel

### Error: "La IA devolvió un formato inválido"
→ El modelo a veces devuelve markdown. Intenta de nuevo o ajusta el prompt

### Error: "Respuesta vacía"
→ Posible timeout. Aumenta `maxOutputTokens` o reduce complejidad del prompt

## Compatibilidad

- ✅ Mantiene `/api/generarCaption` compatible
- ✅ Nuevo `/api/generarPost` para funcionalidad extendida
- ✅ Frontend puede elegir qué endpoint usar según necesidad
- ✅ Migración gradual sin breaking changes

## Notas de Desarrollo

- El backend de Firebase Functions aún usa Claude (puede migrarse después)
- Vercel API Routes es donde está la integración Gemini
- Considerar consolidar ambos backends en futuro
