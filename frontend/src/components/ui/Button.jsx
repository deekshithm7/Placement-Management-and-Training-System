import React from 'react';

const Button = ({ children, variant = 'primary', className, disabled, ...props }) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--primary-bg)]';
  const variants = {
    primary: 'bg-[var(--highlight)] text-[var(--primary-bg)] hover:bg-[var(--highlight)]/90 focus:ring-[var(--highlight)]',
    secondary: 'bg-[var(--secondary-bg)] text-[var(--text-primary)] hover:bg-[var(--secondary-bg)]/80 border border-[var(--text-secondary)] focus:ring-[var(--highlight)]',
    danger: 'bg-[var(--error)] text-[var(--primary-bg)] hover:bg-[var(--error)]/90 focus:ring-[var(--error)]',
  };
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);