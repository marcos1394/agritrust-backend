"use client";

import { useState, useEffect } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { ShoppingCart, Users, Plus, CheckCircle, FileText, Package, Loader2, AlertCircle, DollarSign, Truck, Clock } from "lucide-react";

export default function ProcurementPage() {
  const axiosAuth = useAxiosAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Estados UI
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Formulario Proveedor
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierDays, setSupplierDays] = useState("30");

  // Formulario Orden
  const [newOrderSupplier, setNewOrderSupplier] = useState("");
  const [orderItems, setOrderItems] = useState<{prodId: string, qty: number, cost: number}[]>([]);

  const loadData = async () => {
    try {
      const [sRes, oRes, pRes] = await Promise.all([
        axiosAuth.get("/procurement/suppliers"),
        axiosAuth.get("/procurement/orders"),
        axiosAuth.get("/inventory/products")
      ]);
      setSuppliers(sRes.data || []);
      setOrders(oRes.data || []);
      setProducts(pRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [axiosAuth]);

  // Crear Proveedor
  const createSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || !supplierContact) {
      setError("Por favor completa todos los campos");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      await axiosAuth.post("/procurement/suppliers", { 
        name: supplierName,
        contact_name: supplierContact, 
        credit_days: parseInt(supplierDays) 
      });
      setShowSupplierForm(false);
      setSupplierName("");
      setSupplierContact("");
      setSupplierDays("30");
      loadData();
    } catch (err) {
      setError("Error al guardar el proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crear Orden
  const createOrder = async () => {
    if (!newOrderSupplier || orderItems.length === 0) {
      setError("Por favor selecciona proveedor y productos");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      const itemsPayload = orderItems.map(i => ({
        product_id: i.prodId,
        quantity: i.qty,
        unit_cost: i.cost
      }));

      await axiosAuth.post("/procurement/orders", {
        supplier_id: newOrderSupplier,
        items: itemsPayload
      });
      
      setShowOrderForm(false);
      setOrderItems([]);
      setNewOrderSupplier("");
      loadData();
    } catch (err) {
      setError("Error al crear la orden");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recibir Orden
  const receiveOrder = async (id: string) => {
    if (!confirm("¿Confirmar recepción? Esto aumentará el stock.")) return;
    try {
      setIsSubmitting(true);
      await axiosAuth.post(`/procurement/orders/${id}/receive`, {});
      loadData();
    } catch (e) { 
      setError("Error al recibir");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLine = () => {
    if (products.length > 0) {
      setOrderItems([...orderItems, { prodId: products[0]?.id || "", qty: 1, cost: 0 }]);
    }
  };

  // Stats
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o: any) => o.status === 'draft').length || 0;
  const receivedOrders = orders?.filter((o: any) => o.status === 'received').length || 0;
  const totalSpent = orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
                <ShoppingCart size={28} className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">Compras y Abastecimiento</h1>
                <p className="text-slate-600 mt-1">Gestión de proveedores, órdenes de compra y reabastecimiento</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            <button 
              onClick={() => setActiveTab("orders")} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'orders' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Órdenes de Compra
            </button>
            <button 
              onClick={() => setActiveTab("suppliers")} 
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'suppliers' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proveedores
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">Total de Órdenes</p>
            <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
            <p className="text-xs text-slate-500 mt-2">Generadas</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-600" />
              <p className="text-xs font-medium text-amber-700 uppercase tracking-widest">Pendientes</p>
            </div>
            <p className="text-3xl font-bold text-amber-900">{pendingOrders}</p>
            <p className="text-xs text-amber-600 mt-2">Sin recibir</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-xs font-medium text-green-700 uppercase tracking-widest">Recibidas</p>
            </div>
            <p className="text-3xl font-bold text-green-900">{receivedOrders}</p>
            <p className="text-xs text-green-600 mt-2">Completadas</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-slate-600" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Gasto Total</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">${totalSpent.toLocaleString('en-US')}</p>
            <p className="text-xs text-slate-500 mt-2">Invertido</p>
          </div>
        </div>

        {/* VISTA DE PROVEEDORES */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Proveedores</h2>
                <p className="text-slate-600 text-sm mt-1">{suppliers.length} proveedor(es) registrado(s)</p>
              </div>
              <button 
                onClick={() => setShowSupplierForm(!showSupplierForm)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-purple-500/30"
              >
                {showSupplierForm ? "Cancelar" : <><Plus size={20} /> Nuevo Proveedor</>}
              </button>
            </div>

            {/* FORMULARIO PROVEEDOR */}
            {showSupplierForm && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users size={24} className="text-purple-600" />
                  Registrar Nuevo Proveedor
                </h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Nombre de la Empresa</label>
                    <input 
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                      placeholder="Ej: Bayer, Syngenta, BASF" 
                      value={supplierName} 
                      onChange={e => setSupplierName(e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Contacto</label>
                      <input 
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition text-slate-900 placeholder-slate-400"
                        placeholder="Nombre o email" 
                        value={supplierContact} 
                        onChange={e => setSupplierContact(e.target.value)} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Días de Crédito</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition text-slate-900"
                        value={supplierDays} 
                        onChange={e => setSupplierDays(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={createSupplier}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-lg shadow-purple-500/30 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Guardar Proveedor
                    </>
                  )}
                </button>
              </div>
            )}

            {/* GRID DE PROVEEDORES */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Loader2 size={40} className="text-purple-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Cargando proveedores...</p>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
                <Users size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-900 font-bold text-lg">Sin proveedores</p>
                <p className="text-slate-600 text-sm mt-1">Comienza agregando tu primer proveedor</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                {suppliers.map(s => (
                  <div 
                    key={s.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center font-bold text-purple-600 text-lg">
                        {s.name.substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{s.name}</h3>
                        <p className="text-xs text-slate-600 mt-1">{s.contact_name}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <p className="text-xs text-purple-700 font-medium uppercase tracking-widest">Crédito</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">{s.credit_days} <span className="text-sm font-normal">días</span></p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors">
                        Ver Órdenes
                      </button>
                      <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA DE ÓRDENES */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Órdenes de Compra</h2>
                <p className="text-slate-600 text-sm mt-1">{totalOrders} orden(es) total(es)</p>
              </div>
              <button 
                onClick={() => setShowOrderForm(!showOrderForm)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-purple-500/30"
              >
                {showOrderForm ? "Cancelar" : <><Plus size={20} /> Nueva Orden</>}
              </button>
            </div>

            {/* FORMULARIO ORDEN */}
            {showOrderForm && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Package size={24} className="text-purple-600" />
                  Nueva Orden de Compra
                </h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Proveedor</label>
                    <select 
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition text-slate-900"
                      onChange={e => setNewOrderSupplier(e.target.value)}
                      value={newOrderSupplier}
                    >
                      <option value="">Selecciona un proveedor...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-900">Productos</h3>
                      <button 
                        type="button" 
                        onClick={addLine} 
                        className="text-sm text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1"
                      >
                        <Plus size={16} /> Agregar
                      </button>
                    </div>

                    {orderItems.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No hay productos agregados</p>
                    ) : (
                      <div className="space-y-2">
                        {orderItems.map((item, idx) => (
                          <div key={idx} className="flex gap-2 bg-white p-3 rounded-lg border border-slate-200">
                            <select 
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                              onChange={e => {
                                const newItems = [...orderItems];
                                newItems[idx].prodId = e.target.value;
                                setOrderItems(newItems);
                              }}
                              value={item.prodId}
                            >
                              <option value="">Selecciona producto...</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input 
                              type="number" 
                              className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                              placeholder="Cant." 
                              onChange={e => {
                                const newItems = [...orderItems];
                                newItems[idx].qty = parseFloat(e.target.value) || 0;
                                setOrderItems(newItems);
                              }}
                              value={item.qty || ''}
                            />
                            <input 
                              type="number" 
                              className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
                              placeholder="Costo $" 
                              onChange={e => {
                                const newItems = [...orderItems];
                                newItems[idx].cost = parseFloat(e.target.value) || 0;
                                setOrderItems(newItems);
                              }}
                              value={item.cost || ''}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setOrderItems(orderItems.filter((_, i) => i !== idx));
                              }}
                              className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={createOrder}
                  disabled={isSubmitting || !newOrderSupplier || orderItems.length === 0}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 shadow-lg shadow-purple-500/30 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Package size={18} />
                      Generar Orden
                    </>
                  )}
                </button>
              </div>
            )}

            {/* LISTADO DE ÓRDENES */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Loader2 size={40} className="text-purple-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Cargando órdenes...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
                <Package size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-900 font-bold text-lg">Sin órdenes</p>
                <p className="text-slate-600 text-sm mt-1">Crea tu primera orden de compra</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {orders.map(po => {
                  const isReceived = po.status === 'received';
                  const isPending = po.status === 'draft';
                  
                  return (
                    <div 
                      key={po.id}
                      className={`bg-gradient-to-br ${
                        isReceived 
                          ? 'from-green-50 to-emerald-50 border-green-200' 
                          : 'from-amber-50 to-orange-50 border-amber-200'
                      } rounded-2xl border-2 p-6 hover:shadow-md transition-all duration-300 group`}
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-xl ${
                            isReceived 
                              ? 'bg-green-100' 
                              : 'bg-amber-100'
                          }`}>
                            <FileText size={24} className={isReceived ? 'text-green-600' : 'text-amber-600'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`font-bold text-lg ${isReceived ? 'text-green-900' : 'text-amber-900'}`}>
                                {po.order_number}
                              </h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                isReceived
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-amber-200 text-amber-800'
                              }`}>
                                {isReceived ? 'Completada' : 'Pendiente'}
                              </span>
                            </div>
                            <p className={`text-sm ${isReceived ? 'text-green-700' : 'text-amber-700'} font-medium`}>
                              {po.supplier?.name} • {new Date(po.order_date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {po.items?.slice(0, 3).map((i: any) => (
                                <span key={i.id} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                                  isReceived 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {i.product?.name} ×{i.quantity}
                                </span>
                              ))}
                              {po.items && po.items.length > 3 && (
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                                  isReceived 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  +{po.items.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                          <div className="text-right">
                            <p className="text-xs text-slate-600 font-medium mb-1">Monto Total</p>
                            <p className={`font-bold text-2xl ${isReceived ? 'text-green-600' : 'text-amber-600'}`}>
                              ${(po.total_amount || 0).toLocaleString('en-US')}
                            </p>
                          </div>

                          {isPending && (
                            <button 
                              onClick={() => receiveOrder(po.id)}
                              disabled={isSubmitting}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                            >
                              <Truck size={16} />
                              Recibir Mercancía
                            </button>
                          )}
                          {isReceived && (
                            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                              <CheckCircle size={18} />
                              Recibida
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
