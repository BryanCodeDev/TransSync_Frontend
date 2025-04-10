import React, { useState, useRef, useEffect } from 'react';
import '../styles/chatbot.css';
import Button from './Button';

const ChatBot = ({ 
  title = "Asistente TransSync",
  initialMessage = "¡Hola! Soy el asistente virtual de TransSync. ¿En qué puedo ayudarte hoy?",
  position = "bottom-right",
  theme = "light",
  agentAvatar = "/src/assets/logo.svg",
  userAvatar = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          text: initialMessage,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      handleBotResponse(inputText);
      setIsTyping(false);
    }, 1000);
  };

  const handleBotResponse = (userInput) => {
    // This should be replaced with actual API call or predefined responses
    const responses = {
      default: "Lo siento, no tengo información sobre eso. Por favor contacta al soporte técnico para más ayuda.",
      greeting: ["¡Hola!", "¡Buen día!", "¡Saludos!"],
      help: "Puedo ayudarte con consultas sobre rutas, vehículos, conductores y horarios del transporte público.",
      routes: "Puedes consultar todas las rutas disponibles en la sección 'Rutas' del menú principal.",
      schedules: "Los horarios actualizados se encuentran en la sección 'Horarios'. También puedes filtrar por ruta o por zona.",
      drivers: "La información de conductores está disponible para administradores en la sección 'Conductores'.",
      vehicles: "Para consultar el estado de los vehículos, ve a la sección 'Vehículos'.",
      register: "Para registrarse como nuevo usuario, debes contactar al administrador del sistema."
    };
    
    let botResponse = "";
    const input = userInput.toLowerCase();
    
    if (input.includes("hola") || input.includes("buenos") || input.includes("saludos")) {
      const randomIndex = Math.floor(Math.random() * responses.greeting.length);
      botResponse = responses.greeting[randomIndex];
    } else if (input.includes("ayuda") || input.includes("puedes hacer")) {
      botResponse = responses.help;
    } else if (input.includes("ruta")) {
      botResponse = responses.routes;
    } else if (input.includes("horario")) {
      botResponse = responses.schedules;
    } else if (input.includes("conductor")) {
      botResponse = responses.drivers;
    } else if (input.includes("vehículo") || input.includes("vehiculo") || input.includes("bus")) {
      botResponse = responses.vehicles;
    } else if (input.includes("registr")) {
      botResponse = responses.register;
    } else {
      botResponse = responses.default;
    }
    
    const botMessageObj = {
      id: Date.now(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessageObj]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`chatbot-container ${position} ${theme}`}>
      {!isOpen ? (
        <button 
          className="chatbot-toggle-button" 
          onClick={toggleChat}
          aria-label="Abrir chat de asistencia"
        >
          <span className="chatbot-toggle-icon">💬</span>
        </button>
      ) : (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">{title}</div>
            <button className="chatbot-close" onClick={toggleChat}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`chatbot-message ${msg.sender === 'bot' ? 'bot' : 'user'}`}
              >
                {msg.sender === 'bot' && agentAvatar && (
                  <div className="chatbot-avatar">
                    <img src={agentAvatar} alt="Bot" />
                  </div>
                )}
                
                <div className="chatbot-bubble">
                  <div className="chatbot-text">{msg.text}</div>
                  <div className="chatbot-timestamp">{formatTimestamp(msg.timestamp)}</div>
                </div>
                
                {msg.sender === 'user' && userAvatar && (
                  <div className="chatbot-avatar">
                    <img src={userAvatar} alt="Usuario" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="chatbot-message bot">
                {agentAvatar && (
                  <div className="chatbot-avatar">
                    <img src={agentAvatar} alt="Bot" />
                  </div>
                )}
                <div className="chatbot-bubble">
                  <div className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Escribe tu mensaje aquí..."
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <Button 
              variant="primary"
              size="small"
              onClick={handleSendMessage}
              className="chatbot-send-button"
            >
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;