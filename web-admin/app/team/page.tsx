"use client";

import { useEffect, useState } from "react";
import { useAxiosAuth } from "../../lib/useAxiosAuth";
import { 
  Users, 
  Mail, 
  Shield, 
  Tractor, 
  Plus, 
  Loader2, 
  Copy, 
  CheckCircle 
} from "lucide-react";

// Tipos de datos
interface TeamMember {
  id: string;
  user_clerk_id: string;
  role: string;
  joined_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
}

export default function TeamPage() {
  const axiosAuth = useAxiosAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);

  // Estados del Formulario
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("operator");
  const [sending, setSending] = useState(false);
  
  // Estado para mostrar el link generado (Simulación de email)
  const [generatedLink, setGeneratedLink] = useState("");

  const fetchData = async () => {
    try {
      const res = await axiosAuth.get("/team");
      setMembers(res.data.members);
      setInvites(res.data.invites);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [axiosAuth]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await axiosAuth.post("/team/invite", {
        email: newEmail,
        role: newRole
      });
      
      // Mostrar el link simulado para pruebas
      setGeneratedLink(res.data.link_simulado);
      
      // Limpiar y recargar
      setNewEmail("");
      fetchData();
    } catch (error) {
      alert("Error al enviar invitación");
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Enlace copiado al portapapeles. ¡Envíalo a tu compañero!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <header className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Mi Equipo
          </h1>
          <p className="text-slate-500">Administra quién tiene acceso a tu Agrícola.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} /> Invitar Colaborador
        </button>
      </header>

      {/* MODAL / FORMULARIO DE INVITACIÓN */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-8">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Nueva Invitación</h3>
          
          {!generatedLink ? (
            <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                >
                  <option value="operator">Operador (Móvil)</option>
                  <option value="admin">Administrador (Web)</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={sending}
                className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
              >
                {sending ? <Loader2 className="animate-spin" /> : "Enviar"}
              </button>
            </form>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
                <CheckCircle size={20} /> Invitación Creada
              </div>
              <p className="text-sm text-green-700 mb-3">
                En producción esto se enviaría por email. Para desarrollo, copia este enlace y ábrelo en otro navegador (Incógnito) registrando un usuario nuevo:
              </p>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={generatedLink} 
                  className="flex-1 bg-white border border-green-300 rounded px-3 py-1 text-sm text-slate-600 font-mono"
                />
                <button 
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 flex items-center gap-1"
                >
                  <Copy size={14} /> Copiar
                </button>
              </div>
              <button 
                onClick={() => { setGeneratedLink(""); setShowForm(false); }}
                className="mt-4 text-sm text-slate-500 hover:text-slate-800 underline"
              >
                Cerrar y volver
              </button>
            </div>
          )}
        </div>
      )}

      {/* LISTA DE MIEMBROS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: MIEMBROS ACTIVOS */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Miembros Activos</h3>
            <span className="text-xs bg-white border px-2 py-1 rounded-full text-slate-500">{members.length}</span>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-400">Cargando...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Aún no hay miembros en el equipo.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map(member => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                      {member.role === 'admin' ? 'A' : 'O'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">Usuario #{member.user_clerk_id.slice(-4)}</p>
                      <p className="text-xs text-slate-400">Unido: {new Date(member.joined_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    member.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {member.role.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLUMNA 2: INVITACIONES PENDIENTES */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Invitaciones Pendientes</h3>
            <Mail size={18} className="text-slate-400" />
          </div>

          <div className="divide-y divide-gray-100">
            {invites.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No hay invitaciones enviadas.</div>
            ) : invites.map(invite => (
              <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-gray-50 opacity-75">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{invite.email}</p>
                    <p className="text-xs text-orange-500">Esperando respuesta...</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
                  {invite.role}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}