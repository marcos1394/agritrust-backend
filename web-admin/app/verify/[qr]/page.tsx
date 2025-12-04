"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { 
  MapPin, Calendar, Award, Sprout, CheckCircle, Clock 
} from "lucide-react";
// Usamos el mapa de Google que ya creamos (reutilización de componentes)
import FarmMap from "../../../components/FarmMap";

// IMPORTANTE: Aquí NO usamos useAxiosAuth porque es público. Usamos axios normal.
// Definir URL base manualmente o importar de config público
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://agritrust-api.onrender.com"; // Ajusta a tu URL real

export default function PassportPage() {
  const params = useParams();
  const qrCode = params.qr as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!qrCode) return;
    
    // Llamada pública
    axios.get(`${API_URL}/public/passport/${qrCode}`)
      .then(res => setData(res.data))
      .catch(err => setError("No pudimos validar este producto. Puede ser falso o no registrado."))
      .finally(() => setLoading(false));
  }, [qrCode]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white text-green-600">Verificando Origen...</div>;
  
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
      <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">X</div>
      <h1 className="text-2xl font-bold text-gray-800">Producto No Verificado</h1>
      <p className="text-gray-500 mt-2">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      
      {/* HEADER DE CERTIFICACIÓN */}
      <div className="bg-green-600 text-white p-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-green-700/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-green-400/30">
                <CheckCircle size={14} /> Verificado por AgriTrust
            </div>
            <h1 className="text-3xl font-bold mb-1">{data.product_name}</h1>
            <p className="text-green-100 text-lg">{data.variety}</p>
        </div>
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Sprout size={300} className="-ml-10 -mt-10" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-6 relative z-20 space-y-6">
        
        {/* TARJETA DE ORIGEN */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <MapPin size={24} />
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Origen</p>
                    <p className="font-bold text-gray-800 text-lg">{data.origin}</p>
                    <p className="text-sm text-gray-500">{data.producer}</p>
                </div>
            </div>
            
            {/* Mapa Miniatura (Reutilizamos tu componente) */}
            <div className="h-48 rounded-xl overflow-hidden border border-gray-200">
                <FarmMap 
                    farms={[{ id: "1", name: data.origin, location: data.location }]} 
                    interactive={false}
                />
            </div>
        </div>

        {/* LÍNEA DE TIEMPO (JOURNEY) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-green-600" /> El Viaje de tu Fruta
            </h3>
            
            <div className="space-y-6 pl-2 border-l-2 border-gray-100 ml-2">
                {data.journey.map((step: any, index: number) => (
                    <div key={index} className="relative pl-6">
                        {/* Puntito de la línea de tiempo */}
                        <div className="absolute -left-[9px] top-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
                        
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                            {new Date(step.date).toLocaleDateString()}
                        </p>
                        <h4 className="font-bold text-gray-800">{step.stage}</h4>
                        <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* CERTIFICACIONES */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <Award className="text-yellow-400" /> Garantía de Calidad
            </h3>
            <div className="flex flex-wrap gap-2">
                {data.certifications.map((cert: string) => (
                    <span key={cert} className="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">
                        {cert}
                    </span>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-slate-300">
                <Clock size={16} />
                <span>Cosechado hace {Math.floor(data.freshness_hrs / 24)} días</span>
            </div>
        </div>

        <div className="text-center pb-8">
            <p className="text-xs text-gray-400">Tecnología AgriTrust Blockchain Ready</p>
        </div>

      </div>
    </div>
  );
}