import { create } from 'zustand';
import type { Question } from '../types';
import { CATEGORY_MAP } from '../types';
import { questionBank, getRealExamQuestions } from '../data/questions';
import { shuffleArray, pickRandom, uid } from '../utils/helpers';
import { useSettingsStore } from './settingsStore';
import { generateAIQuestions } from '../utils/aiGenerator';

interface QuizState {
  // 当日题目列表
  dailyQuestions: Question[];
  isDailyReady: boolean;
  isLoading: boolean;
  error: string | null;

  // 当前答题状态
  currentIndex: number;
  userAnswers: Record<string, number[]>;
  showResult: boolean;     // 是否显示答案
  isCompleted: boolean;    // 是否完成作答
  quizMode: 'daily' | 'exam' | 'wrong' | 'favorites';
  sessionId: string | null;
  timeRemaining: number | null;  // 考试模式倒计时(秒)
  questionSource: { type: 'real' | 'ai' | 'static'; topic?: string } | null; // 记录当前题来源

  // 动作
  generateDailyQuiz: (forceRegenerate?: boolean) => Promise<void>;
  setCurrentIndex: (idx: number) => void;
  answerQuestion: (questionId: string, answers: number[]) => void;
  toggleShowResult: () => void;
  startExam: (questions: Question[], timeLimitMin: number) => void;
  startWrongReview: (questions: Question[]) => void;
  startFavoritesReview: (questions: Question[]) => void;
  tickTimer: () => void;
  completeQuiz: () => void;
  reset: () => void;
  clearError: () => void;
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  dailyQuestions: [],
  isDailyReady: false,
  isLoading: false,
  error: null,
  currentIndex: 0,
  userAnswers: {},
  showResult: false,
  isCompleted: false,
  quizMode: 'daily',
  sessionId: null,
  timeRemaining: null,
  questionSource: null,

  generateDailyQuiz: async (forceRegenerate = false) => {
    const state = get();
    if (state.isDailyReady && !forceRegenerate) return;

    set({ isLoading: true, error: null, userAnswers: {}, currentIndex: 0, showResult: false, isCompleted: false });

    const settings = useSettingsStore.getState();
    const totalCount = settings.dailyQuestionCount;
    const realExamCount = Math.min(settings.dailyRealExamCount, totalCount);
    const aiCount = Math.max(0, totalCount - realExamCount);

    // 1. 选取历年真题 (必选)
    const realExams = getRealExamQuestions();
    const selectedReal = pickRandom(realExams, realExamCount);

    // 2. 生成AI新题
    let aiQuestions: Question[] = [];
    if (aiCount > 0 && settings.aiApiKey) {
      try {
        const aiQs = await generateAIQuestions(
          settings.aiApiKey,
          settings.aiBaseUrl,
          settings.aiModel,
          '2026年最新时事政治、政府工作报告、习近平最新讲话、重大成就',
          aiCount
        );
        aiQuestions = aiQs.map((q, i) => ({
          ...q,
          id: `ai-${Date.now()}-${i}`,
          category: Object.keys(CATEGORY_MAP).includes(q.category)
            ? q.category
            : 'political-theory',
          tags: q.tags || [],
          isRealExam: false,
          sourceUrl: '',
        }));
      } catch (err) {
        // AI出题失败，用静态题作为补充
        set({ error: `AI出题失败: ${err instanceof Error ? err.message : '未知错误'}，已使用题库补充` });
      }
    }

    // 3. 用静态题补充到总数
    const nonExamQs = questionBank.filter(q => !q.isRealExam);
    const remainingCount = totalCount - selectedReal.length - aiQuestions.length;
    const staticQuestions = pickRandom(nonExamQs, Math.max(0, remainingCount));

    // 合并并打乱
    const allQuestions = shuffleArray([...selectedReal, ...aiQuestions, ...staticQuestions]);

    set({
      dailyQuestions: allQuestions,
      isDailyReady: true,
      isLoading: false,
      sessionId: uid(),
      quizMode: 'daily',
      questionSource: aiCount > 0 && settings.aiApiKey ? { type: 'ai', topic: '时事政治' } : { type: 'static' },
    });
  },

  setCurrentIndex: (idx) => set({ currentIndex: idx, showResult: false }),

  answerQuestion: (questionId, answers) => {
    const state = get();
    const newAnswers = { ...state.userAnswers, [questionId]: answers };
    set({ userAnswers: newAnswers });
  },

  toggleShowResult: () => set(s => ({ showResult: !s.showResult })),

  startExam: (questions, timeLimitMin) => {
    set({
      dailyQuestions: questions,
      isDailyReady: true,
      currentIndex: 0,
      userAnswers: {},
      showResult: false,
      isCompleted: false,
      quizMode: 'exam',
      sessionId: uid(),
      timeRemaining: timeLimitMin * 60,
    });
  },

  startWrongReview: (questions) => {
    set({
      dailyQuestions: questions,
      isDailyReady: true,
      currentIndex: 0,
      userAnswers: {},
      showResult: false,
      isCompleted: false,
      quizMode: 'wrong',
      sessionId: uid(),
      timeRemaining: null,
    });
  },

  startFavoritesReview: (questions) => {
    set({
      dailyQuestions: questions,
      isDailyReady: true,
      currentIndex: 0,
      userAnswers: {},
      showResult: false,
      isCompleted: false,
      quizMode: 'favorites',
      sessionId: uid(),
      timeRemaining: null,
    });
  },

  tickTimer: () => {
    const state = get();
    if (state.timeRemaining !== null && state.timeRemaining > 0) {
      set({ timeRemaining: state.timeRemaining - 1 });
    } else if (state.timeRemaining === 0) {
      set({ isCompleted: true });
    }
  },

  completeQuiz: () => set({ isCompleted: true }),

  reset: () => set({
    dailyQuestions: [],
    isDailyReady: false,
    isLoading: false,
    error: null,
    currentIndex: 0,
    userAnswers: {},
    showResult: false,
    isCompleted: false,
    quizMode: 'daily',
    sessionId: null,
    timeRemaining: null,
    questionSource: null,
  }),

  clearError: () => set({ error: null }),
}));
