import { useState } from "react";
import authService from "../../../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      console.log("✅ Login exitoso:", data);
      // Aquí puedes redirigir al dashboard según rol
    } catch (err) {
      setError(err.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 p-6">
      <div className="flex flex-col md:flex-row items-center bg-white/90 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl">
        
        {/* Lado izquierdo - ilustración */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-blue-100 p-6">
          <img
            src="/doctor-nurse.png"
            alt="Doctors Illustration"
            className="w-72 h-auto"
          />
        </div>

        {/* Lado derecho - formulario */}
        <div className="flex-1 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            ¡BIENVENIDO!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>

            {/* Recordar y olvidar */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md transition duration-200"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-center font-medium">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}


export default Login;