"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { MapPin, Plus, Tractor, Map as MapIcon } from "lucide-react";
// Importamos el mapa dinámicamente para evitar errores de SSR (Server Side Rendering)

// PON ESTO:
import FarmMap from "../../components/FarmMap";

export default function FarmsPage() {
  const axiosAuth = useAxiosAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para nuevo rancho
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newArea, setNewArea] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);

  // Cargar Ranchos
  const fetchFarms = async () => {
      // Primero necesitamos el Tenant ID. 
      // En un flujo real, el backend debería filtrar por el owner, 
      // o guardamos el tenant_id en el localStorage al hacer login.
      // TRUCO PROVISIONAL: Pedimos tenants, tomamos el primero y pedimos sus ranchos.
      try {
        const tenantsRes = await axiosAuth.get("/tenants");
        if (tenantsRes.data.length > 0) {
            const tenantId = tenantsRes.data[0].id;
            const res = await axiosAuth.get(`/farms?tenant_id=${tenantId}`);
            setFarms(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchFarms();
  }, [axiosAuth]);

  // Guardar Rancho
  const handleCreate = async () => {
    try {
        const tenantsRes = await axiosAuth.get("/tenants");
        const tenantId = tenantsRes.data[0].id;

        await axiosAuth.post("/farms", {
            tenant_id: tenantId,
            name: newName,
            total_area: parseFloat(newArea),
            location: JSON.stringify(selectedLocation || { lat: 24.8, lng: -107.4 }) // Guardamos JSON
        });
        
        setShowForm(false);
        setNewName("");
        setNewArea("");
        fetchFarms(); // Recargar
        alert("Rancho registrado correctamente");
    } catch (error) {
        alert("Error al guardar");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <MapIcon className="text-green-600" /> Gestión de Tierras
            </h1>
            <p className="text-slate-500">Visualice sus activos y parcelas productivas.</p>
        </div>
        <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition"
        >
            {showForm ? "Cancelar" : <><Plus size={20} /> Registrar Nuevo Rancho</>}
        </button>
      </header>

      {/* FORMULARIO DE ALTA (Solo se muestra al dar click) */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800">1. Datos del Predio</h3>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Rancho</label>
                    <input type="text" className="w-full p-3 border rounded-lg" placeholder="Ej: La Agrícola del Sol" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Hectáreas Totales</label>
                    <input type="number" className="w-full p-3 border rounded-lg" placeholder="50" value={newArea} onChange={e => setNewArea(e.target.value)} />
                </div>
                
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                    <strong>Instrucción:</strong> Haga clic en el mapa de la derecha para establecer la ubicación exacta del portón principal del rancho.
                </div>
                
                <button onClick={handleCreate} disabled={!selectedLocation || !newName} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
                    Guardar Ubicación
                </button>
            </div>

            <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-800 flex justify-between">
                    <span>2. Ubicación Satelital</span>
                    {selectedLocation && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Coords: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</span>}
                </h3>
                {/* Mapa Interactivo para seleccionar */}
                <FarmMap 
                    farms={[]} 
                    interactive={true} 
                    onSelectLocation={(lat, lng) => setSelectedLocation({ lat, lng })} 
                />
            </div>
        </div>
      )}

      {/* MAPA GENERAL DE ACTIVOS */}
      <section className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200">
         <FarmMap farms={farms} />
      </section>

      {/* LISTA DE RANCHOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {farms.map((farm) => (
            <div key={farm.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-green-400 transition group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
                        <Tractor size={24} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 border px-2 py-1 rounded-full">
                        {farm.total_area} Has
                    </span>
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-1">{farm.name}</h3>
                <div className="flex items-center text-sm text-gray-500 gap-1">
                    <MapPin size={14} />
                    <span className="truncate max-w-[200px]">
                        {/* Intentamos mostrar algo legible si es JSON, o el texto si no */}
                        {farm.location.includes('{') ? "Ubicación Satelital Registrada" : farm.location}
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}