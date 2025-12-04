
import React, { useEffect, useState, useMemo } from 'react';
import { Stage, TournamentMatch, Group, Pair } from '../types';
import { Trophy, X, Grid, GitMerge, Crown, Clock, Activity, ChevronRight, ChevronLeft } from 'lucide-react';

interface TVDashboardProps {
  stages: Stage[];
  onClose: () => void;
}

export const TVDashboard: React.FC<TVDashboardProps> = ({ stages, onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const CYCLE_DURATION = 15000; // 15 seconds per slide
  const UPDATE_INTERVAL = 100; // Update progress bar every 100ms

  // Filter valid stages (just in case)
  const validStages = useMemo(() => stages.filter(s => s.pairs.length > 0), [stages]);
  const currentStage = validStages[currentIndex];

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Rotation & Progress Bar
  useEffect(() => {
    if (validStages.length <= 1) return;

    setProgress(0);
    const startTime = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / CYCLE_DURATION) * 100, 100);
      setProgress(newProgress);
    }, UPDATE_INTERVAL);

    const slideTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validStages.length);
    }, CYCLE_DURATION);

    return () => {
      clearInterval(progressTimer);
      clearInterval(slideTimer);
    };
  }, [currentIndex, validStages.length]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Organize Tournament Data for Current Stage
  const tournamentRounds = useMemo(() => {
    if (!currentStage) return {};
    return currentStage.tournamentMatches.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, TournamentMatch[]>);
  }, [currentStage]);

  if (!currentStage) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0f172a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nenhuma etapa com dados para exibir.</h1>
          <button onClick={onClose} className="bg-white/10 px-6 py-2 rounded-lg hover:bg-white/20">Fechar</button>
        </div>
      </div>
    );
  }

  const sortedRounds = Object.keys(tournamentRounds).map(Number).sort((a, b) => a - b);
  const finalRound = sortedRounds.length > 0 ? sortedRounds[sortedRounds.length - 1] : null;
  const finalMatch = finalRound ? tournamentRounds[finalRound][0] : null;
  const champion = finalMatch?.winner;

  // Helper to calculate standings on the fly
  const getGroupStandings = (group: Group) => {
    const stats = new Map<string, { wins: number; balance: number; pair: Pair }>();
    
    group.pairs.forEach(p => {
      stats.set(p.id, { wins: 0, balance: 0, pair: p });
    });

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

    return Array.from(stats.values())
      .sort((a, b) => b.wins - a.wins || b.balance - a.balance);
  };

  const manualNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validStages.length);
  };

  const manualPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + validStages.length) % validStages.length);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#0f172a] text-white overflow-hidden flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Progress Bar (Only if multiple stages) */}
      {validStages.length > 1 && (
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-[60]">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <header className="relative z-50 px-8 py-5 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/5 shadow-lg">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-2xl shadow-lg shadow-orange-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Trophy className="text-white w-8 h-8 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-3">
               <h1 key={currentStage.id} className="text-4xl font-black tracking-tighter text-white uppercase italic animate-in slide-in-from-bottom-2 fade-in duration-500">
                 {currentStage.name}
               </h1>
               {validStages.length > 1 && (
                 <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-gray-400">
                   {currentIndex + 1}/{validStages.length}
                 </span>
               )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Resultados em Tempo Real</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
             <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider justify-end">
               <Clock size={14} /> Horário Local
             </div>
            <p className="text-4xl font-mono font-bold text-white tracking-widest">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all text-gray-300 hover:text-white hover:scale-110 active:scale-95"
          >
            <X size={28} />
          </button>
        </div>
      </header>

      {/* Navigation Controls (Hover to see) */}
      {validStages.length > 1 && (
        <>
          <button onClick={manualPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/20 text-white/20 hover:bg-black/40 hover:text-white hover:scale-110 transition-all">
            <ChevronLeft size={40} />
          </button>
          <button onClick={manualNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/20 text-white/20 hover:bg-black/40 hover:text-white hover:scale-110 transition-all">
            <ChevronRight size={40} />
          </button>
        </>
      )}

      {/* Main Content */}
      {/* key={currentStage.id} triggers a full re-render/animation when stage changes */}
      <main key={currentStage.id} className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* CHAMPION SPOTLIGHT - Only shows if there is a champion */}
        {champion && (
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-[2px] shadow-2xl shadow-orange-500/40 transform hover:scale-[1.01] transition-transform duration-500">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
               <div className="relative bg-black/40 backdrop-blur-xl rounded-[22px] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                  
                  {/* Left: Trophy & Label */}
                  <div className="flex items-center gap-6">
                    <div className="p-6 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full shadow-lg shadow-amber-500/50 animate-bounce-slow">
                      <Crown size={64} className="text-white fill-white" />
                    </div>
                    <div>
                      <h2 className="text-amber-300 font-bold uppercase tracking-[0.3em] text-lg mb-1 animate-pulse">Grande Campeão</h2>
                      <div className="text-5xl md:text-7xl font-black text-white italic tracking-tight drop-shadow-lg">
                        {champion.player1.name} <span className="text-amber-400">&</span> {champion.player2.name}
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  {finalMatch && (
                    <div className="bg-black/30 rounded-2xl px-8 py-4 border border-white/10">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center mb-2">Placar Final</div>
                      <div className="text-6xl font-mono font-bold text-white tracking-widest">
                         {finalMatch.score1} - {finalMatch.score2}
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-12 pb-20">
          
          {/* TOURNAMENT SECTION */}
          {sortedRounds.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <GitMerge className="text-indigo-400" /> Mata-Mata
                </h2>
              </div>
              
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x mask-fade-right">
                {sortedRounds.map((round, rIndex) => {
                   const isFinal = round === sortedRounds.length;
                   return (
                    <div key={round} className="min-w-[320px] md:min-w-[380px] flex-none snap-center flex flex-col gap-4 animate-in slide-in-from-right duration-700" style={{ animationDelay: `${rIndex * 100}ms` }}>
                      <h3 className={`text-center py-2 px-4 rounded-lg font-bold uppercase text-sm tracking-wider shadow-lg ${
                        isFinal ? 'bg-amber-500 text-black shadow-amber-500/20' : 'bg-white/10 text-gray-300'
                      }`}>
                        {isFinal ? '🏆 Grande Final' : 
                         round === sortedRounds.length - 1 ? 'Semifinais' : 
                         `Rodada ${round}`}
                      </h3>
                      
                      <div className="flex flex-col gap-4">
                        {tournamentRounds[round].map(match => (
                          <div key={match.id} className={`relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-300 hover:bg-white/10 ${
                            match.winner 
                              ? 'bg-white/10 border-white/20 shadow-lg' 
                              : 'bg-white/5 border-white/5'
                          }`}>
                            {match.winner && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/20 to-transparent rounded-bl-3xl"></div>}
                            
                            <div className="p-4">
                              <div className="flex justify-between items-center mb-4 opacity-50">
                                <span className="text-xs font-bold uppercase tracking-wider">{match.label}</span>
                                {match.winner && <CheckCircleIcon />}
                              </div>

                              {/* Team 1 */}
                              <div className={`flex justify-between items-center mb-3 ${
                                match.winner?.id === match.pair1?.id ? 'text-green-400' : 'text-gray-300'
                              }`}>
                                <span className={`text-lg md:text-xl font-bold truncate pr-4 ${match.winner?.id === match.pair1?.id ? 'opacity-100' : 'opacity-80'}`}>
                                  {match.pair1 ? `${match.pair1.player1.name}/${match.pair1.player2.name}` : 'A definir'}
                                </span>
                                <span className={`text-2xl font-mono font-bold ${match.winner?.id === match.pair1?.id ? 'text-white bg-green-600/20 px-2 rounded' : ''}`}>
                                  {match.score1 ?? '-'}
                                </span>
                              </div>

                              <div className="h-px bg-white/5 w-full my-2"></div>

                              {/* Team 2 */}
                              <div className={`flex justify-between items-center ${
                                match.winner?.id === match.pair2?.id ? 'text-green-400' : 'text-gray-300'
                              }`}>
                                <span className={`text-lg md:text-xl font-bold truncate pr-4 ${match.winner?.id === match.pair2?.id ? 'opacity-100' : 'opacity-80'}`}>
                                  {match.pair2 ? `${match.pair2.player1.name}/${match.pair2.player2.name}` : 'A definir'}
                                </span>
                                <span className={`text-2xl font-mono font-bold ${match.winner?.id === match.pair2?.id ? 'text-white bg-green-600/20 px-2 rounded' : ''}`}>
                                  {match.score2 ?? '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* GROUPS SECTION */}
          {currentStage.groups.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <Grid className="text-orange-400" /> Classificação dos Grupos
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentStage.groups.map((group, gIndex) => {
                  const standings = getGroupStandings(group);
                  
                  return (
                    <div key={group.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col hover:border-white/20 transition-colors animate-in slide-in-from-bottom duration-700" style={{ animationDelay: `${gIndex * 100}ms` }}>
                      <div className="bg-white/5 px-5 py-3 border-b border-white/5 flex justify-between items-center">
                        <span className="font-bold text-lg text-white">{group.name}</span>
                        <Activity size={16} className="text-orange-500" />
                      </div>
                      
                      <div className="p-0">
                        {/* Standings Table - Clean & Big */}
                        <table className="w-full">
                          <thead>
                              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                                <th className="text-left py-3 px-5 font-bold">Dupla</th>
                                <th className="text-center py-3 px-2 font-bold">V</th>
                                <th className="text-center py-3 px-2 font-bold">SG</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {standings.map((s, idx) => {
                              const isLeader = idx === 0;
                              const isQualified = idx < 2; // Assume top 2 qualify usually
                              return (
                                <tr key={idx} className={`${isLeader ? 'bg-gradient-to-r from-green-500/10 to-transparent' : ''}`}>
                                  <td className="py-3 px-5">
                                    <div className="flex items-center gap-3">
                                      <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${
                                        isLeader ? 'bg-amber-400 text-black' : 
                                        isQualified ? 'bg-white/20 text-white' : 'text-gray-500'
                                      }`}>
                                        {idx + 1}
                                      </span>
                                      <span className={`text-base font-bold truncate max-w-[180px] ${isQualified ? 'text-white' : 'text-gray-400'}`}>
                                        {s.pair.player1.name} / {s.pair.player2.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="text-center text-base font-bold text-white/90">{s.wins}</td>
                                  <td className={`text-center text-base font-bold ${s.balance > 0 ? 'text-green-400' : 'text-gray-500'}`}>{s.balance}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Latest Result (Footer) */}
                      {group.matches && group.matches.length > 0 && (
                        <div className="bg-black/20 p-3 text-xs text-gray-400 border-t border-white/5 flex justify-between items-center">
                          <span>Últimos Jogos</span>
                          <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded animate-pulse">Ao Vivo</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);
