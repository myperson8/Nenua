
import React, { useState, useEffect, useMemo } from 'react';
import { fetchWeatherPrep } from '../services/geminiService';
import { WeatherInfo } from '../types';

interface WeatherDashboardProps {
  isCompact?: boolean;
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ isCompact = false }) => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const loadWeather = async (location: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherPrep(location);
      setWeather(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to sync atmospheric data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather(`${pos.coords.latitude}, ${pos.coords.longitude}`),
        () => loadWeather("New York")
      );
    } else {
      loadWeather("New York");
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) loadWeather(query);
  };

  const weatherType = useMemo(() => {
    if (!weather) return 'clear';
    const cond = weather.condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('shower') || cond.includes('storm')) return 'rain';
    if (cond.includes('cloud')) return 'cloudy';
    if (cond.includes('snow') || cond.includes('ice')) return 'snow';
    if (cond.includes('sun') || cond.includes('clear')) return 'sunny';
    return 'clear';
  }, [weather]);

  const getWeatherIcon = (condition: string = "") => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return '☀️';
    if (cond.includes('rain') || cond.includes('shower')) return '🌧️';
    if (cond.includes('cloud')) return '☁️';
    if (cond.includes('storm') || cond.includes('thunder')) return '⛈️';
    if (cond.includes('snow') || cond.includes('ice')) return '❄️';
    return '⛅';
  };

  if (isCompact) {
    return (
      <div className="flex flex-col gap-4">
        {weather ? (
          <div className="flex items-center gap-6">
            <div className="text-5xl shrink-0 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
               {getWeatherIcon(weather.condition)}
            </div>
            <div className="flex-1 space-y-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Nenua Roast</span>
                <span className="text-lg font-black text-white">{weather.temperature}</span>
              </div>
              <p className="text-sm text-slate-300 italic font-bold leading-tight neon-glow-text line-clamp-2">
                "{weather.advisory}"
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 py-4 opacity-20">
             <div className="w-12 h-12 bg-slate-800 rounded-2xl animate-pulse"></div>
             <div className="flex-1 space-y-2">
               <div className="h-3 w-20 bg-slate-800 rounded animate-pulse"></div>
               <div className="h-2 w-full bg-slate-800 rounded animate-pulse"></div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex items-center justify-center py-4 lg:py-10">
      <div className="w-full max-w-5xl glass-card-neon rounded-[3rem] p-8 lg:p-12 relative z-10 animate-in zoom-in-95 duration-700">
        <form onSubmit={handleSearch} className="relative mb-12">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4 transition-all focus-within:border-emerald-500/40 shadow-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Check a city for a fresh roast..."
              className="flex-1 bg-transparent text-lg text-white outline-none placeholder-slate-600 font-medium"
            />
            <button type="submit" disabled={loading} className="text-emerald-500 hover:text-emerald-400 p-2 disabled:opacity-50 transition-transform active:scale-90">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </form>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-8">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[12px] uppercase tracking-[0.5em] font-black text-emerald-500 animate-pulse">Syncing Intel</p>
          </div>
        ) : weather ? (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-110 transition-transform duration-500 cursor-default">
                {getWeatherIcon(weather.condition)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-8xl md:text-9xl font-black text-white leading-none tracking-tighter neon-glow-text mb-6">{weather.temperature}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                  <span className="text-2xl md:text-3xl font-black text-slate-300 uppercase tracking-widest">{weather.condition}</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-30"></div>
                  <span className="text-xl md:text-2xl font-bold text-slate-500 uppercase tracking-tighter">{weather.location}</span>
                </div>
              </div>
            </div>

            <div className="relative bg-emerald-500/10 rounded-[2.5rem] p-10 md:p-14 border border-emerald-500/30 text-center md:text-left overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="absolute -right-10 -top-10 text-9xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12">🔥</div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                <span className="text-2xl animate-bounce">🔥</span>
                <h4 className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.3em]">Nenua Advisory Roast</h4>
              </div>
              <p className="text-3xl md:text-5xl text-white font-black italic leading-[1.15] neon-glow-text relative z-10">
                "{weather.advisory}"
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default WeatherDashboard;
