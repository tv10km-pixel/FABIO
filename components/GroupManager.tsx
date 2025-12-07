
import React, { useState, useMemo } from 'react';
import { Pair, Group, Category, Match } from '../types';
import { Layers, Users, X, Search, Trash2, CheckCircle2, Swords, Save, Trophy, Share2, MapPin } from 'lucide-react';

interface GroupManagerProps {
  pairs: Pair[];
  groups: Group[];
  onAddGroup: (selectedPairs: Pair[]) => void;
  onDeleteGroup: (groupId: string) => void;
  onGenerateMatches: (groupId: string) => void;
  onUpdateScore: (groupId: string, matchId: string, score1: number, score2: number, court: string) => void;
  onShare: (groupName: string, match: Match) => void;
}

// Internal component for Match row to manage its own input state
const MatchRow: React.FC<{ 
  match: Match; 
  groupId: string;
  groupName: string;
  onUpdateScore: (groupId: string, matchId: string, s1: number, s2: number, court: string) => void;
  onShare: (groupName: string, match: Match) => void;
}> = ({ match, groupId, groupName, onUpdateScore, onShare }) => {
  const [s1, setS1] = useState(match.score1?.toString() || '');
  const [s2, setS2] = useState(match.score2?.toString() || '');
  const [court, setCourt] = useState(match.court || '');

  const handleSave = () => {
    const v1 = parseInt(s1);
    const v2 = parseInt(s2);
    if (!isNaN(v1) && !isNaN(v2)) {
      onUpdateScore(groupId, match.id, v1, v2, court);
    } else {
        // Allow saving just the court if scores are empty
        onUpdateScore(groupId, match.id, v1 || 0, v2 || 0, court);
    }
  };

  const isWin1 = (match.score1 ?? 0) > (match.score2 ?? 0) && match.isFinished;
  const isWin2 = (match.score2 ?? 0) > (match.score1 ?? 0) && match.isFinished;

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all overflow-hidden ${
      match.isFinished ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-indigo-300'
    }`}>
      
      {/* HEADER: Label | Court | Actions */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/80 border-b border-gray-100">
         {/* Label */}
         <span className="font-bold text-indigo-600 text-[10px] uppercase bg-white border border-indigo-100 px-2 py-1 rounded shadow-sm whitespace-nowrap min-w-[60px] text-center">
            {match.label}
         </span>
         
         {/* Court Input */}
         <div className="relative flex-1">
           <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
           <input 
              type="text" 
              value={court} 
              onChange={(e) => setCourt(e.target.value)}
              placeholder="Quadra..." 
              className="w-full bg-white border border-gray-200 text-xs rounded-md py-1.5 pl-7 pr-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-gray-700 h-8 placeholder-gray-400"
            />
         </div>

         {/* Actions */}
         <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={handleSave}
              className="h-8 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md flex items-center justify-center shadow-sm transition-colors gap-1.5"
              title="Salvar Resultado e Quadra"
            >
              <Save size={14} />
              <span className="text-[10px] font-bold uppercase hidden sm:inline">Salvar</span>
            </button>
            {match.isFinished && (
              <button 
                onClick={() => onShare(groupName, match)}
                className="h-8 w-8 text-pink-500 bg-white border border-pink-100 hover:bg-pink-50 rounded-md flex items-center justify-center transition-colors"
                title="Compartilhar"
              >
                <Share2 size={14} />
              </button>
            )}
         </div>
      </div>

      {/* BODY: Player 1 | Score | Player 2 */}
      <div className="p-3 flex items-center gap-3">
          {/* Player 1 */}
          <div className={`flex-1 text-right min-w-0 flex flex-col justify-center ${isWin1 ? 'text-green-700' : 'text-gray-700'}`}>
             <div className="font-bold text-xs sm:text-sm truncate leading-tight" title={match.pair1.player1.name}>{match.pair1.player1.name}</div>
             <div className="text-[10px] sm:text-xs text-gray-400 truncate leading-tight" title={match.pair1.player2.name}>{match.pair1.player2.name}</div>
          </div>

          {/* Score Inputs */}
          <div className="flex items-center gap-1.5 shrink-0">
             <input
                type="number"
                min="0"
                max="12"
                value={s1}
                onChange={(e) => setS1(e.target.value)}
                className={`w-10 h-10 text-center border rounded-lg font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors shadow-sm ${isWin1 ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              />
              <span className="text-gray-300 font-bold text-xs">X</span>
              <input
                type="number"
                min="0"
                max="12"
                value={s2}
                onChange={(e) => setS2(e.target.value)}
                className={`w-10 h-10 text-center border rounded-lg font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors shadow-sm ${isWin2 ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
              />
          </div>

          {/* Player 2 */}
          <div className={`flex-1 text-left min-w-0 flex flex-col justify-center ${isWin2 ? 'text-green-700' : 'text-gray-700'}`}>
             <div className="font-bold text-xs sm:text-sm truncate leading-tight" title={match.pair2.player1.name}>{match.pair2.player1.name}</div>
             <div className="text-[10px] sm:text-xs text-gray-400 truncate leading-tight" title={match.pair2.player2.name}>{match.pair2.player2.name}</div>
          </div>
      </div>
    </div>
  );
};

// Internal component for Standings Table
const StandingsTable: React.FC<{ group: Group }> = ({ group }) => {
  const stats = useMemo(() => {
    const map = new Map<string, {
      pair: Pair,
      wins: number,
      losses: number,
      gamesWon: number,
      gamesLost: number,
      balance: number,
      matchesPlayed: number
    }>();

    // Initialize map
    group.pairs.forEach(p => {
      map.set(p.id, { 
        pair: p, wins: 0, losses: 0, gamesWon: 0, gamesLost: 0, balance: 0, matchesPlayed: 0 
      });
    });

    if (group.matches) {
      group.matches.forEach(m => {
        if (!m.isFinished || m.score1 === undefined || m.score2 === undefined) return;
        
        const p1Stats = map.get(m.pair1.id);
        const p2Stats = map.get(m.pair2.id);

        if (p1Stats && p2Stats) {
          p1Stats.matchesPlayed++;
          p2Stats.matchesPlayed++;
          p1Stats.gamesWon += m.score1;
          p1Stats.gamesLost += m.score2;
          p2Stats.gamesWon += m.score2;
          p2Stats.gamesLost += m.score1;

          if (m.score1 > m.score2) {
            p1Stats.wins++;
            p2Stats.losses++;
          } else if (m.score2 > m.score1) {
            p2Stats.wins++;
            p1Stats.losses++;
          }
          
          p1Stats.balance = p1Stats.gamesWon - p1Stats.gamesLost;
          p2Stats.balance = p2Stats.gamesWon - p2Stats.gamesLost;
        }
      });
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.balance - a.balance;
    });
  }, [group]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px]">
          <tr>
            <th className="px-2 py-2">Pos</th>
            <th className="px-2 py-2">Dupla</th>
            <th className="px-2 py-2 text-center">J</th>
            <th className="px-2 py-2 text-center">V</th>
            <th className="px-2 py-2 text-center">SG</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {stats.map((stat, idx) => (
            <tr key={stat.pair.id} className={idx === 0 ? 'bg-amber-50/50' : ''}>
              <td className="px-2 py-2 font-medium text-gray-500">
                {idx === 0 && <Trophy size={12} className="inline mr-1 text-amber-500" />}
                {idx + 1}º
              </td>
              <td className="px-2 py-2 font-medium text-gray-800">
                <div className="truncate max-w-[120px] sm:max-w-[150px]">
                  {stat.pair.player1.name} / {stat.pair.player2.name}
                </div>
              </td>
              <td className="px-2 py-2 text-center text-gray-600">{stat.matchesPlayed}</td>
              <td className="px-2 py-2 text-center font-bold text-gray-800">{stat.wins}</td>
              <td className={`px-2 py-2 text-center font-bold ${stat.balance > 0 ? 'text-green-600' : stat.balance < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {stat.balance > 0 ? '+' : ''}{stat.balance}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const GroupManager: React.FC<GroupManagerProps> = ({ 
  pairs, 
  groups, 
  onAddGroup, 
  onDeleteGroup,
  onGenerateMatches,
  onUpdateScore,
  onShare
}) => {
  const [selectedPairIds, setSelectedPairIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate which pairs are already in a group
  const groupedPairIds = useMemo(() => {
    const ids = new Set<string>();
    groups.forEach(g => {
      g.pairs.forEach(p => ids.add(p.id));
    });
    return ids;
  }, [groups]);

  // Filter available pairs
  const availablePairs = useMemo(() => {
    return pairs.filter(p => 
      !groupedPairIds.has(p.id) &&
      (categoryFilter === 'ALL' || p.player1.category === categoryFilter || p.player2.category === categoryFilter) &&
      (p.player1.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.player2.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [pairs, groupedPairIds, categoryFilter, searchTerm]);

  const toggleSelection = (pairId: string) => {
    if (selectedPairIds.includes(pairId)) {
      setSelectedPairIds(prev => prev.filter(id => id !== pairId));
    } else {
      if (selectedPairIds.length < 3) {
        setSelectedPairIds(prev => [...prev, pairId]);
      }
    }
  };

  const handleCreateGroup = () => {
    if (selectedPairIds.length !== 3) return;
    
    const selectedPairsList = selectedPairIds
      .map(id => pairs.find(p => p.id === id))
      .filter((p): p is Pair => p !== undefined);
    
    if (selectedPairsList.length === 3) {
      onAddGroup(selectedPairsList);
      setSelectedPairIds([]);
    }
  };

  const getSelectedPair = (id: string) => pairs.find(p => p.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Selection Area */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Layers className="text-indigo-500" size={20} />
              Selecione as Duplas
            </h2>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="ALL">Todas</option>
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {availablePairs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">Nenhuma dupla disponível.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {availablePairs.map(pair => {
                const isSelected = selectedPairIds.includes(pair.id);
                return (
                  <button
                    key={pair.id}
                    onClick={() => toggleSelection(pair.id)}
                    disabled={selectedPairIds.length >= 3 && !isSelected}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                        : selectedPairIds.length >= 3
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100'
                          : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Users size={16} className="text-orange-600"/>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {pair.player1.name} <span className="text-gray-400">/</span> {pair.player2.name}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">
                            {pair.player1.category === pair.player2.category ? pair.player1.category : 'Mista'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Staging Area */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Novo Grupo (3 Duplas)</h3>
          
          <div className="space-y-3 mb-6">
            {[0, 1, 2].map((index) => {
              const pairId = selectedPairIds[index];
              const pair = pairId ? getSelectedPair(pairId) : null;
              
              return (
                <div key={index} className={`h-12 rounded-lg border-2 border-dashed flex items-center px-4 transition-all ${
                  pair ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 bg-gray-50'
                }`}>
                   {pair ? (
                     <div className="flex-1 flex items-center justify-between">
                       <span className="font-bold text-sm text-gray-800 truncate">
                         {pair.player1.name} / {pair.player2.name}
                       </span>
                       <button onClick={() => toggleSelection(pair.id)} className="text-red-400 hover:text-red-600 p-1">
                         <X size={16} />
                       </button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-gray-400 text-xs">
                       <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">{index + 1}</span>
                       Selecione a {index + 1}ª dupla
                     </div>
                   )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={selectedPairIds.length !== 3}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              selectedPairIds.length === 3 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-[1.02]' 
                : 'bg-gray-300 cursor-not-allowed shadow-none'
            }`}
          >
            <Layers size={18} />
            Criar Grupo
          </button>
        </div>
      </div>

      {/* Right Column: Groups & Matches */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Created Groups List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Painel de Jogos</h3>
          </div>
          
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Nenhum grupo formado ainda.
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.id} className="relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-800 text-sm">{group.name}</span>
                    <button 
                      onClick={() => onDeleteGroup(group.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Excluir grupo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    
                    {/* Standings Panel */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Trophy size={12} /> Classificação
                      </h4>
                      <StandingsTable group={group} />
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      {!group.matches ? (
                        <button
                          onClick={() => onGenerateMatches(group.id)}
                          className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 border border-indigo-100"
                        >
                          <Swords size={16} />
                          Gerar Partidas
                        </button>
                      ) : (
                        <div>
                           <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Swords size={12} /> Jogos
                              </h4>
                           </div>
                           <div className="space-y-2">
                             {group.matches.map(match => (
                               <MatchRow 
                                  key={match.id} 
                                  match={match} 
                                  groupId={group.id}
                                  groupName={group.name}
                                  onUpdateScore={onUpdateScore}
                                  onShare={onShare}
                               />
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
