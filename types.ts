
export enum Category {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  SUB15 = 'Sub 15',
  PLUS40 = '40+'
}

export enum SubCategory {
  GOLD = 'Ouro',
  SILVER = 'Prata'
}

export interface Athlete {
  id: string;
  name: string;
  category: Category;
  subCategory: SubCategory;
  createdAt: number;
}

export interface Pair {
  id: string;
  player1: Athlete;
  player2: Athlete;
  createdAt: number;
}

export interface Match {
  id: string;
  pair1: Pair;
  pair2: Pair;
  label: string; // e.g., "Jogo 1"
  score1?: number; // Games won by pair 1
  score2?: number; // Games won by pair 2
  isFinished?: boolean;
}

export interface Group {
  id: string;
  name: string; // e.g., "Grupo 1"
  pairs: Pair[]; // Should contain exactly 3 pairs
  matches?: Match[];
  createdAt: number;
}

export interface TournamentMatch {
  id: string;
  round: number; // 1 = Quarters (or first round), 2 = Semis, 3 = Final
  label: string; // "Quartas 1", "Semi 1", etc.
  pair1?: Pair;
  pair2?: Pair;
  score1?: number;
  score2?: number;
  winner?: Pair;
  nextMatchId?: string; // ID of the match the winner advances to
  nextMatchSlot?: 1 | 2; // Which slot (pair1 or pair2) in the next match
}