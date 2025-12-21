
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const aspectRatio = getClosestAspectRatio(width, height);
  
  // تعليمات صارمة لضمان جودة استثنائية وتنفيذ دقيق
  const qualityInstruction = "CRITICAL: Generate a masterpiece. Ultra-high resolution 8k, photorealistic textures, professional cinematic lighting, extremely detailed, vibrant colors, sharp focus. Strictly follow the user's description with zero distortion.";
  
  const finalPrompt = base64Image 
    ? `PRECISION EDIT: Faithfully transform the uploaded image according to this exact request: "${userPrompt}". Maintain high fidelity. ${qualityInstruction}`
    : `PROFESSIONAL GENERATION: Create a detailed scene of "${userPrompt}". ${qualityInstruction}`;

  const contents: any = { 
    parts: [{ text: finalPrompt }] 
  };
  
  if (base64Image) {
    contents.parts.unshift({
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
    if (!candidate) throw new Error("لم يتم استلام رد من الخادم.");
    
    if (candidate.finishReason === 'SAFETY') {
      throw new Error("تم حظر الطلب لمخالفته معايير السلامة. جرب وصفاً فنياً.");
    }

    const parts = candidate.content?.parts;
    if (parts && parts.length > 0) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("تعذر توليد الصورة. حاول تبسيط الوصف.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
