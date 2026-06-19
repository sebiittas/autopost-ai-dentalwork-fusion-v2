import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Dashboard({ usuario, listaUsuarios }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Panel de AutoPost AI</h1>
      <p>Hola, {usuario.displayName || usuario.email}</p>

      <button onClick={() => signOut(auth)}>Cerrar sesión</button>

      <div style={{ marginTop: "30px" }}>
        <h2>Usuarios registrados</h2>

        {listaUsuarios.map((u, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <p><strong>{u.nombre}</strong> - {u.rol}</p>
            <p>{u.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;