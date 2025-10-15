
import { GoogleGenAI, Modality } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // result is "data:mime/type;base64,..." - we only want the part after the comma
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

const PROMPT = `Given the first image is a childhood photo of the user and the second is a recent photo of the same person, generate an image that realistically depicts the younger and older versions warmly embracing or hugging each other in a natural, heartwarming scene. Maintain facial features, hairstyles, and relevant age differences. The setting should feel positive, with both versions of the person looking happy and comfortable.`;

export const generateHugImage = async (childhoodPhoto: File, recentPhoto: File): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const childhoodPhotoBase64 = await fileToBase64(childhoodPhoto);
    const recentPhotoBase64 = await fileToBase64(recentPhoto);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: childhoodPhotoBase64,
                            mimeType: childhoodPhoto.type,
                        },
                    },
                    {
                        inlineData: {
                            data: recentPhotoBase64,
                            mimeType: recentPhoto.type,
                        },
                    },
                    { text: PROMPT },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("No image was generated. The model may have refused the prompt.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate image. Please check the console for more details.");
    }
};
