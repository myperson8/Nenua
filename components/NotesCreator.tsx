
import React, { useState } from 'react';
import { generateCornellNotes } from '../services/geminiService';
import { CornellNote } from '../types';

interface NotesCreatorProps {
  notes: CornellNote | null;
  onNotesGenerated: (notes: CornellNote) => void;
  isCompact?: boolean;
}

const NotesCreator: React.FC<NotesCreatorProps> = ({ notes, onNotesGenerated, isCompact = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateFromQuery = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const result = await generateCornellNotes(searchQuery);
      onNotesGenerated(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isCompact) {
    return (
      <div className="flex flex-col h-full gap-6">
        {/* Input System - Moved here from Weather */}
        <div className="space-y-4">
           <div className="relative">
             <textarea 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Paste lecture text or content for synthesis..." 
               className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl px-5 py-4 text-sm focus:outline-none min-h-[100px] resize-none pointer-events-auto"
               onClick={(e) => e.stopPropagation()}
             />
             <div className="absolute right-4 bottom-4 text-slate-500 pointer-events-none">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
             </div>
           </div>
           <div className="flex justify-center">
             <button 
               onClick={(e) => { e.stopPropagation(); handleGenerateFromQuery(); }}
               disabled={loading}
               className="action-button !px-10 !py-3 !text-sm pointer-events-auto active:scale-95"
             >
               {loading ? (
                 <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
               ) : (
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
               )}
               {loading ? 'Processing...' : 'Update & Generate Notes'}
             </button>
           </div>
        </div>

        {/* Note Structure Preview */}
        <div className="flex-1 space-y-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 mt-2">
           <div className="space-y-3">
             <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">CORNELL NOTES</div>
             <div className="text-xs text-slate-400 flex flex-wrap gap-2">
               <span className="text-emerald-400/80 font-bold">KEYWORDS:</span>
               {notes ? notes.cues.slice(0, 3).join(', ') : 'Topics detected will appear here...'}
             </div>
           </div>

           <div className="space-y-3 pt-4 border-t border-slate-800/50">
             <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">DETAILED NOTES:</div>
             <div className="h-px bg-slate-800/30 w-full border-dashed border-t"></div>
             <div className="h-px bg-slate-800/30 w-2/3 border-dashed border-t"></div>
           </div>

           <div className="pt-4 mt-auto">
             <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
               <span>SUMMARY GENERATION</span>
               <svg className="w-4 h-4 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </div>
           </div>
        </div>

        {/* Bottom Status Controls */}
        <div className="flex justify-end gap-3 text-slate-600 opacity-60">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-emerald-400 tracking-wide uppercase opacity-80 neon-glow-text">Study Lab: Synthesis Workspace</h2>
        {notes && (
          <button 
            onClick={() => onNotesGenerated(null as any)}
            className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            New Note
          </button>
        )}
      </div>

      <div className="flex-1 bg-white/5 border border-emerald-500/20 rounded-[1.5rem] lg:rounded-[2.5rem] p-6 lg:p-10 lg:overflow-y-auto custom-scrollbar flex flex-col gap-8 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
        {!notes ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 gap-4 lg:gap-6 py-10">
             <div className="w-16 h-16 lg:w-24 lg:h-24 border-2 border-dashed border-emerald-500/20 rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center text-3xl lg:text-4xl">📚</div>
             <div className="text-center space-y-1 lg:space-y-2">
               <p className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] lg:tracking-[0.4em]">Awaiting Synthesis</p>
               <p className="text-[8px] lg:text-[10px] max-w-[250px] leading-relaxed mx-auto">Input lecture transcripts or textbooks for AI-driven professional Cornell Notes.</p>
             </div>
          </div>
        ) : (
          <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="border-b border-emerald-500/20 pb-6 lg:pb-8">
              <p className="text-[10px] lg:text-[12px] font-black text-emerald-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] mb-2 lg:mb-3">Professional Synthesis</p>
              <h3 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-none neon-glow-text">{notes.title}</h3>
              <p className="text-sm lg:text-lg text-slate-400 italic mt-2 opacity-80">Subject: {notes.topic}</p>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
               <div className="lg:col-span-4 space-y-4">
                 <p className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full inline-block">Cues & Keywords</p>
                 <div className="flex flex-wrap gap-2 lg:gap-3">
                    {notes.cues.map((cue, i) => (
                      <span key={i} className="text-xs lg:text-sm font-bold text-emerald-300 bg-emerald-950/40 px-4 lg:px-5 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        {cue}
                      </span>
                    ))}
                 </div>
               </div>

               <div className="lg:col-span-8 space-y-4 lg:space-y-6">
                  <p className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full inline-block">Main Discussion Points</p>
                  <ul className="space-y-4 lg:space-y-6">
                    {notes.notes.map((note, i) => (
                      <li key={i} className="text-base lg:text-lg text-slate-200 font-light leading-relaxed border-l-4 border-emerald-500/30 pl-4 lg:pl-8 py-1 hover:border-emerald-500/60 transition-all">
                        {note}
                      </li>
                    ))}
                  </ul>
               </div>
            </div>

            <div className="pt-6 lg:pt-10 border-t border-emerald-500/20 bg-emerald-950/20 rounded-[1.5rem] lg:rounded-[2rem] p-6 lg:p-10 mt-6 lg:mt-10 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
               <p className="text-[9px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] lg:tracking-[0.4em] mb-3 lg:mb-4 neon-glow-text">Core Synthesis Summary</p>
               <p className="text-base lg:text-xl text-slate-200 font-light italic leading-relaxed opacity-90">{notes.summary}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 lg:gap-4 shrink-0 mt-auto">
         <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateFromQuery()}
              placeholder="Enter Lecture Content or Topic..."
              className="w-full bg-white/5 border border-emerald-500/20 rounded-full px-8 py-5 text-sm lg:text-base text-white outline-none focus:border-emerald-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            />
            <button 
              onClick={handleGenerateFromQuery}
              disabled={loading}
              className={`absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${loading ? 'animate-spin text-emerald-400' : 'text-slate-400 hover:text-emerald-400'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
         </div>
      </div>
    </div>
  );
};

export default NotesCreator;
