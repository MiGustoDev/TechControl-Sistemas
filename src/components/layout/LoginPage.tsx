import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogIn, KeyRound, Mail, ShieldAlert } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor, completá todos los campos");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error("Error en inicio de sesión Supabase:", error);
        if (error.message.includes("Failed to fetch") || error.message.includes("network")) {
          toast.error("Error de conexión con el servidor de autenticación (Supabase)");
        } else {
          toast.error("Credenciales incorrectas o usuario inexistente");
        }
      } else {
        toast.success("Sesión iniciada con éxito");
      }
    } catch (err: any) {
      console.error("Error inesperado en inicio de sesión:", err);
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] size-[600px] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-[-20%] right-[-10%] size-[600px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse duration-7000" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Main Glassmorphic Card Wrapper */}
      <div className="relative w-full max-w-[460px] space-y-8 z-10">
        <div className="flex flex-col items-center space-y-3 text-center">
          {/* Logo container with double ring glowing effect */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 blur-md opacity-75 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative flex size-24 items-center justify-center rounded-full overflow-hidden bg-white border border-white/20 shadow-2xl p-1">
              <img 
                src={`${import.meta.env.BASE_URL}LOGOcircular.png`} 
                alt="Mi Gusto Logo" 
                className="size-full object-contain" 
              />
            </div>
          </div>
          
          <div className="space-y-1 mt-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              MG TechOps
            </h1>
            <p className="text-sm font-medium text-slate-400">
              Operaciones & Gestión Tecnológica
            </p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="relative group/card rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl p-8 shadow-[0_0_50px_-12px_rgba(249,115,22,0.15)] transition-all duration-500 hover:border-orange-500/20">
          {/* Top subtle decorative glowing line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <Mail className="size-3.5 text-orange-500" /> Correo Corporativo
              </label>
              <div className="relative group">
                <Input
                  type="email"
                  placeholder="usuario@migusto.com.ar"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-slate-950/40 border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl h-11 px-4 transition-all duration-300 focus:ring-1 focus:ring-orange-500/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <KeyRound className="size-3.5 text-orange-500" /> Contraseña
              </label>
              <div className="relative group">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-slate-950/40 border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl h-11 px-4 transition-all duration-300 focus:ring-1 focus:ring-orange-500/30"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-orange-950/30 hover:shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="size-5" /> Ingresar al Panel
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Security / Info Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-900/20 backdrop-blur-xs py-2.5 px-4 rounded-2xl border border-white/5">
          <ShieldAlert className="size-4 text-orange-500/60" />
          <span>Acceso restringido para personal autorizado de Mi Gusto</span>
        </div>
      </div>
    </div>
  );
}
