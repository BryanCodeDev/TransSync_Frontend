import React from 'react';

const Button = ({ 
  children, 
  variant = "primary", 
  size = "medium", 
  icon = null,
  iconPosition = "left",
  fullWidth = false,
  disabled = false,
  onClick = () => {},
  className = "",
  type = "button"
}) => {
  const baseClasses = `
    font-medium rounded-lg transition-all duration-300 ease-in-out 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    relative overflow-hidden cursor-pointer tracking-wide 
    shadow-[0_1px_3px_rgba(0,0,0,0.1)] 
    flex items-center justify-center
    active:transform active:translate-y-0
    before:content-[''] before:absolute before:top-1/2 before:left-1/2 
    before:w-[5px] before:h-[5px] before:bg-white before:bg-opacity-50 
    before:opacity-0 before:rounded-full before:transform before:scale-100 before:translate-x-[-50%] before:translate-y-[-50%]
    focus:not(:active):before:animate-[ripple_0.6s_ease-out]
  `;
  
  const variantClasses = {
    primary: `
      bg-blue-500 text-white border border-blue-500
      hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]
      focus:ring-blue-200
    `,
    secondary: `
      bg-gray-600 text-white border border-gray-600
      hover:bg-gray-700 hover:border-gray-700 hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(75,85,99,0.3)]
      focus:ring-gray-200
    `,
    outline: `
      bg-transparent text-blue-500 border border-blue-500
      hover:bg-blue-500 hover:bg-opacity-5 hover:border-blue-600 hover:text-blue-600 
      hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)]
      focus:ring-blue-200
    `,
    danger: `
      bg-red-500 text-white border border-red-500
      hover:bg-red-600 hover:border-red-600 hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]
      focus:ring-red-200
    `,
    success: `
      bg-emerald-500 text-white border border-emerald-500
      hover:bg-emerald-600 hover:border-emerald-600 hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]
      focus:ring-emerald-200
    `,
    white: `
      bg-white text-gray-800 border border-gray-200
      hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 
      hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
      focus:ring-gray-200
    `,
    ghost: `
      bg-transparent text-gray-600 border border-transparent
      hover:bg-black hover:bg-opacity-5 hover:text-gray-800
      focus:ring-gray-200
    `
  };
  
  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-5 py-2.5 text-[0.95rem]",
    large: "px-6 py-3 text-base"
  };
  
  const disabledClasses = "opacity-65 pointer-events-none cursor-not-allowed";
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    disabled ? disabledClasses : "",
    className
  ].join(" ").replace(/\s+/g, ' ').trim();
  
  return (
    <>
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.5;
          }
          100% {
            transform: scale(20, 20);
            opacity: 0;
          }
        }
      `}</style>
      <button 
        type={type}
        className={classes} 
        onClick={onClick}
        disabled={disabled}
      >
        {icon && iconPosition === "left" && (
          <span className="flex items-center justify-center mr-2">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {icon && iconPosition === "right" && (
          <span className="flex items-center justify-center ml-2">{icon}</span>
        )}
      </button>
    </>
  );
};

// Exportar el componente principal
export default Button;

// Exportar variantes predefinidas para facilitar su uso
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WhiteButton = (props) => <Button variant="white" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;