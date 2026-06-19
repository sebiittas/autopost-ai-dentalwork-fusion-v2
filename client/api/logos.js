// client/api/logos.js
// Escanea client/public/logos/ y devuelve todos los archivos de imagen disponibles

import fs from 'fs';
import path from 'path';

// Formatos de imagen que se pueden mostrar en el navegador
const FORMATOS_SOPORTADOS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];

// Detectar el tipo de logo según el nombre del archivo
function detectarTipo(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('blanco') || n.includes('white') || n.includes('blanca')) return 'claro';
  if (n.includes('negro') || n.includes('black') || n.includes('negra') || n.includes('dark')) return 'oscuro';
  if (n.includes('firma')) return 'firma';
  if (n.includes('isotipo') || n.includes('simbolo') || n.includes('símbolo') || n.includes('icono') || n.includes('ícono')) return 'isotipo';
  if (n.includes('horizontal')) return 'horizontal';
  if (n.includes('plantilla')) return 'plantilla';
  return 'general';
}

// Generar un label legible a partir del nombre de archivo
function generarLabel(nombreArchivo) {
  return nombreArchivo
    .replace(/\.[^.]+$/, '')           // quitar extensión
    .replace(/[-_]/g, ' ')            // guiones y guiones bajos → espacios
    .replace(/\s+/g, ' ')             // espacios múltiples → uno
    .trim();
}

// Posición sugerida según tipo
function posicionPorTipo(tipo) {
  switch (tipo) {
    case 'isotipo': return 'top-right';
    case 'firma':   return 'bottom-right';
    default:        return 'bottom-center';
  }
}

// Uso sugerido según tipo
function usoPorTipo(tipo) {
  switch (tipo) {
    case 'claro':      return 'Sobre fondos oscuros';
    case 'oscuro':     return 'Sobre fondos claros';
    case 'firma':      return 'Firma o pie de imagen';
    case 'isotipo':    return 'Esquina, sello o marca de agua';
    case 'horizontal': return 'Cabecera o banner horizontal';
    case 'plantilla':  return 'Fondo de plantilla';
    default:           return 'Uso general';
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // En Vercel, public/ está en la raíz del proyecto cliente
    // En desarrollo, __dirname apunta a client/api/
    const posiblesRutas = [
      path.join(process.cwd(), 'public', 'logos'),
      path.join(process.cwd(), 'client', 'public', 'logos'),
      path.join(__dirname, '..', 'public', 'logos'),
    ];

    let carpetaLogos = null;
    for (const ruta of posiblesRutas) {
      if (fs.existsSync(ruta)) {
        carpetaLogos = ruta;
        break;
      }
    }

    if (!carpetaLogos) {
      return res.status(200).json({ logos: [], advertencia: 'Carpeta /public/logos no encontrada' });
    }

    const archivos = fs.readdirSync(carpetaLogos);

    const logos = archivos
      .filter(archivo => {
        const ext = path.extname(archivo).toLowerCase();
        return FORMATOS_SOPORTADOS.includes(ext) && !archivo.startsWith('.');
      })
      .map((archivo, index) => {
        const tipo = detectarTipo(archivo);
        const ext = path.extname(archivo).toLowerCase();
        // Encode para URLs seguras pero manteniendo legibilidad
        const fileEncoded = encodeURIComponent(archivo);
        return {
          id: `logo-${index}`,
          label: generarLabel(archivo),
          file: `/logos/${fileEncoded}`,
          fileRaw: archivo,
          ext: ext.replace('.', ''),
          tipo,
          usage: usoPorTipo(tipo),
          position: posicionPorTipo(tipo),
        };
      })
      .sort((a, b) => {
        // Ordenar: isotipo > claro > oscuro > firma > general > plantilla
        const orden = { isotipo: 0, claro: 1, oscuro: 2, firma: 3, horizontal: 4, general: 5, plantilla: 6 };
        return (orden[a.tipo] ?? 9) - (orden[b.tipo] ?? 9);
      });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json({ logos });
  } catch (err) {
    console.error('Error escaneando logos:', err);
    return res.status(500).json({ error: 'No se pudieron cargar los logos', detalle: err.message });
  }
}
