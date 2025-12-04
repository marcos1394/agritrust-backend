"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { 
  Truck, 
  Package, 
  ArrowRight, 
  CheckCircle, 
  Loader2,
  Calendar
} from "lucide-react";

// Tipos
interface Bin {
  id: string;
  qr_code: string;
  weight_kg: number;
  status: string;
  updated_at: string;
}

interface Shipment {
  id: string;
  customer_name: string;
  status: string;
  departure_time: string;
}

export default function ShipmentsPage() {
  const axiosAuth = useAxiosAuth();
  const [loadingInventory, setLoadingInventory] = useState(true);
  
  // Datos
  const [inventory, setInventory] = useState<Bin[]>([]);
  const [selectedBinIds, setSelectedBinIds] = useState<Set<string>>(new Set());
  const [shipmentHistory, setShipmentHistory] = useState<Shipment[]>([]);

  // Formulario Nuevo Envío
  const [customer, setCustomer] = useState("");
  const [isSending, setIsSending] = useState(false);

  // 1. Cargar Inventario Disponible
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      // Pedimos solo lo que está "full_in_field" (En campo, lleno)
      const res = await axiosAuth.get("/bins?status=full_in_field");
      setInventory(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Cargar historial de envíos (opcional, requeriría endpoint GET /shipments que no hicimos, 
  // pero dejamos la estructura lista para cuando lo agregues)
  // const fetchHistory = ... 

  useEffect(() => {
    fetchInventory();
  }, [axiosAuth]);

  // Manejo de Selección
  const toggleBin = (id: string) => {
    const newSet = new Set(selectedBinIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedBinIds(newSet);
  };

  const selectAll = () => {
    if (selectedBinIds.size === inventory.length) {
      setSelectedBinIds(new Set()); // Deseleccionar todo
    } else {
      setSelectedBinIds(new Set(inventory.map(b => b.id))); // Seleccionar todo
    }
  };

  // Crear el Embarque
  const handleCreateShipment = async () => {
    if (!customer || selectedBinIds.size === 0) return;
    setIsSending(true);

    try {
        await axiosAuth.post("/shipments", {
            customer_name: customer,
            bin_ids: Array.from(selectedBinIds)
        });

        alert("✅ Embarque creado exitosamente");
        
        // Limpieza
        setCustomer("");
        setSelectedBinIds(new Set());
        fetchInventory(); // Recargar inventario (los enviados desaparecerán)

    } catch (error) {
        alert("Error creando embarque");
        console.error(error);
    } finally {
        setIsSending(false);
    }
  };

  // Cálculos de Resumen
  const totalKilosSelected = inventory
    .filter(b => selectedBinIds.has(b.id))
    .reduce((sum, b) => sum + b.weight_kg, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <header>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Truck className="text-blue-600" /> Centro de Embarques
        </h1>
        <p className="text-slate-500">Selecciona cajas del inventario y asígnalas a un cliente.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        
        {/* COLUMNA IZQ: INVENTARIO DISPONIBLE */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Package size={18} /> Inventario en Piso
                </h3>
                <button 
                    onClick={selectAll}
                    className="text-xs font-bold text-blue-600 hover:underline"
                >
                    {selectedBinIds.size === inventory.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loadingInventory ? (
                    <div className="h-full flex items-center justify-center text-slate-400">Cargando...</div>
                ) : inventory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Package size={40} className="mb-2 opacity-20" />
                        <p>No hay cajas listas en inventario.</p>
                        <p className="text-xs">Escanea algunas con la App Móvil.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {inventory.map(bin => {
                            const isSelected = selectedBinIds.has(bin.id);
                            return (
                                <div 
                                    key={bin.id}
                                    onClick={() => toggleBin(bin.id)}
                                    className={`
                                        cursor-pointer p-3 rounded-lg border-2 transition relative
                                        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}
                                    `}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-blue-600">
                                            <CheckCircle size={16} />
                                        </div>
                                    )}
                                    <p className="font-mono font-bold text-slate-800">{bin.qr_code}</p>
                                    <p className="text-xs text-slate-500">{bin.weight_kg} kg</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(bin.updated_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-right text-xs text-slate-500">
                Mostrando {inventory.length} cajas disponibles
            </div>
        </section>

        {/* COLUMNA DER: MANIFIESTO DE SALIDA */}
        <section className="bg-slate-900 text-white rounded-xl shadow-xl flex flex-col p-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Nuevo Envío</h3>
                <p className="text-slate-400 text-sm">Resumen de carga</p>
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cliente / Destino</label>
                    <input 
                        type="text" 
                        placeholder="Ej: Walmart Distribution Center"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={customer}
                        onChange={e => setCustomer(e.target.value)}
                    />
                </div>

                <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                        <span className="text-slate-400">Cajas Seleccionadas</span>
                        <span className="font-mono font-bold text-xl">{selectedBinIds.size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Peso Total Estimado</span>
                        <span className="font-mono font-bold text-xl text-green-400">
                            {totalKilosSelected.toFixed(1)} kg
                        </span>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleCreateShipment}
                disabled={isSending || selectedBinIds.size === 0 || !customer}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-auto transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSending ? <Loader2 className="animate-spin" /> : <>Confirmar Salida <ArrowRight /></>}
            </button>
        </section>

      </div>
    </div>
  );
}