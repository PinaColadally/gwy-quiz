import { useState, useEffect } from 'react';
import { getFavoriteIds } from '../db';
import { questionBank } from '../data/questions';
import { useQuizStore } from '../store/quizStore';
import { useRouterStore } from '../store/routerStore';
import type { Question } from '../types';
import { CATEGORY_MAP } from '../types';
import { Bookmark, RefreshCw, BookOpenCheck } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setLoading(true);
    const ids = getFavoriteIds();
    const questions = ids
      .map(id => questionBank.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
    setFavorites(questions);
    setLoading(false);
  };

  const handleReview = () => {
    if (favorites.length > 0) {
      useQuizStore.getState().startFavoritesReview(favorites);
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
          <Bookmark className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold">收藏夹</h2>
          <span className="text-sm text-slate-400">({favorites.length}题)</span>
        </div>
        <div className="flex items-center gap-2">
          {favorites.length > 0 && (
            <button
              onClick={handleReview}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              收藏重做
            </button>
          )}
          <button
            onClick={loadFavorites}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-10 text-center">
          <BookOpenCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">收藏夹为空</p>
          <p className="text-xs text-slate-400 mt-1">在答题时将感兴趣的题目点击⭐收藏</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1 line-clamp-2">{q.question}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{CATEGORY_MAP[q.category] || q.category}</span>
                    <span>·</span>
                    <span>{q.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
