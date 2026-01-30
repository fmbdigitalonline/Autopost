
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PostBrief, GeneratedPost, ContentChunk } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Week 2: Asset Caching Implementation
const assetCache = new Map<string, string>();

export async function generateSocialContent(brief: PostBrief): Promise<Partial<GeneratedPost>> {
  // Week 1: Strict JSON Storyboarding Prompt
  const prompt = `
    You are a commercial director. Create a high-converting social media post and a ${brief.targetLength} video storyboard.
    Platform: ${brief.platform}
    Brief: ${brief.title} - ${brief.description}
    Tone: ${brief.tone}

    STRICT JSON OUTPUT REQUIRED:
    {
      "headline": "Short punchy title",
      "caption": "Platform optimized text",
      "hashtags": ["tag1", "tag2"],
      "storyboard": [
        {
          "text": "The narration script for this scene (max 12 words)",
          "visualPrompt": "Detailed cinematic description for an image generator"
        }
      ]
    }
    Produce exactly 4 storyboard scenes.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          caption: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          storyboard: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                visualPrompt: { type: Type.STRING }
              },
              required: ["text", "visualPrompt"]
            }
          }
        },
        required: ["headline", "caption", "hashtags", "storyboard"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return {
    headline: data.headline,
    caption: data.caption,
    hashtags: data.hashtags,
    chunks: data.storyboard
  };
}

export async function generateChunkVisual(prompt: string): Promise<string> {
  if (assetCache.has(prompt)) return assetCache.get(prompt)!;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `High quality commercial photography, 8k, professional lighting: ${prompt}` }]
    },
    config: {
      imageConfig: { aspectRatio: "16:9" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const b64 = `data:image/png;base64,${part.inlineData.data}`;
      assetCache.set(prompt, b64);
      return b64;
    }
  }
  throw new Error("No image generated");
}

export async function generateChunkAudio(text: string): Promise<string> {
  if (assetCache.has(text)) return assetCache.get(text)!;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  assetCache.set(text, base64Audio);
  return base64Audio;
}

export async function decodeAudio(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
