import React, { useState, useEffect, useRef } from 'react';

// ─── SERVICIOS ───────────────────────────────────────────────────────────────
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

// ─── LOGOS CONFIG — Agrega tus logos aquí ───────────────────────────────────
// Pon los archivos en: client/public/logos/
const LOGOS_CONFIG = [
  { id: 'simbolo-dorado',   label: 'Símbolo Dorado',    file: '/logos/logo-simbolo-dorado.png',      usage: 'Marca de agua discreta',    position: 'bottom-right' },
  { id: 'horizontal-blanco', label: 'Logo Blanco',      file: '/logos/logo-horizontal-blanco.png',   usage: 'Sobre fondos oscuros',      position: 'bottom-center' },
  { id: 'horizontal-negro',  label: 'Logo Negro',       file: '/logos/logo-horizontal-negro.png',    usage: 'Sobre fondos claros',       position: 'bottom-center' },
  { id: 'isotipo',           label: 'Isotipo',           file: '/logos/logo-isotipo.png',             usage: 'Esquina superior derecha',  position: 'top-right' },
];

const AUTO_ROTATION = { id: 'auto', label: 'Rotación automática', usage: 'El sistema escoge el logo más adecuado según el estilo visual' };

// ─── COMPONENTE ──────────────────────────────────────────────────────────────
const PromptStudio = ({ usuario, onSavePost }) => {
  const [mode, setMode]                     = useState('brief');
  const [channel, setChannel]               = useState('Instagram');
  const [format, setFormat]                 = useState('Post cuadrado 1:1');
  const [theme, setTheme]                   = useState('diseno de sonrisa');
  const [subtypeId, setSubtypeId]           = useState('');
  const [objective, setObjective]           = useState('conseguir nuevas citas');
  const [style, setStyle]                   = useState('Premium clinico con acentos dorados y turquesa');
  const [specification, setSpecification]   = useState('');
  const [referenceImages, setReferenceImages] = useState([]);
  const [logoId, setLogoId]                 = useState('auto');
  const [generando, setGenerando]           = useState(false);
  const [resultado, setResultado]           = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [copiedCaption, setCopiedCaption]   = useState(false);
  const [copiedPrompt, setCopiedPrompt]     = useState(false);
  const fileInputRef                        = useRef(null);

  const currentService = SERVICES_DATA[theme];
  const currentSubtype = currentService.subtypes.find(s => s.id === subtypeId) || currentService.subtypes[0];

  useEffect(() => {
    setSubtypeId(currentService.subtypes[0].id);
  }, [theme]);

  // Reset copied states
  useEffect(() => {
    if (copiedCaption) { const t = setTimeout(() => setCopiedCaption(false), 2000); return () => clearTimeout(t); }
  }, [copiedCaption]);
  useEffect(() => {
    if (copiedPrompt) { const t = setTimeout(() => setCopiedPrompt(false), 2000); return () => clearTimeout(t); }
  }, [copiedPrompt]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - referenceImages.length);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setReferenceImages(prev => [...prev, { url: reader.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => setReferenceImages(prev => prev.filter((_, i) => i !== idx));

  const getLogoForPrompt = () => {
    if (logoId === 'auto') {
      const styleMap = {
        'Editorial oscuro elegante': LOGOS_CONFIG.find(l => l.id === 'horizontal-blanco'),
        'Minimalista marfil': LOGOS_CONFIG.find(l => l.id === 'horizontal-negro'),
      };
      return styleMap[style] || LOGOS_CONFIG[0];
    }
    return LOGOS_CONFIG.find(l => l.id === logoId) || LOGOS_CONFIG[0];
  };

  const handleGenerate = async () => {
    setGenerando(true);
    setResultado(null);
    try {
      const logoInfo = getLogoForPrompt();
      const response = await fetch('/api/generarPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema: theme,
          tono: 'formal',
          // Enviar imágenes de referencia a Gemini (multimodal)
          images: referenceImages.map(img => img.url),
          contexto: `
Canal: ${channel}
Formato: ${format}
Subtipo: ${currentSubtype.label}
Chips de enfoque: ${currentSubtype.chips.join(', ')}
Objetivo: ${objective}
Estilo Visual: ${style}
Especificaciones: ${specification || 'Ninguna'}
Logo: ${logoInfo?.label || 'Símbolo Dorado'} — posición ${logoInfo?.position || 'bottom-right'}
Imágenes de referencia enviadas: ${referenceImages.length}
Modo: ${mode}
          `.trim()
        })
      });
      const data = await response.json();
      if (response.ok) {
        setResultado(data);
        setSelectedVariant(0);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión con la IA');
      console.error(err);
    } finally {
      setGenerando(false);
    }
  };

  const handleLimpiar = () => {
    setResultado(null);
    setSelectedVariant(0);
    setSpecification('');
    setReferenceImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyCaption = () => {
    const caption = resultado?.variants?.[selectedVariant];
    if (caption) { navigator.clipboard.writeText(caption); setCopiedCaption(true); }
  };

  const handleCopyPrompt = () => {
    if (resultado?.visual_prompt) { navigator.clipboard.writeText(resultado.visual_prompt); setCopiedPrompt(true); }
  };

  const handleSave = () => {
    if (!resultado) return;
    onSavePost({
      caption: resultado.variants[selectedVariant],
      visual_prompt: resultado.visual_prompt,
      hashtags: resultado.hashtags,
      compliance_notes: resultado.compliance_notes,
    });
  };

  return (
    <div style={s.container}>

      {/* ── PANEL IZQUIERDO: GENERADOR ── */}
      <section style={s.panel}>
        <div style={s.panelHeader}>
          <div>
            <p style={s.eyebrow}>GENERADOR</p>
            <h2 style={s.h2}>Nuevo contenido</h2>
          </div>
          <select value={mode} onChange={e => setMode(e.target.value)} style={s.modeSelect}>
            <option value="brief">Brief completo</option>
            <option value="texto">Solo texto</option>
          </select>
        </div>

        <div style={s.workflowStrip}>
          {['BRIEF', 'REFERENCIA', 'LOGO', 'REVISIÓN'].map(step => (
            <span key={step} style={s.workflowItem}>{step}</span>
          ))}
        </div>

        <div style={s.formGrid}>
          {/* Canal + Formato */}
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

          {/* Tema + Subtipo */}
          <div style={s.field}>
            <label style={s.label}>TEMA</label>
            <select value={theme} onChange={e => setTheme(e.target.value)} style={s.select}>
              {Object.keys(SERVICES_DATA).map(k => (
                <option key={k} value={k}>{SERVICES_DATA[k].title}</option>
              ))}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>SUBTIPO</label>
            <select value={subtypeId} onChange={e => setSubtypeId(e.target.value)} style={s.select}>
              {currentService.subtypes.map(st => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>

          {/* Objetivo */}
          <div style={{ ...s.field, gridColumn: '1/-1' }}>
            <label style={s.label}>OBJETIVO</label>
            <select value={objective} onChange={e => setObjective(e.target.value)} style={s.select}>
              <option value="conseguir nuevas citas">Conseguir citas</option>
              <option value="educar al paciente">Educar al paciente</option>
              <option value="generar confianza">Generar confianza</option>
              <option value="mostrar resultado clinico">Mostrar resultado clínico</option>
              <option value="promocion especial">Promoción especial</option>
            </select>
          </div>

          {/* Enfoque sugerido */}
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

          {/* Estilo visual */}
          <div style={{ ...s.field, gridColumn: '1/-1' }}>
            <label style={s.label}>ESTILO VISUAL</label>
            <select value={style} onChange={e => setStyle(e.target.value)} style={s.select}>
              <option>Premium clinico con acentos dorados y turquesa</option>
              <option>Editorial oscuro elegante</option>
              <option>Minimalista marfil</option>
              <option>Fresco y moderno turquesa</option>
            </select>
          </div>

          {/* Especificaciones */}
          <div style={{ ...s.field, gridColumn: '1/-1' }}>
            <label style={s.label}>ESPECIFICACIONES</label>
            <textarea
              value={specification}
              onChange={e => setSpecification(e.target.value)}
              placeholder="Ej: Campaña de junio, evitar precios, mencionar agenda por WhatsApp."
              style={s.textarea}
            />
          </div>

          {/* Fotos de referencia */}
          <div style={{ ...s.field, gridColumn: '1/-1' }}>
            <div style={s.fieldTitleRow}>
              <label style={s.label}>FOTOS DE REFERENCIA</label>
              <small style={s.small}>{referenceImages.length}/4 • Gemini las analiza</small>
            </div>
            <div
              style={s.uploadZone}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <div style={s.uploadIcon}>📷</div>
              <strong style={s.uploadTitle}>Subir fotos clínicas</strong>
              <p style={s.uploadHint}>
                {referenceImages.length === 0
                  ? 'Gemini analizará la imagen y generará un caption más preciso'
                  : `${referenceImages.length} foto(s) lista(s) — click para agregar más`}
              </p>
            </div>
            {referenceImages.length > 0 && (
              <div style={s.previewGrid}>
                {referenceImages.map((img, i) => (
                  <div key={i} style={s.thumb}>
                    <img src={img.url} alt={img.name} style={s.thumbImg} />
                    <button onClick={() => removeImage(i)} style={s.thumbRemove}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SELECTOR DE LOGO VISUAL ── */}
          <div style={{ ...s.field, gridColumn: '1/-1' }}>
            <div style={s.fieldTitleRow}>
              <label style={s.label}>LOGO CORPORATIVO</label>
              <small style={s.small}>Siempre incluido en el prompt visual</small>
            </div>

            <div style={s.logoGrid}>
              {/* Opción auto */}
              <div
                style={{ ...s.logoCard, ...(logoId === 'auto' ? s.logoCardActive : {}) }}
                onClick={() => setLogoId('auto')}
              >
                <div style={s.logoCardAuto}>↺</div>
                <span style={s.logoCardLabel}>Auto</span>
                <span style={s.logoCardUsage}>Según estilo</span>
              </div>

              {/* Logos reales */}
              {LOGOS_CONFIG.map(logo => (
                <div
                  key={logo.id}
                  style={{ ...s.logoCard, ...(logoId === logo.id ? s.logoCardActive : {}) }}
                  onClick={() => setLogoId(logo.id)}
                >
                  <div style={s.logoImgWrap}>
                    <img
                      src={logo.file}
                      alt={logo.label}
                      style={s.logoImg}
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div style={{ ...s.logoPlaceholder, display: 'none' }}>
                      <span style={{ fontSize: '18px' }}>🏷</span>
                    </div>
                  </div>
                  <span style={s.logoCardLabel}>{logo.label}</span>
                  <span style={s.logoCardUsage}>{logo.usage}</span>
                  {logoId === logo.id && <div style={s.logoCheck}>✓</div>}
                </div>
              ))}
            </div>

            {/* Info del logo seleccionado */}
            <div style={s.logoInfoBar}>
              <span style={s.logoInfoIcon}>◆</span>
              <div>
                <strong style={s.logoInfoName}>
                  {logoId === 'auto' ? 'Rotación automática' : LOGOS_CONFIG.find(l => l.id === logoId)?.label}
                </strong>
                <span style={s.logoInfoUsage}>
                  {' — '}
                  {logoId === 'auto' ? AUTO_ROTATION.usage : LOGOS_CONFIG.find(l => l.id === logoId)?.usage}
                </span>
              </div>
            </div>

            <p style={s.logoHint}>
              💡 Agrega tus logos en <code style={s.code}>client/public/logos/</code>
            </p>
          </div>

          {/* Acciones */}
          <div style={s.actions}>
            <button onClick={handleGenerate} disabled={generando} style={s.primaryBtn}>
              {generando ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={s.spinner} /> GENERANDO...
                </span>
              ) : (
                `✦ Generar${referenceImages.length > 0 ? ` con ${referenceImages.length} foto(s)` : ''}`
              )}
            </button>
            <button onClick={handleLimpiar} style={s.ghostBtn}>Limpiar</button>
          </div>
        </div>
      </section>

      {/* ── PANEL DERECHO: RESULTADO ── */}
      <section style={s.panel}>
        <div style={s.panelHeader}>
          <div>
            <p style={s.eyebrow}>SALIDA</p>
            <h2 style={s.h2}>Borrador</h2>
          </div>
          <div style={s.badge}>Gemini 2.5 Flash</div>
        </div>

        {!resultado ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>✦</div>
            <p style={s.emptyText}>Genera un contenido para ver el borrador aquí.</p>
            <p style={s.emptySubtext}>Recibirás 3 variantes de caption para elegir.</p>
          </div>
        ) : (
          <div style={s.result}>

            {/* ── 3 VARIANTES DE CAPTION ── */}
            <div style={s.resultBlock}>
              <div style={s.resultLabelRow}>
                <h3 style={s.h3}>CAPTION — ELIGE UNA VARIANTE</h3>
                <button onClick={handleCopyCaption} style={s.copyBtn}>
                  {copiedCaption ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
              <div style={s.variantsGrid}>
                {resultado.variants?.map((v, i) => (
                  <div
                    key={i}
                    style={{ ...s.variantCard, ...(selectedVariant === i ? s.variantCardActive : {}) }}
                    onClick={() => setSelectedVariant(i)}
                  >
                    <div style={s.variantHeader}>
                      <span style={{
                        ...s.variantNum,
                        ...(selectedVariant === i ? s.variantNumActive : {})
                      }}>
                        Opción {i + 1}
                      </span>
                      {selectedVariant === i && <span style={s.variantCheck}>✓ Seleccionada</span>}
                    </div>
                    <p style={s.variantText}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── PROMPT VISUAL ── */}
            <div style={s.resultBlock}>
              <div style={s.resultLabelRow}>
                <h3 style={s.h3}>PROMPT VISUAL</h3>
                <button onClick={handleCopyPrompt} style={s.copyBtn}>
                  {copiedPrompt ? '✓ Copiado' : 'Copiar para Midjourney'}
                </button>
              </div>
              <p style={{ ...s.resultText, fontStyle: 'italic', fontSize: '13px', color: '#2a6e68' }}>
                {resultado.visual_prompt}
              </p>
            </div>

            {/* ── HASHTAGS ── */}
            <div style={s.resultBlock}>
              <h3 style={s.h3}>HASHTAGS</h3>
              <div style={s.hashtags}>
                {resultado.hashtags?.map(h => (
                  <span key={h} style={s.hashtag}>#{h}</span>
                ))}
              </div>
            </div>

            {/* ── NOTAS ── */}
            {resultado.compliance_notes && (
              <div style={s.resultBlock}>
                <h3 style={s.h3}>NOTAS DE REVISIÓN</h3>
                <p style={{ ...s.resultText, color: '#2a6e68', fontSize: '12px' }}>
                  {resultado.compliance_notes}
                </p>
              </div>
            )}

            {/* ── ACCIONES ── */}
            <div style={s.actions}>
              <button onClick={handleSave} style={s.primaryBtn}>
                Guardar borrador
              </button>
              <button
                onClick={handleGenerate}
                disabled={generando}
                style={s.ghostBtn}
              >
                Regenerar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const s = {
  container:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '40px', maxWidth: '1400px', margin: '0 auto' },
  panel:          { background: 'white', border: '1px solid #e8e5df', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  panelHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow:        { fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', color: '#afa99c', marginBottom: '4px' },
  h2:             { fontSize: '24px', fontFamily: 'Playfair Display, serif', margin: 0 },
  h3:             { fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', color: '#6b6558', margin: 0 },
  modeSelect:     { padding: '6px 12px', borderRadius: '6px', border: '1px solid #e8e5df', background: '#f7f3ec', fontSize: '12px', cursor: 'pointer' },
  badge:          { fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: '#f7f3ec', border: '1px solid #c9a44c', fontWeight: '600', color: '#9c7b2e' },
  workflowStrip:  { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e8e5df' },
  workflowItem:   { fontSize: '10px', fontWeight: '600', color: '#afa99c', letterSpacing: '0.1em' },
  formGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' },
  field:          { display: 'flex', flexDirection: 'column', gap: '7px' },
  fieldTitleRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label:          { fontSize: '10px', fontWeight: '600', color: '#6b6558', letterSpacing: '0.06em' },
  small:          { fontSize: '10px', color: '#afa99c' },
  select:         { padding: '10px 12px', borderRadius: '6px', border: '1px solid #e8e5df', background: '#f7f3ec', fontSize: '13px', cursor: 'pointer' },
  textarea:       { padding: '12px', borderRadius: '6px', border: '1px solid #e8e5df', background: '#f7f3ec', fontSize: '13px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' },
  servicePanel:   { gridColumn: '1/-1', background: '#f7f3ec', padding: '18px', borderRadius: '8px', border: '1px solid #e8e5df', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  serviceInfo:    { flex: 1 },
  serviceKicker:  { fontSize: '9px', fontWeight: '700', color: '#c9a44c', display: 'block', marginBottom: '3px', letterSpacing: '0.1em' },
  serviceTitle:   { fontSize: '15px', display: 'block', marginBottom: '4px', fontWeight: '600' },
  serviceCopy:    { fontSize: '12px', color: '#6b6558', lineHeight: '1.45', margin: 0 },
  chips:          { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'flex-end' },
  chip:           { fontSize: '10px', background: 'white', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e8e5df', color: '#6b6558', whiteSpace: 'nowrap' },

  // Upload zone
  uploadZone:     { border: '1.5px dashed #c9a44c', borderRadius: '8px', padding: '20px', textAlign: 'center', background: '#fdfaf4', cursor: 'pointer', transition: 'background 0.2s' },
  uploadIcon:     { fontSize: '24px', marginBottom: '6px' },
  uploadTitle:    { display: 'block', fontSize: '13px', fontWeight: '600', color: '#3a3630', marginBottom: '4px' },
  uploadHint:     { fontSize: '11px', color: '#afa99c', margin: 0 },
  previewGrid:    { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' },
  thumb:          { position: 'relative', width: '64px', height: '64px', borderRadius: '6px', overflow: 'hidden', border: '1.5px solid #e8e5df' },
  thumbImg:       { width: '100%', height: '100%', objectFit: 'cover' },
  thumbRemove:    { position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', lineHeight: '18px', textAlign: 'center', padding: 0 },

  // Logo grid
  logoGrid:       { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '10px' },
  logoCard:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 8px', borderRadius: '8px', border: '1.5px solid #e8e5df', background: '#f7f3ec', cursor: 'pointer', transition: 'all 0.18s', position: 'relative', textAlign: 'center' },
  logoCardActive: { border: '1.5px solid #c9a44c', background: 'rgba(201,164,76,0.08)', boxShadow: '0 0 0 3px rgba(201,164,76,0.15)' },
  logoCardAuto:   { width: '40px', height: '40px', borderRadius: '6px', background: '#e8e5df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#6b6558' },
  logoCardLabel:  { fontSize: '10px', fontWeight: '600', color: '#3a3630', lineHeight: 1.2 },
  logoCardUsage:  { fontSize: '9px', color: '#afa99c', lineHeight: 1.3 },
  logoImgWrap:    { width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#e8e5df', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoImg:        { width: '100%', height: '100%', objectFit: 'contain' },
  logoPlaceholder:{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  logoCheck:      { position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', background: '#c9a44c', color: 'white', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
  logoInfoBar:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(201,164,76,0.06)', border: '1px solid rgba(201,164,76,0.2)', borderRadius: '7px' },
  logoInfoIcon:   { color: '#c9a44c', fontSize: '10px' },
  logoInfoName:   { fontSize: '12px', color: '#3a3630' },
  logoInfoUsage:  { fontSize: '12px', color: '#afa99c' },
  logoHint:       { fontSize: '11px', color: '#afa99c', margin: 0 },
  code:           { background: '#f7f3ec', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '10px' },

  // Actions
  actions:        { gridColumn: '1/-1', display: 'flex', gap: '12px', marginTop: '4px' },
  primaryBtn:     { flex: 1, padding: '14px', background: '#0c0c0c', color: 'white', border: 'none', borderRadius: '7px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.04em' },
  ghostBtn:       { padding: '14px 20px', background: 'white', color: '#3a3630', border: '1px solid #e8e5df', borderRadius: '7px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  spinner:        { display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },

  // Result
  result:         { display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 },
  resultBlock:    { borderBottom: '1px solid #f7f3ec', paddingBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' },
  resultLabelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resultText:     { fontSize: '13.5px', lineHeight: '1.65', color: '#0c0c0c', background: '#f7f3ec', padding: '12px 14px', borderRadius: '7px', margin: 0 },
  copyBtn:        { fontSize: '11px', fontWeight: '600', padding: '5px 12px', borderRadius: '20px', border: '1px solid #c9a44c', background: 'transparent', color: '#9c7b2e', cursor: 'pointer', whiteSpace: 'nowrap' },

  // 3 Variants
  variantsGrid:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  variantCard:    { padding: '14px 16px', borderRadius: '8px', border: '1.5px solid #e8e5df', background: '#fdfcfa', cursor: 'pointer', transition: 'all 0.15s' },
  variantCardActive: { border: '1.5px solid #c9a44c', background: 'rgba(201,164,76,0.05)' },
  variantHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
  variantNum:     { fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', color: '#afa99c', textTransform: 'uppercase' },
  variantNumActive: { color: '#9c7b2e' },
  variantCheck:   { fontSize: '10px', fontWeight: '700', color: '#9c7b2e', background: 'rgba(201,164,76,0.15)', padding: '2px 8px', borderRadius: '10px' },
  variantText:    { fontSize: '13px', lineHeight: '1.6', color: '#3a3630', margin: 0 },

  // Hashtags
  hashtags:       { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  hashtag:        { color: '#c9a44c', fontWeight: '600', fontSize: '13px' },

  // Empty state
  emptyState:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', border: '2px dashed #e8e5df', borderRadius: '10px', gap: '10px' },
  emptyIcon:      { fontSize: '28px', color: '#c9a44c', opacity: 0.5 },
  emptyText:      { fontSize: '14px', color: '#6b6558', textAlign: 'center', margin: 0 },
  emptySubtext:   { fontSize: '12px', color: '#afa99c', textAlign: 'center', margin: 0 },
};

export default PromptStudio;
