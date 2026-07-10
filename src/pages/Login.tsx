import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Obtener la URL base limpia
      let baseUrl = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001";
      if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);

      // 2. Petición directa al endpoint de login
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Credenciales incorrectas");
      }

      // 3. Guardar la sesión en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 4. Redirigir a la vista principal
      navigate("/");
      window.location.reload();
    } catch (err: any) {
      console.error("Error en login:", err);
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <LogIn size={24} />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground">Ingresa tus credenciales para acceder.</p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Correo electrónico</label>
            <div className="relative mt-1">
              <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border bg-background py-2 pr-4 pl-10 text-sm focus:border-primary focus:outline-none"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-background py-2 pr-4 pl-10 text-sm focus:border-primary focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}