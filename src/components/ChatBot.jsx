import React, { useState, useRef, useEffect } from 'react';

// Componente Button con paleta uniforme
const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "medium", 
  className = "",
  disabled = false,
  ...props 
}) => {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white hover:from-[#0d1642] hover:to-[#283593] focus:ring-[#3949ab] focus:ring-opacity-50 shadow-sm hover:shadow-md",
    secondary: "bg-gradient-to-r from-[#283593] to-[#3949ab] text-white hover:from-[#1a237e] hover:to-[#283593] focus:ring-[#283593] focus:ring-opacity-50 shadow-sm hover:shadow-md",
    outline: "bg-transparent border-2 border-[#1a237e] text-[#1a237e] hover:bg-gradient-to-r hover:from-[#1a237e] hover:to-[#3949ab] hover:text-white focus:ring-[#1a237e] focus:ring-opacity-50"
  };
  
  const sizes = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2.5 text-base",
    large: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const ChatBot = ({ 
  title = "Asistente TransSync",
  initialMessage = "¡Hola! Soy el asistente virtual de TransSync. ¿En qué puedo ayudarte hoy?",
  position = "bottom-right",
  theme = "professional",
  agentAvatar = "🤖",
  userAvatar = "👤"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
  }, [initialMessage, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Animaciones CSS mejoradas con paleta de colores uniforme
  useEffect(() => {
    const styleId = 'chatbot-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes typing {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideOutDown {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(26, 35, 126, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(26, 35, 126, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(26, 35, 126, 0);
          }
        }
        
        .typing-dot {
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        .chat-window-enter {
          animation: slideInUp 0.3s ease-out forwards;
        }
        
        .chat-window-exit {
          animation: slideOutDown 0.3s ease-in forwards;
        }
        
        .chat-button-bounce {
          animation: bounce 2s infinite;
        }
        
        .chat-button-pulse {
          animation: pulse 2s infinite;
        }
        
        .message-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Scrollbar personalizada con paleta uniforme */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(26, 35, 126, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(26, 35, 126, 0.6);
        }
        
        /* Gradiente de texto con paleta uniforme */
        .gradient-text {
          background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => {
      handleBotResponse(inputText);
      setIsTyping(false);
    }, Math.random() * 1000 + 800);
  };

  const handleBotResponse = (userInput) => {
    const responses = {
      default: "Lo siento, no tengo información específica sobre eso. Te recomiendo contactar a nuestro equipo de soporte técnico para recibir asistencia personalizada.",
      greeting: [
        "¡Hola! Es un placer ayudarte hoy.", 
        "¡Buen día! ¿En qué puedo asistirte?", 
        "¡Saludos! Estoy aquí para resolver tus consultas."
      ],
      help: "Puedo ayudarte con información sobre:\n• Consulta de rutas y paradas\n• Estado de vehículos y conductores\n• Horarios y programación\n• Reportes de incidencias\n• Procedimientos administrativos",
      routes: "📍 **Gestión de Rutas:**\nAccede al menú 'Rutas' para consultar todas las rutas disponibles, ver mapas interactivos y obtener información sobre paradas y tiempos estimados.",
      schedules: "⏰ **Horarios Actualizados:**\nEn la sección 'Horarios' encontrarás programaciones en tiempo real, filtros por ruta o zona, y notificaciones de cambios de horario.",
      drivers: "👨‍💼 **Gestión de Conductores:**\nLa información detallada de conductores está disponible para administradores en la sección correspondiente, incluyendo licencias y evaluaciones.",
      vehicles: "🚌 **Estado de Vehículos:**\nConsulta el estado en tiempo real de toda la flota, mantenimientos programados y reportes de rendimiento en la sección 'Vehículos'.",
      register: "📝 **Registro de Usuario:**\nPara crear una cuenta nueva, debes contactar al administrador del sistema quien te proporcionará las credenciales de acceso.",
      thanks: ["¡De nada! ¿Hay algo más en lo que pueda ayudarte?", "¡Un placer ayudarte! ¿Necesitas información adicional?", "¡Perfecto! Estoy aquí si tienes más consultas."]
    };
    
    let botResponse = "";
    const input = userInput.toLowerCase();
    
    if (input.includes("hola") || input.includes("buenos") || input.includes("saludos")) {
      const randomIndex = Math.floor(Math.random() * responses.greeting.length);
      botResponse = responses.greeting[randomIndex];
    } else if (input.includes("ayuda") || input.includes("puedes hacer") || input.includes("qué haces")) {
      botResponse = responses.help;
    } else if (input.includes("ruta") || input.includes("recorrido")) {
      botResponse = responses.routes;
    } else if (input.includes("horario") || input.includes("tiempo")) {
      botResponse = responses.schedules;
    } else if (input.includes("conductor") || input.includes("chofer")) {
      botResponse = responses.drivers;
    } else if (input.includes("vehículo") || input.includes("vehiculo") || input.includes("bus") || input.includes("autobús")) {
      botResponse = responses.vehicles;
    } else if (input.includes("registr") || input.includes("cuenta") || input.includes("usuario")) {
      botResponse = responses.register;
    } else if (input.includes("gracias") || input.includes("thanks")) {
      const randomIndex = Math.floor(Math.random() * responses.thanks.length);
      botResponse = responses.thanks[randomIndex];
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clases de posición responsivas
  const getPositionClasses = () => {
    const positions = {
      'bottom-right': {
        desktop: 'bottom-6 right-6',
        mobile: 'bottom-4 right-4'
      },
      'bottom-left': {
        desktop: 'bottom-6 left-6',
        mobile: 'bottom-4 left-4'
      },
      'top-right': {
        desktop: 'top-6 right-6',
        mobile: 'top-4 right-4'
      },
      'top-left': {
        desktop: 'top-6 left-6',
        mobile: 'top-4 left-4'
      }
    };
    
    const pos = positions[position] || positions['bottom-right'];
    return `${pos.desktop} max-md:${pos.mobile}`;
  };

  // Temas mejorados con paleta de colores uniforme
  const themeClasses = {
    light: {
      window: 'bg-white text-gray-800 border border-gray-200',
      header: 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white',
      botBubble: 'bg-gray-50 text-gray-800 border border-gray-100 shadow-sm',
      userBubble: 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white shadow-sm',
      input: 'bg-white border-gray-200 text-gray-800 focus:border-[#3949ab]',
      inputArea: 'border-gray-100 bg-gray-50',
      timestamp: 'text-gray-500'
    },
    dark: {
      window: 'bg-gray-900 text-gray-100 border border-gray-700',
      header: 'bg-gradient-to-r from-[#0d1642] to-[#1a237e] text-white',
      botBubble: 'bg-gray-800 text-gray-100 border border-gray-700 shadow-sm',
      userBubble: 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white shadow-sm',
      input: 'bg-gray-800 border-gray-600 text-gray-100 focus:border-[#3949ab]',
      inputArea: 'border-gray-700 bg-gray-800',
      timestamp: 'text-gray-400'
    },
    professional: {
      window: 'bg-white text-slate-800 border border-slate-200 shadow-2xl',
      header: 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white',
      botBubble: 'bg-slate-50 text-slate-800 border border-slate-100 shadow-sm',
      userBubble: 'bg-gradient-to-r from-[#283593] to-[#3949ab] text-white shadow-sm',
      input: 'bg-white border-slate-200 text-slate-800 focus:border-[#3949ab]',
      inputArea: 'border-slate-100 bg-slate-50',
      timestamp: 'text-slate-500'
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.professional;

  // Determinar tamaño de ventana responsivo
  const getWindowSize = () => {
    return {
      responsive: 'w-[400px] h-[600px] max-sm:w-[calc(100vw-1rem)] max-sm:h-[calc(100vh-2rem)] max-sm:max-h-[600px] max-sm:max-w-[400px] max-md:w-[380px] max-md:h-[520px]'
    };
  };

  return (
    <div className={`fixed z-[9999] ${getPositionClasses()}`}>
      {!isOpen ? (
        <button 
          className={`
            relative group
            bg-gradient-to-r from-[#1a237e] to-[#3949ab]
            text-white border-none rounded-full 
            w-16 h-16 flex items-center justify-center cursor-pointer 
            shadow-lg hover:shadow-xl
            transition-all duration-300 ease-out
            hover:scale-110 hover:from-[#0d1642] hover:to-[#283593]
            focus:outline-none focus:ring-4 focus:ring-[#3949ab] focus:ring-opacity-50
            max-sm:w-14 max-sm:h-14
            chat-button-pulse
          `}
          onClick={toggleChat}
          aria-label="Abrir chat de asistencia"
        >
          <span className="text-2xl max-sm:text-xl filter drop-shadow-sm">💬</span>
          
          {/* Indicador de notificación */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#c62828] to-[#d32f2f] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-[#1a237e] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-white/20">
            Asistente Virtual
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#1a237e]"></div>
          </div>
        </button>
      ) : (
        <div className={`
          ${getWindowSize().responsive}
          rounded-2xl overflow-hidden 
          flex flex-col 
          backdrop-blur-sm
          chat-window-enter
          ${currentTheme.window}
        `}>
          {/* Header mejorado */}
          <div className={`p-4 flex justify-between items-center ${currentTheme.header} shadow-sm`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <div className="font-semibold text-base leading-tight">{title}</div>
                <div className="text-xs opacity-90">
                  {isTyping ? 'Escribiendo...' : 'En línea'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors duration-200"
                onClick={toggleMinimize}
                aria-label={isMinimized ? "Expandir" : "Minimizar"}
              >
                <span className="text-sm">
                  {isMinimized ? '🔼' : '🔽'}
                </span>
              </button>
              <button 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors duration-200"
                onClick={toggleChat}
                aria-label="Cerrar chat"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {/* Contenedor de mensajes con scroll personalizado */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-end space-x-2 message-fade-in ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a237e] to-[#3949ab] flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {typeof agentAvatar === 'string' && agentAvatar.startsWith('http') ? (
                          <img src={agentAvatar} alt="Bot" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{agentAvatar}</span>
                        )}
                      </div>
                    )}
                    
                    <div className={`
                      px-4 py-3 rounded-2xl max-w-[80%] break-words relative
                      ${msg.sender === 'bot' 
                        ? `${currentTheme.botBubble} rounded-bl-md` 
                        : `${currentTheme.userBubble} rounded-br-md`
                      }
                    `}>
                      <div className="leading-relaxed text-sm whitespace-pre-line">
                        {msg.text}
                      </div>
                      <div className={`
                        text-xs opacity-75 text-right mt-2
                        ${currentTheme.timestamp}
                      `}>
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                    
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#283593] to-[#3949ab] flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {typeof userAvatar === 'string' && userAvatar.startsWith('http') ? (
                          <img src={userAvatar} alt="Usuario" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{userAvatar}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-end space-x-2 message-fade-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a237e] to-[#3949ab] flex items-center justify-center text-white text-sm shadow-sm">
                      <span>{agentAvatar}</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${currentTheme.botBubble}`}>
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-[#3949ab] rounded-full inline-block typing-dot"></span>
                        <span className="w-2 h-2 bg-[#3949ab] rounded-full inline-block typing-dot"></span>
                        <span className="w-2 h-2 bg-[#3949ab] rounded-full inline-block typing-dot"></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Área de input mejorada */}
              <div className={`p-4 border-t ${currentTheme.inputArea}`}>
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      className={`
                        w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none
                        transition-all duration-200 ease-in-out
                        focus:ring-2 focus:ring-[#3949ab] focus:ring-opacity-50
                        placeholder-gray-400
                        ${currentTheme.input}
                      `}
                      placeholder="Escribe tu mensaje aquí... (Enter para enviar)"
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      rows={inputText.split('\n').length || 1}
                      style={{ maxHeight: '120px' }}
                    />
                  </div>
                  <Button 
                    variant="primary"
                    size="medium"
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="px-4 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="max-sm:hidden">Enviar</span>
                    <span className="sm:hidden">📤</span>
                  </Button>
                </div>
                
                {/* Sugerencias rápidas */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Rutas', 'Horarios', 'Vehículos', 'Ayuda'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInputText(suggestion);
                        setTimeout(handleSendMessage, 100);
                      }}
                      className="px-3 py-1 text-xs bg-gradient-to-r from-[#1a237e]/10 to-[#3949ab]/10 text-[#1a237e] rounded-full hover:from-[#1a237e]/20 hover:to-[#3949ab]/20 transition-colors duration-200 border border-[#3949ab]/30"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;