import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GRADING_PROMPT } from '../constants';
import type { GradingResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const gradingSchema = {
  type: Type.OBJECT,
  properties: {
    positivePoints: {
      type: Type.ARRAY,
      description: "An array of strings praising correct work in Hebrew.",
      items: { type: Type.STRING },
    },
    areasForImprovement: {
      type: Type.ARRAY,
      description: "An array of strings with constructive feedback in Hebrew.",
      items: { type: Type.STRING },
    },
    recommendedGrade: {
      type: Type.INTEGER,
      description: "A holistic grade from 0-100, calculated by starting at 100 and deducting points for the errors listed in 'areasForImprovement'. The grade must be a fair reflection of the overall work, balancing positives and negatives.",
    },
  },
  required: ["positivePoints", "areasForImprovement", "recommendedGrade"],
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const gradeHomework = async (imageFile: File): Promise<GradingResponse> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [imagePart]
            },
            config: {
                systemInstruction: GRADING_PROMPT,
                responseMimeType: "application/json",
                responseSchema: gradingSchema,
            }
        });

        const text = response.text;
        const parsedJson = JSON.parse(text);

        // Basic validation
        if (
            typeof parsedJson.recommendedGrade !== 'number' ||
            !Array.isArray(parsedJson.positivePoints) ||
            !Array.isArray(parsedJson.areasForImprovement)
        ) {
            throw new Error('Invalid JSON structure from API.');
        }

        return parsedJson as GradingResponse;

    } catch (error) {
        console.error("Error grading homework:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to get a grade from the AI. Reason: ${error.message}`);
        }
        throw new Error("An unknown error occurred while grading.");
    }
};