import { useEffect, useState } from 'react';
import { useRouterStore } from '../store/routerStore';
import { useQuizStore } from '../store/quizStore';
import { useSettingsStore } from '../store/settingsStore';
import { getTodayStats, getStreak } from '../db';
import { questionBank } from '../data/questions';
import { shuffleArray, pickRandom } from '../utils/helpers';
import { CATEGORIES } from '../types';
import {
  BookOpen, ScrollText, BarChart3, Settings, Award,
  TrendingUp, Calendar, Target, Zap, Clock, Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { navigate } = useRouterStore();
  const { dailyQuestions, isDailyReady, generateDailyQuiz, isLoading } = useQuizStore();
  const { dailyQuestionCount } = useSettingsStore();
  const [todayStats, setTodayStats] = useState({ total: 0, correct: 0 });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getTodayStats().then(setTodayStats);
    getStreak().then(setStreak);
  }, []);

  const realExamCount = questionBank.filter(q => q.isRealExam).length;

  const handleStartDaily = async () => {
    if (!isDailyReady || dailyQuestions.length === 0) {
      await generateDailyQuiz();
    }
    navigate('daily-quiz');
  };

  const handleStartExam = async () => {
    // 模拟考试：随机20题，20分钟
    const questions = pickRandom(questionBank, 20);
    useQuizStore.getState().startExam(questions, 20);
    navigate('daily-quiz');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 顶部信息面板 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">连续打卡</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-primary dark:text-blue-300">{streak}天</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-green-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">今日已做</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-green-600">{todayStats.total}题</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">正确率</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-orange-600">
            {todayStats.total > 0 ? Math.round((todayStats.correct / todayStats.total) * 100) : 0}%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-red-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">总题库</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-red-600">{questionBank.length}+题</div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <button
          onClick={handleStartDaily}
          disabled={isLoading}
          className={`relative overflow-hidden bg-gradient-to-br from-primary to-primary-light text-white rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] ${
            isLoading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-lg">今日刷题</h3>
            </div>
            <p className="text-sm opacity-90 mb-1">
              每日{dailyQuestionCount}题 · 含10道真题 + AI新题
            </p>
            <p className="text-xs opacity-75">
              覆盖时政 · 政治 · 科技 · 法律 · 常识
            </p>
          </div>
          <div className="absolute right-2 bottom-0 opacity-10 text-8xl leading-none select-none pointer-events-none">
            <BookOpen className="w-24 h-24" />
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>出题中...</span>
              </div>
            </div>
          )}
        </button>

        <button
          onClick={handleStartExam}
          className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <h3 className="font-bold text-lg">模拟考试</h3>
            </div>
            <p className="text-sm opacity-90 mb-1">20题限时20分钟 · 随机组卷</p>
            <p className="text-xs opacity-75">检验真实水平 · 适应考试节奏</p>
          </div>
          <div className="absolute right-2 bottom-0 opacity-10 text-8xl leading-none select-none pointer-events-none">
            <Zap className="w-24 h-24" />
          </div>
        </button>
      </div>

      {/* 其他功能 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: ScrollText, label: '错题本', desc: '复习巩固', page: 'wrong-book' as const, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { icon: TrendingUp, label: '学习统计', desc: '进度分析', page: 'stats' as const, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: BookOpen, label: '题库浏览', desc: '全部题目', page: 'question-bank' as const, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: Settings, label: '设置', desc: '偏好配置', page: 'settings' as const, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-700/30' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all active:scale-[0.98] text-left"
            >
              <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* 知识点分类 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          知识点分类
          <span className="text-xs font-normal text-slate-400">（{questionBank.length}题）</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const count = questionBank.filter(q => q.category === cat.key).length;
            return (
              <span
                key={cat.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-slate-400">({count})</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
