import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-slow [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-slow [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-slow"></div>
    </div>
  );
};
