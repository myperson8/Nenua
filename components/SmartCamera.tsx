
import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { analyzeSmartCameraFrame } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface SmartCameraProps {
  isCompact?: boolean;
  onAnalysisDone?: (result: AnalysisResult) => void;
}

export interface SmartCameraHandle {
  capture: () => Promise<void>;
}

const SmartCamera = forwardRef<SmartCameraHandle, SmartCameraProps>(({ isCompact = false, onAnalysisDone }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Initialize camera stream
  const startCamera = async () => {
    setError(null);
    try {
      // Try back camera first (environment)
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
      } catch (err) {
        // Fallback to any available camera (usually user/front)
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
      }
      
      setStream(mediaStream);
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera permission denied. Check browser settings.");
      } else {
        setError("Could not access camera. Ensure it isn't being used by another app.");
      }
    }
  };

  // Attach stream to video element whenever stream or videoRef changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error);
      };
    }
  }, [stream, videoRef]);

  // Start on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current || !stream) {
      setError("Camera not ready.");
      return;
    }
    
    // Ensure video is playing and has data
    if (videoRef.current.readyState < 2) {
      setError("Waiting for video stream...");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Create high-res capture
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, width, height);
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeSmartCameraFrame(base64);
      setAnalysis(result);
      if (onAnalysisDone) onAnalysisDone(result);
    } catch (err: any) {
      setError(err.message?.includes('429') ? "Quota limit reached." : "Lens analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    capture
  }));

  if (isCompact) {
    return (
      <div className={`circular-preview relative group ${stream ? 'pulse-emerald' : ''}`}>
        <div className="absolute inset-0 bg-emerald-500/10 z-10 pointer-events-none group-hover:bg-transparent transition-colors"></div>
        
        {/* Always render video if we want to attach stream to it via Ref */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover grayscale opacity-60 ${!stream ? 'hidden' : 'block'}`} 
        />
        
        {!stream && (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-2 text-center">
             <button onClick={startCamera} className="text-[10px] font-black text-emerald-500 uppercase mb-2">Enable Lens</button>
             <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold text-white tracking-wide uppercase opacity-80">Nenua Smart Camera</h2>
        <button 
          onClick={() => { setAnalysis(null); setError(null); startCamera(); }}
          className="text-[10px] font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors"
        >
          Reset View
        </button>
      </div>
      
      <div className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full aspect-video max-w-[640px] overflow-hidden rounded-2xl shadow-2xl border-4 border-emerald-500/10 bg-black">
            <div className="absolute inset-0 z-10 border border-emerald-500/20 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 z-20"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 z-20"></div>
            <div className="scan-line"></div>
            
            <div className="absolute top-4 left-4 z-20 flex gap-2">
               <div className={`px-2 py-1 ${stream ? 'bg-emerald-500' : 'bg-red-500'} text-[8px] font-black text-black rounded tracking-widest animate-pulse`}>
                 {stream ? 'LIVE' : 'OFFLINE'}
               </div>
            </div>

            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/90 z-30">
                <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-xs font-bold text-red-400 mb-4">{error}</p>
                <button onClick={startCamera} className="action-button">Retry Access</button>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transition-opacity duration-500 ${!stream ? 'opacity-0' : 'opacity-100'}`} 
              />
            )}
            
            {!stream && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-700 rounded-full border-t-emerald-500 animate-spin"></div>
                <span className="text-[10px] uppercase font-black tracking-widest">Initialising Neural Link...</span>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-40">
                <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Decoding Vision</p>
              </div>
            )}
          </div>

          <button 
            onClick={capture}
            disabled={loading || !stream}
            className="action-button !text-sm !py-3 !px-12 active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            Capture & Decode
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {analysis && (
          <div className="bg-white/5 border border-emerald-500/20 rounded-3xl p-6 lg:p-8 space-y-6 animate-in slide-in-from-bottom-10">
             <div className="flex items-center gap-4 border-b border-emerald-500/10 pb-4">
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tighter">{analysis.title}</h3>
             </div>
             <p className="text-slate-300 text-sm leading-relaxed italic">"{analysis.explanation}"</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.keyPoints.map((pt, i) => (
                  <div key={i} className="bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-xl flex gap-3">
                    <span className="font-black text-emerald-500 text-xs">0{i+1}</span>
                    <p className="text-xs text-slate-400 leading-tight">{pt}</p>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default SmartCamera;
