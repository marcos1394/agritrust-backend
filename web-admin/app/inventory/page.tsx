"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { Package, ArrowDown, ArrowUp, AlertOctagon, Search } from "lucide-react";

export default function InventoryPage() {
  const axiosAuth = useAxiosAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Entrada
  const [showInModal, setShowInModal] = useState(false);
  const [selectedProd, setSelectedProd] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");

  const fetchInventory = async () => {
    try {
      const res = await axiosAuth.get("/inventory/products");
      setProducts(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, [axiosAuth]);

  const handleStockIn = async () => {
    try {
        await axiosAuth.post("/inventory/movements/in", {
            product_id: selectedProd,
            quantity: parseFloat(qty),
            cost_per_unit: parseFloat(cost),
            reference: "Manual Entry"
        });
        setShowInModal(false); fetchInventory(); setQty(""); setCost("");
        alert("Stock actualizado");
    } catch (e) { alert("Error"); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Package className="text-orange-600" /> Almacén Central
            </h1>
            <p className="text-slate-500">Control de insumos, costos y reabastecimiento.</p>
        </div>
        <button onClick={() => setShowInModal(true)} className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2">
            <ArrowDown size={20}/> Registrar Compra
        </button>
      </header>

      {/* LISTA DE INVENTARIO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm border-b">
                <tr>
                    <th className="px-6 py-4">SKU / Producto</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4 text-right">Existencia</th>
                    <th className="px-6 py-4 text-right">Costo Promedio</th>
                    <th className="px-6 py-4 text-right">Valor Total</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                        </td>
                        <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{p.category}</span></td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-lg">{p.current_stock} <span className="text-xs text-gray-400 font-sans">{p.unit}</span></td>
                        <td className="px-6 py-4 text-right text-sm">${p.avg_cost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700">${(p.current_stock * p.avg_cost).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                            {p.current_stock <= p.min_stock_level ? (
                                <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100">
                                    <AlertOctagon size={12}/> BAJO
                                </span>
                            ) : (
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">OK</span>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL DE ENTRADA SIMPLIFICADO */}
      {showInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
                <h3 className="font-bold text-lg mb-4">Registrar Entrada (Compra)</h3>
                <div className="space-y-3">
                    <select className="w-full p-2 border rounded" onChange={e => setSelectedProd(e.target.value)}>
                        <option value="">Seleccionar Producto...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input className="w-full p-2 border rounded" type="number" placeholder="Cantidad Entrante" value={qty} onChange={e => setQty(e.target.value)} />
                    <input className="w-full p-2 border rounded" type="number" placeholder="Costo Unitario ($)" value={cost} onChange={e => setCost(e.target.value)} />
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setShowInModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-bold">Cancelar</button>
                        <button onClick={handleStockIn} className="flex-1 bg-green-600 text-white py-2 rounded font-bold">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}