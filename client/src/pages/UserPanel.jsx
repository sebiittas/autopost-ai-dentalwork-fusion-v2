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
import PostForm from "../components/PostForm.jsx";
import PostList from "../components/PostList.jsx";

function UserPanel({ usuario }) {
  const [texto, setTexto] = useState("");
  const [posts, setPosts] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [vista, setVista] = useState("posts");

  const cargarPosts = async () => {
    try {
      const data = await obtenerPosts(usuario.uid);
      setPosts(data);
    } catch (e) {
      setError("Error al cargar posts. Intenta recargar la pagina.");
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

  const handleCrear = async (fechaProgramada = null) => {
    if (!texto.trim()) {
      alert("Escribe algo primero");
      return;
    }

    setError(null);
    try {
      await crearPost(texto, usuario, fechaProgramada);
      setTexto("");
      await cargarPosts();
      if (fechaProgramada) setVista("calendario");
    } catch (e) {
      setError("No se pudo guardar el post.");
      console.error(e);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("Seguro que quieres eliminar este post?")) return;
    try {
      await eliminarPost(id);
      await cargarPosts();
    } catch (e) {
      setError("No se pudo eliminar el post.");
      console.error(e);
    }
  };

  const handleEditar = (post) => {
    setTexto(post.texto || post.caption || "");
    setEditandoId(post.id);
    setVista("posts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelar = () => {
    setTexto("");
    setEditandoId(null);
  };

  const handleActualizar = async () => {
    if (!texto.trim()) {
      alert("El texto no puede estar vacio");
      return;
    }
    try {
      await actualizarPost(editandoId, texto);
      setTexto("");
      setEditandoId(null);
      await cargarPosts();
    } catch (e) {
      setError("No se pudo actualizar el post.");
      console.error(e);
    }
  };

  const handleGenerarCaption = async (tema, tono, setTextoCallback) => {
    try {
      const response = await fetch("/api/generarCaption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, tono }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`Error al generar caption: ${data.error}`);
        return;
      }
      setTextoCallback(data.caption);
    } catch (e) {
      alert("No se pudo conectar con la IA. Intenta de nuevo.");
      console.error(e);
    }
  };

  const postsProgramados = posts.filter((p) => p.estado === "programado").length;

  return (
    <div style={{ textAlign: "center", marginTop: "30px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", maxWidth: "720px", margin: "0 auto 20px auto" }}>
        <div style={{ textAlign: "left" }}>
          <h1 style={{ margin: 0 }}>DentalWork Autoposter</h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
            Hola, {usuario.displayName || usuario.email}
          </p>
        </div>
        <button onClick={() => signOut(auth)} style={{ padding: "8px 16px", background: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" }}>
          Cerrar sesion
        </button>
      </div>

      <div style={{ display: "flex", maxWidth: "560px", margin: "0 auto 10px auto", gap: "8px", padding: "0 20px" }}>
        <button onClick={() => setVista("posts")} style={{ flex: 1, padding: "10px", background: vista === "posts" ? "#1A1A2E" : "#f3f4f6", color: vista === "posts" ? "white" : "#374151", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: vista === "posts" ? "bold" : "normal" }}>
          Mis posts
        </button>
        <button onClick={() => setVista("calendario")} style={{ flex: 1, padding: "10px", background: vista === "calendario" ? "#0ea5e9" : "#f3f4f6", color: vista === "calendario" ? "white" : "#374151", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: vista === "calendario" ? "bold" : "normal" }}>
          Calendario
          {postsProgramados > 0 && (
            <span style={{ marginLeft: "6px", background: "#ef4444", color: "white", borderRadius: "99px", fontSize: "11px", padding: "1px 6px" }}>
              {postsProgramados}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "10px", borderRadius: "6px", maxWidth: "560px", margin: "0 auto 16px auto" }}>
          {error}
        </div>
      )}

      {vista === "posts" && (
        <>
          <PostForm
            texto={texto}
            setTexto={setTexto}
            editandoId={editandoId}
            onGuardar={handleCrear}
            onActualizar={handleActualizar}
            onCancelar={handleCancelar}
            onGenerarCaption={handleGenerarCaption}
          />
          {cargando ? (
            <p style={{ color: "#9ca3af", marginTop: "30px" }}>Cargando posts...</p>
          ) : (
            <PostList posts={posts} onEditar={handleEditar} onEliminar={handleEliminar} />
          )}
        </>
      )}

      {vista === "calendario" && <Calendario posts={posts} />}
    </div>
  );
}

export default UserPanel;
