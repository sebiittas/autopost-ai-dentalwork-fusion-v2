import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

import { auth, db } from "./firebase";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login";
import UserPanel from "./pages/UserPanel";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          let userData;

          if (!userSnap.exists()) {
            userData = {
              nombre: firebaseUser.displayName || "",
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              rol: "user",
              empresa: "DentalWork",
              creadoEn: new Date(),
            };
            await setDoc(userRef, userData);
          } else {
            userData = userSnap.data();
          }

          setRol(userData.rol);

          if (userData.rol === "admin") {
            const querySnapshot = await getDocs(collection(db, "users"));
            setListaUsuarios(querySnapshot.docs.map((item) => item.data()));
          }

          setUsuario(firebaseUser);
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
          setUsuario(firebaseUser);
        }
      } else {
        setUsuario(null);
        setRol(null);
        setListaUsuarios([]);
      }

      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  if (cargando) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif", color: "#6b7280" }}>
        <p>Cargando DentalWork Autoposter...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!usuario ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route
              path="/admin"
              element={
                rol === "admin" ? (
                  <Dashboard usuario={usuario} listaUsuarios={listaUsuarios} />
                ) : (
                  <Navigate to="/app" />
                )
              }
            />
            <Route path="/app" element={<UserPanel usuario={usuario} />} />
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Navigate to={rol === "admin" ? "/admin" : "/app"} />} />
            <Route path="*" element={<Navigate to={rol === "admin" ? "/admin" : "/app"} />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
