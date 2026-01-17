
import React, { useState, useEffect } from 'react';
import { Medication, HealthAdvice } from '../types';
import { getHealthAdvice } from '../services/geminiService';

interface HealthHubProps {
  isCompact?: boolean;
}

export default function HealthHub({ isCompact = false }: HealthHubProps) {
  const [meds, setMeds] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('nenua_meds');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Vitamin D', dosage: '1000 IU', time: '08:00', taken: false }
    ];
  });
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [mood, setMood] = useState<number | null>(() => {
    const saved = localStorage.getItem('nenua_mood');
    return saved !== null ? parseInt(saved, 10) : null;
  });
  const [symptoms, setSymptoms] = useState('');
  const [advice, setAdvice] = useState<HealthAdvice | null>(() => {
    const saved = localStorage.getItem('nenua_advice');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('nenua_meds', JSON.stringify(meds));
  }, [meds]);

  useEffect(() => {
    if (mood !== null) {
      localStorage.setItem('nenua_mood', mood.toString());
    }
  }, [mood]);

  useEffect(() => {
    if (advice) {
      localStorage.setItem('nenua_advice', JSON.stringify(advice));
    }
  }, [advice]);

  const moods = [
    { icon: '😊', label: 'Great' },
    { icon: '🙂', label: 'Good' },
    { icon: '😐', label: 'Okay' },
    { icon: '😔', label: 'Low' },
    { icon: '😫', label: 'Stressed' }
  ];

  const handleCheckSymptoms = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const res = await getHealthAdvice(symptoms);
      setAdvice(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addMed = () => {
    if (!newMedName || !newMedTime) return;
    const med: Medication = {
      id: Date.now().toString(),
      name: newMedName,
      dosage: 'Standard',
      time: newMedTime,
      taken: false
    };
    setMeds([...meds, med]);
    setNewMedName('');
    setNewMedTime('');
  };

  const removeMed = (id: string) => {
    setMeds(meds.filter(m => m.id !== id));
  };

  const renderFormattedAdvice = (text: string) => {
    return text.split('\n').map((para, i) => (
      <p key={i} className="mb-2 last:mb-0">
        {para.split(/(\*\*.*?\*\*)/g).map((part, j) => 
          part.startsWith('**') && part.endsWith('**') 
            ? <strong key={j} className="text-white">{part.slice(2, -2)}</strong> 
            : part
        )}
      </p>
    ));
  };

  if (isCompact) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Wellness Sync</span>
          <div className="flex gap-2">
            {moods.map((m, i) => (
              <button 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setMood(i); }}
                className={`text-xl transition-transform hover:scale-125 ${mood === i ? 'scale-125 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]' : 'grayscale opacity-50'}`}
              >
                {m.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {meds.slice(0, 2).map(med => (
            <div key={med.id} className={`p-3 rounded-xl border border-teal-500/20 bg-teal-500/5 flex items-center justify-between ${!med.taken ? 'vibrant-pulse' : ''}`}>
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-100 truncate">{med.name}</p>
                <p className="text-[10px] text-teal-400/80">{med.time}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setMeds(meds.map(m => m.id === med.id ? {...m, taken: !m.taken} : m)); }}
                className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${med.taken ? 'bg-teal-500 border-teal-500' : 'border-teal-500/40'}`}
              >
                {med.taken && <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-4 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Virtual Pillbox */}
        <div className="glass-card-health p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter teal-glow-text">Virtual Pillbox</h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{meds.length} Active</span>
          </div>
          
          <div className="space-y-4">
            {meds.map(med => (
              <div key={med.id} className={`p-5 rounded-2xl border transition-all ${med.taken ? 'bg-slate-800/20 border-slate-700/50 opacity-60' : 'bg-teal-500/5 border-teal-500/20 vibrant-pulse'}`}>
                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-100 truncate">{med.name}</h4>
                    <p className="text-sm text-teal-400">{med.time} • {med.dosage}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeMed(med.id)} className="p-2 text-slate-500 hover:text-red-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <button 
                      onClick={() => setMeds(meds.map(m => m.id === med.id ? {...m, taken: !m.taken} : m))}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${med.taken ? 'text-slate-400 border border-slate-700 hover:bg-slate-700/30' : 'bg-teal-500 text-slate-950 hover:bg-teal-400'}`}
                    >
                      {med.taken ? 'Reset' : 'Take'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="text" placeholder="Med Name" 
              value={newMedName} onChange={e => setNewMedName(e.target.value)}
              className="flex-1 bg-white/5 border border-teal-500/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400 h-11"
            />
            <div className="flex gap-2">
              <input 
                type="time" 
                value={newMedTime} onChange={e => setNewMedTime(e.target.value)}
                className="flex-1 sm:w-32 bg-white/5 border border-teal-500/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400 h-11"
              />
              <button onClick={addMed} className="action-button-teal px-6 rounded-xl font-bold h-11 transition-transform active:scale-95">+</button>
            </div>
          </div>
        </div>

        {/* Mood Tracker */}
        <div className="glass-card-health p-8 flex flex-col items-center justify-center gap-8 min-h-[300px]">
          <h3 className="text-lg font-black text-teal-400 uppercase tracking-[0.2em]">Daily Mood Sync</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {moods.map((m, i) => (
              <button 
                key={i} 
                onClick={() => setMood(i)}
                className={`flex flex-col items-center gap-3 transition-all hover:scale-110 ${mood === i ? 'scale-125' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}
              >
                <span className="text-5xl drop-shadow-lg">{m.icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${mood === i ? 'text-teal-400' : 'text-slate-500'}`}>{m.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center max-w-[280px] font-medium leading-relaxed">
            {mood !== null ? `Context: You are feeling "${moods[mood].label}".` : "Daily check-in required."}
          </p>
        </div>
      </div>

      {/* Symptom Checker AI */}
      <div className="glass-card-health p-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter teal-glow-text flex items-center gap-3">
              <span>🩺</span> Wellness Advisory AI
            </h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Describe any physical or mental discomfort for student-centric advice.</p>
            <textarea 
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="Ex: I feel exhausted and my lower back hurts..."
              className="w-full bg-white/5 border border-teal-500/20 rounded-2xl p-6 text-slate-200 outline-none focus:border-teal-400 min-h-[150px] text-base"
            />
            <button 
              onClick={handleCheckSymptoms}
              disabled={loading || !symptoms.trim()}
              className="action-button action-button-teal w-full py-4 text-base active:scale-[0.98]"
            >
              {loading ? 'Consulting Neural Base...' : 'Analyze Wellness'}
            </button>
          </div>

          <div className="flex-1">
            {advice ? (
              <div className="bg-teal-500/5 border border-teal-500/20 rounded-3xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-start gap-3">
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Assessment</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-teal-500/10 border-teal-500/50 text-teal-400">
                      {advice.triageLevel}
                    </span>
                 </div>
                 <div className="text-lg text-slate-100 font-medium italic leading-relaxed">
                    {renderFormattedAdvice(advice.advice)}
                 </div>
                 <div className="space-y-3">
                   {advice.tips.map((tip, i) => (
                     <div key={i} className="flex gap-3 items-start text-sm text-slate-300">
                        <span className="text-teal-400 shrink-0 mt-0.5">⚡</span>
                        <span>{tip}</span>
                     </div>
                   ))}
                 </div>
              </div>
            ) : (
              <div className="h-full min-h-[200px] border-2 border-dashed border-teal-500/10 rounded-3xl flex items-center justify-center text-slate-700 uppercase font-black tracking-widest">Awaiting Context</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
