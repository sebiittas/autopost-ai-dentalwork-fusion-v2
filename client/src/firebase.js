import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth' // <--- Agregamos GoogleAuthProvider aquí
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBztBNqW2NlCcYWOTRkOcn5NQjsVw2nlfg",
  authDomain: "autopost-ai-cab57.firebaseapp.com",
  projectId: "autopost-ai-cab57",
  storageBucket: "autopost-ai-cab57.firebasestorage.app",
  messagingSenderId: "1051396308090",
  appId: "1:1051396308090:web:bace83f13c96e0a77a0fc3"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider() // <--- Agregamos esta línea
export const db = getFirestore(app)
