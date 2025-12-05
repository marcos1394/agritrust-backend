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
  AlertTriangle,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans text-slate-900">
      
      {/* --- NAVBAR MEJORADO --- */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
              <Sprout className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">AgriTrust</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/sign-in" 
              className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-300 relative group"
            >
              Iniciar Sesión
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/sign-up" 
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Solicitar Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION MEJORADO --- */}
      <header className="relative pt-24 pb-40 overflow-hidden">
        {/* Gradiente de fondo dinámico */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-slate-50 to-transparent"></div>
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-green-200/30 to-emerald-300/20 rounded-full blur-3xl -z-10"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge premium */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100/80 to-green-100/80 border border-emerald-300/50 text-emerald-700 text-xs font-semibold backdrop-blur-sm hover:border-emerald-400 transition-all duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>🚀 Lanzamiento Enterprise v2.0 - Disponible Ahora</span>
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="text-center text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight animate-fade-in-up">
            El Sistema Operativo para la 
            <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 animate-gradient">
              Agricultura de Alto Rendimiento
            </span>
          </h1>
          
          {/* Descripción */}
          <p className="text-center text-lg md:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-100">
            De la planeación pre-siembra hasta el ingreso en el banco. 
            Integramos los <span className="font-semibold text-slate-900">25 procesos críticos</span> que definen tu rentabilidad, eliminando fugas operativas y optimizando activos con inteligencia artificial.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-200">
            <Link href="/sign-up">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 group transform hover:scale-105 active:scale-95">
                Solicitar Demostración
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 flex items-center justify-center gap-2 group">
              Ver Arquitectura
              <Zap className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up delay-300">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-emerald-600">25+</p>
              <p className="text-sm text-slate-600 mt-2">Procesos Integrados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-emerald-600">8</p>
              <p className="text-sm text-slate-600 mt-2">Áreas de Operación</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-emerald-600">∞</p>
              <p className="text-sm text-slate-600 mt-2">Escalabilidad</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- PAIN POINTS SECTION MEJORADA --- */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50 border-y border-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Los Retos Invisibles que Drenan tu Margen</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Cada día sin AgriTrust, pierdes dinero en puntos de fuga que no ves.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PainPointCard 
              icon={<AlertTriangle className="w-7 h-7 text-amber-500" />}
              number="01"
              title="Compras Descontroladas"
              desc="¿Gastas 40% más fertilizante del presupuestado? AgriTrust bloquea automáticamente compras que exceden el Presupuesto Base Cero y te ahorra miles mensuales."
            />
            <PainPointCard 
              icon={<AlertTriangle className="w-7 h-7 text-red-500" />}
              number="02"
              title="Fuga de Activos"
              desc="¿El GPS dice 1km pero el tanque bajó 50 litros? Nuestros algoritmos de IA detectan robo de combustible y desvíos en tiempo real."
            />
            <PainPointCard 
              icon={<AlertTriangle className="w-7 h-7 text-indigo-500" />}
              number="03"
              title="Reclamaciones Injustas"
              desc="¿Clientes descontando $50K por calidad? Defendemos tu margen con Auditoría Forense IA que prueba conformidad en cada embarque."
            />
          </div>
        </div>
      </section>

      {/* --- ECOSISTEMA DE 8 ÁREAS MEJORADO --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Cobertura Integral de tu Cadena de Valor</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">8 módulos integrados que cierren todas las brechas operativas en tu estructura agrícola.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fila 1 */}
            <FeatureCard 
              icon={<BarChart3 />} color="from-blue-500 to-blue-600" bgColor="bg-blue-50"
              title="Planeación y Finanzas"
              items={['Presupuesto Base Cero', 'Compras Consolidadas', 'Gestión de Tierras']}
            />
            <FeatureCard 
              icon={<Sprout />} color="from-emerald-500 to-green-600" bgColor="bg-emerald-50"
              title="Campo y Agronomía"
              items={['Bitácora Fitosanitaria', 'Telemetría Riego IoT', 'Estimación Fenológica']}
            />
            <FeatureCard 
              icon={<Tractor />} color="from-orange-500 to-orange-600" bgColor="bg-orange-50"
              title="Activos y Maquinaria"
              items={['Control Combustible', 'Mantenimiento x Horas', 'Inventario Refacciones']}
            />
            <FeatureCard 
              icon={<Globe />} color="from-cyan-500 to-blue-500" bgColor="bg-cyan-50"
              title="Logística Interna"
              items={['Trazabilidad de Bins', 'Coordinación Fletes', 'Logística Uberizada']}
            />
            
            {/* Fila 2 */}
            <FeatureCard 
              icon={<Factory />} color="from-purple-500 to-purple-600" bgColor="bg-purple-50"
              title="Empaque Industrial"
              items={['OEE y Micro-paros', 'Control de Mermas', 'Inventario Dry Goods']}
            />
            <FeatureCard 
              icon={<Users />} color="from-pink-500 to-pink-600" bgColor="bg-pink-50"
              title="Comercial y Trading"
              items={['Defensa de Claims IA', 'Pooling de Precios', 'Riesgo Crediticio']}
            />
            <FeatureCard 
              icon={<ShieldCheck />} color="from-teal-500 to-teal-600" bgColor="bg-teal-50"
              title="ESG y Sostenibilidad"
              items={['Huella de Carbono', 'Pasaporte Digital', 'Reportes Green Deal']}
            />
            <FeatureCard 
              icon={<Cpu />} color="from-slate-500 to-slate-700" bgColor="bg-slate-50"
              title="Back Office 4.0"
              items={['Conciliación Bancaria', 'Facturación SAT', 'Portal Proveedores']}
            />
          </div>
        </div>
      </section>

      {/* --- TECH DIFFERENTIATORS MEJORADO --- */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Más que software. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Inteligencia de Negocio</span>
            </h2>
            <div className="space-y-8">
              <TechItem 
                number="01"
                title="Auditoría IA Forense" 
                desc="Comparamos fotos de salida vs. llegada automáticamente. Detectamos cambios de empaques, daños, temperaturas. Evita descuentos injustificados." 
              />
              <TechItem 
                number="02"
                title="IoT Nativo Integrado" 
                desc="No capturamos datos POST-hecho. Conexión directa a válvulas, sensores, computadoras de tractores. Telemetría en tiempo real." 
              />
              <TechItem 
                number="03"
                title="Blockchain Ready" 
                desc="Pasaporte digital inmutable para el consumidor final. Del surco a la mesa con transparencia total verificable." 
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>
            <div className="relative h-96 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur-sm">
              {/* Placeholder para Dashboard Image */}
              <div className="text-center p-8">
                <div className="relative mb-6">
                  <Cpu className="w-20 h-20 text-emerald-400 mx-auto animate-pulse" />
                  <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-emerald-400/30 rounded-full animate-spin"></div>
                </div>
                <p className="text-lg font-mono text-emerald-300 mb-4">Processing live telemetry...</p>
                <p className="text-sm text-slate-400 mb-4">8 areas | 25+ processes | ∞ scalability</p>
                <div className="flex gap-2 justify-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '75ms' }}></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 bg-gradient-to-r from-emerald-500 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para Transformar tu Operación?</h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">Únete a las empresas líderes que ya están usando AgriTrust para maximizar rentabilidad y minimizar riesgos.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/sign-up">
              <button className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-xl">
                Solicitar Demo Hoy
              </button>
            </Link>
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
              Ver Documentación
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER MEJORADO --- */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Sprout className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">AgriTrust</span>
              </Link>
              <p className="text-sm text-slate-400">El sistema operativo para la agricultura de alto rendimiento.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Empleos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-sm text-slate-500">© 2024 AgriTrust. Diseñado en México para la Agricultura Global. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTS MEJORADOS ---

function PainPointCard({ icon, number, title, desc }: { icon: any, number: string, title: string, desc: string }) {
  return (
    <div className="group relative p-8 rounded-2xl bg-white border-2 border-slate-100 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300">
      {/* Número de fondo */}
      <div className="absolute -top-4 -left-4 text-6xl font-bold text-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity">{number}</div>
      
      <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-200 group-hover:border-emerald-300 transition-colors relative z-10">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function FeatureCard({ icon, color, bgColor, title, items }: { icon: any, color: string, bgColor: string, title: string, items: string[] }) {
  return (
    <div className="group relative bg-white p-8 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${color}`}></div>
      
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${color} text-white relative z-10`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="font-bold text-slate-900 mb-5 text-lg relative z-10">{title}</h3>
      <ul className="space-y-3 relative z-10">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TechItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center font-bold text-sm group-hover:shadow-lg group-hover:shadow-emerald-500/40 transition-all">
          {number}
        </div>
        <div className="w-1 h-12 bg-gradient-to-b from-emerald-400/50 to-transparent mt-2"></div>
      </div>
      <div className="pb-6">
        <h4 className="font-bold text-white text-lg mb-2 group-hover:text-emerald-300 transition-colors">{title}</h4>
        <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}