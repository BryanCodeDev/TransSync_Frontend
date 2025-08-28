import React, { useState, useEffect } from 'react';
import { ArrowRight, Bus, Clock, Shield, Map, BarChart, CalendarClock, User, Check, Star, Award, TrendingUp, Users, Globe, Zap } from 'lucide-react';

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const estadisticas = [
    { valor: "2,500+", texto: "Rutas activas", icono: Bus, color: "from-blue-500 to-blue-600" },
    { valor: "92%", texto: "Puntualidad", icono: Clock, color: "from-green-500 to-green-600" },
    { valor: "5.2M", texto: "Pasajeros mensuales", icono: Users, color: "from-purple-500 to-purple-600" },
    { valor: "98%", texto: "Satisfacción", icono: Star, color: "from-yellow-500 to-yellow-600" }
  ];

  const caracteristicas = [
    {
      icono: Bus,
      titulo: "Gestión de flota",
      descripcion: "Sistema integral de monitoreo de vehículos en tiempo real con análisis predictivo avanzado.",
      beneficios: ["GPS en tiempo real", "Mantenimiento predictivo", "Optimización de rutas"],
      color: "from-[#1a237e] to-[#3949ab]"
    },
    {
      icono: Clock,
      titulo: "Programación inteligente",
      descripcion: "Algoritmos de IA que optimizan horarios basados en patrones de demanda y condiciones del tráfico.",
      beneficios: ["IA predictiva", "Optimización automática", "Reducción de esperas"],
      color: "from-[#3949ab] to-[#5c6bc0]"
    },
    {
      icono: Shield,
      titulo: "Seguridad avanzada",
      descripcion: "Protocolos de seguridad de nivel empresarial con monitoreo 24/7 y respuesta automática.",
      beneficios: ["Monitoreo 24/7", "Alertas automáticas", "Protección de datos"],
      color: "from-[#1a237e] to-[#283593]"
    },
    {
      icono: Map,
      titulo: "Geolocalización precisa",
      descripcion: "Sistema GPS de alta precisión optimizado para entornos urbanos complejos.",
      beneficios: ["Precisión submétrica", "Cobertura urbana", "Actualización en vivo"],
      color: "from-[#283593] to-[#3949ab]"
    },
    {
      icono: BarChart,
      titulo: "Análisis de datos",
      descripcion: "Dashboard inteligente con métricas avanzadas para la toma de decisiones estratégicas.",
      beneficios: ["Informes automatizados", "KPIs en tiempo real", "Análisis predictivo"],
      color: "from-[#3949ab] to-[#5c6bc0]"
    },
    {
      icono: CalendarClock,
      titulo: "Planificación de horarios",
      descripcion: "Sistema automatizado de creación y optimización de horarios basado en demanda real.",
      beneficios: ["Automatización completa", "Optimización dinámica", "Adaptación en tiempo real"],
      color: "from-[#1a237e] to-[#3949ab]"
    }
  ];

  const testimonios = [
    {
      id: 1,
      texto: "TransSync ha revolucionado completamente nuestra operación. Hemos reducido costos en un 35% y mejorado la satisfacción del usuario significativamente.",
      autor: "Carlos Rodríguez",
      cargo: "Director de Operaciones",
      empresa: "TransUrbe Bogotá",
      rating: 5,
      beneficio: "35% reducción de costos"
    },
    {
      id: 2,
      texto: "La implementación fue sorprendentemente rápida y el soporte técnico es excepcional. Nuestros indicadores de puntualidad mejoraron en solo 3 meses.",
      autor: "Ana Martínez",
      cargo: "Gerente de Flota",
      empresa: "Metroplús Medellín",
      rating: 5,
      beneficio: "40% mejora en puntualidad"
    },
    {
      id: 3,
      texto: "La plataforma es increíblemente intuitiva. Nuestros operadores se adaptaron rápidamente y ahora gestionamos el doble de rutas con el mismo equipo.",
      autor: "Luis Fernández",
      cargo: "Jefe de Operaciones",
      empresa: "MIO Cali",
      rating: 5,
      beneficio: "100% más rutas gestionadas"
    }
  ];

  const premios = [
    { titulo: "Mejor Innovación en Transporte", año: "2025", organizacion: "Smart Cities Awards" },
    { titulo: "Excelencia en Tecnología", año: "2024", organizacion: "TransTech Global" },
    { titulo: "Producto del Año", año: "2024", organizacion: "Mobility Innovation Awards" }
  ];

  const ciudades = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga",
    "Pereira", "Santa Marta", "Cúcuta", "Ibagué", "Manizales", "Pasto"
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonios.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonios.length]);

  return (
    <div className="font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-gray-800 leading-relaxed">
      {/* Header Hero mejorado */}
      <header className="bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="w-full max-w-6xl mx-auto relative z-10 text-center">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Premiado como Mejor Innovación en Transporte 2025</span>
          </div>

          <h1 className="text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            TransSync
          </h1>
          <p className="text-xl w-full max-w-3xl mx-auto mb-8 text-blue-100">
            La plataforma integral para la gestión y optimización del transporte público moderno
          </p>
          
          <div className="flex gap-4 justify-center mb-12 flex-wrap">
            <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group">
              Comenzar ahora
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300">
              Ver demostración
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {estadisticas.map((stat, index) => (
              <div className="bg-white/10 backdrop-blur-sm py-4 px-6 rounded-xl border border-white/20 min-w-[150px] shadow-lg" key={index}>
                <div className="text-2xl font-bold mb-1 text-blue-100">{stat.valor}</div>
                <div className="text-sm text-blue-200">{stat.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Sección de confianza */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gray-600 font-medium mb-4">Más de 50 ciudades confían en nosotros</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {ciudades.slice(0, 8).map((ciudad, index) => (
                <span key={index} className="text-lg font-semibold text-gray-400 hover:text-[#3949ab] transition-colors duration-300">
                  {ciudad}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sección de características mejorada */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#3949ab]/10 text-[#3949ab] px-4 py-2 rounded-full font-semibold mb-4">
              <Zap className="w-4 h-4" />
              Tecnología de Vanguardia
            </div>
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Soluciones que <span className="bg-gradient-to-r from-[#1a237e] to-[#3949ab] bg-clip-text text-transparent">transforman</span> ciudades
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Herramientas inteligentes diseñadas para optimizar cada aspecto del transporte público moderno
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caracteristicas.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 h-full flex flex-col relative overflow-hidden">
                  {/* Elemento decorativo de fondo */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500`}></div>
                  
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg relative z-10`}>
                    <feature.icono className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-[#1a237e] transition-colors duration-300">
                    {feature.titulo}
                  </h3>
                  
                  <p className="text-gray-600 text-base mb-6 flex-grow leading-relaxed">
                    {feature.descripcion}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {feature.beneficios.map((beneficio, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{beneficio}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="flex items-center gap-2 text-[#3949ab] font-semibold hover:text-[#1a237e] transition-all duration-300 group-hover:translate-x-2 mt-auto">
                    Explorar característica
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de proceso mejorada */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Implementación <span className="bg-gradient-to-r from-[#1a237e] to-[#3949ab] bg-clip-text text-transparent">sin complicaciones</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestro proceso probado garantiza una transición suave y resultados inmediatos
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Línea conectora */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-[#1a237e] to-[#3949ab] transform -translate-y-1/2 hidden lg:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    numero: "01",
                    titulo: "Análisis inicial",
                    descripcion: "Evaluamos su infraestructura actual y definimos objetivos específicos",
                    icono: BarChart,
                    tiempo: "1-2 semanas"
                  },
                  {
                    numero: "02",
                    titulo: "Configuración personalizada",
                    descripcion: "Adaptamos la plataforma a sus necesidades operacionales específicas",
                    icono: Zap,
                    tiempo: "2-3 semanas"
                  },
                  {
                    numero: "03",
                    titulo: "Capacitación integral",
                    descripcion: "Entrenamos a su equipo para maximizar el potencial de la plataforma",
                    icono: Users,
                    tiempo: "1 semana"
                  },
                  {
                    numero: "04",
                    titulo: "Lanzamiento y soporte",
                    descripcion: "Implementamos con soporte 24/7 y monitoreo continuo del rendimiento",
                    icono: TrendingUp,
                    tiempo: "Continuo"
                  }
                ].map((paso, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center relative z-10 hover:border-[#3949ab]/30">
                      {/* Número del paso */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                          {paso.numero}
                        </div>
                      </div>
                      
                      <div className="w-16 h-16 bg-gradient-to-br from-[#3949ab]/10 to-[#1a237e]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <paso.icono className="w-8 h-8 text-[#3949ab]" />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 text-gray-900">{paso.titulo}</h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{paso.descripcion}</p>
                      <div className="inline-block bg-[#3949ab]/10 text-[#3949ab] px-3 py-1 rounded-full text-xs font-semibold">
                        {paso.tiempo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios mejorados */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Resultados que <span className="bg-gradient-to-r from-[#1a237e] to-[#3949ab] bg-clip-text text-transparent">hablan por sí solos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre cómo TransSync está transformando el transporte público en toda América Latina
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 relative overflow-hidden">
              {/* Elemento decorativo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3949ab]/5 to-[#1a237e]/5 rounded-full -translate-y-32 translate-x-32"></div>
              
              {/* Testimonial actual */}
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonios[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-2xl font-medium text-gray-900 text-center mb-8 leading-relaxed">
                  "{testimonios[currentTestimonial].texto}"
                </blockquote>
                
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1a237e] to-[#3949ab] rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-gray-900">{testimonios[currentTestimonial].autor}</div>
                    <div className="text-gray-600">{testimonios[currentTestimonial].cargo}</div>
                    <div className="text-[#3949ab] font-semibold">{testimonios[currentTestimonial].empresa}</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-block bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-4 py-2 rounded-full font-semibold text-sm">
                    {testimonios[currentTestimonial].beneficio}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Indicadores de testimonio */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonios.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-[#3949ab] scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sección de reconocimientos */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Reconocido por la industria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {premios.map((premio, index) => (
                <div key={index} className="flex items-center justify-center gap-4 p-6 border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-300">
                  <Award className="w-8 h-8 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{premio.titulo}</div>
                    <div className="text-sm text-gray-600">{premio.organizacion} - {premio.año}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final más compacto */}
      <section className="relative py-16 bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] text-white overflow-hidden">
        {/* Elementos decorativos sutiles */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
              <Globe className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Disponible en toda América Latina</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              El futuro del transporte <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">empieza hoy</span>
            </h2>
            
            <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Únase a más de 50 ciudades que ya están transformando su transporte público 
              con la plataforma más avanzada del mercado
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Implementación en 30 días</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">ROI garantizado</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Soporte 24/7</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group">
                Solicitar una demostración
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button className="bg-white text-[#1a237e] hover:bg-blue-50 font-semibold py-3 px-6 rounded-xl border border-white transition-all duration-300">
                Contactar ventas
              </button>
            </div>
            
            <div className="mt-8 text-blue-200 text-sm">
              <p>💡 <strong>Oferta especial 2025:</strong> Primeros 3 meses sin costo de implementación</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;