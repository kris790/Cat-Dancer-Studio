import { GoogleGenAI } from "@google/genai";

// Helper to get the client with the current key
const getClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a paid API key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return !!process.env.API_KEY;
};

export const openApiKeySelector = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
};

export const generateCatImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  
  // Using gemini-2.5-flash-image as requested for speed/efficiency
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1", 
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  
  if (!part || !part.inlineData || !part.inlineData.data) {
    throw new Error("No image generated.");
  }

  return part.inlineData.data;
};

export const generateDancingVideo = async (imageBase64: string, prompt: string): Promise<string> => {
  const ai = getClient();

  // Using Veo fast for quick results
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: imageBase64,
      mimeType: 'image/png', 
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '1:1' // Matches our source image usually
    }
  });

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!videoUri) {
    throw new Error("Video generation failed: No URI returned.");
  }

  // Fetch the actual video bytes using the URI + API Key
  const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }
  
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};