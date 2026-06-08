import { useState } from "react";
import { enviarEmailRegistro } from "./emailService";

const BASE_URL = "https://api.escuelajs.co/api/v1";

function Auth({ onLogin }) {
  const [modo, setModo] = useState("login"); // 'login' o 'registro'
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (modo === "registro") {
        // 1. Registrar usuario
        const resRegistro = await fetch(`${BASE_URL}/users/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nombre,
            email,
            password,
            avatar: "https://picsum.photos/800",
          }),
        });
        const dataRegistro = await resRegistro.json();
        if (!resRegistro.ok)
          throw new Error(dataRegistro.message || "Error al registrarse");
      }

      // 2. Login (tanto si es registro nuevo como login directo)
      const resLogin = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const dataLogin = await resLogin.json();
      if (!resLogin.ok) throw new Error("Email o contraseña incorrectos");

      // 3. Guardar token y obtener perfil
      const token = dataLogin.access_token;
      const resPerfil = await fetch(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usuario = await resPerfil.json();

      // 4. Si es registro, enviar email de bienvenida
      if (modo === "registro") {
        enviarEmailRegistro(nombre, email).catch((err) =>
          console.error("Error enviando email de registro:", err),
        );
      }

      // 5. Guardar en localStorage y avisar a App
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      onLogin(usuario, token);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo);
    setError("");
    setNombre("");
    setEmail("");
    setPassword("");
  }

  return (
    <div id="auth">
      <div id="auth-box">
        <h2>🛍️ Tienda Online</h2>

        {/* Pestañas */}
        <div id="auth-tabs">
          <button
            className={modo === "login" ? "activo" : ""}
            onClick={() => cambiarModo("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={modo === "registro" ? "activo" : ""}
            onClick={() => cambiarModo("registro")}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {modo === "registro" && (
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p id="auth-error">{error}</p>}

          <button type="submit" disabled={cargando}>
            {cargando
              ? "⏳ Cargando..."
              : modo === "login"
                ? "Entrar"
                : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
