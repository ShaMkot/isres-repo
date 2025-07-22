import React from 'react';
import clsx from 'clsx';

const Button = React.forwardRef(({ 
  children, 
  variant = 'solid', 
  className = '', 
  ...props 
}, ref) => {
  const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-300';
  const solid = 'bg-blue-600 text-white hover:bg-blue-700';
  const outline = 'border border-blue-600 text-blue-600 hover:bg-blue-50';

  return (
    <button
      ref={ref}
      className={clsx(
        base, 
        variant === 'solid' ? solid : outline, 
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;