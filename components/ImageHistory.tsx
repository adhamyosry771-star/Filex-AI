
import React from 'react';
import { ImageItem } from '../types';

interface ImageHistoryProps {
  history: ImageItem[];
  onSelect: (item: ImageItem) => void;
}

const ImageHistory: React.FC<ImageHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-white/5"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">الأرشيف</h3>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 cursor-pointer border border-white/5 hover:border-indigo-500/50 transition-all"
          >
            <img 
              src={item.url} 
              alt={item.prompt} 
              className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageHistory;
