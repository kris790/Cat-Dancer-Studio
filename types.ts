export enum AppStep {
  API_CHECK = 'API_CHECK',
  CREATE_ASSET = 'CREATE_ASSET',
  ANIMATE = 'ANIMATE',
  RESULT = 'RESULT',
}

export interface GeneratedImage {
  id: string;
  base64: string;
  mimeType: string;
}

export interface GenerationConfig {
  imagePrompt: string;
  videoPrompt: string;
}