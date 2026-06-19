import React, { useState, useEffect } from 'react';

const SERVICES_DATA = {
  'diseno de sonrisa': {
    title: 'Diseño de Sonrisa',
    copy: 'Enfoque en armonía facial, proporciones áureas y expectativas reales sin prometer resultados.',
    subtypes: [
      { id: 'resina', label: 'Resina de alta estética', chips: ['Capa a capa', 'Pulido espejo', 'Anatomía natural'] },
      { id: 'ceramica', label: 'Carillas cerámicas', chips: ['Translucidez', 'Durabilidad', 'Mínima preparación'] },
      { id: 'digital', label: 'Planificación digital', chips: ['Mockup 3D', 'Simetría', 'Previsualización'] }
    ]
  },
  'microdiseno de sonrisa': {
    title: 'Microdiseño de Sonrisa',
    copy: 'Cambios sutiles para grandes impactos: bordes, nivelación y pulido cosmético.',
    subtypes: [
      { id: 'bordes', label: 'Nivelación de bordes', chips: ['Simetría incisal', 'Desgastes', 'Pulido'] },
      { id: 'gingivo', label: 'Gingivoplastia', chips: ['Arquitectura gingival', 'Cenit dental', 'Salud'] }
    ]
  },
  'blanqueamiento dental': {
    title: 'Blanqueamiento Profesional',
    copy: 'Brillo natural sin sensibilidad extrema, utilizando tecnología de punta.',
    subtypes: [
      { id: 'consultorio', label: 'Sesión consultorio', chips: ['Fotoactivado', 'Barrera gingival', 'Inmediato'] },
      { id: 'casero', label: 'Kit profesional casa', chips: ['Cubetas personalizadas', 'Progresivo', 'Seguro'] }
    ]
  },
  'ortodoncia': {
    title: 'Ortodoncia Invisible',
    copy: 'Alineación perfecta con la discreción que el estilo de vida premium exige.',
    subtypes: [
      { id: 'invisalign', label: 'Alineadores', chips: ['Removible', 'Escaneo iTero', 'Sin brackets'] },
      { id: 'zafiro', label: 'Brackets de Zafiro', chips: ['Transparente', 'Convencional', 'Estético'] }
    ]
  },
  'coworking': {
    title: 'Coworking Odontológico',
    copy: 'Espacios de lujo para especialistas que buscan elevar su práctica clínica.',
    subtypes: [
      { id: 'consultorio', label: 'Alquiler consultorio', chips: ['Equipado', 'Lujo', 'Ubicación'] },
      { id: 'comunidad', label: 'Comunidad dental', chips: ['Networking', 'Eventos', 'Respaldo'] }
    ]
  }
};

const LOGOS = [
  { id: 'symbol-gold', label: 'Símbolo Dorado', file: 'dentalwork-symbol-gold.svg', usage: 'Marca de agua discreta' },
  { id: 'logo-horizontal', label: 'Logo Horizontal', file: 'logo-dentalwork-horizontal.pdf', usage: 'Cierre de composición' },
  { id: 'logo-blanco', label: 'Logo Blanco', file: 'logo-blanco.png', usage: 'Sobre fondos oscuros' },
  { id: 'logo-negro', label: 'Logo Negro', file: 'logo-negro.png', usage: 'Sobre fondos claros' }
];

