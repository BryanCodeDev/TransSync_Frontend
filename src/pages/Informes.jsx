import React, { useState } from "react";
import { Calendar, BarChart2, Download, Filter, Printer, Clock, FileText, ChevronDown } from "lucide-react";
import "../styles/informes.css";

const Informes = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  
  // Función para obtener informes reales
  const fetchReports = () => {
    // Implementar la llamada a la API real aquí
    // const response = await api.getReports();
    // setReports(response.data);
  };
  
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Implementar la llamada a la API real para generar el informe
      // const response = await api.generateReport(params);
      // Si la generación es exitosa, actualizar la lista de informes
      // await fetchReports();
      
      // Para propósitos de demostración (remover en producción)
      setTimeout(() => {
        setLoading(false);
        alert("Informe generado con éxito");
      }, 300);
    } catch (error) {
      console.error("Error al generar el informe:", error);
      alert("Error al generar el informe");
    } finally {
      // setLoading(false); // Descomentar cuando se implemente la API real
    }
  };
  
  const filteredReports = reports.filter(report => {
    if (activeTab === "general") return true;
    return report.type === activeTab;
  });

  return (
    <div className="informes-container">
      <div className="informes-header">
        <h1 className="title">
          <FileText className="title-icon" />
          Informes y Estadísticas
        </h1>
        <p className="subtitle">
          Genera y visualiza informes detallados sobre el sistema de transporte público
        </p>
      </div>

      <div className="informes-tabs">
        <button 
          className={`tab-button ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          General
        </button>
        <button 
          className={`tab-button ${activeTab === "rutas" ? "active" : ""}`}
          onClick={() => setActiveTab("rutas")}
        >
          Rutas
        </button>
        <button 
          className={`tab-button ${activeTab === "vehiculos" ? "active" : ""}`}
          onClick={() => setActiveTab("vehiculos")}
        >
          Vehículos
        </button>
        <button 
          className={`tab-button ${activeTab === "horarios" ? "active" : ""}`}
          onClick={() => setActiveTab("horarios")}
        >
          Horarios
        </button>
        <button 
          className={`tab-button ${activeTab === "conductores" ? "active" : ""}`}
          onClick={() => setActiveTab("conductores")}
        >
          Conductores
        </button>
      </div>

      <div className="panel-container">
        <div className="panel">
          <div className="panel-header">
            <h2>Generar nuevo informe</h2>
          </div>
          <div className="panel-content">
            <div className="form-group">
              <label>Tipo de informe</label>
              <div className="select-wrapper">
                <select className="form-control">
                  <option>Ocupación por ruta</option>
                  <option>Puntualidad de servicios</option>
                  <option>Estado de la flota</option>
                  <option>Incidencias reportadas</option>
                  <option>Ganancias por ruta</option>
                </select>
                <ChevronDown className="select-icon" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fecha inicial</label>
                <div className="input-icon-wrapper">
                  <Calendar className="input-icon" />
                  <input 
                    type="date" 
                    className="form-control"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Fecha final</label>
                <div className="input-icon-wrapper">
                  <Calendar className="input-icon" />
                  <input 
                    type="date" 
                    className="form-control"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Formato</label>
              <div className="format-options">
                <label className="format-option">
                  <input type="radio" name="format" value="pdf" defaultChecked />
                  <span>PDF</span>
                </label>
                <label className="format-option">
                  <input type="radio" name="format" value="excel" />
                  <span>Excel</span>
                </label>
                <label className="format-option">
                  <input type="radio" name="format" value="csv" />
                  <span>CSV</span>
                </label>
              </div>
            </div>
            
            <button 
              className={`generate-button ${loading ? "loading" : ""}`}
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="button-icon spin" />
                  Generando...
                </>
              ) : (
                <>
                  <BarChart2 className="button-icon" />
                  Generar informe
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="panel">
          <div className="panel-header">
            <h2>Informes recientes</h2>
            <div className="panel-actions">
              <button className="action-button">
                <Filter className="button-icon-sm" />
                Filtrar
              </button>
            </div>
          </div>
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Descargas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map(report => (
                    <tr key={report.id}>
                      <td>{report.name}</td>
                      <td>{report.date}</td>
                      <td>{report.downloads}</td>
                      <td>
                        <div className="table-actions">
                          <button className="table-action-button" title="Descargar">
                            <Download size={16} />
                          </button>
                          <button className="table-action-button" title="Imprimir">
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-reports">
                      No hay informes disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-content">
            <h3>Estadísticas rápidas</h3>
            <div className="stat-item">
              <span className="stat-label">Informes generados este mes:</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ruta más analizada:</span>
              <span className="stat-value">-</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Descargas totales:</span>
              <span className="stat-value">0</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-content">
            <h3>Programar informes</h3>
            <p>Configura informes automáticos periódicos enviados directamente a tu correo.</p>
            <button className="card-button">Configurar</button>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-content">
            <h3>Personalizar informes</h3>
            <p>Crea plantillas personalizadas para tus necesidades específicas.</p>
            <button className="card-button">Crear plantilla</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informes;