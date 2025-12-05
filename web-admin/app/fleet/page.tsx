"use client";

import { useState, useEffect } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { Tractor, PenTool, Plus, Gauge, AlertCircle, CheckCircle, Clock, Loader2, X, Wrench, TrendingUp } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState<Asset | null>(null);
  const [showServiceModal, setShowServiceModal] = useState<Asset | null>(null);
  const [error, setError] = useState("");

  // Form States
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("tractor");
  const [usageInput, setUsageInput] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceCost, setServiceCost] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get("/fleet/assets");
      setAssets(res.data || []);
    } catch(e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [axiosAuth]);

  // Actions
  const handleCreate = async () => {
    if (!newName) {
      setError("Por favor ingresa el nombre del activo");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await axiosAuth.post("/fleet/assets", {
        name: newName, 
        type: newType, 
        usage_unit: "hours", 
        service_interval: 200, 
        current_usage: 0,
        tenant_id: "fake-uuid-replace-in-prod"
      });
      setShowForm(false);
      setNewName("");
      setNewType("tractor");
      loadData();
    } catch (err) {
      setError("Error al crear el activo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUsage = async () => {
    if(!showUsageModal || !usageInput) {
      setError("Por favor ingresa las horas");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await axiosAuth.post(`/fleet/assets/${showUsageModal.id}/usage`, { 
        add_amount: parseFloat(usageInput) 
      });
      setShowUsageModal(null);
      setUsageInput("");
      loadData();
    } catch (err) {
      setError("Error al agregar uso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleService = async () => {
    if(!showServiceModal || !serviceDesc || !serviceCost) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await axiosAuth.post(`/fleet/assets/${showServiceModal.id}/maintenance`, {
        description: serviceDesc,
        cost: parseFloat(serviceCost),
        type: "preventive",
        tenant_id: "fake-uuid-replace-in-prod"
      });
      setShowServiceModal(null);
      setServiceDesc("");
      setServiceCost("");
      loadData();
    } catch (err) {
      setError("Error al registrar mantenimiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper para barra de progreso
  const getHealth = (asset: Asset) => {
    const usageSinceService = asset.service_interval - (asset.next_service_at - asset.current_usage);
    const percentage = (usageSinceService / asset.service_interval) * 100;
    const remaining = asset.next_service_at - asset.current_usage;
    
    let color = "from-green-500 to-emerald-500";
    let bgColor = "from-green-50 to-emerald-50 border-green-200";
    let textColor = "text-green-900";
    let statusText = "Excelente";

    if(percentage > 75) {
      color = "from-amber-500 to-orange-500";
      bgColor = "from-amber-50 to-orange-50 border-amber-200";
      textColor = "text-amber-900";
      statusText = "Próximo servicio";
    }
    if(percentage >= 100) {
      color = "from-red-500 to-rose-500";
      bgColor = "from-red-50 to-rose-50 border-red-200";
      textColor = "text-red-900";
      statusText = "Mantenimiento urgente";
    }

    return { 
      percentage: Math.min(percentage, 100), 
      remaining, 
      color,
      bgColor,
      textColor,
      statusText
    };
  };

  const getAssetIcon = (type: string) => {
    switch(type) {
      case 'tractor': return '🚜';
      case 'pickup': return '🚙';
      case 'pump': return '💧';
      default: return '⚙️';
    }
  };

  const getAssetTypeLabel = (type: string) => {
    switch(type) {
      case 'tractor': return 'Tractor';
      case 'pickup': return 'Camioneta';
      case 'pump': return 'Bomba de Riego';
      default: return type;
    }
  };

  // Stats
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const needsService = assets.filter(a => {
    const health = getHealth(a);
    return health.percentage >= 75;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl">
                <Tractor size={28} className="text-orange-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Maquinaria y Activos</h1>
                <p className="text-slate-600 mt-1">Control de horas de uso, mantenimiento preventivo y costos operacionales</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-orange-500/30"
          >
            {showForm ? "Cancelar" : <><Plus size={20} /> Nuevo Activo</>}
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Total de Activos</p>
            <p className="text-3xl font-bold text-slate-900">{assets.length}</p>
            <p className="text-xs text-slate-500 mt-2">{activeAssets} activos</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-600" />
              <p className="text-xs font-medium text-amber-700 uppercase tracking-widest">Próximo Servicio</p>
            </div>
            <p className="text-3xl font-bold text-amber-900">{needsService}</p>
            <p className="text-xs text-amber-600 mt-2">Requiere atención</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-slate-600" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Operativo</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{Math.round((activeAssets / assets.length) * 100)}%</p>
            <p className="text-xs text-slate-500 mt-2">De la flota</p>
          </div>
        </div>

        {/* FORMULARIO */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Tractor size={24} className="text-orange-600" />
              Registrar Nuevo Activo
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-900 mb-2">Nombre / Modelo</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                  placeholder="Ej: John Deere 6120M, Bomba Riego Sector A" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Tipo de Activo</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition text-slate-900"
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                >
                  <option value="tractor">🚜 Tractor</option>
                  <option value="pickup">🚙 Camioneta</option>
                  <option value="pump">💧 Bomba de Riego</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Intervalo Servicio (hrs)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition text-slate-900"
                  placeholder="200"
                  defaultValue="200"
                />
              </div>
            </div>

            <button 
              onClick={handleCreate}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Guardar Activo
                </>
              )}
            </button>
          </div>
        )}

        {/* GRID DE ACTIVOS */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Loader2 size={40} className="text-orange-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Cargando activos...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
            <Tractor size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-900 font-bold text-lg">Sin activos registrados</p>
            <p className="text-slate-600 text-sm mt-1">Agrega tu primer activo para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {assets.map(asset => {
              const health = getHealth(asset);
              return (
                <div 
                  key={asset.id} 
                  className={`bg-gradient-to-br ${health.bgColor} rounded-2xl border-2 p-6 hover:shadow-md transition-all duration-300 group`}
                >
                  {/* HEADER CARD */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/60 rounded-xl text-2xl">
                        {getAssetIcon(asset.type)}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${health.textColor}`}>{asset.name}</h3>
                        <p className={`text-xs font-medium ${health.textColor} opacity-75 mt-0.5`}>
                          {getAssetTypeLabel(asset.type)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      asset.status === 'active'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {asset.status === 'active' ? '🟢 Activo' : '⚪ Inactivo'}
                    </span>
                  </div>

                  {/* MEDIDORES */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="flex justify-center mb-1">
                        <Gauge size={16} className={health.textColor} />
                      </div>
                      <p className="font-mono font-bold text-lg text-slate-900">{asset.current_usage}</p>
                      <p className="text-[10px] text-slate-600 uppercase font-medium">Horas Usadas</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center">
                      <div className="flex justify-center mb-1">
                        <Clock size={16} className={health.textColor} />
                      </div>
                      <p className={`font-mono font-bold text-lg ${health.percentage >= 100 ? 'text-red-600' : 'text-slate-900'}`}>
                        {Math.max(0, Math.round(health.remaining))}
                      </p>
                      <p className="text-[10px] text-slate-600 uppercase font-medium">Hrs al Servicio</p>
                    </div>
                  </div>

                  {/* BARRA DE SALUD */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold uppercase ${health.textColor}`}>
                        {health.statusText}
                      </span>
                      <span className={`text-sm font-bold ${health.textColor}`}>
                        {Math.round(health.percentage)}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/40 rounded-full overflow-hidden border border-white/60">
                      <div 
                        className={`h-full bg-gradient-to-r ${health.color} transition-all duration-500`} 
                        style={{width: `${health.percentage}%`}}
                      ></div>
                    </div>
                  </div>

                  {/* ACCIONES */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowUsageModal(asset)}
                      className="flex-1 bg-white/60 hover:bg-white text-slate-700 text-sm font-bold py-2.5 rounded-lg transition-colors"
                    >
                      + Horas
                    </button>
                    <button 
                      onClick={() => setShowServiceModal(asset)}
                      className="flex-1 bg-white/80 hover:bg-white text-slate-900 text-sm font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Wrench size={14} />
                      Taller
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL USO */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Registrar Uso</h3>
                <p className="text-slate-600 text-sm mt-1">{showUsageModal.name}</p>
              </div>
              <button 
                onClick={() => setShowUsageModal(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex gap-3">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Horas a Agregar</label>
                <input 
                  type="number" 
                  autoFocus 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                  placeholder="Ej: 8.5" 
                  onChange={e => setUsageInput(e.target.value)}
                  value={usageInput}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowUsageModal(null)}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddUsage}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/30 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Agregar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SERVICIO */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle size={28} className="text-green-600" />
                  Mantenimiento
                </h3>
                <p className="text-slate-600 text-sm mt-1">Resetea el contador de servicio</p>
              </div>
              <button 
                onClick={() => setShowServiceModal(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex gap-3">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium">
                <strong>{showServiceModal.name}</strong> volverá a 0 horas de uso
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Descripción del Servicio</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                  placeholder="Ej: Cambio de aceite, Mantenimiento general" 
                  onChange={e => setServiceDesc(e.target.value)}
                  value={serviceDesc}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Costo Total</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                    placeholder="0.00" 
                    onChange={e => setServiceCost(e.target.value)}
                    value={serviceCost}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowServiceModal(null)}
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleService}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
