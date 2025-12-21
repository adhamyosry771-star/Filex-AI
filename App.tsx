
import React, { useState, useRef, useEffect } from 'react';
import { AppStatus, ImageItem } from './types';
import { generateProfessionalBackground } from './services/geminiService';
import LoadingOverlay from './components/LoadingOverlay';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [prompt, setPrompt] = useState('');
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1920);
  const [currentImage, setCurrentImage] = useState<ImageItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadedImage) return;
    
    setCurrentImage(null);
    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const resultUrl = await generateProfessionalBackground(prompt, width, height, uploadedImage || undefined);
      const newItem: ImageItem = {
        id: crypto.randomUUID(),
        url: resultUrl,
        prompt: prompt || "توليد احترافي",
        timestamp: Date.now(),
        type: uploadedImage ? 'edit' : 'generation'
      };
      setCurrentImage(newItem);
      setPrompt('');
      setUploadedImage(null);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setStatus(AppStatus.IDLE);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 selection:bg-indigo-500/30">
      {status === AppStatus.PROCESSING && <LoadingOverlay />}

      {/* Header */}
      <nav className="w-full h-14 px-6 flex justify-between items-center border-b border-white/5 bg-[#020408]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-black text-base tracking-tighter uppercase">FILEX <span className="text-indigo-500">AI</span></span>
        </div>
        <button 
          onClick={() => { setPrompt(''); setUploadedImage(null); setCurrentImage(null); setError(null); }}
          className="text-[9px] font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
        >
          إعادة تعيين
        </button>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 lg:p-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="glass-panel p-5 rounded-[1.5rem] border-white/5">
              <div className="flex items-center gap-2 mb-6 text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                <h3 className="text-[10px] font-black uppercase tracking-widest">الأبعاد</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase px-1">العرض</label>
                  <input 
                    type="number" 
                    value={width} 
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full bg-slate-900/30 border border-white/5 rounded-xl px-3 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase px-1">الارتفاع</label>
                  <input 
                    type="number" 
                    value={height} 
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-slate-900/30 border border-white/5 rounded-xl px-3 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-2">
                {[
                  { label: '1:1', w: 1080, h: 1080 },
                  { label: '9:16', w: 1080, h: 1920 },
                  { label: '16:9', w: 1920, h: 1080 },
                  { label: '4:5', w: 1080, h: 1350 }
                ].map(p => (
                  <button 
                    key={p.label}
                    onClick={() => { setWidth(p.w); setHeight(p.h); }}
                    className={`py-2 rounded-lg text-[9px] font-black border transition-all ${width === p.w && height === p.h ? 'bg-white text-black border-white' : 'bg-transparent border-white/5 text-slate-500 hover:border-white/10'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400 text-[9px] font-bold text-center">
                {error}
              </div>
            )}
          </aside>

          {/* Canvas Area */}
          <section className="lg:col-span-9 flex flex-col items-center justify-start">
            {!currentImage ? (
              <div className="w-full aspect-[16/9] rounded-[2rem] border border-white/5 bg-slate-900/10 flex flex-col items-center justify-center text-slate-800 gap-3">
                <svg className="w-12 h-12 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">بانتظار المدخلات</p>
              </div>
            ) : (
              <div className="relative group w-fit mx-auto rounded-[2rem] overflow-hidden bg-transparent border border-white/10 shadow-2xl max-h-[65vh]">
                 <div className="flex justify-center items-center">
                    <img 
                      src={currentImage.url} 
                      alt="Result" 
                      className="w-auto h-auto max-h-[65vh] block object-contain transition-transform duration-1000 group-hover:scale-[1.01]" 
                    />
                 </div>
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = currentImage.url;
                        a.download = `filex-${Date.now()}.png`;
                        a.click();
                      }}
                      className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] active:scale-95 shadow-2xl"
                    >
                      تحميل الصورة
                    </button>
                 </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Floating Prompt Bar */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-50 flex justify-center items-end">
        <div className="w-full max-w-3xl bg-[#0d1117]/90 backdrop-blur-lg rounded-[1.8rem] p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 flex items-end gap-2 transition-all duration-300">
          
          <div className="pb-0.5 pl-1">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-10 h-10 rounded-[1.2rem] flex items-center justify-center transition-all ${uploadedImage ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900/50 hover:bg-slate-800 text-slate-500'}`}
            >
              {uploadedImage ? (
                <img src={uploadedImage} className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              )}
            </button>
          </div>

          <div className="flex-1 min-h-[40px] flex items-center">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب وصف الصورة هنا..."
              rows={1}
              className="w-full bg-transparent border-none ring-0 focus:ring-0 text-white placeholder-slate-700 py-2.5 resize-none text-xs font-bold text-right outline-none hide-scrollbar max-h-32 overflow-y-auto"
              style={{ boxShadow: 'none' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            />
          </div>

          <div className="pb-0.5 pr-0.5">
            <button
              onClick={handleGenerate}
              disabled={status === AppStatus.PROCESSING || (!prompt.trim() && !uploadedImage)}
              className="h-10 px-6 rounded-[1.2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] transition-all disabled:opacity-20 active:scale-95 shadow-lg shadow-indigo-600/20 whitespace-nowrap"
            >
              {status === AppStatus.PROCESSING ? 'جاري...' : 'توليد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
