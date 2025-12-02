import React, { useState, useMemo } from 'react';
import { Athlete, Pair, Category, SubCategory } from '../types';
import { UserPlus, Users, X, Trophy, Search, Trash2, CheckCircle2 } from 'lucide-react';

interface PairingManagerProps {
  athletes: Athlete[];
  pairs: Pair[];
  onAddPair: (p1: Athlete, p2: Athlete) => void;
  onDeletePair: (pairId: string) => void;
}

export const PairingManager: React.FC<PairingManagerProps> = ({ 
  athletes, 
  pairs, 
  onAddPair, 
  onDeletePair 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate which athletes are already in a pair
  const pairedAthleteIds = useMemo(() => {
    const ids = new Set<string>();
    pairs.forEach(p => {
      ids.add(p.player1.id);
      ids.add(p.player2.id);
    });
    return ids;
  }, [pairs]);

  // Filter available athletes
  const availableAthletes = useMemo(() => {
    return athletes.filter(a => 
      !pairedAthleteIds.has(a.id) &&
      (categoryFilter === 'ALL' || a.category === categoryFilter) &&
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [athletes, pairedAthleteIds, categoryFilter, searchTerm]);

  const toggleSelection = (athleteId: string) => {
    if (selectedIds.includes(athleteId)) {
      setSelectedIds(prev => prev.filter(id => id !== athleteId));
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds(prev => [...prev, athleteId]);
      }
    }
  };

  const handleCreatePair = () => {
    if (selectedIds.length !== 2) return;
    const p1 = athletes.find(a => a.id === selectedIds[0]);
    const p2 = athletes.find(a => a.id === selectedIds[1]);
    
    if (p1 && p2) {
      onAddPair(p1, p2);
      setSelectedIds([]);
    }
  };

  const getSelectedAthlete = (id: string) => athletes.find(a => a.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Selection Area */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <UserPlus className="text-orange-500" size={20} />
              Selecione os Atletas
            </h2>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="ALL">Todas Categorias</option>
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {availableAthletes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">Nenhum atleta disponível com os filtros atuais.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {availableAthletes.map(athlete => {
                const isSelected = selectedIds.includes(athlete.id);
                return (
                  <button
                    key={athlete.id}
                    onClick={() => toggleSelection(athlete.id)}
                    disabled={selectedIds.length >= 2 && !isSelected}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left ${
                      isSelected 
                        ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' 
                        : selectedIds.length >= 2
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100'
                          : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{athlete.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">{athlete.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          athlete.subCategory === SubCategory.GOLD 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {athlete.subCategory}
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Staging & List */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Staging Area */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Nova Dupla</h3>
          
          <div className="flex items-center justify-center gap-4 mb-6">
             {/* Slot 1 */}
             <div className={`flex-1 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
               selectedIds[0] ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 bg-gray-50'
             }`}>
                {selectedIds[0] ? (
                  <>
                    <span className="font-bold text-sm text-gray-800 line-clamp-2">{getSelectedAthlete(selectedIds[0])?.name}</span>
                    <span className="text-xs text-gray-500 mt-1">{getSelectedAthlete(selectedIds[0])?.category}</span>
                    <button onClick={() => toggleSelection(selectedIds[0])} className="mt-1 text-red-400 hover:text-red-600">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Selecione o 1º</span>
                )}
             </div>

             <div className="text-gray-300 font-bold">+</div>

             {/* Slot 2 */}
             <div className={`flex-1 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
               selectedIds[1] ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 bg-gray-50'
             }`}>
                {selectedIds[1] ? (
                  <>
                    <span className="font-bold text-sm text-gray-800 line-clamp-2">{getSelectedAthlete(selectedIds[1])?.name}</span>
                    <span className="text-xs text-gray-500 mt-1">{getSelectedAthlete(selectedIds[1])?.category}</span>
                    <button onClick={() => toggleSelection(selectedIds[1])} className="mt-1 text-red-400 hover:text-red-600">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Selecione o 2º</span>
                )}
             </div>
          </div>

          <button
            onClick={handleCreatePair}
            disabled={selectedIds.length !== 2}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              selectedIds.length === 2 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:scale-[1.02]' 
                : 'bg-gray-300 cursor-not-allowed shadow-none'
            }`}
          >
            <Users size={18} />
            Formar Dupla
          </button>
        </div>

        {/* Created Pairs List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Duplas Formadas ({pairs.length})</h3>
          </div>
          
          {pairs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Nenhuma dupla formada ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {pairs.map((pair) => (
                <div key={pair.id} className="relative group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 text-teal-600 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      <Trophy size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center text-sm font-bold text-gray-800">
                        <span className="truncate">{pair.player1.name}</span>
                        <span className="mx-1.5 text-gray-300">/</span>
                        <span className="truncate">{pair.player2.name}</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                          {pair.player1.category}
                        </span>
                        {pair.player1.category !== pair.player2.category && (
                           <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                             Mista
                           </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeletePair(pair.id)}
                      className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Desfazer dupla"
                    >
                      <Trash2 size={16} />
                    </button>
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