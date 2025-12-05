"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { MapPin, Plus, Tractor, Map as MapIcon, FileText, AlertTriangle, Calendar, Loader2, Home, AlertCircle, Zap } from "lucide-react";
import FarmMap from "../../components/FarmMap";

export default function LandManagementPage() {
  const axiosAuth = useAxiosAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        axiosAuth.get("/farms"),
        axiosAuth.get("/land/alerts")
      ]);
      setFarms(fRes.data);
      setAlerts(aRes.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [axiosAuth]);

  const handleCreateFarm = async () => {
    if (!newName || !newArea) {
      setError("Por favor completa todos los campos");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      const tenantsRes = await axiosAuth.get("/tenants");
      const tenantId = tenantsRes.data[0].id;

      await axiosAuth.post("/farms", {
        tenant_id: tenantId,
        name: newName,
        total_area: parseFloat(newArea),
        ownership_type: ownership,
        location: JSON.stringify(location || { lat: 24.8, lng: -107.4 })
      });
      
      setShowFarmForm(false);
      setNewName("");
      setNewArea("");
      setLocation(null);
      fetchData();
    } catch (error) { 
      setError("Error al guardar el predio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateContract = async (farmId: string) => {
    if (!landowner || !endDate || !amount) {
      setError("Por favor completa todos los campos del contrato");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
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

      setShowContractForm(null);
      setLandowner("");
      setEndDate("");
      setAmount("");
      fetchData();
    } catch (error) { 
      setError("Error guardando contrato");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats
  const totalHectares = farms.reduce((acc, f) => acc + f.total_area, 0);
  const ownedCount = farms.filter(f => f.ownership_type === 'own').length;
  const rentedCount = farms.filter(f => f.ownership_type === 'rented').length;
  const litigationCount = farms.filter(f => f.ownership_type === 'litigation').length;

  const getOwnershipColor = (type: string) => {
    switch(type) {
      case 'own': return 'from-green-50 to-emerald-50 border-green-200';
      case 'rented': return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'litigation': return 'from-red-50 to-rose-50 border-red-200';
      default: return 'from-slate-50 to-slate-100 border-slate-200';
    }
  };

  const getOwnershipIcon = (type: string) => {
    switch(type) {
      case 'own': return <Home size={20} className="text-green-600" />;
      case 'rented': return <FileText size={20} className="text-blue-600" />;
      case 'litigation': return <AlertCircle size={20} className="text-red-600" />;
      default: return <MapPin size={20} className="text-slate-600" />;
    }
  };

  const getOwnershipLabel = (type: string) => {
    switch(type) {
      case 'own': return 'Propio';
      case 'rented': return 'Rentado';
      case 'litigation': return 'En Litigio';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                <MapIcon size={28} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Land Management</h1>
                <p className="text-slate-600 mt-1">Gestión de predios, contratos y estatus legal de tierras</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowFarmForm(!showFarmForm)} 
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-green-500/30"
          >
            {showFarmForm ? "Cancelar" : <><Plus size={20} /> Nuevo Predio</>}
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Total Hectáreas</p>
            <p className="text-3xl font-bold text-green-600">{totalHectares.toFixed(1)}</p>
            <p className="text-xs text-slate-500 mt-2">{farms.length} predios</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-green-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Home size={14} /> Propios
            </p>
            <p className="text-3xl font-bold text-green-900">{ownedCount}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <FileText size={14} /> Rentados
            </p>
            <p className="text-3xl font-bold text-blue-900">{rentedCount}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-200 p-6 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-red-700 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertCircle size={14} /> En Litigio
            </p>
            <p className="text-3xl font-bold text-red-900">{litigationCount}</p>
          </div>
        </div>

        {/* ALERTS */}
        {alerts.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-4">
              <AlertTriangle size={22} className="text-amber-600" /> 
              {alerts.length} Contrato(s) próximo(s) a vencer
            </h3>
            <div className="space-y-3">
              {alerts.map((c: any) => (
                <div key={c.id} className="bg-white/70 backdrop-blur-sm p-4 rounded-xl flex justify-between items-center hover:bg-white transition-colors">
                  <div>
                    <p className="font-bold text-amber-900">{c.farm?.name}</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Expira: {new Date(c.end_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg transition-colors">
                    Renovar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* NUEVO FORM */}
            {showFarmForm && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Plus size={24} className="text-green-600" />
                  Registrar Nuevo Predio
                </h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Nombre del Predio</label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                      placeholder="Ej: La Joya, Los Olivos, etc." 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Hectáreas</label>
                      <input 
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                        type="number" 
                        step="0.1"
                        placeholder="100" 
                        value={newArea} 
                        onChange={e => setNewArea(e.target.value)} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Tipo de Tenencia</label>
                      <select 
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition text-slate-900"
                        value={ownership} 
                        onChange={e => setOwnership(e.target.value)}
                      >
                        <option value="own">Propio (Escriturado)</option>
                        <option value="rented">Arrendado</option>
                        <option value="litigation">En Litigio</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-900 font-medium">
                      {location ? '✅ Ubicación fijada en el mapa' : '👆 Haz clic en el mapa para ubicar tu predio'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleCreateFarm} 
                  disabled={isSubmitting || !location}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-lg shadow-green-500/30 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Guardar Predio
                    </>
                  )}
                </button>
              </div>
            )}

            {/* MAPA */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <FarmMap 
                farms={farms} 
                interactive={showFarmForm} 
                onSelectLocation={(lat, lng) => setLocation({lat, lng})} 
              />
            </div>

            {/* FARMS GRID */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Tus Predios</h2>
                <p className="text-slate-600 text-sm mt-1">{farms.length} predio(s) registrado(s)</p>
              </div>

              {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <Loader2 size={40} className="text-green-500 animate-spin mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Cargando predios...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  {farms.map(farm => (
                    <div 
                      key={farm.id} 
                      className={`bg-gradient-to-br ${getOwnershipColor(farm.ownership_type)} rounded-2xl border-2 p-6 hover:shadow-md transition-all duration-300 group`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-white/60 rounded-lg mt-0.5">
                            {getOwnershipIcon(farm.ownership_type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-green-600 transition-colors">
                              {farm.name}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">
                              {farm.total_area} hectáreas
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                          farm.ownership_type === 'own' ? 'bg-green-200 text-green-800' :
                          farm.ownership_type === 'rented' ? 'bg-blue-200 text-blue-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {getOwnershipLabel(farm.ownership_type)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {farm.ownership_type !== 'own' && (
                          <button 
                            onClick={() => setShowContractForm(showContractForm === farm.id ? null : farm.id)}
                            className="flex-1 bg-white/60 hover:bg-white text-slate-700 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <FileText size={14} /> Contrato
                          </button>
                        )}
                        <button className="flex-1 bg-white/60 hover:bg-white text-slate-700 font-bold text-xs py-2 rounded-lg transition-colors">
                          Historial
                        </button>
                      </div>

                      {/* INLINE CONTRACT FORM */}
                      {showContractForm === farm.id && (
                        <div className="mt-4 pt-4 border-t-2 border-white/30 space-y-3 animate-fade-in">
                          <p className="font-bold text-slate-900 text-sm">Nuevo Contrato de Renta</p>
                          
                          {error && (
                            <div className="text-xs text-red-700 bg-red-100/50 p-2 rounded">
                              {error}
                            </div>
                          )}

                          <input 
                            className="w-full px-3 py-2 border border-white/30 rounded-lg bg-white/50 text-slate-900 placeholder-slate-500 text-sm"
                            placeholder="Nombre del dueño/ejidatario" 
                            value={landowner} 
                            onChange={e => setLandowner(e.target.value)} 
                          />
                          
                          <div className="flex gap-2">
                            <input 
                              type="date" 
                              className="flex-1 px-3 py-2 border border-white/30 rounded-lg bg-white/50 text-slate-900 text-sm"
                              value={endDate} 
                              onChange={e => setEndDate(e.target.value)} 
                            />
                            <input 
                              type="number" 
                              className="flex-1 px-3 py-2 border border-white/30 rounded-lg bg-white/50 text-slate-900 placeholder-slate-500 text-sm"
                              placeholder="Monto $" 
                              value={amount} 
                              onChange={e => setAmount(e.target.value)} 
                            />
                          </div>

                          <button 
                            onClick={() => handleCreateContract(farm.id)} 
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                          >
                            {isSubmitting ? 'Guardando...' : 'Guardar Contrato'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl p-8">
              <h3 className="font-bold text-lg mb-6">Resumen de Activos</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-widest">Inversión Total</p>
                  <p className="text-3xl font-bold mt-2">
                    {totalHectares.toFixed(1)} <span className="text-lg font-normal text-slate-400">Has</span>
                  </p>
                </div>
                <div className="h-px bg-slate-700"></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Propios
                    </span>
                    <span className="font-bold">{ownedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      Rentados
                    </span>
                    <span className="font-bold">{rentedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      En Litigio
                    </span>
                    <span className="font-bold">{litigationCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Próximos Pagos
              </h3>
              <p className="text-xs text-slate-500 mb-4">Basado en contratos activos</p>
              <div className="text-center py-8 text-slate-400 text-sm">
                No hay pagos programados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}