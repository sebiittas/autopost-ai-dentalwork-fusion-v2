import { useState } from "react";

const TONOS = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "humor", label: "Humor" },
  { value: "inspirador", label: "Inspirador" },
];

export default function PostForm({
  texto,
  setTexto,
  editandoId,
  onGuardar,
  onActualizar,
  onCancelar,
  onGenerarCaption,
}) {
  const [tema, setTema] = useState("");
  const [tono, setTono] = useState("formal");
  const [generando, setGenerando] = useState(false);
  const [modoFecha, setModoFecha] = useState(false);
  const [fechaValor, setFechaValor] = useState("");

  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  const minimoFecha = ahora.toISOString().slice(0, 16);

  const handleGenerar = async () => {
    if (!tema.trim()) {
      alert("Escribe el tema del post");
      return;
    }
    setGenerando(true);
    try {
      await onGenerarCaption(tema, tono, setTexto);
    } finally {
      setGenerando(false);
      setTema("");
    }
  };

  const handleBorrador = () => {
    onGuardar(null);
    setModoFecha(false);
    setFechaValor("");
  };

  const handleConfirmarProgramar = () => {
    if (!fechaValor) {
      alert("Elige una fecha y hora");
      return;
    }
    onGuardar(new Date(fechaValor));
    setModoFecha(false);
    setFechaValor("");
  };

  return (
    <div style={{ marginTop: "30px", maxWidth: "560px", margin: "30px auto" }}>
      <h2>{editandoId ? "Editar post" : "Crear post"}</h2>

      {!editandoId && (
        <div style={s.iaBox}>
          <p style={s.iaLabel}>Generar con IA</p>
          <input
            type="text"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Tema, por ejemplo: carillas en resina de alta estetica"
            style={s.input}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <select value={tono} onChange={(e) => setTono(e.target.value)} style={{ ...s.input, flex: 1, color: "#111" }}>
              {TONOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button onClick={handleGenerar} disabled={generando} style={s.btnGenerar}>
              {generando ? "Generando..." : "Generar"}
            </button>
          </div>
        </div>
      )}

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="El texto de tu post aparece aqui. Puedes editarlo libremente."
        style={s.textarea}
      />

      {editandoId ? (
        <div style={s.row}>
          <button onClick={onActualizar} style={s.btnVerde}>Guardar cambios</button>
          <button onClick={onCancelar} style={s.btnGris}>Cancelar</button>
        </div>
      ) : (
        <>
          <div style={s.row}>
            <button onClick={handleBorrador} style={s.btnOscuro}>
              Guardar borrador
            </button>
            <button
              onClick={() => { setModoFecha(!modoFecha); setFechaValor(""); }}
              style={modoFecha ? s.btnMorado : s.btnOutline}
            >
              Programar
            </button>
          </div>

          {modoFecha && (
            <div style={s.fechaBox}>
              <label style={s.fechaLabel}>Cuando quieres publicarlo?</label>
              <input
                type="datetime-local"
                value={fechaValor}
                min={minimoFecha}
                onChange={(e) => setFechaValor(e.target.value)}
                style={s.input}
              />
              <button
                onClick={handleConfirmarProgramar}
                disabled={!fechaValor}
                style={{ ...s.btnMorado, opacity: fechaValor ? 1 : 0.5, marginTop: "10px", width: "100%" }}
              >
                Confirmar programacion
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  iaBox: {
    background: "#f0f4ff",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "14px",
  },
  iaLabel: { margin: "0 0 10px", fontWeight: "bold", fontSize: "14px" },
  input: {
    width: "100%",
    padding: "9px 11px",
    borderRadius: "7px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#fff",
    color: "#111",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "vertical",
    marginBottom: "12px",
  },
  row: { display: "flex", gap: "10px" },
  btnGenerar: {
    padding: "9px 16px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  btnOscuro: {
    flex: 1,
    padding: "11px",
    background: "#1A1A2E",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  btnOutline: {
    flex: 1,
    padding: "11px",
    background: "transparent",
    color: "#6366f1",
    border: "1px solid #6366f1",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  btnMorado: {
    flex: 1,
    padding: "11px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
  btnVerde: {
    flex: 1,
    padding: "11px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnGris: {
    flex: 1,
    padding: "11px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
  },
  fechaBox: {
    marginTop: "12px",
    background: "rgba(99,102,241,0.06)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fechaLabel: { fontSize: "13px", fontWeight: 600, color: "#4b5563" },
};
