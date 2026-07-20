import { useState, useEffect } from 'react';
import { getWrongQuestionIds } from '../db';
import { questionBank } from '../data/questions';
import { useQuizStore } from '../store/quizStore';
import { useRouterStore } from '../store/routerStore';
import type { Question } from '../types';
import { ScrollText, RefreshCw, BookOpenCheck } from 'lucide-react';

export default function WrongBookPage() {
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const loadWrongQuestions = async () => {
    setLoading(true);
    const wrongIds = await getWrongQuestionIds();
    const questions = wrongIds
      .map(id => questionBank.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
    setWrongQuestions(questions);
    setLoading(false);
  };

  const handleReview = () => {
    if (wrongQuestions.length > 0) {
      useQuizStore.getState().startWrongReview(wrongQuestions);
      useRouterStore.getState().navigate('daily-quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold">错题本</h2>
          <span className="text-sm text-slate-400">({wrongQuestions.length}题)</span>
        </div>
        <div className="flex items-center gap-2">
          {wrongQuestions.length > 0 && (
            <>
              <button
                onClick={handleReview}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                错题重做
              </button>
            </>
          )}
          <button
            onClick={loadWrongQuestions}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {wrongQuestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-10 text-center">
          <BookOpenCheck className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">没有错题 🎉</p>
          <p className="text-xs text-slate-400 mt-1">继续保持！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {wrongQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1 line-clamp-2">{q.question}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{q.category}</span>
                    <span>·</span>
                    <span className="text-green-600">
                      正确答案：{q.answer.map(i => ['A','B','C','D','E','F'][i]).join('、')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{q.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
