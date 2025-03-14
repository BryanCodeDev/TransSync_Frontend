import React from 'react';
import "../styles/button.css";

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
  const baseClasses = "btn flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    danger: "btn-danger",
    success: "btn-success",
    white: "btn-white",
    ghost: "btn-ghost"
  };
  
  const sizeClasses = {
    small: "btn-sm",
    medium: "btn-md",
    large: "btn-lg"
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    disabled ? "btn-disabled" : "",
    className
  ].join(" ");
  
  return (
    <button 
      type={type}
      className={classes} 
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === "left" && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      
      <span>{children}</span>
      
      {icon && iconPosition === "right" && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </button>
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