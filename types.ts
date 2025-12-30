
export interface ImageState {
  original: string | null;      // الصورة الأساسية (أو صورة المجموعة)
  secondary: string | null;     // الصورة الإضافية (اختيارية - صورتك الشخصية للدمج)
  result: string | null;
  isLoading: boolean;
  error: string | null;
}
