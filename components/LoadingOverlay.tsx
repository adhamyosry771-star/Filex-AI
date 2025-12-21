
import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05070a]/95 backdrop-blur-sm transition-opacity duration-500">
      <div className="relative flex flex-col items-center">
        {/* Simple Ring Loader */}
        <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
        
        <div className="text-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-[0.4em] mb-2">جاري المعالجة</h2>
          <p className="text-[10px] text-slate-500 font-medium">نحول خيالك إلى حقيقة بدقة عالية</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
