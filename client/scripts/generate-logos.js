// scripts/generate-logos.js
// Corre ANTES del build de Vite (prebuild).
// Lee client/public/logos/ y escribe client/public/logos.json
// Vercel ejecuta: node scripts/generate-logos.js && vite build

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const LOGOS_DIR   = path.join(__dirname, '..', 'public', 'logos');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'logos.json');

const FORMATOS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];

function detectarTipo(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('blanco') || n.includes('white'))                       return 'claro';
  if (n.includes('negro') || n.includes('black') || n.includes('dark')) return 'oscuro';
  if (n.includes('firma'))                                               return 'firma';
  if (n.includes('isotipo') || n.includes('simbolo') || n.includes('icono')) return 'isotipo';
  if (n.includes('horizontal'))                                          return 'horizontal';
  if (n.includes('plantilla'))                                           return 'plantilla';
  return 'general';
}

function generarLabel(archivo) {
  return archivo
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function posicionPorTipo(tipo) {
  if (tipo === 'isotipo') return 'top-right';
  if (tipo === 'firma')   return 'bottom-right';
  return 'bottom-center';
}

function usoPorTipo(tipo) {
  const mapa = {
    claro:      'Sobre fondos oscuros',
    oscuro:     'Sobre fondos claros',
    firma:      'Firma o pie de imagen',
    isotipo:    'Esquina, sello o marca de agua',
    horizontal: 'Cabecera o banner horizontal',
    plantilla:  'Fondo de plantilla',
    general:    'Uso general',
  };
  return mapa[tipo] || 'Uso general';
}

const ORDEN_TIPO = { isotipo: 0, claro: 1, oscuro: 2, firma: 3, horizontal: 4, general: 5, plantilla: 6 };

// ── Leer carpeta ────────────────────────────────────────────────────────────
if (!fs.existsSync(LOGOS_DIR)) {
  console.warn(`[generate-logos] Carpeta no encontrada: ${LOGOS_DIR}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ logos: [] }, null, 2));
  process.exit(0);
}

const archivos = fs.readdirSync(LOGOS_DIR).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return FORMATOS.includes(ext) && !f.startsWith('.') && f !== 'README.md';
});

const logos = archivos
  .map((archivo, i) => {
    const ext  = path.extname(archivo).toLowerCase().replace('.', '');
    const tipo = detectarTipo(archivo);
    return {
      id:       `logo-${i}`,
      label:    generarLabel(archivo),
      file:     `/logos/${encodeURIComponent(archivo)}`,
      fileRaw:  archivo,
      ext,
      tipo,
      usage:    usoPorTipo(tipo),
      position: posicionPorTipo(tipo),
    };
  })
  .sort((a, b) => (ORDEN_TIPO[a.tipo] ?? 9) - (ORDEN_TIPO[b.tipo] ?? 9));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ logos }, null, 2));
console.log(`[generate-logos] ✓ ${logos.length} logos → public/logos.json`);
