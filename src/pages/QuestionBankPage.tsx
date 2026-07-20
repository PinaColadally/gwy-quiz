import { useState, useMemo } from 'react';
import { questionBank } from '../data/questions';
import { CATEGORIES, CATEGORY_MAP } from '../types';
import type { Question } from '../types';
import { BookOpen, Search, Filter, ChevronDown } from 'lucide-react';

export default function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return questionBank.filter(q => {
      if (category !== 'all' && q.category !== category) return false;
      if (search && !q.question.includes(search) && !q.explanation.includes(search)) return false;
      return true;
    });
  }, [search, category]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold">题库浏览</h2>
          <span className="text-sm text-slate-400">({questionBank.length}题)</span>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索题目..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">全部分类</option>
          {CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
          ))}
        </select>
      </div>

      {/* 题目列表 */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">未找到匹配题目</div>
        ) : (
          filtered.slice(0, 100).map((q, idx) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs flex items-center justify-center text-slate-500">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-1">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{CATEGORY_MAP[q.category] || q.category}</span>
                    {q.isRealExam && <span className="text-red-400">真题</span>}
                    <span className="text-green-500">✓ {q.answer.map(i => ['A','B','C','D','E','F'][i]).join('、')}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${expanded === q.id ? 'rotate-180' : ''}`} />
              </button>
              {expanded === q.id && (
                <div className="px-4 pb-3 pt-0 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-xs space-y-1 pt-2">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                    <p className="text-slate-400 mt-2">📎 {q.source}</p>
                    {q.tags.length > 0 && (
                      <p className="flex flex-wrap gap-1 mt-1">
                        {q.tags.map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px]">{t}</span>
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {filtered.length > 100 && (
          <p className="text-center text-xs text-slate-400">
            共 {filtered.length} 题，显示前 100 题
          </p>
        )}
      </div>
    </div>
  );
}
