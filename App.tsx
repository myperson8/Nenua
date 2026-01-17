
import React, { useState, useRef, useEffect } from 'react';
import WeatherDashboard from './components/WeatherDashboard';
import SmartCamera, { SmartCameraHandle } from './components/SmartCamera';
import NotesCreator from './components/NotesCreator';
import HealthHub from './components/HealthHub';
import StudentChat from './components/StudentChat';
import { CornellNote, FocusedView, AppRoute } from './types';

const App: React.FC = () => {
  const [generatedNotes, setGeneratedNotes] = useState<CornellNote | null>(() => {
    const saved = localStorage.getItem('nenua_notes');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [path, setPath] = useState(window.location.pathname);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const cameraRef = useRef<SmartCameraHandle>(null);

  // Sync state with browser history
  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation Helper
  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Definitions & Redirect Logic
  const routeMap: Record<string, FocusedView> = {
    '/dashboard': 'DASHBOARD',
    '/chat': 'STUDENT_CHAT',
    '/notes': 'STUDY_LAB',
    '/camera': 'VISION',
    '/weather': 'WEATHER',
    '/wellness': 'HEALTH'
  };

  useEffect(() => {
    if (!routeMap[path]) {
      navigate('/dashboard');
    }
  }, [path]);

  const currentView: FocusedView = routeMap[path] || 'DASHBOARD';

  useEffect(() => {
    if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
      setApiKeyMissing(true);
    }
  }, []);

  useEffect(() => {
    if (generatedNotes) {
      localStorage.setItem('nenua_notes', JSON.stringify(generatedNotes));
    } else {
      localStorage.removeItem('nenua_notes');
    }
  }, [generatedNotes]);

  return (
    <div className="w-full min-h-screen flex flex-col p-4 md:p-8 xl:p-12 gap-8 max-w-[1920px] mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-center w-full px-2 md:px-4 gap-4 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
           <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-transform group-hover:scale-110">
             <span className="font-black text-slate-900 text-2xl">N</span>
           </div>
           <div>
             <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100 uppercase neon-glow-text leading-none">Nenua AI</h1>
             <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.2em] mt-1 hidden sm:block">Neural Student OS</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto justify-center sm:justify-end">
          {apiKeyMissing && (
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black tracking-widest text-red-400 uppercase items-gap-2 flex animate-pulse">
               API Key Missing
            </div>
          )}
          <button 
            onClick={() => navigate('/chat')}
            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border ${
              currentView === 'STUDENT_CHAT' ? 'bg-emerald-500 text-slate-900 border-emerald-500 shadow-lg' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
             Smart Chat
          </button>
          <button 
            onClick={() => navigate('/wellness')}
            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap border ${
              currentView === 'HEALTH' ? 'bg-teal-500 text-slate-900 border-teal-500 shadow-lg' : 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20'
            }`}
          >
             Wellness
          </button>
        </div>
      </header>

      <main className="flex-1 w-full h-auto">
        {currentView === 'DASHBOARD' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 md:gap-8 pb-10">
            <div className="md:col-span-1 xl:col-span-4 flex flex-col gap-6 md:gap-8 order-2 md:order-1">
              <div 
                onClick={() => navigate('/chat')}
                className="glass-card-neon p-6 md:p-8 flex flex-col gap-4 cursor-pointer hover:scale-[1.01] transition-transform min-h-[300px]"
              >
                <div className="glow-edge"></div>
                <StudentChat isCompact={true} />
              </div>

              <div 
                onClick={() => navigate('/weather')}
                className="glass-card-neon p-6 md:p-8 flex flex-col gap-4 cursor-pointer hover:scale-[1.01] transition-transform min-h-[150px]"
              >
                <div className="glow-edge"></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atmospheric Intel</h3>
                <div className="pointer-events-none">
                   <WeatherDashboard isCompact={true} />
                </div>
              </div>

              <div 
                onClick={() => navigate('/wellness')}
                className="glass-card-health p-6 md:p-8 flex flex-col gap-4 cursor-pointer hover:scale-[1.01] transition-transform min-h-[250px]"
              >
                <div className="glow-edge glow-edge-teal"></div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wellness Sync</h3>
                <div className="pointer-events-none">
                   <HealthHub isCompact={true} />
                </div>
              </div>
            </div>

            <div className="md:col-span-1 xl:col-span-8 flex flex-col gap-6 md:gap-8 order-1 md:order-2">
              <div 
                onClick={() => navigate('/notes')}
                className="glass-card-neon p-8 md:p-12 flex flex-col gap-8 cursor-pointer hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] transition-all min-h-[450px]"
              >
                <div className="glow-edge"></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synthesis Lab</h3>
                <div className="pointer-events-none flex-1">
                   <NotesCreator notes={generatedNotes} onNotesGenerated={setGeneratedNotes} isCompact={true} />
                </div>
              </div>

              <div 
                onClick={() => navigate('/camera')}
                className="glass-card-neon p-6 md:p-8 flex flex-col sm:flex-row gap-6 md:gap-8 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <div className="glow-edge"></div>
                <div className="flex-1 flex flex-col justify-center">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vision Portal</h3>
                   <p className="text-sm text-slate-400 max-w-lg leading-relaxed font-medium">Decode whiteboards or complex diagrams with neural optical analysis.</p>
                </div>
                <div className="w-full sm:w-48 xl:w-56 flex flex-col items-center justify-center bg-slate-900/40 rounded-3xl p-4 border border-white/5">
                   <SmartCamera isCompact={true} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-auto animate-in zoom-in-95 duration-500 pb-20">
             <div className={`w-full h-auto min-h-[70vh] p-6 md:p-12 flex flex-col rounded-[2.5rem] relative ${currentView === 'HEALTH' ? 'glass-card-health' : 'glass-card-neon'}`}>
                <div className={`glow-edge ${currentView === 'HEALTH' ? 'glow-edge-teal' : ''}`}></div>
                <div className="flex justify-between items-center mb-10">
                  <h2 className={`text-sm md:text-base font-black uppercase tracking-[0.3em] ${currentView === 'HEALTH' ? 'text-teal-400' : 'text-emerald-500'}`}>
                    {currentView.replace('_', ' ')} Portal
                  </h2>
                  <button onClick={() => navigate('/dashboard')} className="action-button !py-2 !px-6 text-[10px]">Close Portal</button>
                </div>
                <div className="w-full h-auto">
                  {currentView === 'WEATHER' && <WeatherDashboard />}
                  {currentView === 'VISION' && <SmartCamera ref={cameraRef} />}
                  {currentView === 'STUDY_LAB' && <NotesCreator notes={generatedNotes} onNotesGenerated={setGeneratedNotes} />}
                  {currentView === 'HEALTH' && <HealthHub />}
                  {currentView === 'STUDENT_CHAT' && <StudentChat />}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
