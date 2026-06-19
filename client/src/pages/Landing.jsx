import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap";
document.head.appendChild(fontLink);

const ACCENT       = "#6366f1";
const ACCENT_DIM   = "rgba(99,102,241,0.12)";
const ACCENT_BORDER= "rgba(99,102,241,0.3)";
const BG           = "#1A1A2E";
const BORDER       = "rgba(255,255,255,0.08)";
const MUTED        = "#9090A8";

const FEATURES = [
  { icon: "✨", title: "IA que escribe en español real", desc: "Genera captions que suenan humanos, no traducidos. Elige el tono: casual, formal, humor o inspirador." },
  { icon: "📅", title: "Programa y olvídate", desc: "Define fecha y hora para cada post. El sistema publica solo — tú te dedicas a lo que importa." },
  { icon: "📊", title: "Todo en un panel", desc: "Gestiona múltiples cuentas, ve el calendario y monitorea tu actividad en un solo lugar." },
];

const PASOS = [
  { num: "01", title: "Crea tu cuenta", desc: "Gratis. En 30 segundos." },
  { num: "02", title: "Describe tu post", desc: "Escribe el tema y elige el tono. La IA hace el resto." },
  { num: "03", title: "Programa o publica", desc: "Elige cuándo — la plataforma lo hace automático." },
];

export default function Landing() {
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0"; el.style.transform = "translateY(20px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      el.style.opacity = "1"; el.style.transform = "translateY(0)";
    });
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: BG, color: "#E8E8F0", minHeight: "100vh", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 40px", borderBottom:`1px solid ${BORDER}`, position:"sticky", top:0, background:"rgba(26,26,46,0.93)", backdropFilter:"blur(12px)", zIndex:100 }}>
        <Logo />
        <div style={{ display:"flex", gap:"14px", alignItems:"center" }}>
          <Link to="/login" style={{ color:MUTED, textDecoration:"none", fontSize:"14px", fontWeight:500 }}>Iniciar sesión</Link>
          <Link to="/login" style={{ background:ACCENT, color:"#fff", padding:"8px 18px", borderRadius:"8px", textDecoration:"none", fontSize:"14px", fontWeight:600 }}>Empezar gratis →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ textAlign:"center", padding:"90px 24px 70px", maxWidth:"760px", margin:"0 auto" }}>
        <div style={{ display:"inline-block", background:ACCENT_DIM, color:ACCENT, border:`1px solid ${ACCENT_BORDER}`, borderRadius:"100px", padding:"5px 16px", fontSize:"13px", fontWeight:500, marginBottom:"26px" }}>
          ✦ Automatización de redes sociales con IA
        </div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(36px,6vw,68px)", fontWeight:800, lineHeight:1.1, letterSpacing:"-2px", margin:"0 0 22px", color:"#fff" }}>
          Publica en Instagram<br /><span style={{ color:ACCENT }}>sin escribir ni un post.</span>
        </h1>
        <p style={{ fontSize:"17px", color:MUTED, lineHeight:1.6, margin:"0 0 36px" }}>
          Describe el tema, elige el tono y la IA genera el caption.<br />Tú programas — AutoPost AI publica solo.
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:"12px", flexWrap:"wrap" }}>
          <BtnPrimary to="/login">Crear cuenta gratis</BtnPrimary>
          <a href="#como-funciona" style={{ background:"transparent", color:"#E8E8F0", padding:"13px 26px", borderRadius:"10px", textDecoration:"none", fontWeight:600, fontSize:"15px", border:`1px solid ${BORDER}`, display:"inline-block" }}>Ver cómo funciona ↓</a>
        </div>
        <p style={{ fontSize:"12px", color:"#5A5A70", marginTop:"18px" }}>Acceso instantáneo · Empieza ahora</p>
      </section>

      {/* FEATURES */}
      <Section>
        <SectionTitle>¿Por qué AutoPost AI?</SectionTitle>
        <Grid3 mt="44px">
          {FEATURES.map(f => (
            <div key={f.title} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${BORDER}`, borderRadius:"14px", padding:"26px" }}>
              <div style={{ fontSize:"30px", marginBottom:"14px" }}>{f.icon}</div>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"17px", fontWeight:700, color:"#fff", margin:"0 0 8px" }}>{f.title}</h3>
              <p style={{ color:MUTED, fontSize:"14px", lineHeight:1.6, margin:0 }}>{f.desc}</p>
            </div>
          ))}
        </Grid3>
      </Section>

      {/* CÓMO FUNCIONA */}
      <div style={{ background:"rgba(255,255,255,0.02)", borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}` }} id="como-funciona">
        <Section>
          <SectionTitle>Tres pasos. Eso es todo.</SectionTitle>
          <Grid3 mt="44px">
            {PASOS.map(p => (
              <div key={p.num} style={{ padding:"24px", textAlign:"center" }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"44px", fontWeight:800, color:ACCENT_DIM, display:"block", marginBottom:"10px" }}>{p.num}</span>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"18px", fontWeight:700, color:"#fff", margin:"0 0 8px" }}>{p.title}</h3>
                <p style={{ color:MUTED, fontSize:"14px", margin:0 }}>{p.desc}</p>
              </div>
            ))}
          </Grid3>
        </Section>
      </div>

      {/* CTA FINAL */}
      <section style={{ textAlign:"center", padding:"90px 24px", background:`linear-gradient(180deg, transparent, ${ACCENT_DIM})` }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(26px,4vw,46px)", fontWeight:800, color:"#fff", letterSpacing:"-1.5px", margin:"0 0 32px", lineHeight:1.15 }}>
          Tu competencia ya está automatizando.<br />¿Y tú?
        </h2>
        <BtnPrimary to="/login">Crear cuenta gratis →</BtnPrimary>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${BORDER}`, padding:"28px 40px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Logo />
        <p style={{ fontSize:"13px", color:"#5A5A70", margin:0 }}>Hecho en Colombia 🇨🇴 · 2026</p>
      </footer>

    </div>
  );
}

// ── Helpers ──
function Logo() {
  return <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"20px", fontWeight:800, color:"#fff" }}>AutoPost <span style={{ color:ACCENT }}>AI</span></span>;
}
function BtnPrimary({ to, children }) {
  return <Link to={to} style={{ background:ACCENT, color:"#fff", padding:"13px 26px", borderRadius:"10px", textDecoration:"none", fontWeight:700, fontSize:"15px", display:"inline-block" }}>{children}</Link>;
}
function Section({ children }) {
  return <section style={{ padding:"72px 24px", maxWidth:"1060px", margin:"0 auto" }}>{children}</section>;
}
function SectionTitle({ children }) {
  return <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(24px,4vw,40px)", fontWeight:800, textAlign:"center", margin:"0 0 8px", letterSpacing:"-1px", color:"#fff" }}>{children}</h2>;
}
function Grid3({ children, mt }) {
  return <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:"18px", marginTop: mt || "44px", maxWidth:"980px", margin:`${mt||"44px"} auto 0` }}>{children}</div>;
}
