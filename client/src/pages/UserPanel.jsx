import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  actualizarPost,
  crearPost,
  eliminarPost,
  obtenerPosts,
} from "../services/posts";

import Calendario from "../components/Calendario.jsx";
import PostList from "../components/PostList.jsx";
import PromptStudio from "../components/PromptStudio.jsx";

function UserPanel({ usuario }) {
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [vista, setVista] = useState("studio");

  const cargarPosts = async () => {
    try {
      const data = await obtenerPosts(usuario.uid);
      setPosts(data);
    } catch (e) {
      setError("Error al cargar posts.");
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setCargando(true);
      await cargarPosts();
      setCargando(false);
    };
    init();
  }, [usuario.uid]);

  const handleSavePost = async (resultado) => {
    try {
     await crearPost(resultado.caption, usuario, null, {
  visual_prompt: resultado.visual_prompt,
  hashtags: resultado.hashtags,
  compliance_notes: resultado.compliance_notes,
  image: resultado.image,
});
      await cargarPosts();
      alert("Borrador guardado correctamente.");
    } catch (e) {
      alert("Error al guardar.");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar este borrador?")) return;
    try {
      await eliminarPost(id);
      await cargarPosts();
    } catch (e) {
      setError("No se pudo eliminar.");
    }
  };

  return (
    <div style={s.container}>
      {/* HEADER SUPERIOR */}
      <header style={s.header}>
        <div style={s.logoArea}>
          <span style={s.logoMark}>DENTALWORK</span>
          <h1 style={s.h1}>Autoposter Studio</h1>
        </div>
        <div style={s.topActions}>
          <div style={s.statusBadge}>Referencia fiel</div>
          <div style={s.statusBadge}>Logos rotativos</div>
          <div style={s.apiBadge}>API Active</div>
          <button onClick={() => signOut(auth)} style={s.logoutBtn}>Salir</button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={s.main}>
        {vista === "studio" && (
          <div style={s.studioLayout}>
            <PromptStudio usuario={usuario} onSavePost={handleSavePost} />
            
            {/* PANEL INFERIOR: HISTORIAL (D1) */}
            <section style={s.historyPanel}>
              <div style={s.panelHeader}>
                <div>
                  <p style={s.eyebrow}>D1</p>
                  <h2 style={s.h2}>Borradores guardados</h2>
                </div>
                <button onClick={cargarPosts} style={s.refreshBtn}>Actualizar</button>
              </div>
              <div style={s.postListWrapper}>
                {cargando ? <p style={s.loading}>Sincronizando con D1...</p> : <PostList posts={posts} onEliminar={handleEliminar} />}
              </div>
            </section>
          </div>
        )}

        {vista === "calendario" && (
          <div style={s.calendarWrapper}>
            <button onClick={() => setVista("studio")} style={s.backBtn}>← Volver al Studio</button>
            <Calendario posts={posts} />
          </div>
        )}
      </main>

      {/* NAVEGACIÓN FLOTANTE / INFERIOR */}
      <nav style={s.nav}>
        <button onClick={() => setVista("studio")} style={{...s.navBtn, ...(vista === "studio" ? s.navBtnActive : {})}}>Studio</button>
        <button onClick={() => setVista("calendario")} style={{...s.navBtn, ...(vista === "calendario" ? s.navBtnActive : {})}}>Calendario</button>
      </nav>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#fdfcfa', display: 'flex', flexDirection: 'column' },
  header: { padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e5df', background: 'white' },
  logoArea: { display: 'flex', flexDirection: 'column' },
  logoMark: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.2em', color: '#c9a44c' },
  h1: { fontSize: '20px', fontFamily: 'Playfair Display, serif', margin: 0 },
  topActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  statusBadge: { fontSize: '10px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #e8e5df', color: '#6b6558' },
  apiBadge: { fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: '600' },
  logoutBtn: { padding: '6px 12px', fontSize: '11px', border: '1px solid #e8e5df', background: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' },
  main: { flex: 1, padding: '20px' },
  studioLayout: { display: 'flex', flexDirection: 'column', gap: '30px' },
  historyPanel: { background: 'white', border: '1px solid #e8e5df', borderRadius: '12px', padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  eyebrow: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', color: '#afa99c' },
  h2: { fontSize: '22px', fontFamily: 'Playfair Display, serif' },
  refreshBtn: { background: 'none', border: 'none', color: '#c9a44c', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  postListWrapper: { minHeight: '100px' },
  loading: { fontSize: '13px', color: '#afa99c', textAlign: 'center', padding: '40px' },
  nav: { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(12,12,12,0.9)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '40px', display: 'flex', gap: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 1000 },
  navBtn: { padding: '10px 24px', borderRadius: '30px', border: 'none', background: 'none', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  navBtnActive: { background: '#c9a44c', color: 'white' },
  calendarWrapper: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  backBtn: { background: 'none', border: 'none', color: '#6b6558', fontSize: '14px', marginBottom: '20px', cursor: 'pointer' }
};

export default UserPanel;
