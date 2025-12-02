import React from 'react';
import { Athlete, Category, SubCategory } from '../types';
import { Trash2, Pencil } from 'lucide-react';

interface AthleteCardProps {
  athlete: Athlete;
  previousAthlete?: Athlete;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (athlete: Athlete) => void;
}

const getCategoryColor = (cat: Category) => {
  switch (cat) {
    case Category.A: return 'bg-red-100 text-red-800 border-red-200';
    case Category.B: return 'bg-orange-100 text-orange-800 border-orange-200';
    case Category.C: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case Category.D: return 'bg-green-100 text-green-800 border-green-200';
    case Category.SUB15: return 'bg-blue-100 text-blue-800 border-blue-200';
    case Category.PLUS40: return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSubCategoryColor = (sub: SubCategory) => {
  if (sub === SubCategory.GOLD) {
    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
  return 'bg-slate-100 text-slate-600 border-slate-300';
};

const getCategoryBorderColor = (cat: Category) => {
  switch (cat) {
    case Category.A: return 'border-l-red-400';
    case Category.B: return 'border-l-orange-400';
    case Category.C: return 'border-l-yellow-400';
    case Category.D: return 'border-l-green-400';
    case Category.SUB15: return 'border-l-blue-400';
    case Category.PLUS40: return 'border-l-purple-400';
    default: return 'border-l-gray-400';
  }
};

export const AthleteCard: React.FC<AthleteCardProps> = ({ athlete, previousAthlete, index, onDelete, onEdit }) => {
  const isRepeated = previousAthlete && 
    previousAthlete.category === athlete.category && 
    previousAthlete.subCategory === athlete.subCategory;

  return (
    <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg shadow-sm border transition-all duration-200 ${
      isRepeated 
        ? `bg-slate-50 border-slate-200 border-l-4 ${getCategoryBorderColor(athlete.category)} rounded-l-md` 
        : `bg-white border-gray-100 hover:shadow-md`
    }`}>
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
        <span className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold ${
          isRepeated ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-500'
        }`}>
          {index}
        </span>
        <h3 className={`text-sm sm:text-base font-semibold truncate pr-2 ${
          isRepeated ? 'text-gray-600' : 'text-gray-800'
        }`}>
          {athlete.name}
        </h3>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        <div className={`flex flex-col sm:flex-row gap-1 sm:gap-2 items-end sm:items-center transition-opacity ${isRepeated ? 'opacity-75' : 'opacity-100'}`}>
          <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getCategoryColor(athlete.category)} whitespace-nowrap`}>
            {athlete.category}
          </span>
          {athlete.subCategory && (
            <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getSubCategoryColor(athlete.subCategory)} whitespace-nowrap`}>
              {athlete.subCategory}
            </span>
          )}
        </div>

        <div className="flex items-center border-l border-gray-100 pl-2 sm:pl-4 space-x-1">
          <button 
            onClick={() => onEdit(athlete)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            title="Editar"
          >
            <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
          <button 
            onClick={() => onDelete(athlete.id)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Excluir"
          >
            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
};