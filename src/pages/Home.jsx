import React from 'react';
import { ArrowRight, Bus, Clock, Shield, Map, BarChart, CalendarClock, User, Check } from 'lucide-react';

const Home = () => {
  const estadisticas = [
    { valor: "1,500+", texto: "Rutas activas" },
    { valor: "85%", texto: "Puntualidad" },
    { valor: "3.5M", texto: "Pasajeros mensuales" },
    { valor: "95%", texto: "Satisfacción" }
  ];

  const testimonios = [
    {
      id: 1,
      texto: "TransSync ha revolucionado nuestra forma de gestionar el transporte público. Ahora podemos optimizar rutas en tiempo real y mejorar la experiencia de nuestros usuarios.",
      autor: "Carlos Rodríguez",
      cargo: "Director de Operaciones, TransUrbe Bogotá"
    },
    {
      id: 2,
      texto: "La plataforma nos ha permitido reducir costos operativos en un 30% mientras mejoramos la frecuencia de nuestros servicios. Una herramienta indispensable.",
      autor: "Ana Martínez",
      cargo: "Gerente de Flota, Metroplús Medellín"
    }
  ];

  return (
    <div className="font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-gray-800 leading-relaxed">
      {/* Header con fondo de gradiente */}
      <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-6 relative overflow-hidden">
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            TransSync
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-white/90">
            La plataforma integral para la gestión y optimización del transporte público moderno
          </p>
          
          <div className="flex gap-4 justify-center mb-12 flex-wrap">
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group">
              Comenzar ahora
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg border border-white/20 transition-all duration-300">
              Ver demostración
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {estadisticas.map((stat, index) => (
              <div className="bg-white/10 backdrop-blur-sm py-4 px-6 rounded-lg border border-white/20 min-w-[150px]" key={index}>
                <div className="text-2xl font-bold mb-1">{stat.valor}</div>
                <div className="text-sm opacity-90">{stat.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Sección de características */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Soluciones de clase mundial</h2>
          <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Herramientas potentes para transformar la movilidad urbana
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Bus className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestión de flota</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Monitoreo de vehículos en tiempo real para una operación optimizada y eficiente.
              </p>
              <a href="/features" className="flex items-center gap-1.5 text-blue-600 font-medium text-sm hover:underline mt-auto">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Programación inteligente</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Algoritmos predictivos que mejoran la puntualidad y reducen el tiempo de espera.
              </p>
              <a href="/features" className="flex items-center gap-1.5 text-blue-600 font-medium text-sm hover:underline mt-auto">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguridad avanzada</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Protección de datos y sistemas de vigilancia para la seguridad de pasajeros y conductores.
              </p>
              <a href="/features" className="flex items-center gap-1.5 text-blue-600 font-medium text-sm hover:underline mt-auto">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Map className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Geolocalización precisa</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Seguimiento GPS optimizado para entornos urbanos complejos con actualización continua.
              </p>
              <a href="/features" className="flex items-center gap-1.5 text-blue-600 font-medium text-sm hover:underline mt-auto">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <BarChart className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Análisis de datos</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Informes detallados y métricas clave para la toma de decisiones estratégicas.
              </p>
              <a href="/features" className="flex items-center gap-1.5 text-blue-600 font-medium text-sm hover:underline mt-auto">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <CalendarClock className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Planificación de horarios</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">
                Creación y gestión de horarios optimizados basados en patrones de demanda real.
              </p>
              <a href="/features" className="flex items-center gap-1.5 text-blue-600 font-medium text-sm hover:underline mt-auto">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de cómo funciona */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Cómo funciona TransSync</h2>
          <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Una solución integral para cada aspecto de la gestión del transporte público
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex mb-8 relative">
              <div className="absolute top-12 left-6 w-0.5 h-full bg-gray-200 -z-10"></div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xl mr-6 flex-shrink-0 relative z-10">
                1
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold mb-2">Integración de datos</h3>
                <p className="text-gray-600">
                  Conectamos todas las fuentes de información de su operación en una única plataforma centralizada.
                </p>
              </div>
            </div>
            
            <div className="flex mb-8 relative">
              <div className="absolute top-12 left-6 w-0.5 h-full bg-gray-200 -z-10"></div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xl mr-6 flex-shrink-0 relative z-10">
                2
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold mb-2">Análisis y optimización</h3>
                <p className="text-gray-600">
                  Nuestros algoritmos procesan los datos para identificar áreas de mejora y optimizar operaciones.
                </p>
              </div>
            </div>
            
            <div className="flex mb-8 relative">
              <div className="absolute top-12 left-6 w-0.5 h-full bg-gray-200 -z-10"></div>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xl mr-6 flex-shrink-0 relative z-10">
                3
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold mb-2">Implementación de cambios</h3>
                <p className="text-gray-600">
                  Aplicación de ajustes a rutas, horarios y asignación de recursos en tiempo real.
                </p>
              </div>
            </div>
            
            <div className="flex mb-0 relative">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xl mr-6 flex-shrink-0 relative z-10">
                4
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold mb-2">Monitoreo continuo</h3>
                <p className="text-gray-600">
                  Seguimiento permanente del rendimiento para garantizar mejoras constantes en el servicio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de testimonios */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Lo que dicen nuestros clientes</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testimonios.map(testimonio => (
              <div className="bg-white rounded-xl p-8 shadow-sm relative" key={testimonio.id}>
                <div className="absolute top-4 left-4 text-6xl text-blue-500/10 font-serif leading-none">
                  "
                </div>
                <p className="text-base mb-6 relative z-10">{testimonio.texto}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3 text-white">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-0.5">{testimonio.autor}</h4>
                    <p className="text-gray-600 text-sm">{testimonio.cargo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Transforme su gestión de transporte hoy</h2>
            <p className="text-lg mb-8 text-white/90">
              Únase a más de 50 ciudades que ya están revolucionando su transporte público con TransSync
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 py-2 px-4 bg-white/10 rounded-lg">
                <Check className="text-amber-500" />
                <span>Implementación en menos de 30 días</span>
              </div>
              <div className="flex items-center gap-2 py-2 px-4 bg-white/10 rounded-lg">
                <Check className="text-amber-500" />
                <span>Soporte técnico 24/7</span>
              </div>
              <div className="flex items-center gap-2 py-2 px-4 bg-white/10 rounded-lg">
                <Check className="text-amber-500" />
                <span>Capacitación incluida</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group">
                Solicitar una demostración
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg border border-blue-600 transition-all duration-300">
                Contactar ventas
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;