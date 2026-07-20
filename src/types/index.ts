// 题目类型定义

export type QuestionType = 'single' | 'multi' | 'judge';
export type Difficulty = 1 | 2 | 3; // 1=简单 2=中等 3=困难

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  subCategory: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: number[];
  explanation: string;
  source: string;
  sourceUrl?: string;
  year?: number;
  tags: string[];
  /** 是否为真题 */
  isRealExam: boolean;
}

export interface QuizSession {
  id: string;
  date: string;
  questions: Question[];
  answers: Record<string, number[]>;
  startTime: number;
  endTime?: number;
  completed: boolean;
  score?: number;
  totalQuestions: number;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  answeredAt: number;
  sessionId: string;
}

export interface CategoryStats {
  category: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface DailyStats {
  date: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface AppSettings {
  dailyQuestionCount: number;       // 每日总题量 (20-50)
  dailyRealExamCount: number;        // 每日真题数量 (默认10)
  darkMode: boolean;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  quizMode: 'practice' | 'exam';     // 练习模式 / 考试模式
  examTimeLimit: number;             // 考试时间限制(分钟)
  selectedCategories: string[];      // 选中的题目分类
}

export const DEFAULT_SETTINGS: AppSettings = {
  dailyQuestionCount: 35,
  dailyRealExamCount: 10,
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  aiApiKey: '',
  aiModel: 'deepseek-chat',
  aiBaseUrl: 'https://api.deepseek.com',
  quizMode: 'practice',
  examTimeLimit: 20,
  selectedCategories: [],
};

export const CATEGORIES = [
  { key: 'political-theory', label: '政治理论', icon: '🏛', color: '#dc2626' },
  { key: 'party-history', label: '党史近代史', icon: '📜', color: '#ea580c' },
  { key: 'economic-thought', label: '经济思想', icon: '💰', color: '#ca8a04' },
  { key: 'cultural-thought', label: '文化思想', icon: '🎭', color: '#16a34a' },
  { key: 'policy-planning', label: '政策规划', icon: '📋', color: '#0891b2' },
  { key: 'tech-achievements', label: '科技成就', icon: '🚀', color: '#2563eb' },
  { key: 'major-projects', label: '重大项目', icon: '🏗', color: '#7c3aed' },
  { key: 'laws-regulations', label: '法律法规', icon: '⚖', color: '#db2777' },
  { key: 'important-speeches', label: '重要讲话', icon: '🎤', color: '#9333ea' },
  { key: 'nature-common', label: '自然常识', icon: '🌿', color: '#059669' },
  { key: 'physics-chem-bio', label: '理化生', icon: '🔬', color: '#0891b2' },
] as const;

export const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.label])
);

export const SUBCATEGORY_MAP: Record<string, string[]> = {
  'political-theory': ['马克思主义基本原理', '社会主义理论', '习近平新时代中国特色社会主义思想', '中国特色社会主义'],
  'party-history': ['中共党史', '中国近代史', '重要会议', '党的理论发展'],
  'economic-thought': ['习近平经济思想', '社会主义市场经济', '宏观经济政策', '新发展理念'],
  'cultural-thought': ['习近平文化思想', '中华优秀传统文化', '文化自信', '精神文明建设'],
  'policy-planning': ['政府工作报告', '十五五规划', '十四五成就', '乡村振兴战略'],
  'tech-achievements': ['航天成就', '深海探测', '量子科技', '人工智能与5G', '国防科技'],
  'major-projects': ['交通工程', '水利工程', '能源工程', '重大基础设施'],
  'laws-regulations': ['宪法', '民法典', '党章党规', '行政法规', '国家安全法'],
  'important-speeches': ['新年致辞', '主场外交讲话', '国际会议讲话', '考察调研讲话'],
  'nature-common': ['二十四节气', '天文地理', '生态环境', '自然灾害防护'],
  'physics-chem-bio': ['物理常识', '化学常识', '生物常识'],
};
