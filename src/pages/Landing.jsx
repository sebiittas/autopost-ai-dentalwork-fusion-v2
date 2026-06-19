import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={s.container}>
      <header style={s.header}>
        <div style={s.logoArea}>
          <div style={s.logoTextGroup}>
            <span style={s.logoMark}>DENTALWORK</span>
            <span style={s.logoSub}>AUTOPREMIUM</span>
          </div>
        </div>
        <Link to="/login" style={s.loginLink}>Acceso Profesional</Link>
      </header>

      <main style={s.main}>
        <section style={s.hero}>
          <div style={s.heroContent}>
            <div style={s.badge}>IA GENERATIVA PREMIUM</div>
            <h1 style={s.h1}>La estética de tu clínica, <em>elevada</em> por inteligencia artificial.</h1>
            <p style={s.p}>
              Diseñado exclusivamente para odontólogos que buscan una presencia digital editorial, 
              manteniendo la fidelidad clínica y el lujo visual.
            </p>
            <div style={s.heroActions}>
              <Link to="/login" style={s.primaryBtn}>COMENZAR AHORA</Link>
              <div style={s.heroNote}>No requiere configuración técnica.</div>
            </div>
          </div>
          <div style={s.heroImage}>
            <div style={s.imagePlaceholder}>
              <div style={s.imageOverlay}></div>
              <img 
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1000" 
                alt="Dental Clinic Premium" 
                style={s.img}
              />
            </div>
          </div>
        </section>

        <section style={s.features}>
          <div style={s.featureGrid}>
            <div style={s.featureCard}>
              <span style={s.featIcon}>✨</span>
              <h3 style={s.featTitle}>Referencia Fiel</h3>
              <p style={s.featDesc}>Gemini analiza tus fotos reales para crear prompts que respetan la anatomía clínica sin retoques artificiales.</p>
            </div>
            <div style={s.featureCard}>
              <span style={s.featIcon}>🏆</span>
              <h3 style={s.featTitle}>Look Editorial</h3>
              <p style={s.featDesc}>Inspirado en revistas de lujo. Paleta dorada, turquesa y tipografía Playfair Display para una marca premium.</p>
            </div>
            <div style={s.featureCard}>
              <span style={s.featIcon}>⚡</span>
              <h3 style={s.featTitle}>Prompt Studio</h3>
              <div style={s.featDesc}>Genera captions, visual prompts y hashtags en segundos, listos para publicar o programar.</div>
            </div>
          </div>
        </section>
      </main>

      <footer style={s.footer}>
        <div style={s.footerContent}>
          <span>&copy; 2026 DentalWork Autoposter.</span>
          <div style={s.footerLinks}>
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Soporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const s = {
  container: {
    minHeight: '100vh',
    background: 'var(--paper)',
    color: 'var(--ink)',
  },
  header: {
    padding: '30px 60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  logoTextGroup: { display: 'flex', flexDirection: 'column' },
  logoMark: { fontWeight: '700', fontSize: '18px', letterSpacing: '0.2em' },
  logoSub: { fontSize: '10px', color: 'var(--gold-deep)', fontWeight: '500', letterSpacing: '0.1em' },
  loginLink: { fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--gold)', paddingBottom: '2px' },
  main: { maxWidth: '1400px', margin: '0 auto', padding: '0 60px' },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '60px',
    alignItems: 'center',
    padding: '80px 0',
  },
  heroContent: { maxWidth: '600px' },
  badge: { display: 'inline-block', fontSize: '10px', fontWeight: '700', letterSpacing: '0.2em', color: 'var(--gold-deep)', background: 'var(--cream)', padding: '6px 12px', borderRadius: '4px', marginBottom: '24px' },
  h1: { fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: '1.1', marginBottom: '32px' },
  p: { fontSize: '18px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '40px' },
  heroActions: { display: 'flex', alignItems: 'center', gap: '24px' },
  primaryBtn: { background: 'var(--ink)', color: 'white', padding: '20px 40px', borderRadius: '4px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', letterSpacing: '0.1em', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  heroNote: { fontSize: '12px', color: 'var(--gray-400)' },
  heroImage: { position: 'relative' },
  imagePlaceholder: { aspectRatio: '4/5', background: 'var(--cream)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,12,12,0.2), transparent)' },
  features: { padding: '100px 0' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
  featureCard: { padding: '40px', background: 'white', borderRadius: '8px', border: '1px solid var(--gray-200)', transition: 'transform 0.3s' },
  featIcon: { fontSize: '32px', display: 'block', marginBottom: '20px' },
  featTitle: { fontSize: '20px', marginBottom: '16px' },
  featDesc: { fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.5' },
  footer: { padding: '60px', borderTop: '1px solid var(--gray-200)', background: 'white' },
  footerContent: { maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--gray-400)' },
  footerLinks: { display: 'flex', gap: '24px' },
};

export default Landing;
