
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Stage, TournamentMatch, Group, Pair, Match } from '../types';
import { Trophy, X, Grid, GitMerge, Crown, Clock, Activity, ChevronRight, ChevronLeft, Plane, MapPin } from 'lucide-react';

interface TVDashboardProps {
  stages: Stage[];
  onClose: () => void;
}

// --- AIRPORT BOARD COMPONENT ---
const AirportBoardHeader = () => (
  <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-black border-b-2 border-gray-800 text-gray-500 font-mono text-xs md:text-sm uppercase tracking-[0.2em] sticky top-0 z-20">
    <div className="col-span-2 pl-2">Jogo</div>
    <div className="col-span-6">Duelo (Atletas)</div>
    <div className="col-span-2 text-center">Placar</div>
    <div className="col-span-2 text-right">Quadra</div>
  </div>
);

const AirportBoardRow: React.FC<{ 
  label: string; 
  status: 'SCHEDULED' | 'PLAYING' | 'FINISHED'; 
  p1Name: string; 
  p2Name: string; 
  score?: string; 
  court?: string;
  isHeader?: boolean;
}> = ({ label, status, p1Name, p2Name, score, court }) => {
  
  // Background logic based on status
  let rowBg = "bg-[#1a1a1a]"; // Dark gray/black
  
  if (status === 'PLAYING') {
    rowBg = "bg-[#222]";
  }

  return (
    <div className={`grid grid-cols-12 gap-2 px-6 py-4 border-b border-gray-800 items-center font-mono ${rowBg} hover:bg-[#2a2a2a] transition-colors`}>
      {/* MATCH LABEL */}
      <div className="col-span-2 text-white font-bold text-sm md:text-base truncate pl-2 border-l-2 border-transparent">
        <span className={status === 'PLAYING' ? 'text-green-400' : (status === 'FINISHED' ? 'text-amber-500' : 'text-gray-400')}>
            {label}
        </span>
      </div>

      {/* PLAYERS */}
      <div className="col-span-6 flex items-center gap-3 text-white truncate">
        <span className={`truncate w-[45%] text-right uppercase ${status === 'FINISHED' && score && parseInt(score.split('-')[0]) > parseInt(score.split('-')[1]) ? 'text-amber-400' : 'text-gray-300'}`}>
            {p1Name}
        </span>
        <span className="text-gray-600 text-xs font-bold">VS</span>
        <span className={`truncate w-[45%] text-left uppercase ${status === 'FINISHED' && score && parseInt(score.split('-')[1]) > parseInt(score.split('-')[0]) ? 'text-amber-400' : 'text-gray-300'}`}>
            {p2Name}
        </span>
      </div>

      {/* SCORE */}
      <div className="col-span-2 text-center">
         <span className={`text-xl md:text-2xl font-bold tracking-widest ${status === 'PLAYING' ? 'text-green-400 animate-pulse' : 'text-amber-500'}`}>
           {score || "00-00"}
         </span>
      </div>

      {/* COURT (GATE) */}
      <div className="col-span-2 flex justify-end">
        {court ? (
            <div className="bg-amber-500 text-black px-3 py-1 rounded-sm font-bold text-lg min-w-[3rem] text-center shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                {court}
            </div>
        ) : (
            <div className="text-gray-600 text-sm">--</div>
        )}
      </div>
    </div>
  );
};
// -------------------------------

