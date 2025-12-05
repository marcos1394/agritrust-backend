"use client";

import { useState, useEffect } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { ShoppingCart, Users, Plus, CheckCircle, FileText, Package } from "lucide-react";

export default function ProcurementPage() {
  const axiosAuth = useAxiosAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Estados UI
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Formulario Orden
  const [newOrderSupplier, setNewOrderSupplier] = useState("");
  const [orderItems, setOrderItems] = useState<{prodId: string, qty: number, cost: number}[]>([]);

  const loadData = async () => {
    const [sRes, oRes, pRes] = await Promise.all([
        axiosAuth.get("/procurement/suppliers"),
        axiosAuth.get("/procurement/orders"),
        axiosAuth.get("/inventory/products")
    ]);
    setSuppliers(sRes.data);
    setOrders(oRes.data);
    setProducts(pRes.data);
  };

  useEffect(() => { loadData(); }, [axiosAuth]);

  // Crear Proveedor Rápido
  const createSupplier = async (e: any) => {
    e.preventDefault();
    const name = e.target.name.value;
    await axiosAuth.post("/procurement/suppliers", { name, contact_name: "Gerente Ventas", credit_days: 30 });
    setShowSupplierForm(false); loadData();
  };

  // Crear Orden
  const createOrder = async () => {
    if (!newOrderSupplier || orderItems.length === 0) return;
    
    // Mapear items al formato del backend
    const itemsPayload = orderItems.map(i => ({
        product_id: i.prodId,
        quantity: i.qty,
        unit_cost: i.cost
    }));

    await axiosAuth.post("/procurement/orders", {
        supplier_id: newOrderSupplier,
        items: itemsPayload
    });
    
    setShowOrderForm(false); setOrderItems([]); loadData();
    alert("Orden creada");
  };

  // Recibir Orden (Trigger de Inventario)
  const receiveOrder = async (id: string) => {
    if (!confirm("¿Confirmar recepción? Esto aumentará el stock.")) return;
    try {
        await axiosAuth.post(`/procurement/orders/${id}/receive`, {});
        alert("Inventario actualizado correctamente");
        loadData();
    } catch (e) { alert("Error al recibir"); }
  };

  // Helper para agregar linea a la orden
  const addLine = () => setOrderItems([...orderItems, { prodId: products[0]?.id, qty: 1, cost: 0 }]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="text-purple-600" /> Compras
            </h1>
            <p className="text-slate-500">Gestión de proveedores y reabastecimiento.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab("orders")} className={`px-4 py-2 rounded font-bold ${activeTab === 'orders' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>Órdenes</button>
            <button onClick={() => setActiveTab("suppliers")} className={`px-4 py-2 rounded font-bold ${activeTab === 'suppliers' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>Proveedores</button>
        </div>
      </header>

      {/* VISTA DE PROVEEDORES */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
            <button onClick={() => setShowSupplierForm(!showSupplierForm)} className="bg-slate-900 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={16}/> Nuevo Proveedor</button>
            
            {showSupplierForm && (
                <form onSubmit={createSupplier} className="bg-white p-4 rounded shadow flex gap-2">
                    <input name="name" placeholder="Nombre Empresa (Ej: Bayer)" className="border p-2 rounded flex-1" required />
                    <button className="bg-green-600 text-white px-4 rounded font-bold">Guardar</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suppliers.map(s => (
                    <div key={s.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">{s.name.substring(0,2).toUpperCase()}</div>
                        <div>
                            <h3 className="font-bold text-slate-800">{s.name}</h3>
                            <p className="text-xs text-slate-500">Crédito: {s.credit_days} días</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* VISTA DE ÓRDENES */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
            <button onClick={() => setShowOrderForm(!showOrderForm)} className="bg-slate-900 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={16}/> Crear Orden de Compra</button>

            {/* FORMULARIO ORDEN */}
            {showOrderForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
                    <h3 className="font-bold mb-4">Nueva PO</h3>
                    <select className="w-full border p-2 rounded mb-4" onChange={e => setNewOrderSupplier(e.target.value)}>
                        <option value="">Seleccionar Proveedor...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    
                    <div className="space-y-2 mb-4">
                        {orderItems.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <select className="flex-1 border p-2 rounded" onChange={e => {
                                    const newItems = [...orderItems]; newItems[idx].prodId = e.target.value; setOrderItems(newItems);
                                }}>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input type="number" className="w-24 border p-2 rounded" placeholder="Cant." onChange={e => {
                                    const newItems = [...orderItems]; newItems[idx].qty = parseFloat(e.target.value); setOrderItems(newItems);
                                }}/>
                                <input type="number" className="w-24 border p-2 rounded" placeholder="Costo $" onChange={e => {
                                    const newItems = [...orderItems]; newItems[idx].cost = parseFloat(e.target.value); setOrderItems(newItems);
                                }}/>
                            </div>
                        ))}
                        <button type="button" onClick={addLine} className="text-sm text-blue-600 font-bold">+ Agregar Producto</button>
                    </div>
                    <button onClick={createOrder} className="bg-green-600 text-white px-6 py-2 rounded font-bold w-full">Generar Orden</button>
                </div>
            )}

            {/* LISTADO DE ORDENES */}
            <div className="space-y-4">
                {orders.map(po => (
                    <div key={po.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${po.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                <FileText size={24}/>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">{po.order_number}</h4>
                                <p className="text-sm text-slate-500">{po.supplier?.name} • {new Date(po.order_date).toLocaleDateString()}</p>
                                <div className="text-xs text-slate-400 mt-1 flex gap-2">
                                    {po.items?.map((i: any) => (
                                        <span key={i.id} className="bg-gray-100 px-1 rounded">{i.product?.name} (x{i.quantity})</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-xl text-slate-800">${po.total_amount.toLocaleString()}</p>
                            {po.status === 'draft' && (
                                <button onClick={() => receiveOrder(po.id)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-700 transition">
                                    Recibir Mercancía
                                </button>
                            )}
                            {po.status === 'received' && (
                                <span className="mt-2 inline-flex items-center gap-1 text-green-600 font-bold text-sm">
                                    <CheckCircle size={14}/> Completado
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
