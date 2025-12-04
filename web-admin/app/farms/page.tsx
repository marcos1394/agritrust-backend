"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { MapPin, Plus, Tractor, Map as MapIcon, FileText, AlertTriangle, Calendar } from "lucide-react";
import FarmMap from "../../components/FarmMap";

export default function LandManagementPage() {
  const axiosAuth = useAxiosAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState<string | null>(null); // FarmID si está activo

  // Form Rancho
  const [newName, setNewName] = useState("");
  const [newArea, setNewArea] = useState("");
  const [ownership, setOwnership] = useState("own");
  const [location, setLocation] = useState<any>(null);

  // Form Contrato
  const [landowner, setLandowner] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");

  const fetchData = async () => {
    try {
        const [fRes, aRes] = await Promise.all([
            axiosAuth.get("/farms"),      // Todos los ranchos
            axiosAuth.get("/land/alerts") // Alertas de contratos
        ]);
        setFarms(fRes.data);
        setAlerts(aRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [axiosAuth]);

  // Crear Rancho
  const handleCreateFarm = async () => {
    try {
        const tenantsRes = await axiosAuth.get("/tenants"); // Get current tenant context
        const tenantId = tenantsRes.data[0].id; // MVP: Pick first

        await axiosAuth.post("/farms", {
            tenant_id: tenantId,
            name: newName,
            total_area: parseFloat(newArea),
            ownership_type: ownership,
            location: JSON.stringify(location || { lat: 24.8, lng: -107.4 })
        });
        
        setShowFarmForm(false); setNewName(""); setNewArea(""); fetchData();
        alert("Predio registrado correctamente");
    } catch (error) { alert("Error al guardar"); }
  };

  // Crear Contrato
  const handleCreateContract = async (farmId: string) => {
    try {
        const tenantsRes = await axiosAuth.get("/tenants");
        const tenantId = tenantsRes.data[0].id;

        await axiosAuth.post("/land/contracts", {
            tenant_id: tenantId,
            farm_id: farmId,
            landowner_name: landowner,
            start_date: new Date().toISOString(),
            end_date: new Date(endDate).toISOString(),
            payment_amount: parseFloat(amount),
            payment_freq: "yearly"
        });

        setShowContractForm(null); fetchData();
        alert("Contrato registrado. El estatus del rancho cambió a 'Rentado'.");
    } catch (error) { alert("Error guardando contrato"); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* HEADER */}
      <header className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <MapIcon className="text-green-600" /> Land Management
            </h1>
            <p className="text-slate-500">Gestión de activos, contratos y situación legal de la tierra.</p>
        </div>
        <button onClick={() => setShowFarmForm(!showFarmForm)} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg">
            {showFarmForm ? "Cancelar" : <><Plus size={20} /> Registrar Predio</>}
        </button>
      </header>

      {/* ALERTAS DE CONTRATOS (Solo si hay) */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-sm">
            <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                <AlertTriangle size={20}/> Contratos Próximos a Vencer
            </h3>
            <div className="space-y-2">
                {alerts.map((c: any) => (
                    <div key={c.id} className="flex justify-between items-center text-sm text-orange-700 bg-white/50 p-2 rounded">
                        <span><strong>{c.farm?.name}</strong> - Expira el {new Date(c.end_date).toLocaleDateString()}</span>
                        <button className="text-xs font-bold underline hover:text-orange-900">Renovar</button>
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQ: MAPA & LISTA */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* FORMULARIO NUEVO RANCHO */}
            {showFarmForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
                    <h3 className="font-bold text-lg mb-4">Datos del Nuevo Predio</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input className="border p-2 rounded" placeholder="Nombre (Ej: La Joya)" value={newName} onChange={e => setNewName(e.target.value)} />
                        <input className="border p-2 rounded" type="number" placeholder="Hectáreas" value={newArea} onChange={e => setNewArea(e.target.value)} />
                        <select className="border p-2 rounded" value={ownership} onChange={e => setOwnership(e.target.value)}>
                            <option value="own">Propio (Escriturado)</option>
                            <option value="rented">Arrendado</option>
                            <option value="litigation">En Litigio</option>
                        </select>
                        <div className="flex items-center text-xs text-gray-500">
                            {location ? "✅ Ubicación fijada en mapa" : "👆 Haz clic en el mapa para ubicar"}
                        </div>
                    </div>
                    <button onClick={handleCreateFarm} disabled={!location} className="w-full bg-green-600 text-white font-bold py-2 rounded disabled:opacity-50">
                        Guardar Predio
                    </button>
                </div>
            )}

            {/* MAPA */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200">
                <FarmMap farms={farms} interactive={showFarmForm} onSelectLocation={(lat, lng) => setLocation({lat, lng})} />
            </div>

            {/* LISTA DE ACTIVOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farms.map(farm => (
                    <div key={farm.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg text-slate-800">{farm.name}</h4>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                farm.ownership_type === 'own' ? 'bg-green-50 text-green-700 border-green-200' :
                                farm.ownership_type === 'litigation' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                                {farm.ownership_type}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{farm.total_area} Hectáreas • {farm.location.includes('{') ? 'Geolocalizado' : 'Sin mapa'}</p>
                        
                        {/* Botones de Acción */}
                        <div className="flex gap-2">
                            {farm.ownership_type !== 'own' && (
                                <button 
                                    onClick={() => setShowContractForm(showContractForm === farm.id ? null : farm.id)}
                                    className="flex-1 bg-slate-50 text-slate-600 text-xs font-bold py-2 rounded hover:bg-slate-100 flex items-center justify-center gap-1"
                                >
                                    <FileText size={14}/> Contratos
                                </button>
                            )}
                            <button className="flex-1 bg-slate-50 text-slate-600 text-xs font-bold py-2 rounded hover:bg-slate-100">
                                Ver Historial
                            </button>
                        </div>

                        {/* FORMULARIO DE CONTRATO (Inline) */}
                        {showContractForm === farm.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 bg-slate-50 p-3 rounded text-sm animate-fade-in">
                                <p className="font-bold mb-2">Registrar Contrato de Renta</p>
                                <input className="w-full p-2 border rounded mb-2" placeholder="Nombre Dueño / Ejidatario" value={landowner} onChange={e => setLandowner(e.target.value)} />
                                <div className="flex gap-2 mb-2">
                                    <input type="date" className="w-full p-2 border rounded" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    <input type="number" className="w-full p-2 border rounded" placeholder="$ Monto" value={amount} onChange={e => setAmount(e.target.value)} />
                                </div>
                                <button onClick={() => handleCreateContract(farm.id)} className="w-full bg-blue-600 text-white font-bold py-2 rounded">Guardar Contrato</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* COLUMNA DER: ESTADÍSTICAS */}
        <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <h3 className="font-bold text-lg mb-4">Resumen de Tierras</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Total Hectáreas</span>
                        <span className="font-mono font-bold text-xl">{farms.reduce((acc, f) => acc + f.total_area, 0)} Has</span>
                    </div>
                    <div className="h-px bg-slate-700"></div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Propias</span>
                        <span>{farms.filter(f => f.ownership_type === 'own').length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div> Rentadas</span>
                        <span>{farms.filter(f => f.ownership_type === 'rented').length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full"></div> En Litigio</span>
                        <span>{farms.filter(f => f.ownership_type === 'litigation').length}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-2">Próximos Pagos</h3>
                <p className="text-xs text-slate-400 mb-4">Basado en contratos activos.</p>
                <div className="text-center py-8 text-slate-400 text-sm italic">
                    No hay pagos programados para este mes.
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}