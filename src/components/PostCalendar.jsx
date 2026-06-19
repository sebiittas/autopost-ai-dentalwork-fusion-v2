import { useState } from "react";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const ESTADO_COLORES = {
  borrador:   "#9ca3af",
  programado: "#d97706",
  publicado:  "#059669",
};

// Convierte Firestore Timestamp o Date normal a Date de JS
function toDate(ts) {
  if (!ts) return null;
  if (ts?.toDate) return ts.toDate();
  return new Date(ts);
}

function PostCalendar({ posts }) {
  const hoy = new Date();
  const [mes, setMes]   = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const anterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1); }
    else setMes(m => m - 1);
    setDiaSeleccionado(null);
  };

  const siguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1); }
    else setMes(m => m + 1);
    setDiaSeleccionado(null);
  };

  // Primer día de la semana del mes y cuántos días tiene
  const primerDia   = new Date(anio, mes, 1).getDay();
  const diasEnMes   = new Date(anio, mes + 1, 0).getDate();

  // Agrupar posts por día del mes actual
  // Usa fechaProgramada si existe, sino creadoEn
  const postsPorDia = {};
  posts.forEach(post => {
    const fecha = toDate(post.fechaProgramada) || toDate(post.creadoEn);
    if (!fecha) return;
    if (fecha.getMonth() === mes && fecha.getFullYear() === anio) {
      const dia = fecha.getDate();
      if (!postsPorDia[dia]) postsPorDia[dia] = [];
      postsPorDia[dia].push(post);
    }
  });

  // Armar celdas del grid: null = celda vacía antes del día 1
  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const esHoy = (d) =>
    d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();

  const postsDia = diaSeleccionado ? (postsPorDia[diaSeleccionado] || []) : [];

  return (
    <div style={{ maxWidth: "500px", margin: "30px auto" }}>

      {/* Navegación mes */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button onClick={anterior} style={estilos.navBtn}>←</button>
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>
          {MESES[mes]} {anio}
        </span>
        <button onClick={siguiente} style={estilos.navBtn}>→</button>
      </div>

      {/* Encabezado días de la semana */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
        {DIAS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", fontWeight: "bold", padding: "4px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`empty-${i}`} />;

          const tiene       = postsPorDia[dia] || [];
          const seleccionado = diaSeleccionado === dia;
          const hoyFlag      = esHoy(dia);

          return (
            <div
              key={dia}
              onClick={() => setDiaSeleccionado(seleccionado ? null : dia)}
              style={{
                border: seleccionado
                  ? "2px solid #6366f1"
                  : hoyFlag
                  ? "2px solid #1A1A2E"
                  : "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "6px 4px",
                minHeight: "52px",
                cursor: "pointer",
                background: seleccionado ? "#eef2ff" : "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                transition: "background 0.15s",
              }}
            >
              <span style={{
                fontSize: "13px",
                fontWeight: hoyFlag ? "bold" : "normal",
                color: hoyFlag ? "#1A1A2E" : "#374151",
              }}>
                {dia}
              </span>

              {/* Puntos de color por estado */}
              <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", justifyContent: "center" }}>
                {tiene.slice(0, 3).map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: ESTADO_COLORES[p.estado] || ESTADO_COLORES.borrador,
                    }}
                  />
                ))}
                {tiene.length > 3 && (
                  <span style={{ fontSize: "9px", color: "#6b7280" }}>+{tiene.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalle del día seleccionado */}
      {diaSeleccionado && (
        <div style={{
          marginTop: "16px",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
        }}>
          <p style={{ margin: "0 0 10px 0", fontWeight: "bold", fontSize: "14px" }}>
            Posts del {diaSeleccionado} de {MESES[mes]}
          </p>

          {postsDia.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
              Sin posts este día.
            </p>
          ) : (
            postsDia.map((p) => (
              <div key={p.id} style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "10px",
                marginBottom: "8px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: ESTADO_COLORES[p.estado] || ESTADO_COLORES.borrador,
                  }} />
                  <span style={{ fontSize: "11px", color: "#6b7280", textTransform: "capitalize" }}>
                    {p.estado}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>
                  {p.texto.length > 120 ? p.texto.slice(0, 120) + "…" : p.texto}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Leyenda */}
      <div style={{ display: "flex", gap: "16px", marginTop: "14px", justifyContent: "center" }}>
        {Object.entries(ESTADO_COLORES).map(([estado, color]) => (
          <div key={estado} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#6b7280" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
            <span style={{ textTransform: "capitalize" }}>{estado}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

const estilos = {
  navBtn: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default PostCalendar;
