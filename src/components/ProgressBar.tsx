import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ProgressBar: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div 
      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 
                  transform origin-left transition-transform duration-300
                  ${isAnimating ? 'scale-x-100' : 'scale-x-0'}`}
    />
  );
};

export default ProgressBar;
