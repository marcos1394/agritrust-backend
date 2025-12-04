"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { 
  ShieldAlert, 
  FileWarning, 
  DollarSign, 
  ArrowRight, 
  AlertCircle,
  Gavel
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
  
  // Datos
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  // Formulario
  const [selectedShipment, setSelectedShipment] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [shipRes, claimRes] = await Promise.all([
        axiosAuth.get("/shipments"), // Lista para el dropdown
        axiosAuth.get("/claims")     // Lista histórica
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
    setIsSubmitting(true);
    try {
        await axiosAuth.post("/claims", {
            shipment_id: selectedShipment,
            amount_usd: parseFloat(amount),
            reason: reason,
            claim_date: new Date().toISOString(), // Fecha de hoy
            internal_notes: "Registrado desde Web Admin"
        });
        
        alert("Reclamo registrado. Se ha generado una alerta de auditoría.");
        setAmount("");
        setReason("");
        setSelectedShipment("");
        fetchData(); // Recargar tablas
    } catch (error) {
        alert("Error al guardar el reclamo");
    } finally {
        setIsSubmitting(false);
    }
  };

  // KPI Rápido: Dinero total en disputa
  const totalDisputed = claims.reduce((sum, c) => sum + c.amount_usd, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <header className="flex justify-between items-end border-b border-red-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="text-red-600" /> Defensa Comercial
          </h1>
          <p className="text-slate-500">Gestión de descuentos, rechazos y disputas de clientes.</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-slate-400 font-medium uppercase">Dinero en Disputa</p>
            <p className="text-3xl font-bold text-red-600">${totalDisputed.toLocaleString('en-US')} USD</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQ: FORMULARIO DE RECLAMO */}
        <section className="bg-white p-6 rounded-xl shadow-lg border border-red-100 h-fit">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <FileWarning className="text-orange-500" /> Registrar Incidente
            </h3>
            
            <form onSubmit={handleCreateClaim} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Embarque Afectado</label>
                    <select 
                        required
                        className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-red-200"
                        value={selectedShipment}
                        onChange={e => setSelectedShipment(e.target.value)}
                    >
                        <option value="">Seleccione Embarque...</option>
                        {shipments.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.customer_name} ({new Date(s.departure_time).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Monto Descontado (USD)</label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                            type="number" 
                            required
                            placeholder="5000.00"
                            className="w-full pl-8 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-200"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Motivo del Rechazo</label>
                    <textarea 
                        required
                        rows={3}
                        placeholder="Ej: Moho detectado en pallet #4..."
                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-200"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? "Guardando..." : <>Iniciar Protocolo de Defensa <ArrowRight size={18} /></>}
                </button>
            </form>
        </section>

        {/* COLUMNA DER: LISTA DE RECLAMOS ACTIVOS */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-slate-700">Historial de Disputas</h3>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-400">Cargando casos...</div>
            ) : claims.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center text-slate-400">
                    <Gavel size={48} className="mb-4 opacity-20" />
                    <p>Sin reclamos activos. ¡Buen trabajo de calidad!</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {claims.map(claim => {
                        // Encontrar nombre del cliente cruzando arrays (simple para MVP)
                        const shipment = shipments.find(s => s.id === claim.shipment_id);
                        
                        return (
                            <div key={claim.id} className="p-5 hover:bg-red-50 transition flex justify-between items-start group">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-800 text-lg">
                                            {shipment?.customer_name || "Cliente Desconocido"}
                                        </span>
                                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold uppercase">
                                            {claim.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-1">{claim.reason}</p>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        Reportado: {new Date(claim.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-red-600">-${claim.amount_usd.toLocaleString()}</p>
                                    <button className="text-xs text-blue-600 hover:underline font-bold mt-1 opacity-0 group-hover:opacity-100 transition">
                                        Ver Evidencia &rarr;
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>

      </div>
    </div>
  );
}