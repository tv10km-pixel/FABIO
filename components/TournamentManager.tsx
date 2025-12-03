
import React, { useState } from 'react';
import { TournamentMatch, Pair } from '../types';
import { Trophy, Save, RefreshCw, AlertCircle, Share2 } from 'lucide-react';

interface TournamentManagerProps {
  matches: TournamentMatch[];
  onGenerate: () => void;
  onUpdateScore: (matchId: string, s1: number, s2: number) => void;
  onShare: (match: TournamentMatch) => void;
  hasGroups: boolean;
}

const MatchCard: React.FC<{ 
  match: TournamentMatch; 
  onUpdateScore: (id: string, s1: number, s2: number) => void; 
  onShare: (match: TournamentMatch) => void;
}> = ({ match, onUpdateScore, onShare }) => {
  const [s1, setS1] = useState(match.score1?.toString() || '');
  const [s2, setS2] = useState(match.score2?.toString() || '');

  const handleSave = () => {
    const v1 = parseInt(s1);
    const v2 = parseInt(s2);
    if (!isNaN(v1) && !isNaN(v2)) {
      onUpdateScore(match.id, v1, v2);
    }
  };

  const isFinished = match.winner !== undefined;
  const isP1Winner = match.winner?.id === match.pair1?.id;
  const isP2Winner = match.winner?.id === match.pair2?.id;

  return (
    <div className={`relative flex flex-col bg-white border rounded-xl shadow-sm overflow-hidden min-w-[240px] w-full mb-4 transition-all ${
      isFinished ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'
    }`}>
      {/* Label */}
      <div className="bg-slate-50 border-b border-gray-100 px-3 py-1.5 flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{match.label}</span>
        <div className="flex items-center gap-2">
          {isFinished && (
            <button 
              onClick={() => onShare(match)}
              className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full p-1 transition-colors"
              title="Compartilhar"
            >
              <Share2 size={12} />
            </button>
          )}
          {isFinished && <Trophy size={12} className="text-amber-500" />}
        </div>
      </div>

      <div className="p-3 space-y-2">
        {/* Pair 1 */}
        <div className={`flex justify-between items-center p-2 rounded-lg border ${
          isP1Winner ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex flex-col mr-2 min-w-0 flex-1">
            {match.pair1 ? (
              <>
                <span className={`text-xs font-bold leading-tight break-words ${isP1Winner ? 'text-green-800' : 'text-gray-700'}`}>
                  {match.pair1.player1.name}
                </span>
                <span className={`text-[10px] leading-tight mt-0.5 break-words ${isP1Winner ? 'text-green-600' : 'text-gray-500'}`}>
                  {match.pair1.player2.name}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">A aguardar...</span>
            )}
          </div>
          <input
            type="number"
            value={s1}
            onChange={(e) => setS1(e.target.value)}
            disabled={!match.pair1 || !match.pair2}
            className={`w-10 h-8 text-center rounded border font-bold text-lg focus:ring-2 focus:ring-amber-500 focus:outline-none shrink-0 ${
              isP1Winner 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
            }`}
          />
        </div>

        {/* VS */}
        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-300 border border-gray-100 shadow-sm">
            VS
          </div>
        </div>

        {/* Pair 2 */}
        <div className={`flex justify-between items-center p-2 rounded-lg border ${
          isP2Winner ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex flex-col mr-2 min-w-0 flex-1">
            {match.pair2 ? (
              <>
                <span className={`text-xs font-bold leading-tight break-words ${isP2Winner ? 'text-green-800' : 'text-gray-700'}`}>
                  {match.pair2.player1.name}
                </span>
                <span className={`text-[10px] leading-tight mt-0.5 break-words ${isP2Winner ? 'text-green-600' : 'text-gray-500'}`}>
                  {match.pair2.player2.name}
                </span>
              </>
            ) : (
               <span className="text-xs text-gray-400 italic">A aguardar...</span>
            )}
          </div>
          <input
            type="number"
            value={s2}
            onChange={(e) => setS2(e.target.value)}
            disabled={!match.pair1 || !match.pair2}
            className={`w-10 h-8 text-center rounded border font-bold text-lg focus:ring-2 focus:ring-amber-500 focus:outline-none shrink-0 ${
              isP2Winner 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {match.pair1 && match.pair2 && (
        <button 
          onClick={handleSave}
          className="w-full py-2 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors border-t border-amber-100 flex items-center justify-center gap-1"
        >
          <Save size={14} /> Salvar Resultado
        </button>
      )}
    </div>
  );
};

export const TournamentManager: React.FC<TournamentManagerProps> = ({ 
  matches, 
  onGenerate, 
  onUpdateScore,
  onShare,
  hasGroups
}) => {
  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, TournamentMatch[]>);

  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);
  
  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return "Final";
    if (round === totalRounds - 1) return "Semifinais";
    if (round === totalRounds - 2) return "Quartas de Final";
    return `Rodada ${round}`;
  };

  const totalRounds = roundNumbers.length;

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Trophy size={48} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Torneio Mata-Mata</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          O torneio será gerado automaticamente com base nos 1º e 2º colocados dos grupos.
        </p>
        
        {hasGroups ? (
          <button
            onClick={onGenerate}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Gerar Chave do Torneio
          </button>
        ) : (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
            <AlertCircle size={18} />
            <span>Crie grupos e jogue as partidas primeiro.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-auto pb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="text-amber-500" />
          Chaveamento
        </h2>
        <button
          onClick={() => {
            if (window.confirm("Gerar uma nova chave apagará os resultados atuais do torneio. Continuar?")) {
              onGenerate();
            }
          }}
          className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
        >
          <RefreshCw size={12} /> Regenerar
        </button>
      </div>

      <div className="flex gap-8 min-w-max">
        {roundNumbers.map((round) => (
          <div key={round} className="w-64 flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center border-b pb-2">
              {getRoundName(round, totalRounds)}
            </h3>
            <div className="flex-1 flex flex-col justify-around gap-4">
              {rounds[round].map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  onUpdateScore={onUpdateScore}
                  onShare={onShare}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
