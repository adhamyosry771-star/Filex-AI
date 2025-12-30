
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ImageDisplay from './components/ImageDisplay';
import { editImageWithGemini } from './services/geminiService';
import { ImageState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    original: null,
    secondary: null,
    result: null,
    isLoading: false,
    error: null,
  });

  const [prompt, setPrompt] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.isLoading) {
      setTimer(0);
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'secondary') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ 
          ...prev, 
          [type]: reader.result as string, 
          result: null,
          error: null 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!state.original) {
      setState(prev => ({ ...prev, error: "من فضلك ارفع الصورة الأساسية أولاً" }));
      return;
    }
    if (!prompt.trim()) {
      setState(prev => ({ ...prev, error: "أخبرنا ماذا تريد أن تفعل في الصورة؟" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await editImageWithGemini(state.original, state.secondary, prompt);
      setState(prev => ({ ...prev, result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: "حدث خطأ بسيط، دعنا نحاول مرة أخرى!" 
      }));
    }
  };

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            حول خيالك إلى <span className="text-indigo-600">حقيقة</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            ارفع صورتك وادمجها مع أي مشهد تريده باستخدام أقوى تقنيات العمل.
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200 p-8 md:p-10 mb-12 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Primary Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 text-right pr-2 uppercase">الصورة الأساسية (الخلفية)</label>
              <div className="relative group h-40">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'original')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`h-full border-2 border-dashed rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-3 ${state.original ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 group-hover:border-indigo-400 group-hover:bg-white'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${state.original ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm font-bold ${state.original ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {state.original ? 'تم اختيار الخلفية' : 'ارفع الصورة الأساسية'}
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 text-right pr-2 uppercase">صورتك الشخصية (للدمج)</label>
              <div className="relative group h-40">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'secondary')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`h-full border-2 border-dashed rounded-3xl p-6 transition-all flex flex-col items-center justify-center gap-3 ${state.secondary ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 group-hover:border-indigo-400 group-hover:bg-white'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${state.secondary ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className={`text-sm font-bold ${state.secondary ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {state.secondary ? 'تم اختيار صورتك الشخصية' : 'ارفع صورتك لإضافتها'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 text-right pr-2 uppercase tracking-wide">ما هو التعديل المطلوب؟</label>
              <textarea 
                placeholder={state.secondary ? "مثال: ضفني في الصورة بجانب الشخص الآخر، واجعل الإضاءة واقعية..." : "مثال: غير الخلفية لتبدو في الغابة، أو غير لون القميص..."}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all h-32 text-right font-medium"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {state.error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-right border border-red-100">
                {state.error}
              </div>
            )}

            <button 
              onClick={handleEdit}
              disabled={state.isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                state.isLoading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-200 active:scale-[0.98]'
              }`}
            >
              {state.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-indigo-600"></div>
                  <span>جاري المعالجة... ({timer}ث)</span>
                </>
              ) : (
                <span>بدء معالجة الصورة</span>
              )}
            </button>
          </div>
        </div>

        <ImageDisplay 
          original={state.original} 
          secondary={state.secondary}
          result={state.result} 
          isLoading={state.isLoading}
          timer={timer}
        />
      </main>
    </div>
  );
};

export default App;
