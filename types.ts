
export type Tone = 'professional' | 'casual' | 'witty' | 'enthusiastic' | 'informative';
export type Platform = 'linkedin' | 'twitter' | 'instagram' | 'tiktok';

export interface PostBrief {
  title: string;
  description: string;
  tone: Tone;
  platform: Platform;
  targetLength: 'short' | 'medium' | 'long';
}

export interface ContentChunk {
  text: string;
  visualPrompt: string;
  imageUrl?: string;
  audioData?: string; // base64
}

export interface GeneratedPost {
  id: string;
  brief: PostBrief;
  headline: string;
  caption: string;
  hashtags: string[];
  chunks: ContentChunk[];
  status: 'draft' | 'scheduled' | 'published';
  createdAt: number;
  estimatedCost: number;
}

export interface AppState {
  posts: GeneratedPost[];
  isGenerating: boolean;
  currentPost: GeneratedPost | null;
}

export type AppTab = 'dashboard' | 'create' | 'strategy' | 'settings';

export type GenPhase = 'idle' | 'storyboarding' | 'assets' | 'baking' | 'finalizing';
