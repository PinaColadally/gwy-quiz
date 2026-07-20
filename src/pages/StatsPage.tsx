import { useState, useEffect, useMemo } from 'react';
import { getDailyStats, getCategoryStats, getStreak } from '../db';
import { questionBank } from '../data/questions';
import { CATEGORIES, CATEGORY_MAP } from '../types';
import {
  BarChart3, TrendingUp, Calendar, Award,
  Target, Activity, ChevronDown,
} from 'lucide-react';

export default function StatsPage() {
  const [dailyStats, setDailyStats] = useState<{ date: string; total: number; accuracy: number }[]>([]);
  const [catStats, setCatStats] = useState<{ category: string; total: number; correct: number; accuracy: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [timeRange, setTimeRange] = useState<'7' | '30'>('30');

  useEffect(() => {
    getDailyStats(parseInt(timeRange)).then(setDailyStats);
    getCategoryStats(questionBank).then(setCatStats);
    getStreak().then(setStreak);
  }, [timeRange]);

  const totalAnswered = dailyStats.reduce((s, d) => s + d.total, 0);
  const avgAccuracy = totalAnswered > 0
    ? Math.round(dailyStats.reduce((s, d) => s + d.correct, 0) / totalAnswered * 100)
    : 0;

  const chartMax = Math.max(...dailyStats.map(d => d.total || 0), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-green-500" />
        <h2 className="text-lg font-bold">学习统计</h2>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 mb-1">总做题</div>
          <div className="text-xl font-bold">{totalAnswered}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 mb-1">平均正确率</div>
          <div className="text-xl font-bold text-green-600">{avgAccuracy}%</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 mb-1">连续打卡</div>
          <div className="text-xl font-bold text-primary">{streak}天</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 mb-1">题库总题</div>
          <div className="text-xl font-bold">{questionBank.length}</div>
        </div>
      </div>

      {/* 每日趋势图 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold">每日做题趋势</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-2 py-1 text-xs rounded-lg ${timeRange === '7' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            >
              7天
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-2 py-1 text-xs rounded-lg ${timeRange === '30' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            >
              30天
            </button>
          </div>
        </div>

        {/* 简易柱状图 */}
        <div className="flex items-end gap-1 h-32">
          {dailyStats.map((d, i) => {
            const height = d.total > 0 ? (d.total / chartMax) * 100 : 0;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 font-mono">{d.accuracy}%</span>
                <div
                  className="w-full rounded-t-sm transition-all duration-300 bg-gradient-to-t from-primary to-primary-light"
                  style={{ height: `${Math.max(height, 1)}%` }}
                />
                <span className="text-[10px] text-slate-400">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 各分类正确率 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold">知识点分类正确率</h3>
        </div>
        <div className="space-y-3">
          {catStats.map(cs => {
            const catInfo = CATEGORIES.find(c => c.key === cs.category);
            return (
              <div key={cs.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{catInfo?.icon} {catInfo?.label || cs.category}</span>
                  <span className="text-slate-400">{cs.correct}/{cs.total} ({cs.accuracy}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cs.accuracy}%`,
                      backgroundColor: catInfo?.color || '#2563eb',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
