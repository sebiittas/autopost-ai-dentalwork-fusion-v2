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

// ─── LOGOS — Se cargan dinámicamente desde /api/logos ───────────────────────
// Formatos soportados: .png, .jpg, .jpeg, .webp, .svg, .gif
// Pon cualquier imagen en: client/public/logos/ y aparecerá automáticamente.

const AUTO_ROTATION = { id: 'auto', label: 'Rotación automática', usage: 'El sistema escoge el logo más adecuado según el estilo visual' };

// Fallback en caso de que la API no responda
const LOGOS_FALLBACK = [
  { id: 'logo-0', label: 'logo BLANCO',          file: '/logos/logo%20BLANCO%20.png',              tipo: 'claro',  usage: 'Sobre fondos oscuros',   position: 'bottom-center' },
  { id: 'logo-1', label: 'logos negro-07',        file: '/logos/logos%20negro-07.png',              tipo: 'oscuro', usage: 'Sobre fondos claros',    position: 'bottom-center' },
  { id: 'logo-2', label: 'Logo Jenniffer 2023',   file: '/logos/Logo%20Jenniffer%202023_Mesa%20de%20trabajo%201.png', tipo: 'general', usage: 'Uso general', position: 'bottom-right' },
  { id: 'logo-3', label: 'Mesa de trabajo 26',    file: '/logos/Mesa%20de%20trabajo%2026.png',      tipo: 'isotipo', usage: 'Esquina o marca de agua', position: 'top-right' },
];

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
  const [logosConfig, setLogosConfig]       = useState(LOGOS_FALLBACK);
  const [logosCargando, setLogosCargando]   = useState(true);
  const [generando, setGenerando]           = useState(false);
  const [resultado, setResultado]           = useState(null);
  const [copiedCaption, setCopiedCaption]   = useState(false);
  const [copiedPrompt, setCopiedPrompt]     = useState(false);
  const [errorIA, setErrorIA]               = useState(null);
  const [generandoImagen, setGenerandoImagen] = useState(false);
  const [imagenGenerada, setImagenGenerada] = useState(null);
  const [errorImagen, setErrorImagen]       = useState(null);
  const [mostrarOriginal, setMostrarOriginal] = useState(false);
  const fileInputRef                        = useRef(null);

  // Cargar logos dinámicamente desde la API
  useEffect(() => {
    const cargarLogos = async () => {
      setLogosCargando(true);
      try {
        const res = await fetch('/logos.json');
        if (res.ok) {
          const data = await res.json();
          if (data.logos && data.logos.length > 0) {
            setLogosConfig(data.logos);
          } else {
            setLogosConfig(LOGOS_FALLBACK);
          }
        } else {
          setLogosConfig(LOGOS_FALLBACK);
        }
      } catch {
        setLogosConfig(LOGOS_FALLBACK);
      } finally {
        setLogosCargando(false);
      }
    };
    cargarLogos();
  }, []);

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
        'Editorial oscuro elegante': logosConfig.find(l => l.tipo === 'claro'),
        'Minimalista marfil':        logosConfig.find(l => l.tipo === 'oscuro'),
      };
      return styleMap[style] || logosConfig.find(l => l.tipo === 'isotipo') || logosConfig[0];
    }
    return logosConfig.find(l => l.id === logoId) || logosConfig[0];
  };

  const getAspectRatio = () => (format === 'Historia 9:16' ? '9:16' : '1:1');

  // Convierte una imagen servida por URL (ej. el logo en /public/logos) a
  // data URL base64, para poder mandarla como referencia a Gemini.
  const urlToBase64 = (url) => new Promise((resolve, reject) => {
    fetch(url)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });

  const handleGenerarImagen = async (prompt) => {
    if (!prompt) return;
    setGenerandoImagen(true);
    setErrorImagen(null);
    setMostrarOriginal(false);
    try {
      // Imágenes de referencia de alta fidelidad: la(s) foto(s) real(es) del
      // paciente/clínica (si las hay) y el logo corporativo seleccionado.
      // Así la IA los usa tal cual en vez de inventar una versión genérica.
      const fidelidad = referenceImages.map(img => img.url);
      const logoInfo = getLogoForPrompt();
      if (logoInfo?.file) {
        try {
          fidelidad.push(await urlToBase64(logoInfo.file));
        } catch (e) {
          console.warn('No se pudo cargar el logo como referencia:', e);
        }
      }

      const response = await fetch('/api/generarImagen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio: getAspectRatio(), images: fidelidad })
      });
      const data = await response.json();
      if (response.ok) {
        setImagenGenerada(data.image);
      } else {
        setErrorImagen(data.error || 'No se pudo generar la imagen.');
      }
    } catch (err) {
      setErrorImagen('Error de conexión al generar la imagen.');
      console.error(err);
    } finally {
      setGenerandoImagen(false);
    }
  };

  const handleGenerate = async () => {
    setGenerando(true);
    setResultado(null);
    setImagenGenerada(null);
    setErrorImagen(null);
    setMostrarOriginal(false);
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
        setErrorIA(null);
        // Generamos siempre la imagen del post con IA, usando la foto real
        // y el logo como referencias, para que el mockup muestre cómo
        // quedaría publicado de verdad.
        if (data.visual_prompt) {
          handleGenerarImagen(data.visual_prompt);
        }
      } else {
        setErrorIA(data.error || 'Error desconocido');
      }
    } catch (err) {
      setErrorIA('No se pudo conectar con la IA. Verifica tu conexión.');
      console.error(err);
    } finally {
      setGenerando(false);
    }
  };

  const handleLimpiar = () => {
    setResultado(null);
    setSpecification('');
    setReferenceImages([]);
    setErrorIA(null);
    setImagenGenerada(null);
    setErrorImagen(null);
    setMostrarOriginal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyCaption = () => {
    const caption = resultado?.caption;
    if (caption) { navigator.clipboard.writeText(caption); setCopiedCaption(true); }
  };

  const handleCopyPrompt = () => {
    if (resultado?.visual_prompt) { navigator.clipboard.writeText(resultado.visual_prompt); setCopiedPrompt(true); }
  };

const handleSave = () => {
  if (!resultado) return;

  onSavePost({
    caption: resultado.caption,
    visual_prompt: resultado.visual_prompt,
    hashtags: resultado.hashtags,
    compliance_notes: resultado.compliance_notes,
    image: imagenGenerada,
  });
};

const descargarImagen = () => {
  if (!imagenGenerada) return;

  const link = document.createElement("a");

  link.href = imagenGenerada;
  link.download = `post-${Date.now()}.png`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  // ── Qué mostrar en el área de imagen del mockup ──────────────────────────
  // Prioridad normal: imagen compuesta por IA (foto real + logo + diseño)
  // > cargando > foto original (si la IA aún no respondió) > placeholder.
  // El toggle "Ver original" fuerza a mostrar la foto tal cual se subió.
  const renderImagenPost = () => {
    if (mostrarOriginal && referenceImages[0]) {
      return <img src={referenceImages[0].url} alt="Foto original" style={s.socialImage} />;
    }
    if (generandoImagen) {
      return (
        <div style={s.socialImagePlaceholder}>
          <span style={s.spinnerDark} />
          <span style={s.socialImagePlaceholderText}>
            {referenceImages[0] ? 'Componiendo tu foto con el diseño…' : 'Generando imagen con IA…'}
          </span>
        </div>
      );
    }
    if (imagenGenerada) {
      return <img src={imagenGenerada} alt="Imagen generada por IA" style={s.socialImage} />;
    }
    if (referenceImages[0]) {
      return <img src={referenceImages[0].url} alt="Foto de referencia" style={s.socialImage} />;
    }
    return (
      <div style={s.socialImagePlaceholder}>
        <span style={s.socialImagePlaceholderIcon}>{errorImagen ? '⚠' : '✦'}</span>
        <span style={s.socialImagePlaceholderText}>
          {errorImagen || 'Genera la imagen para ver cómo quedaría el post'}
        </span>
        <button
          onClick={() => handleGenerarImagen(resultado?.visual_prompt)}
          style={s.genImgBtn}
        >
          {errorImagen ? '↻ Reintentar' : '✦ Generar imagen'}
        </button>
      </div>
    );
  };

  // Botones flotantes sobre la imagen: alternar foto original/diseño,
  // y regenerar otra versión. Solo se muestran cuando hay algo que controlar.
  const renderImagenControles = () => {
    if (generandoImagen) return null;
    return (
      <div style={s.imgOverlayControls}>
        {referenceImages[0] && imagenGenerada && (
          <button onClick={() => setMostrarOriginal(v => !v)} style={s.regenImgBtn}>
            {mostrarOriginal ? '✦ Ver diseño' : '📷 Ver original'}
          </button>
        )}
        {imagenGenerada && !mostrarOriginal && (
          <button onClick={() => handleGenerarImagen(resultado?.visual_prompt)} style={s.regenImgBtn}>
            ↻ Otra versión
          </button>
        )}
      </div>
    );
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
              <small style={s.small}>
                {logosCargando
                  ? 'Cargando logos...'
                  : `${logosConfig.length} logo(s) • PNG, JPG, SVG soportados`}
              </small>
            </div>

            {logosCargando ? (
              <div style={s.logosLoading}>
                <span style={s.spinner} /> Detectando logos en /public/logos/...
              </div>
            ) : (
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

                {/* Logos reales — todos los formatos */}
                {logosConfig.map(logo => (
                  <div
                    key={logo.id}
                    style={{ ...s.logoCard, ...(logoId === logo.id ? s.logoCardActive : {}) }}
                    onClick={() => setLogoId(logo.id)}
                    title={logo.label}
                  >
                    <div style={s.logoImgWrap}>
                      {logo.ext === 'svg' ? (
                        // SVG: usar object tag para que renderice correctamente
                        <object
                          data={logo.file}
                          type="image/svg+xml"
                          style={s.logoImg}
                          aria-label={logo.label}
                        >
                          <div style={{ ...s.logoPlaceholder, display: 'flex' }}>
                            <span style={{ fontSize: '14px' }}>SVG</span>
                          </div>
                        </object>
                      ) : (
                        // PNG, JPG, WEBP, GIF
                        <img
                          src={logo.file}
                          alt={logo.label}
                          style={s.logoImg}
                          loading="lazy"
                          onError={e => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      <div style={{ ...s.logoPlaceholder, display: 'none' }}>
                        <span style={{ fontSize: '11px', color: '#afa99c' }}>
                          {logo.ext?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    <span style={s.logoCardLabel} title={logo.label}>
                      {logo.label.length > 14 ? logo.label.slice(0, 13) + '…' : logo.label}
                    </span>
                    <span style={s.logoCardUsage}>{logo.usage}</span>
                    {logoId === logo.id && <div style={s.logoCheck}>✓</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Info del logo seleccionado */}
            {!logosCargando && (
              <div style={s.logoInfoBar}>
                <span style={s.logoInfoIcon}>◆</span>
                <div>
                  <strong style={s.logoInfoName}>
                    {logoId === 'auto' ? 'Rotación automática' : logosConfig.find(l => l.id === logoId)?.label}
                  </strong>
                  <span style={s.logoInfoUsage}>
                    {' — '}
                    {logoId === 'auto' ? AUTO_ROTATION.usage : logosConfig.find(l => l.id === logoId)?.usage}
                  </span>
                </div>
              </div>
            )}

            <p style={s.logoHint}>
              💡 Agrega cualquier imagen (PNG, JPG, SVG) en <code style={s.code}>client/public/logos/</code> y aparecerá aquí automáticamente.
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
          <div style={s.badge}>
            {resultado?._modelo ? resultado._modelo : 'Gemini 2.5 Flash'}
          </div>
        </div>

        {/* ── BANNER DE ERROR ── */}
        {errorIA && (
          <div style={s.errorBanner}>
            <div style={s.errorIcon}>⚠</div>
            <div style={s.errorBody}>
              <strong style={s.errorTitle}>La IA no pudo responder</strong>
              <p style={s.errorMsg}>{errorIA}</p>
              <p style={s.errorHint}>
                Los modelos se intentaron en cascada. Espera unos segundos y vuelve a intentar.
              </p>
            </div>
            <button onClick={handleGenerate} disabled={generando} style={s.retryBtn}>
              {generando ? '...' : '↻ Reintentar'}
            </button>
          </div>
        )}

        {!resultado && !errorIA ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>✦</div>
            <p style={s.emptyText}>Genera un contenido para ver el borrador aquí.</p>
            <p style={s.emptySubtext}>Verás una vista previa lista para publicar.</p>
          </div>
        ) : resultado ? (
          <div style={s.result}>

            {/* ── VISTA PREVIA DEL POST ── */}
            <div style={s.resultBlock}>
              <div style={s.resultLabelRow}>
                <h3 style={s.h3}>VISTA PREVIA — {channel.toUpperCase()}</h3>
                <button onClick={handleCopyCaption} style={s.copyBtn}>
                  {copiedCaption ? '✓ Copiado' : 'Copiar caption'}
                </button>
                {imagenGenerada && (
  <button onClick={descargarImagen}>
    Descargar imagen
  </button>
)}
              </div>

              {channel === 'WhatsApp Business' ? (
                <div style={s.waCard}>
                  <div style={s.waHeader}>
                    <div style={s.socialAvatarWrap}>
                      {getLogoForPrompt()?.file
                        ? <img src={getLogoForPrompt().file} alt="" style={s.socialAvatar} onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
                        : <span style={s.socialAvatarFallback}>DW</span>}
                    </div>
                    <div style={s.socialNames}>
                      <strong style={s.socialUsername}>DentalWork</strong>
                      <span style={s.socialSubname}>Cuenta de empresa</span>
                    </div>
                  </div>
                  <div style={s.waBubble}>
                    <div style={s.socialImageWrap}>
                      {renderImagenPost()}
                      {renderImagenControles()}
                    </div>
                    <p style={s.waCaption}>{resultado.caption}</p>
                    <p style={s.socialHashtags}>{resultado.hashtags?.map(h => `#${h}`).join(' ')}</p>
                    <span style={s.waTime}>09:41 ✓✓</span>
                  </div>
                </div>
              ) : (
                <div style={s.socialCard}>
                  <div style={s.socialHeader}>
                    <div style={s.socialAvatarWrap}>
                      {getLogoForPrompt()?.file
                        ? <img src={getLogoForPrompt().file} alt="" style={s.socialAvatar} onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
                        : <span style={s.socialAvatarFallback}>DW</span>}
                    </div>
                    <div style={s.socialNames}>
                      <strong style={s.socialUsername}>dentalworkcol</strong>
                      <span style={s.socialSubname}>
                        {channel === 'Facebook' ? 'DentalWork · Hace unos segundos · 🌐' : 'Dra. Jenniffer Espinosa'}
                      </span>
                    </div>
                    <span style={s.socialDots}>•••</span>
                  </div>

                  {channel === 'Facebook' && (
                    <p style={{ ...s.socialCaption, padding: '0 14px 10px' }}>{resultado.caption}</p>
                  )}

                  <div style={s.socialImageWrap}>
                    {renderImagenPost()}
                    {renderImagenControles()}
                  </div>

                  {channel === 'Facebook' ? (
                    <div style={s.fbActions}>
                      <span style={s.fbActionItem}>👍 Me gusta</span>
                      <span style={s.fbActionItem}>💬 Comentar</span>
                      <span style={s.fbActionItem}>↗ Compartir</span>
                    </div>
                  ) : (
                    <>
                      <div style={s.socialActions}>
                        <span style={s.socialIcon}>♡</span>
                        <span style={s.socialIcon}>💬</span>
                        <span style={s.socialIcon}>↗</span>
                        <span style={{ ...s.socialIcon, marginLeft: 'auto' }}>⚑</span>
                      </div>
                      <p style={s.socialLikes}>Le gusta a <strong>jenniffer.espinosa</strong> y otras personas</p>
                      <p style={s.socialCaption}>
                        <strong>dentalworkcol</strong>{' '}{resultado.caption}
                      </p>
                      <p style={s.socialHashtags}>{resultado.hashtags?.map(h => `#${h}`).join(' ')}</p>
                    </>
                  )}

                  {channel === 'Facebook' && (
                    <p style={{ ...s.socialHashtags, padding: '0 14px 12px' }}>
                      {resultado.hashtags?.map(h => `#${h}`).join(' ')}
                    </p>
                  )}
                </div>
              )}
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
        ) : null}
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
  logoGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginBottom: '10px' },
  logosLoading:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '20px', background: '#f7f3ec', borderRadius: '8px', fontSize: '12px', color: '#afa99c' },
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

  // Vista previa social (Instagram / Facebook)
  socialCard:     { border: '1px solid #e8e5df', borderRadius: '10px', overflow: 'hidden', background: 'white' },
  socialHeader:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px' },
  socialAvatarWrap: { width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#c9a44c,#2a6e68)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  socialAvatar:   { width: '100%', height: '100%', objectFit: 'cover' },
  socialAvatarFallback: { color: 'white', fontSize: '11px', fontWeight: '700' },
  socialNames:    { display: 'flex', flexDirection: 'column', lineHeight: 1.25, flex: 1, minWidth: 0 },
  socialUsername: { fontSize: '13px', color: '#0c0c0c' },
  socialSubname:  { fontSize: '11px', color: '#afa99c' },
  socialDots:     { fontSize: '14px', color: '#afa99c', letterSpacing: '1px' },
  socialImageWrap:{ width: '100%', aspectRatio: '1 / 1', background: '#f7f3ec', position: 'relative', overflow: 'hidden' },
  socialImage:    { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  socialImagePlaceholder: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg,#fdfaf4,#f0ece2)' },
  socialImagePlaceholderIcon: { fontSize: '22px', color: '#c9a44c' },
  socialImagePlaceholderText: { fontSize: '11px', color: '#afa99c', textAlign: 'center', padding: '0 30px' },
  spinnerDark:    { display: 'inline-block', width: '18px', height: '18px', border: '2px solid #e8e5df', borderTopColor: '#c9a44c', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  genImgBtn:      { fontSize: '11px', fontWeight: '700', color: '#9c7b2e', background: 'rgba(201,164,76,0.12)', border: '1px solid rgba(201,164,76,0.35)', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer' },
  imgOverlayControls: { position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' },
  regenImgBtn:    { fontSize: '10.5px', fontWeight: '700', color: 'white', background: 'rgba(12,12,12,0.55)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '20px', padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' },
  socialActions:  { display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px 4px' },
  socialIcon:     { fontSize: '19px', color: '#3a3630' },
  socialLikes:    { fontSize: '12.5px', color: '#3a3630', margin: '4px 14px 0' },
  socialCaption:  { fontSize: '13px', lineHeight: '1.5', color: '#3a3630', margin: '6px 14px 0', background: 'transparent', padding: 0 },
  socialHashtags: { fontSize: '12.5px', color: '#2a6e68', margin: '4px 14px 14px' },
  fbActions:      { display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #e8e5df', borderBottom: '1px solid #e8e5df', margin: '10px 0 0', padding: '8px 0' },
  fbActionItem:   { fontSize: '12.5px', fontWeight: '600', color: '#6b6558' },

  // Vista previa WhatsApp Business
  waCard:         { display: 'flex', flexDirection: 'column', gap: '10px', background: '#e9ddc8', borderRadius: '10px', padding: '14px' },
  waHeader:       { display: 'flex', alignItems: 'center', gap: '10px' },
  waBubble:       { background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  waCaption:      { fontSize: '13px', lineHeight: '1.5', color: '#3a3630', margin: '10px 14px 0' },
  waTime:         { display: 'block', fontSize: '10px', color: '#afa99c', textAlign: 'right', margin: '6px 14px 12px' },

  // Hashtags
  hashtags:       { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  hashtag:        { color: '#c9a44c', fontWeight: '600', fontSize: '13px' },

  // Empty state
  emptyState:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', border: '2px dashed #e8e5df', borderRadius: '10px', gap: '10px' },
  emptyIcon:      { fontSize: '28px', color: '#c9a44c', opacity: 0.5 },
  emptyText:      { fontSize: '14px', color: '#6b6558', textAlign: 'center', margin: 0 },
  emptySubtext:   { fontSize: '12px', color: '#afa99c', textAlign: 'center', margin: 0 },

  // Error banner
  errorBanner:    { display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 18px', background: '#fff8f0', border: '1.5px solid #f5c28a', borderRadius: '10px', marginBottom: '4px' },
  errorIcon:      { fontSize: '20px', color: '#d97706', flexShrink: 0, marginTop: '2px' },
  errorBody:      { flex: 1 },
  errorTitle:     { fontSize: '13px', fontWeight: '700', color: '#92400e', display: 'block', marginBottom: '4px' },
  errorMsg:       { fontSize: '12px', color: '#78350f', margin: '0 0 4px 0', lineHeight: 1.5 },
  errorHint:      { fontSize: '11px', color: '#b45309', margin: 0, opacity: 0.8 },
  retryBtn:       { flexShrink: 0, padding: '8px 14px', background: '#d97706', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' },
};

export default PromptStudio;
