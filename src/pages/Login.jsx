import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const provider = new GoogleAuthProvider();

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError('Error al iniciar con Google');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      setError(isRegister ? 'Error al registrarse: ' + e.message : 'Correo o contraseña incorrectos');
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logoArea}>
          <span style={s.logoMark}>DENTALWORK</span>
          <span style={s.logoSub}>AUTOPREMIUM</span>
        </div>
        
        <h1 style={s.h1}>{isRegister ? 'Crear Cuenta' : 'Acceso Profesional'}</h1>
        <p style={s.p}>Bienvenido al centro de estrategia digital para odontología de lujo.</p>

        <button onClick={loginGoogle} style={s.googleBtn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={s.googleIcon} />
          Continuar con Google
        </button>

        <div style={s.divider}>
          <span style={s.dividerText}>o con email</span>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <input 
            type="email" 
            placeholder="Email profesional" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={s.input}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={s.input}
            required
          />
          {error && <p style={s.errorText}>{error}</p>}
          <button type="submit" style={s.submitBtn}>
            {isRegister ? 'REGISTRARSE' : 'ENTRAR AL STUDIO'}
          </button>
        </form>

        <button onClick={() => setIsRegister(!isRegister)} style={s.switchBtn}>
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--paper)',
    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(201,164,76,0.05) 0%, transparent 50%)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'white',
    padding: '48px',
    borderRadius: '12px',
    border: '1px solid var(--gray-200)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
  logoArea: { marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '2px' },
  logoMark: { fontWeight: '700', fontSize: '16px', letterSpacing: '0.2em' },
  logoSub: { fontSize: '9px', color: 'var(--gold-deep)', fontWeight: '500', letterSpacing: '0.1em' },
  h1: { fontSize: '28px', marginBottom: '12px' },
  p: { fontSize: '14px', color: 'var(--gray-600)', marginBottom: '32px', lineHeight: '1.5' },
  googleBtn: {
    width: '100%',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    background: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  googleIcon: { width: '18px', height: '18px' },
  divider: { margin: '24px 0', position: 'relative', borderTop: '1px solid var(--gray-200)' },
  dividerText: { position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 12px', fontSize: '12px', color: 'var(--gray-400)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { padding: '14px', borderRadius: '6px', border: '1px solid var(--gray-200)', background: 'var(--cream)', fontSize: '14px' },
  submitBtn: { padding: '16px', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', letterSpacing: '0.1em', cursor: 'pointer', marginTop: '8px' },
  switchBtn: { marginTop: '24px', background: 'none', border: 'none', color: 'var(--gold-deep)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
  errorText: { color: '#dc2626', fontSize: '12px', marginTop: '-8px' },
};

export default Login;
