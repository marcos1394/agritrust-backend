"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { 
  ShieldAlert, 
  FileWarning, 
  DollarSign, 
  ArrowRight, 
  AlertCircle,
  Gavel,
  Check,
  Clock,
  TrendingDown,
  Loader2
} from "lucide-react";

// Tipos
interface Shipment { id: string; customer_name: string; departure_time: string; }
interface Claim { 
  id: string; 
  shipment_id: string; 
  reason: string; 
  amount_usd: number; 
  status: string; 
  created_at: string;
}

export default function ClaimsPage() {
  const axiosAuth = useAxiosAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Datos
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  // Formulario
  const [selectedShipment, setSelectedShipment] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [shipRes, claimRes] = await Promise.all([
        axiosAuth.get("/shipments"),
        axiosAuth.get("/claims")
      ]);
      setShipments(shipRes.data);
      setClaims(claimRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [axiosAuth]);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await axiosAuth.post("/claims", {
        shipment_id: selectedShipment,
        amount_usd: parseFloat(amount),
        reason: reason,
        claim_date: new Date().toISOString(),
        internal_notes: "Registrado desde Web Admin"
      });
      
      setAmount("");
      setReason("");
      setSelectedShipment("");
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.error || "Error al guardar el reclamo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estadísticas
  const totalDisputed = claims && Array.isArray(claims) ? claims.reduce((sum, c) => sum + c.amount_usd, 0) : 0;
  const resolvedClaims = claims && Array.isArray(claims) ? claims.filter(c => c.status === 'resolved').length : 0;
  const pendingClaims = claims && Array.isArray(claims) ? claims.filter(c => c.status === 'pending').length : 0;

  // Agrupar claims por estado
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'resolved': return 'from-green-50 to-emerald-50 border-green-200';
      case 'pending': return 'from-amber-50 to-orange-50 border-amber-200';
      default: return 'from-slate-50 to-slate-100 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'resolved': return <Check size={20} className="text-green-600" />;
      case 'pending': return <Clock size={20} className="text-amber-600" />;
      default: return <AlertCircle size={20} className="text-slate-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'resolved': return 'Resuelto';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl">
              <ShieldAlert size={32} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Defensa Comercial</h1>
              <p className="text-slate-600 mt-1">Gestión de reclamos, descuentos y disputas de clientes</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Total en Disputa</p>
              <p className="text-3xl font-bold text-red-600">${totalDisputed.toLocaleString('en-US')}</p>
              <p className="text-xs text-slate-500 mt-2">{claims.length} reclamos</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-amber-600" />
                <p className="text-xs font-medium text-amber-700 uppercase tracking-widest">Pendientes</p>
              </div>
              <p className="text-3xl font-bold text-amber-900">{pendingClaims}</p>
              <p className="text-xs text-amber-600 mt-2">Requiere atención</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Check size={16} className="text-green-600" />
                <p className="text-xs font-medium text-green-700 uppercase tracking-widest">Resueltos</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{resolvedClaims}</p>
              <p className="text-xs text-green-600 mt-2">Cerrados</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Tasa de Resolución</p>
              <p className="text-3xl font-bold text-slate-900">
                {claims.length > 0 ? Math.round((resolvedClaims / claims.length) * 100) : 0}%
              </p>
              <p className="text-xs text-slate-500 mt-2">Casos cerrados</p>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORM SECTION */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <FileWarning size={22} className="text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Nuevo Reclamo</h2>
                  <p className="text-xs text-slate-500">Registra un incidente</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateClaim} className="space-y-5">
                
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Shipment Select */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Embarque Afectado</label>
                  <select 
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition text-slate-900"
                    value={selectedShipment}
                    onChange={e => setSelectedShipment(e.target.value)}
                  >
                    <option value="">Selecciona un embarque...</option>
                    {shipments.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.customer_name} • {new Date(s.departure_time).toLocaleDateString('es-ES')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Monto Descontado</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      placeholder="5000.00"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Reason Textarea */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Motivo del Reclamo</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe el problema detectado (ej: Moho en pallet #4, Daño en embalaje, etc.)"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition text-slate-900 placeholder-slate-400 resize-none"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isSubmitting || !selectedShipment || !amount || !reason}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-lg shadow-red-500/30 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={18} />
                      Iniciar Defensa
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* CLAIMS LIST SECTION */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Historial de Reclamos</h2>
              <p className="text-slate-600 text-sm">Seguimiento de todos los casos registrados</p>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Loader2 size={40} className="text-red-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Cargando reclamos...</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-300 p-12 text-center">
                <Gavel size={48} className="text-green-300 mx-auto mb-4" />
                <p className="text-green-900 font-bold text-lg">¡Sin reclamos!</p>
                <p className="text-green-700 text-sm mt-1">Excelente trabajo de calidad. Mantén los estándares.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {claims.map(claim => {
                  const shipment = shipments.find(s => s.id === claim.shipment_id);
                  const isResolved = claim.status === 'resolved';
                  
                  return (
                    <div 
                      key={claim.id}
                      className={`bg-gradient-to-br ${getStatusColor(claim.status)} rounded-2xl border-2 p-6 hover:shadow-md transition-all duration-300 group`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2.5 bg-white/60 rounded-lg mt-0.5">
                            {getStatusIcon(claim.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900 text-lg">
                                {shipment?.customer_name || "Cliente Desconocido"}
                              </h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                isResolved
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-amber-200 text-amber-800'
                              }`}>
                                {getStatusText(claim.status)}
                              </span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed mb-2">{claim.reason}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              📅 {new Date(claim.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 justify-end mb-2">
                            <TrendingDown size={18} className="text-red-600" />
                            <p className="text-2xl font-bold text-red-600">
                              ${claim.amount_usd.toLocaleString('en-US')}
                            </p>
                          </div>
                          <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100">
                            Ver detalles →
                          </button>
                        </div>
                      </div>

                      {/* ID Badge */}
                      <div className="flex gap-2 pt-3 border-t border-white/30">
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">ID: {claim.id.substring(0, 12)}...</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}