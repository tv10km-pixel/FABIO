import React from 'react';
import { X, Trophy, Share2 } from 'lucide-react';
import { Pair } from '../types';

export interface ShareData {
  stageName: string;
  matchLabel: string;
  pair1: Pair;
  pair2: Pair;
  score1: number;
  score2: number;
}

interface SocialShareModalProps {
  data: ShareData | null;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
         {/* Close Button & Hint */}
         <div className="absolute -top-12 left-0 w-full flex justify-between items-center text-white/80">
            <span className="text-sm font-medium flex items-center gap-2">
              <Share2 size={16} /> Tire um print para postar
            </span>
            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
              <X size={20} />
            </button>
         </div>

         {/* Design Content - This is what they screenshot */}
         <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative">
            {/* Artistic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
            
            {/* Top Accent */}
            <div className="relative z-10 h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-500"></div>

            <div className="relative z-10 flex flex-col min-h-[550px] p-0">
                {/* Header */}
                <div className="p-8 text-center">
                   <div className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
                      <Trophy size={14} className="text-amber-400 fill-amber-400/20"/>
                      <span className="text-[10px] font-bold text-amber-100 uppercase tracking-[0.2em]">Resultado Oficial</span>
                   </div>
                   
                   <h2 className="text-3xl font-black text-white leading-none tracking-tight mb-2 drop-shadow-lg">
                     {data.stageName}
                   </h2>
                   <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest">{data.matchLabel}</p>
                </div>

                {/* Main Score Area */}
                <div className="flex-1 flex flex-col justify-center px-6 gap-8 pb-8">
                   {/* Pair 1 */}
                   <div className={`text-center space-y-2 transition-all duration-500 ${data.score1 > data.score2 ? 'scale-105 opacity-100' : 'opacity-80 scale-95'}`}>
                      <div className="text-2xl font-bold text-white leading-tight filter drop-shadow-md">
                        {data.pair1.player1.name}
                      </div>
                      <div className="text-lg font-medium text-gray-400 leading-tight">
                        {data.pair1.player2.name}
                      </div>
                   </div>

                   {/* Score Board */}
                   <div className="flex items-center justify-center gap-4 py-4">
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-20 h-24 flex items-center justify-center shadow-inner">
                        <span className={`text-6xl font-black ${data.score1 > data.score2 ? 'text-amber-400' : 'text-white'}`}>
                           {data.score1}
                        </span>
                      </div>
                      <div className="h-px w-8 bg-gray-700"></div>
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl w-20 h-24 flex items-center justify-center shadow-inner">
                        <span className={`text-6xl font-black ${data.score2 > data.score1 ? 'text-amber-400' : 'text-white'}`}>
                           {data.score2}
                        </span>
                      </div>
                   </div>

                   {/* Pair 2 */}
                   <div className={`text-center space-y-2 transition-all duration-500 ${data.score2 > data.score1 ? 'scale-105 opacity-100' : 'opacity-80 scale-95'}`}>
                      <div className="text-2xl font-bold text-white leading-tight filter drop-shadow-md">
                        {data.pair2.player1.name}
                      </div>
                      <div className="text-lg font-medium text-gray-400 leading-tight">
                        {data.pair2.player2.name}
                      </div>
                   </div>
                </div>

                {/* Footer */}
                <div className="mt-auto p-6 bg-gradient-to-t from-black/40 to-transparent">
                  <div className="flex flex-col items-center justify-center gap-3">
                     <div className="h-px w-full max-w-[100px] bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">BT Arena</span>
                  </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  )
}
