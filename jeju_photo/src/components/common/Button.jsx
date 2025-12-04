const Button = ({
  children,
  onClick,
  disabled = false,
  primary = true,
  className = "",
  isLoading = false,
}) => {
  const classNames = `button ${
    primary ? "button-primary" : "button-secondary"
  } ${className}`;
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={classNames}
    >
      {children}
    </button>
  );
};

export default Button;

