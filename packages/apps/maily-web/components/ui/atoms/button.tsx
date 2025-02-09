import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
}

export const Button = ({ variant, className, ...props }: ButtonProps) => {
  // Optionally add a CSS class for the variant
  const variantClass = variant ? `btn-${variant}` : '';
  const combinedClassName = [className, variantClass].filter(Boolean).join(' ');
  return <button {...props} className={combinedClassName} />;
};

export default Button;
// export { Button }; 