import React, { useState, useRef, useEffect } from 'react';
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
  }, [initialMessage, messages.length]);

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

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8'
  };

  // Theme classes
  const themeClasses = {
    light: {
      window: 'bg-white text-gray-900',
      header: 'bg-blue-500 text-white',
      botBubble: 'bg-gray-100 text-gray-900',
      userBubble: 'bg-blue-500 text-white',
      input: 'bg-white border-gray-300 text-gray-900',
      inputArea: 'border-gray-200'
    },
    dark: {
      window: 'bg-gray-800 text-gray-100',
      header: 'bg-gray-900 text-white',
      botBubble: 'bg-gray-700 text-gray-100',
      userBubble: 'bg-blue-500 text-white',
      input: 'bg-gray-700 border-gray-600 text-gray-100',
      inputArea: 'border-gray-700'
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <>
      <style jsx>{`
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
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
      `}</style>
      
      <div className={`fixed z-[1000] ${positionClasses[position]} max-sm:${position.includes('right') ? 'right-4' : 'left-4'} max-sm:${position.includes('bottom') ? 'bottom-4' : 'top-4'}`}>
        {!isOpen ? (
          <button 
            className={`
              bg-blue-500 text-white border-none rounded-full 
              w-15 h-15 flex items-center justify-center cursor-pointer 
              shadow-[0_4px_12px_rgba(59,130,246,0.3)] 
              transition-all duration-300 ease-in-out
              hover:scale-105 hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)]
              max-sm:w-12 max-sm:h-12
            `}
            onClick={toggleChat}
            aria-label="Abrir chat de asistencia"
          >
            <span className="text-2xl">💬</span>
          </button>
        ) : (
          <div className={`
            w-[340px] h-[480px] rounded-xl overflow-hidden 
            flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.15)] 
            border border-black border-opacity-10
            max-sm:w-[calc(100vw-2rem)] max-sm:h-[70vh] max-sm:max-h-[500px]
            ${currentTheme.window}
          `}>
            {/* Header del chat */}
            <div className={`p-4 flex justify-between items-center ${currentTheme.header}`}>
              <div className="font-semibold text-base">{title}</div>
              <button 
                className="bg-none border-none text-white text-2xl leading-none cursor-pointer p-0 m-0"
                onClick={toggleChat}
              >
                ×
              </button>
            </div>
            
            {/* Contenedor de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-end mb-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.sender === 'bot' && agentAvatar && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 mr-2">
                      <img src={agentAvatar} alt="Bot" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className={`
                    px-4 py-3 rounded-[18px] max-w-[75%] break-words relative
                    ${msg.sender === 'bot' 
                      ? `${currentTheme.botBubble} rounded-bl-[6px]` 
                      : `${currentTheme.userBubble} rounded-br-[6px] mr-2`
                    }
                  `}>
                    <div className="leading-relaxed text-[0.925rem]">{msg.text}</div>
                    <div className={`
                      text-[0.7rem] opacity-70 text-right mt-1
                      ${msg.sender === 'user' ? 'text-white text-opacity-90' : ''}
                    `}>
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                  
                  {msg.sender === 'user' && userAvatar && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                      <img src={userAvatar} alt="Usuario" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-end mb-3">
                  {agentAvatar && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200 mr-2">
                      <img src={agentAvatar} alt="Bot" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-[18px] rounded-bl-[6px] ${currentTheme.botBubble}`}>
                    <div className="flex gap-1 px-3 py-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full inline-block typing-dot"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full inline-block typing-dot"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full inline-block typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Area de input */}
            <div className={`p-4 flex gap-2 border-t ${currentTheme.inputArea}`}>
              <input
                type="text"
                className={`
                  flex-1 px-4 py-3 border rounded-lg text-[0.925rem] outline-none 
                  transition-all duration-200 ease-in-out
                  focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]
                  ${currentTheme.input}
                `}
                placeholder="Escribe tu mensaje aquí..."
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              <Button 
                variant="primary"
                size="small"
                onClick={handleSendMessage}
                className="px-4 py-3 min-w-[60px]"
              >
                Enviar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBot;