// src/components/Calendario.jsx
// Muestra los posts programados en una vista de lista por fecha

function Calendario({ posts }) {
  // Filtrar solo posts programados
  const programados = posts
    .filter((p) => p.estado === "programado" && p.fechaProgramada)
    .sort((a, b) => {
      const fechaA = a.fechaProgramada?.toDate ? a.fechaProgramada.toDate() : new Date(a.fechaProgramada);
      const fechaB = b.fechaProgramada?.toDate ? b.fechaProgramada.toDate() : new Date(b.fechaProgramada);
      return fechaA - fechaB;
    });

  const formatearFecha = (fechaRaw) => {
    const fecha = fechaRaw?.toDate ? fechaRaw.toDate() : new Date(fechaRaw);
    return fecha.toLocaleString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tiempoRestante = (fechaRaw) => {
    const fecha = fechaRaw?.toDate ? fechaRaw.toDate() : new Date(fechaRaw);
    const diff = fecha - new Date();
    if (diff < 0) return "⏰ Ya pasó";
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    if (horas >= 24) {
      const dias = Math.floor(horas / 24);
      return `⏳ En ${dias} día${dias > 1 ? "s" : ""}`;
    }
    if (horas > 0) return `⏳ En ${horas}h ${minutos}m`;
    return `⏳ En ${minutos} minuto${minutos !== 1 ? "s" : ""}`;
  };

  if (programados.length === 0) {
    return (
      <div style={{
        maxWidth: "500px",
        margin: "30px auto",
        padding: "20px",
        background: "#f9fafb",
        border: "1px dashed #d1d5db",
        borderRadius: "10px",
        textAlign: "center",
        color: "#9ca3af",
      }}>
        <p style={{ fontSize: "32px", margin: "0 0 8px 0" }}>📅</p>
        <p style={{ margin: 0, fontSize: "14px" }}>No tienes posts programados todavía.</p>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Crea un post y elige "Programar" para verlo aquí.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "500px", margin: "30px auto" }}>
      <h2 style={{ textAlign: "center" }}>📅 Posts Programados ({programados.length})</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {programados.map((post) => (
          <div
            key={post.id}
            style={{
              background: "white",
              border: "1px solid #bae6fd",
              borderLeft: "4px solid #0ea5e9",
              borderRadius: "8px",
              padding: "14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {/* Fecha */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}>
              <span style={{ fontSize: "12px", color: "#0369a1", fontWeight: "bold" }}>
                🗓 {formatearFecha(post.fechaProgramada)}
              </span>
              <span style={{
                fontSize: "11px",
                background: "#e0f2fe",
                color: "#0369a1",
                padding: "2px 8px",
                borderRadius: "99px",
              }}>
                {tiempoRestante(post.fechaProgramada)}
              </span>
            </div>

            {/* Texto del post */}
            <p style={{
              margin: 0,
              fontSize: "14px",
              color: "#374151",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap",
            }}>
              {post.texto}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendario;
