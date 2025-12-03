"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Sprout, Box, Plus, Calendar, QrCode } from "lucide-react";

// TU URL PÚBLICA DE CODESPACES
const API_URL = "https://improved-funicular-gpxx6vqj47whpwr9-8080.app.github.dev";

// Tipos de datos
interface Crop {
  id: string;
  name: string;
  variety: string;
  status: string;
}

interface Batch {
  id: string;
  batch_code: string;
  harvest_date: string;
  crop?: Crop; // Relación opcional
}

export default function HarvestPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para formulario simple
  const [newCropName, setNewCropName] = useState("");

  const fetchData = async () => {
    try {
      const [cropsRes, batchesRes] = await Promise.all([
        axios.get(`${API_URL}/crops`),
        axios.get(`${API_URL}/harvest-batches`),
      ]);
      setCrops(cropsRes.data);
      setBatches(batchesRes.data);
    } catch (error) {
      console.error("Error fetching harvest data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función rápida para crear un cultivo (Mockup funcional)
  const handleCreateCrop = async () => {
    if (!newCropName) return;
    try {
        // Usamos un ID de tenant hardcodeado temporalmente o el primero que encontremos
        // En producción esto viene del Login
        const fakeTenantID = "f5ac9e66-a798-4b23-ad1c-82a9875eb623"; // Reemplaza si tienes uno a la mano, si no, fallará validación estricta
        
        await axios.post(`${API_URL}/crops`, {
            name: newCropName,
            variety: "Standard",
            status: "growing",
            tenant_id: fakeTenantID, // Necesitamos un ID real aquí para que pase, o desactivar la validación FK
            farm_id: fakeTenantID // Temporal
        });
        setNewCropName("");
        fetchData(); // Recargar
    } catch (e) {
        alert("Para crear cultivos necesitas asignar un TenantID válido en el código.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Box className="text-green-600" /> Centro de Cosecha
            </h1>
            <p className="text-gray-600">Gestione cultivos y lotes de trazabilidad.</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
            <Plus size={18} /> Nuevo Lote
        </button>
      </header>

      {/* Sección 1: Cultivos Activos */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Sprout size={20} /> Cultivos Activos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Card para crear nuevo (Visual) */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col justify-center items-center text-gray-400 hover:border-green-500 hover:text-green-500 transition cursor-pointer group">
                <Plus size={30} className="mb-2 group-hover:scale-110 transition" />
                <span className="font-medium">Sembrar Nuevo</span>
            </div>

            {loading ? <p>Cargando...</p> : crops.map(crop => (
                <div key={crop.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                            {crop.status.toUpperCase()}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{crop.name}</h3>
                    <p className="text-sm text-gray-500">{crop.variety}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Sección 2: Lotes de Cosecha (Traceability Batches) */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <QrCode size={20} /> Lotes de Trazabilidad
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm border-b">
                    <tr>
                        <th className="px-6 py-3">Código de Lote</th>
                        <th className="px-6 py-3">Cultivo Origen</th>
                        <th className="px-6 py-3">Fecha Corte</th>
                        <th className="px-6 py-3">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {batches.length === 0 ? (
                        <tr><td colSpan={4} className="p-6 text-center text-gray-400">No hay lotes abiertos hoy.</td></tr>
                    ) : batches.map(batch => (
                        <tr key={batch.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-mono font-medium text-blue-600">
                                {batch.batch_code}
                            </td>
                            <td className="px-6 py-4">
                                {batch.crop?.name || "Desconocido"}
                            </td>
                            <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(batch.harvest_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-green-600 font-medium text-sm">Abierto</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </section>
    </div>
  );
}