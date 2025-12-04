"use client";

import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, CheckCircle, Shield, Smartphone, Globe } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold text-green-700 flex items-center gap-2">
            🌱 AgriTrust
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium hover:text-green-600 hidden md:block">Funcionalidades</Link>
            <Link href="#" className="text-sm font-medium hover:text-green-600 hidden md:block">Precios</Link>
            <SignInButton mode="modal">
              <button className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2">
                Iniciar Sesión
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition shadow-lg">
                Comenzar Gratis
              </button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide mb-6 border border-green-100">
          🚀 Nueva Versión 2.0 Disponible
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
          El Sistema Operativo para la <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Agroindustria Moderna</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Digitaliza tu campo, certifica tu calidad y protege tus envíos. 
          Todo en una plataforma unificada para exportadores de alto nivel.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <SignInButton mode="modal">
            <button className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-green-700 transition shadow-xl shadow-green-600/30 flex items-center gap-2">
              Crear Cuenta Gratis <ArrowRight />
            </button>
          </SignInButton>
          <button className="text-slate-600 font-medium px-8 py-4 hover:bg-gray-50 rounded-full transition">
            Ver Demo en Vivo
          </button>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Smartphone className="text-blue-500" />}
              title="App Móvil Offline"
              desc="Tus capataces pueden escanear cajas y registrar bitácoras sin necesidad de internet. Sincronización automática."
            />
            <FeatureCard 
              icon={<Shield className="text-red-500" />}
              title="Escudo Fitosanitario"
              desc="Bloqueo automático de químicos prohibidos. Evita multas y rechazos en la frontera antes de que sucedan."
            />
            <FeatureCard 
              icon={<Globe className="text-purple-500" />}
              title="Pasaporte Digital"
              desc="Genera códigos QR para el consumidor final. Muestra el origen satelital y la frescura de tu producto."
            />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Confían en AgriTrust</p>
        <div className="flex justify-center gap-12 opacity-50 grayscale">
           {/* Logos ficticios para demo */}
           <div className="text-2xl font-bold font-serif text-slate-600">BERRYMEX</div>
           <div className="text-2xl font-bold font-mono text-slate-600">AgroExport</div>
           <div className="text-2xl font-bold italic text-slate-600">FreshFields</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p>© 2025 AgriTrust Inc.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Términos</a>
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
      <div className="mb-4 bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}