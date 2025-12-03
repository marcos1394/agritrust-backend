"use client";

import { useEffect, useState } from "react";
import { Sprout, Box, Plus, Calendar, QrCode, RefreshCw } from "lucide-react";
import { API_URL } from '../../utils/api'; // Ajusta la ruta según donde lo creaste
import { useAxiosAuth } from "../../lib/useAxiosAuth"; // <--- IMPORTA ESTO


// Interfaces
interface Crop { id: string; name: string; variety: string; status: string; }
interface Batch { id: string; batch_code: string; harvest_date: string; crop?: Crop; }
// Nueva Interfaz para Bins
interface Bin { id: string; qr_code: string; weight_kg: number; status: string; updated_at: string; }

export default function HarvestPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [bins, setBins] = useState<Bin[]>([]); // <--- Estado para cajas
  const [loading, setLoading] = useState(true);
  const axiosAuth = useAxiosAuth(); // <--- INICIALIZA EL HOOK


  const fetchData = async () => {
    try {
      const [cropsRes, batchesRes, binsRes] = await Promise.all([
        axiosAuth.get(`${API_URL}/crops`),
        axiosAuth.get(`${API_URL}/harvest-batches`),
        axiosAuth.get(`${API_URL}/bins`), // <--- Petición nueva
      ]);
      setCrops(cropsRes.data);
      setBatches(batchesRes.data);
      setBins(binsRes.data);
    } catch (error) {
      console.error("Error fetching harvest data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // TRUCO PRO: Auto-recarga cada 10 segundos para ver datos en "Tiempo Real"
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Box className="text-green-600" /> Centro de Cosecha
            </h1>
            <p className="text-gray-600">Monitoreo de flujo de fruta en tiempo real.</p>
        </div>
        <button 
          onClick={fetchData}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
        >
            <RefreshCw size={18} /> Actualizar Ahora
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (2/3): Lotes y Cultivos */}
        <div className="lg:col-span-2 space-y-8">
            {/* Sección Lotes */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <QrCode size={18} /> Lotes Activos (Batches)
                    </h3>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-white text-gray-500 border-b">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Cultivo</th>
                            <th className="px-6 py-3">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {batches.map(batch => (
                            <tr key={batch.id}>
                                <td className="px-6 py-3 font-mono text-blue-600 font-medium">{batch.batch_code}</td>
                                <td className="px-6 py-3">{batch.crop?.name}</td>
                                <td className="px-6 py-3 text-gray-500">{new Date(batch.harvest_date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>

        {/* COLUMNA DERECHA (1/3): FEED EN VIVO DE ESCANEO */}
        <div className="lg:col-span-1">
            <section className="bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden h-full max-h-[600px] flex flex-col">
                <div className="p-4 border-b border-slate-700 bg-slate-800">
                    <h3 className="font-bold text-green-400 flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Live Feed: Entrada de Cajas
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Últimos escaneos recibidos desde campo</p>
                </div>
                
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                    {bins.length === 0 ? (
                        <p className="text-center text-slate-500 py-10">Esperando datos...</p>
                    ) : bins.map(bin => (
                        <div key={bin.id} className="bg-slate-800 p-3 rounded-lg border-l-4 border-green-500 flex justify-between items-center">
                            <div>
                                <p className="font-mono text-lg font-bold text-white">{bin.qr_code}</p>
                                <p className="text-xs text-slate-400">
                                    {new Date(bin.updated_at).toLocaleTimeString()} • {bin.weight_kg} kg
                                </p>
                            </div>
                            <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">
                                RECIBIDO
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>

      </div>
    </div>
  );
}