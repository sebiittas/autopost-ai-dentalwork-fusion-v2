import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const provider = new GoogleAuthProvider()

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      setError('Error al iniciar con Google')
    }
  }

  const loginEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      setError('Correo o contraseña incorrectos')
    }
  }

  const registrar = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (e) {
      setError('Error al registrarse: ' + e.message)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', fontFamily: 'sans-serif' }}>
      <h2>AutoPost AI</h2>
      <button onClick={loginGoogle} style={{ width: '100%', padding: 12, marginBottom: 16, background: '#4285F4', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>
        Continuar con Google
      </button>
      <hr />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={loginEmail} style={{ width: '100%', padding: 12, marginBottom: 8, background: '#1A1A2E', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>
        Iniciar sesión
      </button>
      <button onClick={registrar} style={{ width: '100%', padding: 12, background: 'white', color: '#1A1A2E', border: '1px solid #1A1A2E', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>
        Crear cuenta nueva
      </button>
    </div>
  )
}

export default Login