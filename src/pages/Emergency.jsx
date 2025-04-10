import React, { useState } from "react";
import { AlertTriangle, Bell, Phone, AlertCircle, SendHorizontal } from "lucide-react";
import "../styles/emergency.css";

const Emergency = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");

  const emergencyTypes = [
    { id: "accident", label: "Accidente vial", icon: <AlertTriangle /> },
    { id: "mechanical", label: "Falla mecánica", icon: <AlertCircle /> },
    { id: "security", label: "Problema de seguridad", icon: <Shield /> },
    { id: "medical", label: "Emergencia médica", icon: <Heart /> }
  ];

  const emergencyContacts = [
    { name: "Central de Operaciones", number: "601-555-0123", available: true },
    { name: "Servicio Técnico", number: "601-555-0124", available: true },
    { name: "Policía Nacional", number: "123", available: true },
    { name: "Ambulancia", number: "125", available: true }
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Alerta enviada: ${emergencyType} - ${description}`);
    closeModal();
    setEmergencyType("");
    setDescription("");
  };

  return (
    <div className="emergency-container">
      <div className="emergency-header">
        <AlertTriangle className="emergency-icon" size={32} />
        <h1>Centro de Emergencias</h1>
        <p className="emergency-subtitle">
          Sistema de respuesta rápida para situaciones de emergencia en el transporte público
        </p>
      </div>

      <div className="emergency-cards">
        <div className="emergency-card main-alert">
          <Bell className="card-icon" />
          <h2>Alerta de Emergencia</h2>
          <p>Presiona el botón para reportar un incidente o situación de emergencia en tiempo real</p>
          <button 
            className="emergency-button pulse" 
            onClick={openModal}
          >
            <AlertCircle size={20} />
            <span>Reportar Emergencia</span>
          </button>
        </div>

        <div className="emergency-card">
          <Phone className="card-icon" />
          <h2>Contactos de Emergencia</h2>
          <ul className="contacts-list">
            {emergencyContacts.map((contact, index) => (
              <li key={index} className={contact.available ? "available" : "unavailable"}>
                <div>
                  <span className="contact-name">{contact.name}</span>
                  <span className="contact-number">{contact.number}</span>
                </div>
                <span className="status-indicator"></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ventana modal para reportar emergencia */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2><AlertTriangle size={20} /> Reportar Emergencia</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="emergency-form">
              <div className="form-section">
                <h3>Tipo de emergencia</h3>
                <div className="emergency-types">
                  {emergencyTypes.map((type) => (
                    <label 
                      key={type.id} 
                      className={`type-option ${emergencyType === type.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="emergencyType"
                        value={type.id}
                        checked={emergencyType === type.id}
                        onChange={(e) => setEmergencyType(e.target.value)}
                        required
                      />
                      <span className="icon-wrapper">{type.icon}</span>
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-section">
                <label htmlFor="description">
                  <h3>Descripción del incidente</h3>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Proporciona detalles sobre la situación..."
                    required
                    rows="4"
                  ></textarea>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="submit-button">
                  <SendHorizontal size={16} />
                  <span>Enviar Alerta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes de iconos adicionales
const Heart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const Shield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default Emergency;