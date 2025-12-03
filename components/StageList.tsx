
import React, { useState } from 'react';
import { Stage } from '../types';
import { Plus, Calendar, ChevronRight, Trash2, Trophy, Pencil, X, Save, Users } from 'lucide-react';

interface StageListProps {
  stages: Stage[];
  onAddStage: (name: string) => void;
  onSelectStage: (stageId: string) => void;
  onDeleteStage: (stageId: string) => void;
  onEditStage: (stageId: string, newName: string) => void;
}

export const StageList: React.FC<StageListProps> = ({ 
  stages, 
  onAddStage, 
  onSelectStage, 
  onDeleteStage,
  onEditStage
}) => {
  const [newStageName, setNewStageName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStageName.trim()) {
      onAddStage(newStageName.trim());
      setNewStageName('');
    }
  };

  const startEdit = (stage: Stage) => {
    setEditingId(stage.id);
    setEditName(stage.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onEditStage(id, editName.trim());
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta etapa e todos os seus dados?')) {
      onDeleteStage(id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Create Stage */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-800">Nova Etapa</h2>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Etapa</label>
              <input
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Ex: Etapa de Verão"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={!newStageName.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                !newStageName.trim()
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl active:scale-95'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Criar Etapa</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: List of Stages */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-gray-800">Etapas Criadas ({stages.length})</h2>
          </div>

          {stages.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Nenhuma etapa encontrada</h3>
              <p className="text-gray-500 mt-1">Crie uma etapa para gerenciar grupos e torneios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stages.map((stage) => (
                <div 
                  key={stage.id} 
                  className="group relative bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md rounded-xl transition-all"
                >
                  {/* Action Buttons Container - Absolute positioned to sit on top but separated from the click flow logic */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-gray-100">
                      {editingId === stage.id ? (
                        <>
                           <button 
                            type="button"
                            onClick={() => saveEdit(stage.id)}
                            className="text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors"
                            title="Salvar"
                          >
                            <Save size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Cancelar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="button"
                            onClick={() => startEdit(stage)}
                            className="text-gray-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDelete(stage.id)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                  </div>

                  {/* Main Clickable Area - Opens the Stage */}
                  <div 
                    className="p-5 cursor-pointer h-full flex flex-col relative z-10"
                    onClick={() => {
                      if (editingId !== stage.id) {
                        onSelectStage(stage.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                        <Trophy size={20} />
                      </div>
                      {/* Spacer to prevent text from going under buttons */}
                      <div className="w-20"></div> 
                    </div>
                    
                    {editingId === stage.id ? (
                      <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                         <input 
                           type="text" 
                           value={editName}
                           onChange={(e) => setEditName(e.target.value)}
                           className="w-full border-b-2 border-indigo-500 pb-1 text-lg font-bold text-gray-800 focus:outline-none bg-transparent"
                           autoFocus
                         />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors pr-16 truncate">
                          {stage.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Criado em: {new Date(stage.createdAt).toLocaleDateString()}
                        </p>
                      </>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1">
                           <Users size={12} /> {stage.pairs ? stage.pairs.length : 0} Duplas
                        </div>
                        <div className="flex items-center gap-1">
                           <Trophy size={12} /> {stage.tournamentMatches.length > 0 ? 'Mata-mata Ativo' : 'Sem Torneio'}
                        </div>
                      </div>
                      {editingId !== stage.id && (
                        <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" size={20} />
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
