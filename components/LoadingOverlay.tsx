import React from 'react';

interface LoadingOverlayProps {
  message: string;
  subMessage?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message, subMessage }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono text-indigo-400">AI</span>
             </div>
           </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{message}</h3>
        {subMessage && (
          <p className="text-gray-400 text-sm animate-pulse">{subMessage}</p>
        )}
      </div>
    </div>
  );
};