const PromptStudio = ({ usuario, onSavePost }) => {
  const [mode, setMode] = useState('brief');
  const [channel, setChannel] = useState('Instagram');
  const [format, setFormat] = useState('post cuadrado 1:1');
  const [theme, setTheme] = useState('diseno de sonrisa');
  const [subtypeId, setSubtypeId] = useState('');
  const [objective, setObjective] = useState('conseguir nuevas citas');
  const [style, setStyle] = useState('premium clinico con acentos dorados y turquesa');
  const [userText, setUserText] = useState('');
  const [specification, setSpecification] = useState('');
  const [referenceImages, setReferenceImages] = useState([]);
  const [logoId, setLogoId] = useState('auto');
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const currentService = SERVICES_DATA[theme];
  const currentSubtype = currentService.subtypes.find(s => s.id === subtypeId) || currentService.subtypes[0];

  useEffect(() => {
    setSubtypeId(currentService.subtypes[0].id);
  }, [theme]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - referenceImages.length);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    setGenerando(true);
    try {
      const response = await fetch('/api/generarPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema: theme,
          tono: 'formal',
          contexto: `
            Canal: ${channel}
            Formato: ${format}
            Subtipo: ${currentSubtype.label}
            Chips de enfoque: ${currentSubtype.chips.join(', ')}
            Objetivo: ${objective}
            Estilo Visual: ${style}
            Texto Usuario: ${userText}
            Especificaciones: ${specification}
            Logo: ${logoId === 'auto' ? 'Rotación automática' : LOGOS.find(l => l.id === logoId).label}
            Modo: ${mode}
          `
        })
      });
      const data = await response.json();
      if (response.ok) setResultado(data);
      else alert("Error: " + data.error);
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div style={s.container}>
      {/* PANEL IZQUIERDO: GENERADOR */}
      <section style={s.panel}>
        <div style={s.panelHeader}>
          <div>
            <p style={s.eyebrow}>GENERADOR</p>
            <h2 style={s.h2}>Nuevo contenido</h2>
          </div>
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={s.modeSelect}>
            <option value="brief">Brief completo</option>
            <option value="texto">Solo texto</option>
          </select>
        </div>

        <div style={s.workflowStrip}>
          <span style={s.workflowItem}>BRIEF</span>
          <span style={s.workflowItem}>REFERENCIA</span>
          <span style={s.workflowItem}>LOGO</span>
          <span style={s.workflowItem}>REVISIÓN</span>
        </div>

        <div style={s.formGrid}>
          <div style={s.field}>
            <label style={s.label}>CANAL</label>
            <select value={channel} onChange={e => setChannel(e.target.value)} style={s.select}>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>WhatsApp Business</option>
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>FORMATO</label>
            <select value={format} onChange={e => setFormat(e.target.value)} style={s.select}>
              <option>Post cuadrado 1:1</option>
              <option>Historia 9:16</option>
              <option>Carrusel educativo</option>
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>TEMA</label>
            <select value={theme} onChange={e => setTheme(e.target.value)} style={s.select}>
              {Object.keys(SERVICES_DATA).map(k => <option key={k} value={k}>{SERVICES_DATA[k].title}</option>)}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>SUBTIPO</label>
            <select value={subtypeId} onChange={e => setSubtypeId(e.target.value)} style={s.select}>
              {currentService.subtypes.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
            </select>
          </div>
          <div style={{...s.field, gridColumn: '1/-1'}}>
            <label style={s.label}>OBJETIVO</label>
            <select value={objective} onChange={e => setObjective(e.target.value)} style={s.select}>
              <option value="conseguir nuevas citas">Conseguir citas</option>
              <option value="educar al paciente">Educar</option>
              <option value="generar confianza">Generar confianza</option>
            </select>
          </div>

          <div style={s.servicePanel}>
            <div style={s.serviceInfo}>
              <span style={s.serviceKicker}>ENFOQUE SUGERIDO</span>
              <strong style={s.serviceTitle}>{currentSubtype.label}</strong>
              <p style={s.serviceCopy}>{currentService.copy}</p>
            </div>
            <div style={s.chips}>
              {currentSubtype.chips.map(c => <span key={c} style={s.chip}>{c}</span>)}
            </div>
          </div>

          <div style={{...s.field, gridColumn: '1/-1'}}>
            <label style={s.label}>ESTILO VISUAL</label>
            <select value={style} onChange={e => setStyle(e.target.value)} style={s.select}>
              <option>Premium clinico con acentos dorados y turquesa</option>
              <option>Editorial oscuro elegante</option>
              <option>Minimalista marfil</option>
            </select>
          </div>

          <div style={{...s.field, gridColumn: '1/-1'}}>
            <label style={s.label}>ESPECIFICACIONES</label>
            <textarea 
              value={specification} 
              onChange={e => setSpecification(e.target.value)}
              placeholder="Ej: Campaña de junio, evitar precios, mencionar agenda por WhatsApp."
              style={s.textarea}
            />
          </div>

          <div style={{...s.field, gridColumn: '1/-1'}}>
            <div style={s.fieldTitleRow}>
              <label style={s.label}>FOTOS REALES DE REFERENCIA</label>
              <small style={s.small}>Max. 4 fotos</small>
            </div>
            <div style={s.uploadZone}>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={s.fileInput} />
              <strong>Subir fotos clínicas o del consultorio</strong>
              <p style={s.uploadHint}>Se usan solo para generar el prompt. No se guardan en D1.</p>
            </div>
            <div style={s.previewGrid}>
              {referenceImages.map((img, i) => (
                <div key={i} style={s.thumb}><img src={img} alt="ref" style={s.img} /></div>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>LOGO CORPORATIVO</label>
            <select value={logoId} onChange={e => setLogoId(e.target.value)} style={s.select}>
              <option value="auto">Rotar automáticamente</option>
              {LOGOS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>

          <div style={s.logoPreviewCard}>
            <div style={s.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <strong style={s.logoName}>{logoId === 'auto' ? 'Rotación: Aleatoria' : LOGOS.find(l => l.id === logoId).label}</strong>
              <p style={s.logoUsage}>{logoId === 'auto' ? 'Logo sugerido para marca de agua o cierre visual.' : LOGOS.find(l => l.id === logoId).usage}</p>
            </div>
          </div>

          <div style={s.actions}>
            <button onClick={handleGenerate} disabled={generando} style={s.primaryBtn}>
              {generando ? 'GENERANDO...' : 'Generar'}
            </button>
            <button onClick={() => {}} style={s.ghostBtn}>Limpiar</button>
          </div>
        </div>
      </section>

      {/* PANEL DERECHO: BORRADOR */}
      <section style={s.panel}>
        <div style={s.panelHeader}>
          <div>
            <p style={s.eyebrow}>SALIDA</p>
            <h2 style={s.h2}>Borrador</h2>
          </div>
          <div style={s.badge}>Gemini 1.5 Flash (Stable)</div>
        </div>

        {!resultado ? (
          <div style={s.emptyState}>Genera un contenido para ver el borrador aquí.</div>
        ) : (
          <div style={s.result}>
            <div style={s.resultBlock}>
              <h3 style={s.h3}>CAPTION</h3>
              <p style={s.resultText}>{resultado.caption}</p>
            </div>
            <div style={s.resultBlock}>
              <h3 style={s.h3}>PROMPT VISUAL</h3>
              <p style={{...s.resultText, fontStyle: 'italic', fontSize: '13px'}}>{resultado.visual_prompt}</p>
            </div>
            <div style={s.resultBlock}>
              <h3 style={s.h3}>HASHTAGS</h3>
              <div style={s.hashtags}>
                {resultado.hashtags?.map(h => <span key={h} style={s.hashtag}>#{h}</span>)}
              </div>
            </div>
            <div style={s.resultBlock}>
              <h3 style={s.h3}>NOTAS DE REVISIÓN</h3>
              <p style={{...s.resultText, color: '#2a6e68'}}>{resultado.compliance_notes || 'Sin observaciones críticas.'}</p>
            </div>
            <div style={s.actions}>
              <button onClick={() => onSavePost(resultado)} style={s.primaryBtn}>Guardar borrador</button>
              <button onClick={() => {}} style={s.ghostBtn}>Copiar caption</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const s = {
  container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '40px', maxWidth: '1400px', margin: '0 auto' },
  panel: { background: 'white', border: '1px solid #e8e5df', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', color: '#afa99c', marginBottom: '4px' },
  h2: { fontSize: '24px', fontFamily: 'Playfair Display, serif' },
  h3: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#6b6558', marginBottom: '12px' },
  modeSelect: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #e8e5df', background: '#f7f3ec', fontSize: '12px', cursor: 'pointer' },
  workflowStrip: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e8e5df', marginBottom: '8px' },
  workflowItem: { fontSize: '10px', fontWeight: '600', color: '#afa99c', letterSpacing: '0.1em' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '10px', fontWeight: '600', color: '#6b6558', letterSpacing: '0.05em' },
  select: { padding: '10px', borderRadius: '6px', border: '1px solid #e8e5df', background: '#f7f3ec', fontSize: '13px' },
  textarea: { padding: '12px', borderRadius: '6px', border: '1px solid #e8e5df', background: '#f7f3ec', fontSize: '13px', minHeight: '80px', resize: 'vertical' },
  servicePanel: { gridColumn: '1 / -1', background: '#f7f3ec', padding: '20px', borderRadius: '8px', border: '1px solid #e8e5df', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  serviceInfo: { maxWidth: '70%' },
  serviceKicker: { fontSize: '9px', fontWeight: '700', color: '#c9a44c', display: 'block', marginBottom: '4px' },
  serviceTitle: { fontSize: '16px', display: 'block', marginBottom: '4px' },
  serviceCopy: { fontSize: '12px', color: '#6b6558', lineHeight: '1.4' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end' },
  chip: { fontSize: '10px', background: 'white', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e8e5df', color: '#6b6558' },
  fieldTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  small: { fontSize: '10px', color: '#afa99c' },
  uploadZone: { border: '1.5px dashed #afa99c', borderRadius: '8px', padding: '24px', textAlign: 'center', background: '#f7f3ec', position: 'relative' },
  fileInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },
  uploadHint: { fontSize: '11px', color: '#afa99c', marginTop: '4px' },
  previewGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  thumb: { width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e8e5df' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  logoPreviewCard: { gridColumn: '1 / -1', display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: 'white', border: '1px solid #e8e5df', borderRadius: '8px' },
  logoIcon: { color: '#c9a44c' },
  logoName: { fontSize: '13px', display: 'block' },
  logoUsage: { fontSize: '11px', color: '#afa99c' },
  actions: { gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '12px' },
  primaryBtn: { flex: 1, padding: '14px', background: '#0c0c0c', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' },
  ghostBtn: { padding: '14px 24px', background: 'white', color: '#0c0c0c', border: '1px solid #e8e5df', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  badge: { fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: '#f7f3ec', border: '1px solid #c9a44c', fontWeight: '600' },
  emptyState: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#afa99c', fontSize: '14px', border: '2px dashed #f7f3ec', borderRadius: '8px' },
  result: { display: 'flex', flexDirection: 'column', gap: '24px' },
  resultBlock: { borderBottom: '1px solid #f7f3ec', paddingBottom: '16px' },
  resultText: { fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#0c0c0c' },
  hashtags: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  hashtag: { color: '#c9a44c', fontWeight: '600', fontSize: '13px' },
};

export default PromptStudio;
