"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { CheckCircle, XCircle, Loader2, Sprout } from "lucide-react";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const axiosAuth = useAxiosAuth();
  
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleJoin = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      await axiosAuth.post("/team/join", { token });
      setStatus("success");
      // Esperar 2 segundos y redirigir al dashboard
      setTimeout(() => router.push("/"), 2000);
    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error.response?.data?.error || "La invitación no es válida o ya expiró.");
    }
  };

  if (!token) {
    return (
      <div className="text-center text-red-500">
        <XCircle size={48} className="mx-auto mb-4" />
        <h1 className="text-xl font-bold">Enlace inválido</h1>
        <p>No se encontró el código de invitación.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
      
      {/* HEADER LOGO */}
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sprout size={32} />
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">Invitación a AgriTrust</h1>
      <p className="text-slate-500 mb-8">
        Has sido invitado a colaborar en una organización agrícola.
      </p>

      {/* ESTADOS DE LA ACCIÓN */}
      
      {status === "idle" && (
        <button 
          onClick={handleJoin}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg transform hover:-translate-y-1"
        >
          Aceptar y Unirse al Equipo
        </button>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center text-slate-500">
          <Loader2 className="animate-spin mb-2 text-blue-600" size={32} />
          <p>Procesando tu ingreso...</p>
        </div>
      )}

      {status === "success" && (
        <div className="animate-fade-in">
          <div className="text-green-600 flex justify-center mb-4">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">¡Bienvenido!</h3>
          <p className="text-sm text-slate-500">Redirigiendo a tu panel...</p>
        </div>
      )}

      {status === "error" && (
        <div className="animate-shake">
          <div className="text-red-500 flex justify-center mb-4">
            <XCircle size={48} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Hubo un problema</h3>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {errorMsg}
          </p>
          <button 
            onClick={() => router.push("/")}
            className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline"
          >
            Ir al inicio
          </button>
        </div>
      )}
    </div>
  );
}

// Página principal que envuelve el contenido en Suspense (Requerido por Next.js App Router para useSearchParams)
export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <JoinContent />
      </Suspense>
    </div>
  );
}