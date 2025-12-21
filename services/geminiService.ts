
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getClosestAspectRatio = (width: number, height: number): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
  const ratio = width / height;
  const supportedRatios = [
    { name: "1:1", val: 1 / 1 },
    { name: "3:4", val: 3 / 4 },
    { name: "4:3", val: 4 / 3 },
    { name: "9:16", val: 9 / 16 },
    { name: "16:9", val: 16 / 9 },
  ];
  let closest = supportedRatios[0];
  let minDiff = Math.abs(ratio - closest.val);
  for (const r of supportedRatios) {
    const diff = Math.abs(ratio - r.val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = r;
    }
  }
  return closest.name as any;
};

export const generateProfessionalBackground = async (
  userPrompt: string,
  width: number,
  height: number,
  base64Image?: string
): Promise<string> => {
  // استخدام مفتاح البيئة المدمج تلقائياً
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const aspectRatio = getClosestAspectRatio(width, height);
  
  const qualityInstruction = "High resolution, professional quality, detailed, cinematic lighting.";
  
  const contents: any = { 
    parts: [{ text: `${userPrompt}. ${qualityInstruction}` }] 
  };
  
  if (base64Image) {
    contents.parts.push({
      inlineData: {
        mimeType: "image/png",
        data: base64Image.split(',')[1] || base64Image
      }
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("لم نتمكن من الحصول على رد من النظام.");

    const parts = candidate.content?.parts;
    if (parts && parts.length > 0) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("لم يتم العثور على بيانات الصورة في الرد.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("حدث خطأ أثناء الاتصال بالخادم. تأكد من اتصالك بالإنترنت.");
  }
};
