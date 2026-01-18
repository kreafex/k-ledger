import React from 'react';

export const Logo = ({ className = "h-10 w-10" }) => {
  return (
    <img 
      src="/K-ledger Logo.jpg" 
      alt="K-Ledger Logo" 
      className={`${className} object-contain`} 
    />
  );
};