
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, UserPlus, Trophy, Search, Save, X, Medal, Users, LayoutGrid, Layers, GitMerge, Calendar, ArrowLeft, AlertTriangle, Monitor } from 'lucide-react';
import { Category, Athlete, SubCategory, Pair, Group, Match, TournamentMatch, Stage } from './types';
import { AthleteCard } from './components/AthleteCard';
import { CategoryChart } from './components/CategoryChart';
import { PairingManager } from './components/PairingManager';
import { GroupManager } from './components/GroupManager';
import { TournamentManager } from './components/TournamentManager';
import { StageList } from './components/StageList';
import { SocialShareModal, ShareData } from './components/SocialShareModal';
import { TVDashboard } from './components/TVDashboard';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'athletes' | 'stages'>('stages');
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [stageView, setStageView] = useState<'pairs' | 'groups' | 'tournament'>('pairs');
  const [isTVMode, setIsTVMode] = useState(false);
  
  // Share State
  const [shareData, setShareData] = useState<ShareData | null>(null);

  // Athlete State
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const saved = localStorage.getItem('bt_athletes');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Stage State
  const [stages, setStages] = useState<Stage[]>(() => {
    const saved = localStorage.getItem('bt_stages');
    const parsedStages = saved ? JSON.parse(saved) : [];
    return parsedStages.map((s: any) => ({
      ...s,
      pairs: s.pairs || []
    }));
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('bt_athletes', JSON.stringify(athletes));
  }, [athletes]);

  useEffect(() => {
    localStorage.setItem('bt_stages', JSON.stringify(stages));
  }, [stages]);

  const currentStage = stages.find(s => s.id === activeStageId);

  // --- Reset Handler ---
  const handleResetSystem = useCallback(() => {
    setTimeout(() => {
      const confirmText = "⚠️ ZERAR SISTEMA ⚠️\n\nTem certeza que deseja apagar:\n- Todas as DUPLAS\n- Todas as ETAPAS\n- Todos os GRUPOS e JOGOS\n\n✅ O cadastro de atletas será MANTIDO.\n\nEssa ação é irreversível.";
      
      if (window.confirm(confirmText)) {
        localStorage.setItem('bt_stages', '[]');
        setStages([]);
        setActiveStageId(null);
        setActiveTab('stages');
      }
    }, 50);
  }, []);

  // --- Share Handler ---
  const handleShareGroupMatch = (groupName: string, match: Match) => {
    if (!currentStage) return;
    setShareData({
      stageName: currentStage.name,
      matchLabel: `${groupName} - ${match.label}`,
      pair1: match.pair1,
      pair2: match.pair2,
      score1: match.score1 ?? 0,
      score2: match.score2 ?? 0
    });
  };

  const handleShareTournamentMatch = (match: TournamentMatch) => {
    if (!currentStage || !match.pair1 || !match.pair2) return;
    setShareData({
      stageName: currentStage.name,
      matchLabel: `${match.label} - Mata-Mata`,
      pair1: match.pair1,
      pair2: match.pair2,
      score1: match.score1 ?? 0,
      score2: match.score2 ?? 0
    });
  };

  // --- Athlete Handlers ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedCategory || !selectedSubCategory) return;

    if (editingId) {
      setAthletes(prev => prev.map(a => 
        a.id === editingId 
          ? { ...a, name: name.trim(), category: selectedCategory, subCategory: selectedSubCategory } 
          : a
      ));
      setEditingId(null);
    } else {
      const newAthlete: Athlete = {
        id: crypto.randomUUID(),
        name: name.trim(),
        category: selectedCategory,
        subCategory: selectedSubCategory,
        createdAt: Date.now()
      };
      setAthletes(prev => [newAthlete, ...prev]);
    }

    setName('');
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const handleEdit = (athlete: Athlete) => {
    setName(athlete.name);
    setSelectedCategory(athlete.category);
    setSelectedSubCategory(athlete.subCategory || null);
    setEditingId(athlete.id);
    setActiveTab('athletes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setName('');
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setEditingId(null);
  };

  const handleDelete = useCallback((id: string) => {
    const inPair = stages.some(stage => 
      stage.pairs.some(p => p.player1.id === id || p.player2.id === id)
    );
    
    if (inPair) {
      alert("Este atleta está em uma dupla em uma etapa existente. Remova a dupla da etapa antes de excluir o atleta.");
      return;
    }

    setAthletes(prev => prev.filter(a => a.id !== id));
    if (editingId === id) {
      handleCancelEdit();
    }
  }, [editingId, stages]);

  // --- Stage Handlers ---
  const handleAddStage = (name: string) => {
    const newStage: Stage = {
      id: crypto.randomUUID(),
      name,
      pairs: [],
      groups: [],
      tournamentMatches: [],
      createdAt: Date.now(),
      status: 'OPEN'
    };
    setStages(prev => [newStage, ...prev]);
  };

  const handleDeleteStage = useCallback((stageId: string) => {
    setStages(prev => prev.filter(s => s.id !== stageId));
    if (activeStageId === stageId) {
      setActiveStageId(null);
    }
  }, [activeStageId]);

  const handleEditStage = (stageId: string, newName: string) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, name: newName } : s));
  };

  const updateCurrentStage = (updater: (stage: Stage) => Stage) => {
    if (!activeStageId) return;
    setStages(prev => prev.map(s => s.id === activeStageId ? updater(s) : s));
  };

  // --- Pair Handlers ---
  const handleAddPair = (p1: Athlete, p2: Athlete) => {
    updateCurrentStage(stage => {
      const newPair: Pair = {
        id: crypto.randomUUID(),
        player1: p1,
        player2: p2,
        createdAt: Date.now()
      };
      return { ...stage, pairs: [newPair, ...stage.pairs] };
    });
  };

  const handleDeletePair = (pairId: string) => {
    updateCurrentStage(stage => ({
      ...stage,
      pairs: stage.pairs.filter(p => p.id !== pairId),
    }));
  };

  // --- Group Handlers ---
  const handleAddGroup = (selectedPairs: Pair[]) => {
    updateCurrentStage(stage => {
      const groupNumber = stage.groups.length + 1;
      const newGroup: Group = {
        id: crypto.randomUUID(),
        name: `Grupo ${groupNumber}`,
        pairs: selectedPairs,
        createdAt: Date.now()
      };
      return { ...stage, groups: [newGroup, ...stage.groups] };
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    updateCurrentStage(stage => ({
      ...stage,
      groups: stage.groups.filter(g => g.id !== groupId),
      tournamentMatches: [] // Reset tournament
    }));
  };

  const handleGenerateMatches = (groupId: string) => {
    updateCurrentStage(stage => ({
      ...stage,
      groups: stage.groups.map(group => {
        if (group.id !== groupId) return group;
        const [p1, p2, p3] = group.pairs;
        if (!p1 || !p2 || !p3) return group;

        const matches: Match[] = [
          { id: crypto.randomUUID(), pair1: p1, pair2: p2, label: 'Jogo 1' },
          { id: crypto.randomUUID(), pair1: p2, pair2: p3, label: 'Jogo 2' },
          { id: crypto.randomUUID(), pair1: p1, pair2: p3, label: 'Jogo 3' },
        ];
        return { ...group, matches };
      })
    }));
  };

  const handleUpdateMatchScore = (groupId: string, matchId: string, score1: number, score2: number) => {
    updateCurrentStage(stage => ({
      ...stage,
      groups: stage.groups.map(group => {
        if (group.id !== groupId) return group;
        const updatedMatches = group.matches?.map(match => {
          if (match.id !== matchId) return match;
          return { ...match, score1, score2, isFinished: true };
        });
        return { ...group, matches: updatedMatches };
      })
    }));
  };

  // --- Tournament Handlers ---
  const handleGenerateTournament = () => {
    if (!currentStage) return;

    const firstPlacePairs: Pair[] = [];
    const secondPlacePairs: Pair[] = [];

    currentStage.groups.forEach(group => {
      if (!group.matches) return;

      const statsMap = new Map<string, { pair: Pair, wins: number, balance: number }>();
      group.pairs.forEach(p => statsMap.set(p.id, { pair: p, wins: 0, balance: 0 }));

      group.matches.forEach(m => {
        if (!m.isFinished || m.score1 === undefined || m.score2 === undefined) return;
        const p1 = statsMap.get(m.pair1.id);
        const p2 = statsMap.get(m.pair2.id);
        if (p1 && p2) {
          if (m.score1 > m.score2) p1.wins++;
          else if (m.score2 > m.score1) p2.wins++;
          p1.balance += (m.score1 - m.score2);
          p2.balance += (m.score2 - m.score1);
        }
      });

      const sorted = Array.from(statsMap.values()).sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.balance - a.balance;
      });

      if (sorted[0]) firstPlacePairs.push(sorted[0].pair);
      if (sorted[1]) secondPlacePairs.push(sorted[1].pair);
    });

    if (firstPlacePairs.length === 0) {
      alert("Não há jogos finalizados suficientes para gerar o torneio.");
      return;
    }

    const shuffledSeconds = [...secondPlacePairs].sort(() => Math.random() - 0.5);
    const newMatches: TournamentMatch[] = [];
    const round1MatchCount = Math.min(firstPlacePairs.length, shuffledSeconds.length);
    const round1Matches: TournamentMatch[] = [];

    for (let i = 0; i < round1MatchCount; i++) {
      round1Matches.push({
        id: crypto.randomUUID(),
        round: 1,
        label: '', 
        pair1: firstPlacePairs[i],
        pair2: shuffledSeconds[i],
      });
    }

    let currentRoundMatches = round1Matches;
    let roundNum = 1;
    let matchCounter = 1;

    currentRoundMatches.forEach((m) => {
       m.label = `J${matchCounter++} (R${roundNum})`;
       newMatches.push(m);
    });

    while (currentRoundMatches.length > 1) {
      const nextRoundMatches: TournamentMatch[] = [];
      const nextRoundNum = roundNum + 1;

      for (let i = 0; i < currentRoundMatches.length; i += 2) {
        const nextMatchId = crypto.randomUUID();
        const nextMatch: TournamentMatch = {
          id: nextMatchId,
          round: nextRoundNum,
          label: `J${matchCounter++} (R${nextRoundNum})`,
        };
        newMatches.push(nextMatch);
        nextRoundMatches.push(nextMatch);

        currentRoundMatches[i].nextMatchId = nextMatchId;
        currentRoundMatches[i].nextMatchSlot = 1;
        
        if (currentRoundMatches[i+1]) {
          currentRoundMatches[i+1].nextMatchId = nextMatchId;
          currentRoundMatches[i+1].nextMatchSlot = 2;
        }
      }
      currentRoundMatches = nextRoundMatches;
      roundNum++;
    }

    const totalRounds = roundNum;
    newMatches.forEach(m => {
       if (m.round === totalRounds) m.label = "Final";
       else if (m.round === totalRounds - 1) m.label = "Semifinal";
       else if (m.round === totalRounds - 2) m.label = "Quartas";
       else m.label = `Rodada ${m.round}`;
    });

    updateCurrentStage(stage => ({ ...stage, tournamentMatches: newMatches }));
  };

  const handleUpdateTournamentScore = (matchId: string, score1: number, score2: number) => {
    updateCurrentStage(stage => {
      const newMatches = [...stage.tournamentMatches];
      const matchIndex = newMatches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return stage;

      const match = { ...newMatches[matchIndex] };
      match.score1 = score1;
      match.score2 = score2;

      if (score1 > score2 && match.pair1) match.winner = match.pair1;
      else if (score2 > score1 && match.pair2) match.winner = match.pair2;
      else match.winner = undefined;

      newMatches[matchIndex] = match;

      if (match.winner && match.nextMatchId) {
        const nextMatchIndex = newMatches.findIndex(m => m.id === match.nextMatchId);
        if (nextMatchIndex !== -1) {
          const nextMatch = { ...newMatches[nextMatchIndex] };
          if (match.nextMatchSlot === 1) nextMatch.pair1 = match.winner;
          else nextMatch.pair2 = match.winner;
          newMatches[nextMatchIndex] = nextMatch;
        }
      }

      return { ...stage, tournamentMatches: newMatches };
    });
  };

  // --- Sorting ---
  const filteredAthletes = athletes
    .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const categoryOrder: Record<string, number> = {
        [Category.A]: 1, [Category.B]: 2, [Category.C]: 3,
        [Category.D]: 4, [Category.SUB15]: 5, [Category.PLUS40]: 6
      };
      const catDiff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
      if (catDiff !== 0) return catDiff;
      return a.name.localeCompare(b.name);
    });

  if (isTVMode) {
    // Pass ALL stages to TVDashboard, but only those with active pairs to avoid empty screens
    const activeStages = stages.filter(s => s.pairs.length > 0);
    return <TVDashboard stages={activeStages} onClose={() => setIsTVMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SocialShareModal data={shareData} onClose={() => setShareData(null)} />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg shadow-md">
              <Trophy className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 tracking-tight hidden sm:block">
              BT Arena
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <nav className="flex items-center p-1 bg-gray-100/80 rounded-lg overflow-x-auto scrollbar-hide">
              {!activeStageId ? (
                <>
                  <button
                    onClick={() => setActiveTab('athletes')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === 'athletes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LayoutGrid size={16} />
                    <span className="hidden sm:inline">Cadastro</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('stages')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === 'stages' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Calendar size={16} />
                    <span className="hidden sm:inline">Etapas</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                       setActiveStageId(null);
                       setActiveTab('stages');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 mr-2 border border-indigo-200"
                  >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Voltar</span>
                  </button>
                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                  
                  <button
                    onClick={() => setStageView('pairs')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                      stageView === 'pairs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users size={16} />
                    <span className="hidden sm:inline">Duplas</span>
                  </button>

                  <button
                    onClick={() => setStageView('groups')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                      stageView === 'groups' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Layers size={16} />
                    <span className="hidden sm:inline">Grupos</span>
                  </button>
                  <button
                    onClick={() => setStageView('tournament')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                      stageView === 'tournament' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <GitMerge size={16} />
                    <span className="hidden sm:inline">Mata-Mata</span>
                  </button>
                </>
              )}
            </nav>

            {/* TV Mode Button - Always available when there are stages */}
            {stages.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTVMode(true)}
                className="ml-2 p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                title="Abrir Painel de TV / Monitor (Todas Etapas)"
              >
                <Monitor size={20} />
              </button>
            )}

            <button
              type="button"
              onClick={handleResetSystem}
              className="ml-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Zerar Sistema (Manter Atletas)"
            >
              <AlertTriangle size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeStageId && currentStage ? (
          <>
            <div className="mb-6 flex flex-col">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Etapa Ativa</span>
              <h2 className="text-3xl font-extrabold text-gray-800">{currentStage.name}</h2>
            </div>

            {stageView === 'pairs' && (
              <PairingManager 
                athletes={athletes} 
                pairs={currentStage.pairs} 
                onAddPair={handleAddPair}
                onDeletePair={handleDeletePair}
              />
            )}

            {stageView === 'groups' && (
              <GroupManager
                pairs={currentStage.pairs}
                groups={currentStage.groups}
                onAddGroup={handleAddGroup}
                onDeleteGroup={handleDeleteGroup}
                onGenerateMatches={handleGenerateMatches}
                onUpdateScore={handleUpdateMatchScore}
                onShare={handleShareGroupMatch}
              />
            )}

            {stageView === 'tournament' && (
              <TournamentManager 
                matches={currentStage.tournamentMatches}
                onGenerate={handleGenerateTournament}
                onUpdateScore={handleUpdateTournamentScore}
                onShare={handleShareTournamentMatch}
                hasGroups={currentStage.groups.length > 0}
              />
            )}
          </>
        ) : (
          <>
            {activeTab === 'stages' && (
              <StageList 
                stages={stages}
                onAddStage={handleAddStage}
                onSelectStage={(id) => {
                  setActiveStageId(id);
                  setStageView('pairs');
                }}
                onDeleteStage={handleDeleteStage}
                onEditStage={handleEditStage}
              />
            )}

            {activeTab === 'athletes' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
                  <div className={`bg-white rounded-2xl shadow-sm border ${editingId ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'} p-6 transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <UserPlus className={`w-5 h-5 ${editingId ? 'text-blue-600' : 'text-teal-600'}`} />
                        <h2 className="text-lg font-bold text-gray-800">
                          {editingId ? 'Editar Atleta' : 'Novo Cadastro'}
                        </h2>
                      </div>
                      {editingId && (
                        <button onClick={handleCancelEdit} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                          <X size={14} /> Cancelar
                        </button>
                      )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Atleta</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: João Silva"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.values(Category).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-2 py-2 rounded-lg text-sm font-bold transition-all ${
                                selectedCategory === cat
                                  ? editingId 
                                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                    : 'bg-teal-600 text-white shadow-md transform scale-105'
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nível</label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedSubCategory(SubCategory.GOLD)}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg border transition-all ${
                              selectedSubCategory === SubCategory.GOLD
                                ? 'bg-yellow-50 border-yellow-400 text-yellow-800 ring-1 ring-yellow-400'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <Medal size={18} className={selectedSubCategory === SubCategory.GOLD ? 'fill-yellow-500 text-yellow-600' : 'text-gray-300'} />
                            <span className="font-bold">Ouro</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSubCategory(SubCategory.SILVER)}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg border transition-all ${
                              selectedSubCategory === SubCategory.SILVER
                                ? 'bg-slate-100 border-slate-400 text-slate-800 ring-1 ring-slate-400'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <Medal size={18} className={selectedSubCategory === SubCategory.SILVER ? 'fill-slate-400 text-slate-500' : 'text-gray-300'} />
                            <span className="font-bold">Prata</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!name || !selectedCategory || !selectedSubCategory}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                          !name || !selectedCategory || !selectedSubCategory
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : editingId
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                        } hover:shadow-xl active:scale-95`}
                      >
                        {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        <span>{editingId ? 'Salvar Alterações' : 'Cadastrar Atleta'}</span>
                      </button>
                    </form>
                  </div>
                  <div className="hidden lg:block">
                     <CategoryChart athletes={athletes} />
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="block lg:hidden">
                    <CategoryChart athletes={athletes} />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                     <h2 className="text-lg font-bold text-gray-800">Atletas ({athletes.length})</h2>
                     <div className="relative w-full sm:w-64">
                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                       <input 
                          type="text" 
                          placeholder="Buscar atleta..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                       />
                     </div>
                  </div>

                  {filteredAthletes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                      <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-8 h-8 text-orange-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Nenhum atleta encontrado</h3>
                      <p className="text-gray-500 mt-1">Cadastre o primeiro atleta para começar o jogo!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredAthletes.map((athlete, index) => (
                        <AthleteCard 
                          key={athlete.id} 
                          index={index + 1}
                          athlete={athlete}
                          previousAthlete={filteredAthletes[index - 1]}
                          onDelete={handleDelete}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
          <p className="mb-2 sm:mb-0">&copy; {new Date().getFullYear()} BT Arena. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-orange-400" />
            <span className="font-medium text-gray-500">Versão 1.3</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
