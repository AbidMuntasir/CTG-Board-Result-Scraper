import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="relative flex space-x-3">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="w-3 h-10 bg-slate-300 rounded-full transform origin-center animate-[pulse_1s_ease-in-out_infinite]"
            style={{
              animationDelay: `${index * 0.2}s`,
              transform: `scaleY(${1 - index * 0.2})`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;