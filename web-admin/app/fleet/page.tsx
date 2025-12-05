"use client";

import { useState, useEffect } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { Tractor, PenTool, Plus, Gauge, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  type: string;
  current_usage: number;
  usage_unit: string;
  service_interval: number;
  next_service_at: number;
  status: string;
}

export default function FleetPage() {
  const axiosAuth = useAxiosAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState<Asset | null>(null);
  const [showServiceModal, setShowServiceModal] = useState<Asset | null>(null);

  // Form States
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("tractor");
  const [usageInput, setUsageInput] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCost, setServiceCost] = useState("");

  const loadData = async () => {
    try {
        const res = await axiosAuth.get("/fleet/assets");
        setAssets(res.data);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, [axiosAuth]);

  // Actions
  const handleCreate = async () => {
    await axiosAuth.post("/fleet/assets", {
        name: newName, type: newType, usage_unit: "hours", service_interval: 200, current_usage: 0,
        tenant_id: "fake-uuid-replace-in-prod" // El backend debería tomarlo del token
    });
    setShowForm(false); loadData();
  };

  const handleAddUsage = async () => {
    if(!showUsageModal) return;
    await axiosAuth.post(`/fleet/assets/${showUsageModal.id}/usage`, { add_amount: parseFloat(usageInput) });
    setShowUsageModal(null); setUsageInput(""); loadData();
  };

  const handleService = async () => {
    if(!showServiceModal) return;
    await axiosAuth.post(`/fleet/assets/${showServiceModal.id}/maintenance`, {
        description: serviceDesc, cost: parseFloat(serviceCost), type: "preventive",
        tenant_id: "fake-uuid-replace-in-prod"
    });
    setShowServiceModal(null); setServiceDesc(""); setServiceCost(""); loadData();
  };

  // Helper para barra de progreso
  const getHealth = (asset: Asset) => {
    const usageSinceService = asset.service_interval - (asset.next_service_at - asset.current_usage);
    const percentage = (usageSinceService / asset.service_interval) * 100;
    const remaining = asset.next_service_at - asset.current_usage;
    
    let color = "bg-green-500";
    if(percentage > 75) color = "bg-yellow-500";
    if(percentage >= 100) color = "bg-red-600";

    return { percentage: Math.min(percentage, 100), remaining, color };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Tractor className="text-orange-500" /> Maquinaria y Activos
            </h1>
            <p className="text-slate-500">Control de horas, combustible y mantenimiento.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Plus size={18}/> Nuevo Activo
        </button>
      </header>

      {/* FORMULARIO RÁPIDO */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100 flex gap-4 items-end">
            <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre / Modelo</label>
                <input className="w-full border p-2 rounded" placeholder="Ej: John Deere 6120M" onChange={e=>setNewName(e.target.value)} />
            </div>
            <div className="w-48">
                <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                <select className="w-full border p-2 rounded" onChange={e=>setNewType(e.target.value)}>
                    <option value="tractor">Tractor</option>
                    <option value="pickup">Camioneta</option>
                    <option value="pump">Bomba de Riego</option>
                </select>
            </div>
            <button onClick={handleCreate} className="bg-orange-600 text-white px-6 py-2 rounded font-bold">Guardar</button>
        </div>
      )}

      {/* GRID DE ACTIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(asset => {
            const health = getHealth(asset);
            return (
                <div key={asset.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600 transition">
                                <Tractor size={24}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{asset.name}</h3>
                                <p className="text-xs text-slate-500 uppercase">{asset.type}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${asset.status==='active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                            {asset.status}
                        </span>
                    </div>

                    {/* MEDIDORES */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="flex justify-center text-slate-400 mb-1"><Gauge size={16}/></div>
                            <p className="font-mono font-bold text-lg text-slate-700">{asset.current_usage}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{asset.usage_unit}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="flex justify-center text-slate-400 mb-1"><Clock size={16}/></div>
                            <p className={`font-mono font-bold text-lg ${health.percentage >= 100 ? 'text-red-500' : 'text-slate-700'}`}>
                                {health.remaining > 0 ? health.remaining : 0}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase">Hrs para servicio</p>
                        </div>
                    </div>

                    {/* BARRA DE SALUD MECÁNICA */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Vida Útil Aceite</span>
                            <span className={health.percentage >= 100 ? 'text-red-600 font-bold' : 'text-slate-700'}>{Math.round(health.percentage)}% Usado</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${health.color} transition-all duration-500`} style={{width: `${health.percentage}%`}}></div>
                        </div>
                    </div>

                    {/* ACCIONES */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowUsageModal(asset)}
                            className="flex-1 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded hover:bg-slate-50"
                        >
                            + Horas
                        </button>
                        <button 
                            onClick={() => setShowServiceModal(asset)}
                            className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded hover:bg-slate-800 flex items-center justify-center gap-1"
                        >
                            <PenTool size={12}/> Taller
                        </button>
                    </div>
                </div>
            )
        })}
      </div>

      {/* MODAL USO */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-80">
                <h3 className="font-bold mb-4">Registrar Trabajo Diario</h3>
                <p className="text-sm text-gray-500 mb-2">{showUsageModal.name}</p>
                <input type="number" autoFocus className="w-full border p-2 rounded mb-4" placeholder="Horas trabajadas hoy" onChange={e=>setUsageInput(e.target.value)}/>
                <div className="flex gap-2">
                    <button onClick={()=>setShowUsageModal(null)} className="flex-1 py-2 bg-gray-100 rounded">Cancelar</button>
                    <button onClick={handleAddUsage} className="flex-1 py-2 bg-green-600 text-white rounded font-bold">Sumar</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL SERVICIO */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96">
                <h3 className="font-bold mb-4 flex items-center gap-2"><CheckCircle className="text-green-600"/> Registrar Mantenimiento</h3>
                <p className="text-sm text-gray-500 mb-4">Esto reseteará el contador de servicio para {showServiceModal.name}.</p>
                
                <input className="w-full border p-2 rounded mb-3" placeholder="Descripción (Ej: Cambio Aceite)" onChange={e=>setServiceDesc(e.target.value)}/>
                <input type="number" className="w-full border p-2 rounded mb-4" placeholder="Costo Total ($)" onChange={e=>setServiceCost(e.target.value)}/>
                
                <div className="flex gap-2">
                    <button onClick={()=>setShowServiceModal(null)} className="flex-1 py-2 bg-gray-100 rounded">Cancelar</button>
                    <button onClick={handleService} className="flex-1 py-2 bg-slate-900 text-white rounded font-bold">Confirmar</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
