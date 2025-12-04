import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Tractor, 
  Sprout, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  Factory, 
  Users, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AgriTrust</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/sign-up" className="hidden sm:flex bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
              Solicitar Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-50 to-slate-50"></div>
        
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Nueva Versión Enterprise v2.0
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            El Sistema Operativo para la <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Agrícola de Alto Rendimiento
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            De la planeación pre-siembra hasta el ingreso en el banco. 
            Gestionamos los <span className="font-semibold text-slate-900">25 procesos críticos</span> que definen tu rentabilidad, eliminando fugas y optimizando activos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl">
              Ver Arquitectura del Sistema
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all">
              Hablar con un Experto
            </button>
          </div>
        </div>
      </header>

      {/* --- EL PROBLEMA INVISIBLE (PAIN POINTS) --- */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <PainPointCard 
              icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
              title="Compras Descontroladas"
              desc="¿Gastas más fertilizante del presupuestado? AgriTrust bloquea compras que exceden el Presupuesto Base Cero."
            />
            <PainPointCard 
              icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
              title="Fuga de Activos"
              desc="¿El GPS dice 1km pero el tanque bajó 50 litros? Nuestros algoritmos detectan robo de combustible al instante."
            />
            <PainPointCard 
              icon={<AlertTriangle className="w-6 h-6 text-indigo-500" />}
              title="Reclamaciones Injustas"
              desc="¿Clientes descontando miles de dólares por 'calidad'? Defendemos tu margen con Auditoría Forense por IA."
            />
          </div>
        </div>
      </section>

      {/* --- ECOSISTEMA DE 8 ÁREAS (ROADMAP) --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Cobertura Total de la Cadena de Valor</h2>
            <p className="text-slate-600 mt-4">Unificamos los 8 pilares operativos de tu agrícola en una sola plataforma.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fila 1 */}
            <FeatureCard 
              icon={<BarChart3 />} color="bg-blue-100 text-blue-700"
              title="Planeación y Finanzas"
              items={['Presupuesto Base Cero', 'Compras Consolidadas', 'Gestión de Tierras']}
            />
            <FeatureCard 
              icon={<Sprout />} color="bg-emerald-100 text-emerald-700"
              title="Campo y Agronomía"
              items={['Bitácora Fitosanitaria', 'Telemetría Riego IoT', 'Estimación Fenológica']}
            />
            <FeatureCard 
              icon={<Tractor />} color="bg-orange-100 text-orange-700"
              title="Activos y Maquinaria"
              items={['Control Combustible', 'Mantenimiento x Horas', 'Inventario Refacciones']}
            />
            <FeatureCard 
              icon={<Globe />} color="bg-cyan-100 text-cyan-700"
              title="Logística Interna"
              items={['Trazabilidad de Bins', 'Coordinación Fletes', 'Logística Uberizada']}
            />
            
            {/* Fila 2 */}
            <FeatureCard 
              icon={<Factory />} color="bg-purple-100 text-purple-700"
              title="Empaque Industrial"
              items={['OEE y Micro-paros', 'Control de Mermas', 'Inventario Dry Goods']}
            />
            <FeatureCard 
              icon={<Users />} color="bg-pink-100 text-pink-700"
              title="Comercial y Trading"
              items={['Defensa de Claims IA', 'Pooling de Precios', 'Riesgo Crediticio']}
            />
            <FeatureCard 
              icon={<ShieldCheck />} color="bg-teal-100 text-teal-700"
              title="ESG y Sostenibilidad"
              items={['Huella de Carbono', 'Pasaporte Digital', 'Reportes Green Deal']}
            />
            <FeatureCard 
              icon={<Cpu />} color="bg-slate-200 text-slate-700"
              title="Back Office 4.0"
              items={['Conciliación Bancaria', 'Facturación SAT', 'Portal Proveedores']}
            />
          </div>
        </div>
      </section>

      {/* --- TECH DIFFERENTIATORS --- */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Más que software, es Inteligencia de Negocio.</h2>
            <div className="space-y-6">
              <TechItem 
                title="Auditoría IA Forense" 
                desc="Comparamos fotos de salida vs. llegada automáticamente para evitar descuentos injustificados." 
              />
              <TechItem 
                title="IoT Nativo" 
                desc="No capturamos datos, los leemos. Conexión directa a válvulas, sensores y computadoras de tractores." 
              />
              <TechItem 
                title="Blockchain Ready" 
                desc="Pasaporte digital inmutable para el consumidor final. Del surco a la mesa con transparencia total." 
              />
            </div>
          </div>
          <div className="relative h-96 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl border border-white/10 flex items-center justify-center">
            {/* Placeholder para Dashboard Image */}
            <div className="text-center p-8">
              <Cpu className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <p className="text-lg font-mono text-emerald-200">Processing live telemetry...</p>
              <div className="mt-4 flex gap-2 justify-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-150"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
              <Sprout className="text-white w-3 h-3" />
            </div>
            <span className="font-bold text-slate-900">AgriTrust</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 AgriTrust. Diseñado en México para la Agricultura Global.</p>
        </div>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function PainPointCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function FeatureCard({ icon, color, title, items }: { icon: any, color: string, title: string, items: string[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <h3 className="font-bold text-slate-900 mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TechItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-1 h-full bg-emerald-500/30 rounded-full"></div>
      <div>
        <h4 className="font-bold text-white text-lg">{title}</h4>
        <p className="text-slate-400 text-sm mt-1">{desc}</p>
      </div>
    </div>
  )
}