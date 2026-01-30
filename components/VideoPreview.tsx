
import React, { useState, useEffect, useRef } from 'react';
import { ContentChunk } from '../types';
import { decodeAudio } from '../geminiService';

interface VideoPreviewProps {
  chunks: ContentChunk[];
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ chunks }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const startPlayback = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    setIsPlaying(true);
    playChunk(0);
  };

  const playChunk = async (index: number) => {
    if (index >= chunks.length || !isPlaying) {
      if (index >= chunks.length) setIsPlaying(false);
      return;
    }

    setCurrentIndex(index);
    const chunk = chunks[index];

    if (chunk.audioData && audioContextRef.current) {
      const buffer = await decodeAudio(chunk.audioData, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      activeSourceRef.current = source;
      
      source.onended = () => {
        if (isPlaying) playChunk(index + 1);
      };
      
      source.start();
    } else {
      // Fallback if no audio
      setTimeout(() => {
        if (isPlaying) playChunk(index + 1);
      }, 3000);
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
    }
  };

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video group shadow-2xl">
      {chunks[currentIndex]?.imageUrl ? (
        <img 
          src={chunks[currentIndex].imageUrl} 
          alt="Visual" 
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
        </div>
      )}

      {/* Subtitles */}
      <div className="absolute bottom-10 left-0 right-0 px-8 text-center">
        <p className="inline-block bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-white text-lg font-medium shadow-lg">
          {chunks[currentIndex]?.text}
        </p>
      </div>

      {/* Controls */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={isPlaying ? stopPlayback : startPlayback}
          className="w-16 h-16 rounded-full bg-white text-slate-900 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-blue-600 transition-all duration-300" 
           style={{ width: `${((currentIndex + 1) / chunks.length) * 100}%` }}></div>
    </div>
  );
};
