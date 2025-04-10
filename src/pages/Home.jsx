import React from 'react';
import { ArrowRight, Bus, Clock, Shield, Map, BarChart, CalendarClock, Settings, User, Check } from 'lucide-react';
import "../styles/home.css";

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
    <div className="home-container">
      {/* Header con fondo de gradiente */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">TransSync</h1>
          <p className="hero-subtitle">
            La plataforma integral para la gestión y optimización del transporte público moderno
          </p>
          
          <div className="hero-buttons">
            <button className="btn-primary">
              Comenzar ahora
              <ArrowRight className="btn-icon" />
            </button>
            <button className="btn-secondary">
              Ver demostración
            </button>
          </div>
          
          <div className="stats-container">
            {estadisticas.map((stat, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-value">{stat.valor}</div>
                <div className="stat-text">{stat.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Sección de características */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Soluciones de clase mundial</h2>
          <p className="section-subtitle">
            Herramientas potentes para transformar la movilidad urbana
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-container">
                <Bus className="feature-icon" />
              </div>
              <h3 className="feature-title">Gestión de flota</h3>
              <p className="feature-description">
                Monitoreo de vehículos en tiempo real para una operación optimizada y eficiente.
              </p>
              <a href="/features" className="feature-link">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-container">
                <Clock className="feature-icon" />
              </div>
              <h3 className="feature-title">Programación inteligente</h3>
              <p className="feature-description">
                Algoritmos predictivos que mejoran la puntualidad y reducen el tiempo de espera.
              </p>
              <a href="/features" className="feature-link">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-container">
                <Shield className="feature-icon" />
              </div>
              <h3 className="feature-title">Seguridad avanzada</h3>
              <p className="feature-description">
                Protección de datos y sistemas de vigilancia para la seguridad de pasajeros y conductores.
              </p>
              <a href="/features" className="feature-link">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-container">
                <Map className="feature-icon" />
              </div>
              <h3 className="feature-title">Geolocalización precisa</h3>
              <p className="feature-description">
                Seguimiento GPS optimizado para entornos urbanos complejos con actualización continua.
              </p>
              <a href="/features" className="feature-link">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-container">
                <BarChart className="feature-icon" />
              </div>
              <h3 className="feature-title">Análisis de datos</h3>
              <p className="feature-description">
                Informes detallados y métricas clave para la toma de decisiones estratégicas.
              </p>
              <a href="/features" className="feature-link">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-container">
                <CalendarClock className="feature-icon" />
              </div>
              <h3 className="feature-title">Planificación de horarios</h3>
              <p className="feature-description">
                Creación y gestión de horarios optimizados basados en patrones de demanda real.
              </p>
              <a href="/features" className="feature-link">
                Explorar <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de cómo funciona */}
      <section className="how-it-works-section">
        <div className="section-container">
          <h2 className="section-title">Cómo funciona TransSync</h2>
          <p className="section-subtitle">
            Una solución integral para cada aspecto de la gestión del transporte público
          </p>
          
          <div className="workflow-steps">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Integración de datos</h3>
                <p className="step-description">
                  Conectamos todas las fuentes de información de su operación en una única plataforma centralizada.
                </p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Análisis y optimización</h3>
                <p className="step-description">
                  Nuestros algoritmos procesan los datos para identificar áreas de mejora y optimizar operaciones.
                </p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Implementación de cambios</h3>
                <p className="step-description">
                  Aplicación de ajustes a rutas, horarios y asignación de recursos en tiempo real.
                </p>
              </div>
            </div>
            
            <div className="workflow-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">Monitoreo continuo</h3>
                <p className="step-description">
                  Seguimiento permanente del rendimiento para garantizar mejoras constantes en el servicio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de testimonios */}
      <section className="testimonials-section">
        <div className="section-container">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          
          <div className="testimonials-grid">
            {testimonios.map(testimonio => (
              <div className="testimonial-card" key={testimonio.id}>
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{testimonio.texto}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <User size={24} />
                  </div>
                  <div className="author-info">
                    <h4 className="author-name">{testimonio.autor}</h4>
                    <p className="author-title">{testimonio.cargo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección CTA */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Transforme su gestión de transporte hoy</h2>
            <p className="cta-description">
              Únase a más de 50 ciudades que ya están revolucionando su transporte público con TransSync
            </p>
            
            <div className="cta-features">
              <div className="cta-feature">
                <Check className="cta-check" />
                <span>Implementación en menos de 30 días</span>
              </div>
              <div className="cta-feature">
                <Check className="cta-check" />
                <span>Soporte técnico 24/7</span>
              </div>
              <div className="cta-feature">
                <Check className="cta-check" />
                <span>Capacitación incluida</span>
              </div>
            </div>
            
            <div className="cta-buttons">
              <button className="btn-primary">
                Solicitar una demostración
                <ArrowRight className="btn-icon" />
              </button>
              <button className="btn-tertiary">
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