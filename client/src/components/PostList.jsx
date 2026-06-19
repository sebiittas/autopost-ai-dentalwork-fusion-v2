const ESTADO_COLORES = {
  borrador: { bg: "#f7f3ec", color: "#6b6558", label: "Borrador" },
  programado: { bg: "rgba(201,164,76,0.12)", color: "#9c7b2e", label: "Programado" },
  publicado: { bg: "rgba(127,212,207,0.15)", color: "#2a6e68", label: "Publicado" },
};

function formatFecha(timestamp) {
  if (!timestamp) return "";
  const fecha = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function PostList({ posts, onEditar, onEliminar }) {
  if (!posts || posts.length === 0) {
    return (
      <div style={s.empty}>
        <p style={s.emptyText}>No hay borradores guardados aún.</p>
      </div>
    );
  }

  return (
    <div style={s.list}>
      {posts.map((p) => {
        const estadoInfo = ESTADO_COLORES[p.estado] || ESTADO_COLORES.borrador;
        return (
          <div key={p.id} style={s.card}>
            <div style={s.cardTop}>
              <span style={{ ...s.pill, background: estadoInfo.bg, color: estadoInfo.color }}>
                {estadoInfo.label}
              </span>
              <span style={s.fecha}>{formatFecha(p.creadoEn)}</span>
            </div>
            <p style={s.caption}>{p.caption || p.texto}</p>
            {p.hashtags?.length > 0 && (
              <div style={s.hashtags}>
                {p.hashtags.map(h => (
                  <span key={h} style={s.hashtag}>#{h}</span>
                ))}
              </div>
            )}
            <div style={s.actions}>
              {onEditar && (
                <button onClick={() => onEditar(p)} style={s.btnEdit}>✏️ Editar</button>
              )}
              {onEliminar && (
                <button onClick={() => onEliminar(p.id)} style={s.btnDelete}>🗑️ Eliminar</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const s = {
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { background: "#fdfcfa", border: "1px solid #e8e5df", borderRadius: "8px", padding: "16px 20px" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  pill: { fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "20px" },
  fecha: { fontSize: "11px", color: "#afa99c" },
  caption: { fontSize: "13.5px", lineHeight: "1.65", color: "#3a3630", marginBottom: "12px" },
  hashtags: { display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" },
  hashtag: { fontSize: "12px", color: "#c9a44c", fontWeight: "600" },
  actions: { display: "flex", gap: "8px" },
  btnEdit: { padding: "6px 14px", background: "#f7f3ec", border: "1px solid #e8e5df", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
  btnDelete: { padding: "6px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "6px", cursor: "pointer", color: "#dc2626", fontSize: "12px" },
  empty: { textAlign: "center", padding: "40px 20px" },
  emptyText: { color: "#afa99c", fontSize: "13px" },
};

export default PostList;
