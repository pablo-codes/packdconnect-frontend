import React from 'react';

interface TactileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TactileCard: React.FC<TactileCardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`tactile-card ${className}`} {...props}>
      {children}
    </div>
  );
};