export const TVDashboard: React.FC<TVDashboardProps> = ({ stages, onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants
  const SCROLL_SPEED = 25; // pixels per second
  const START_DELAY = 3000;
  const END_DELAY = 5000;
  const MIN_DURATION = 10000;

  const validStages = useMemo(() => stages.filter(s => s.pairs.length > 0), [stages]);
  const currentStage = validStages[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Scrolling Logic ---
  useEffect(() => {
    if (validStages.length === 0) return;

    setProgress(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;

    let animationFrameId: number;
    let startTime: number | null = null;
    let totalDuration = MIN_DURATION;
    let scrollDistance = 0;
    let scrollDuration = 0;

    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      scrollDistance = scrollHeight - clientHeight;
      if (scrollDistance > 0) {
        scrollDuration = (scrollDistance / SCROLL_SPEED) * 1000;
        totalDuration = START_DELAY + scrollDuration + END_DELAY;
      }
    }

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      if (containerRef.current && scrollDistance > 0) {
        if (elapsed > START_DELAY && elapsed < (START_DELAY + scrollDuration)) {
          const scrollProgress = (elapsed - START_DELAY) / scrollDuration;
          containerRef.current.scrollTop = scrollDistance * scrollProgress;
        } else if (elapsed >= (START_DELAY + scrollDuration)) {
          containerRef.current.scrollTop = scrollDistance;
        }
      }

      if (elapsed < totalDuration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        if (validStages.length > 1) {
           setCurrentIndex((prev) => (prev + 1) % validStages.length);
        } else {
           startTime = null; 
           containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
           animationFrameId = requestAnimationFrame(animate); 
        }
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentIndex, validStages.length]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const tournamentRounds = useMemo(() => {
    if (!currentStage) return {};
    return currentStage.tournamentMatches.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, TournamentMatch[]>);
  }, [currentStage]);

  if (!currentStage) return null;

  const sortedRounds = Object.keys(tournamentRounds).map(Number).sort((a, b) => a - b);
  const finalRound = sortedRounds.length > 0 ? sortedRounds[sortedRounds.length - 1] : null;
  const finalMatches = finalRound ? tournamentRounds[finalRound] : [];
  const grandFinalMatch = finalMatches.find(m => m.label.includes("Final"));
  const champion = grandFinalMatch?.winner;

  const getGroupStandings = (group: Group) => {
    const stats = new Map<string, { wins: number; balance: number; pair: Pair }>();
    group.pairs.forEach(p => stats.set(p.id, { wins: 0, balance: 0, pair: p }));
    group.matches?.forEach(m => {
      if (!m.isFinished || m.score1 === undefined || m.score2 === undefined) return;
      const p1 = stats.get(m.pair1.id);
      const p2 = stats.get(m.pair2.id);
      if (p1 && p2) {
        if (m.score1 > m.score2) p1.wins++;
        else if (m.score2 > m.score1) p2.wins++;
        p1.balance += (m.score1 - m.score2);
        p2.balance += (m.score2 - m.score1);
      }
    });
    return Array.from(stats.values()).sort((a, b) => b.wins - a.wins || b.balance - a.balance);
  };

  const manualNext = () => setCurrentIndex((prev) => (prev + 1) % validStages.length);
  const manualPrev = () => setCurrentIndex((prev) => (prev - 1 + validStages.length) % validStages.length);

  return (
    <div className="fixed inset-0 z-[200] bg-black text-white overflow-hidden flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-900 z-[60]">
        <div className="h-full bg-amber-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
      </div>

      {/* Header - Airport Style */}
      <header className="relative z-50 px-8 py-6 flex justify-between items-center bg-[#111] border-b border-gray-800 shadow-xl shrink-0">
        <div className="flex items-center gap-6">
           <img src="https://i.imgur.com/n60mKq5.png" alt="Tv Neblina" className="h-16 object-contain bg-white rounded-lg px-2" />
           <div>
             <h1 className="text-4xl font-black tracking-tighter text-white uppercase font-mono">
               {currentStage.name}
             </h1>
             <div className="flex items-center gap-4 mt-1">
                <span className="text-amber-500 font-bold font-mono tracking-widest text-sm uppercase">Painel de Jogos</span>
                {validStages.length > 1 && (
                  <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-400">
                    ETAPA {currentIndex + 1}/{validStages.length}
                  </span>
                )}
             </div>
           </div>
        </div>
        
        <div className="text-right">
           <div className="flex items-center gap-2 text-gray-500 text-xs font-mono uppercase tracking-widest justify-end mb-1">
             <Clock size={12} /> Horário Local
           </div>
           <p className="text-5xl font-mono font-bold text-amber-500 tracking-widest">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </p>
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-700 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </header>

      {/* Controls */}
      {validStages.length > 1 && (
        <>
          <button onClick={manualPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 text-white/20 hover:bg-white/10 hover:text-white transition-all"><ChevronLeft size={40} /></button>
          <button onClick={manualNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 text-white/20 hover:bg-white/10 hover:text-white transition-all"><ChevronRight size={40} /></button>
        </>
      )}

      {/* Main Board */}
      <main 
        ref={containerRef}
        key={currentStage.id} 
        className="flex-1 overflow-y-auto scrollbar-hide relative z-10 bg-black pb-20"
      >
        
        {/* CHAMPION BANNER */}
        {champion && grandFinalMatch && (
          <div className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 text-black p-8 flex items-center justify-center gap-8 mb-8 shadow-lg shadow-amber-900/40">
              <Crown size={64} className="animate-bounce" />
              <div className="text-center">
                 <h2 className="text-xl font-bold uppercase tracking-[0.5em] mb-2">Grande Campeão</h2>
                 <div className="text-6xl font-black italic font-mono uppercase">
                    {champion.player1.name} & {champion.player2.name}
                 </div>
              </div>
              <Trophy size={64} />
          </div>
        )}

        <div className="container mx-auto max-w-7xl px-4 py-8 space-y-12">

          {/* SECTION: TOURNAMENT (MATA-MATA) */}
          {sortedRounds.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4 pl-2 border-l-4 border-indigo-500">
                <h2 className="text-2xl font-bold text-indigo-400 uppercase tracking-widest font-mono">
                  Jogos Eliminatórios
                </h2>
              </div>
              
              <div className="border-t-4 border-indigo-500 rounded-sm overflow-hidden shadow-2xl bg-[#111]">
                 <AirportBoardHeader />
                 
                 {/* FLIGHT ROWS */}
                 {sortedRounds.map(round => {
                   // Sort matches: Finals on top
                   const matchesInRound = [...tournamentRounds[round]].sort((a, b) => {
                       if (a.label.includes("Final") && !b.label.includes("Final")) return -1;
                       if (b.label.includes("Final") && !a.label.includes("Final")) return 1;
                       return 0;
                   });

                   return matchesInRound.map(match => {
                     let status: 'SCHEDULED' | 'PLAYING' | 'FINISHED' = 'SCHEDULED';
                     if (match.winner) status = 'FINISHED';
                     else if (match.court) status = 'PLAYING';

                     return (
                       <AirportBoardRow 
                          key={match.id}
                          label={match.label}
                          status={status}
                          p1Name={match.pair1 ? `${match.pair1.player1.name}/${match.pair1.player2.name}` : 'A Definir'}
                          p2Name={match.pair2 ? `${match.pair2.player1.name}/${match.pair2.player2.name}` : 'A Definir'}
                          score={match.score1 !== undefined && match.score2 !== undefined ? `${match.score1}-${match.score2}` : undefined}
                          court={match.court}
                       />
                     );
                   });
                 })}
              </div>
            </section>
          )}

          {/* SECTION: GROUPS */}
          {currentStage.groups.length > 0 && (
             <section>
               <div className="flex items-center gap-3 mb-6 pl-2 border-l-4 border-amber-500">
                <h2 className="text-2xl font-bold text-amber-500 uppercase tracking-widest font-mono">
                  Fase de Grupos
                </h2>
              </div>

              {/* Group Grid - Keep standings as grid but darken them */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                 {currentStage.groups.map(group => {
                    const standings = getGroupStandings(group);
                    return (
                      <div key={group.id} className="bg-[#111] border border-gray-800 p-4 rounded-sm">
                         <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                            <span className="font-mono text-amber-500 font-bold text-lg">{group.name}</span>
                            <Activity size={16} className="text-gray-600"/>
                         </div>
                         <table className="w-full text-sm font-mono text-gray-300">
                           <thead>
                             <tr className="text-gray-600 uppercase text-xs">
                               <th className="text-left pb-2">Dupla</th>
                               <th className="text-center pb-2">V</th>
                               <th className="text-center pb-2">SG</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-800">
                             {standings.map((s, idx) => (
                               <tr key={s.pair.id}>
                                 <td className="py-1.5 truncate max-w-[150px]">
                                   {idx+1}. <span className={idx < 2 ? 'text-white font-bold' : 'text-gray-500'}>{s.pair.player1.name}/{s.pair.player2.name}</span>
                                 </td>
                                 <td className="text-center">{s.wins}</td>
                                 <td className="text-center">{s.balance}</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                      </div>
                    )
                 })}
              </div>

              {/* GROUP MATCHES - AIRPORT STYLE */}
              <div className="border-t-4 border-amber-500 rounded-sm overflow-hidden shadow-2xl bg-[#111]">
                 <AirportBoardHeader />
                 
                 {currentStage.groups.flatMap(g => g.matches || []).map(match => {
                    let status: 'SCHEDULED' | 'PLAYING' | 'FINISHED' = 'SCHEDULED';
                    if (match.isFinished) status = 'FINISHED';
                    else if (match.court) status = 'PLAYING';
                    
                    // Only show matches that have a court assigned or are finished to reduce clutter? 
                    // Or show all. Let's show all for "Airport" completeness.
                    
                    return (
                       <AirportBoardRow 
                          key={match.id}
                          label={`${match.label} (${currentStage.groups.find(g => g.matches?.includes(match))?.name})`}
                          status={status}
                          p1Name={`${match.pair1.player1.name}/${match.pair1.player2.name}`}
                          p2Name={`${match.pair2.player1.name}/${match.pair2.player2.name}`}
                          score={match.score1 !== undefined && match.score2 !== undefined ? `${match.score1}-${match.score2}` : undefined}
                          court={match.court}
                       />
                    )
                 })}
              </div>
             </section>
          )}

        </div>
      </main>
    </div>
  );
};
