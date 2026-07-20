import { create } from 'zustand';

export type PageId =
  | 'home'
  | 'daily-quiz'
  | 'exam'
  | 'wrong-book'
  | 'favorites'
  | 'stats'
  | 'question-bank'
  | 'settings'
  | 'quiz-result';

interface RouterState {
  currentPage: PageId;
  navigate: (page: PageId) => void;
  // 答题时传递的参数
  quizParams: {
    mode: 'daily' | 'exam' | 'wrong' | 'favorites';
    questionIds?: string[];
    timeLimit?: number;
  } | null;
  startQuiz: (params: RouterState['quizParams']) => void;
  endQuiz: () => void;
}

export const useRouterStore = create<RouterState>((set) => ({
  currentPage: 'home',
  navigate: (page) => set({ currentPage: page, quizParams: null }),
  quizParams: null,
  startQuiz: (params) => set({ currentPage: 'daily-quiz', quizParams: params }),
  endQuiz: () => set({ currentPage: 'quiz-result', quizParams: null }),
}));
