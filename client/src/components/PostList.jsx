const ESTADO_COLORES = {
  borrador: { bg: "#f3f4f6", color: "#6b7280", label: "Borrador" },
  programado: { bg: "#fef3c7", color: "#d97706", label: "Programado" },
  publicado: { bg: "#d1fae5", color: "#059669", label: "Publicado" },
};

function formatFecha(timestamp) {
  if (!timestamp) return "";
  // Firestore Timestamp tiene .toDate(), Date normal ya tiene los métodos
  const fecha = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PostList({ posts, onEditar, onEliminar }) {
  if (posts.length === 0) {
    return (
      <div style={{ marginTop: "30px", color: "#9ca3af" }}>
        <p>No tienes posts aún. ¡Crea el primero! 🚀</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "30px", maxWidth: "500px", margin: "30px auto" }}>
      <h2>📋 Mis Posts ({posts.length})</h2>

      {posts.map((p) => {
        const estadoInfo = ESTADO_COLORES[p.estado] || ESTADO_COLORES.borrador;

        return (
          <div
            key={p.id}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "12px",
              textAlign: "left",
            }}
          >
            {/* Encabezado: estado + fecha */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{
                background: estadoInfo.bg,
                color: estadoInfo.color,
                fontSize: "12px",
                fontWeight: "bold",
                padding: "2px 8px",
                borderRadius: "99px",
              }}>
                {estadoInfo.label}
              </span>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                {formatFecha(p.creadoEn)}
              </span>
            </div>

            {/* Texto del post */}
            <p style={{ margin: "0 0 12px 0", color: "#374151", lineHeight: "1.5" }}>
              {p.texto}
            </p>

            {/* Acciones */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => onEditar(p)}
                style={{
                  padding: "6px 12px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => onEliminar(p.id)}
                style={{
                  padding: "6px 12px",
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#dc2626",
                  fontSize: "13px",
                }}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PostList;
