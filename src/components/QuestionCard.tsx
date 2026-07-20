import { useState } from 'react';
import type { Question } from '../types';
import { CATEGORY_MAP } from '../types';
import { saveAnswer } from '../db';
import { toggleFavorite, isFavorite } from '../db';
import { useQuizStore } from '../store/quizStore';
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Props {
  question: Question;
  questionNumber: number;
  total: number;
  selectedAnswers: number[];
  onAnswer: (answers: number[]) => void;
  showResult: boolean;
  onToggleResult: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuestionCard({
  question, questionNumber, total,
  selectedAnswers, onAnswer, showResult, onToggleResult,
  onNext, onPrev,
}: Props) {
  const { sessionId, isCompleted, completeQuiz } = useQuizStore();
  const [faved, setFaved] = useState(isFavorite(question.id));
  const hasAnswered = selectedAnswers.length > 0;

  const isCorrect = showResult && hasAnswered
    ? JSON.stringify(selectedAnswers.sort()) === JSON.stringify(question.answer.sort())
    : false;

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const handleOptionClick = (idx: number) => {
    if (showResult || isCompleted) return;

    if (question.type === 'single' || question.type === 'judge') {
      onAnswer([idx]);
    } else {
      // 多选题
      const current = [...selectedAnswers];
      const pos = current.indexOf(idx);
      if (pos > -1) {
        current.splice(pos, 1);
      } else {
        current.push(idx);
      }
      onAnswer(current.sort());
    }
  };

  const handleSubmit = () => {
    if (!hasAnswered) return;
    onToggleResult();
    // 保存作答记录
    if (sessionId) {
      saveAnswer({
        questionId: question.id,
        selectedAnswers,
        isCorrect: JSON.stringify(selectedAnswers.sort()) === JSON.stringify(question.answer.sort()),
        answeredAt: Date.now(),
        sessionId,
      });
    }
  };

  const handleFav = () => {
    const now = toggleFavorite(question.id);
    setFaved(now);
  };

  const correctIcon = (idx: number) => {
    if (!showResult) return null;
    if (question.answer.includes(idx)) return '✓';
    if (selectedAnswers.includes(idx) && !question.answer.includes(idx)) return '✗';
    return null;
  };

  const getOptionStyle = (idx: number) => {
    if (!showResult) {
      if (selectedAnswers.includes(idx)) {
        return 'border-primary bg-primary/5 dark:bg-blue-900/20 ring-2 ring-primary';
      }
      return 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500';
    }

    const isSelected = selectedAnswers.includes(idx);
    const isCorrectAnswer = question.answer.includes(idx);

    if (isCorrectAnswer && isSelected) return 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500';
    if (isCorrectAnswer && !isSelected) return 'border-green-500 bg-green-50/50 dark:bg-green-900/10 ring-2 ring-green-500';
    if (!isCorrectAnswer && isSelected) return 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500';
    return 'border-slate-200 dark:border-slate-600 opacity-60';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* 题目头部 */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-primary dark:text-blue-300">
            第 {questionNumber}/{total} 题
          </span>
          <span className="text-slate-400">|</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            {CATEGORY_MAP[question.category] || question.category}
          </span>
          {question.isRealExam && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              真题 {question.year || ''}
            </span>
          )}
          {question.type === 'judge' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              判断题
            </span>
          )}
          {question.type === 'multi' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              多选题
            </span>
          )}
        </div>
        <button
          onClick={handleFav}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={faved ? '取消收藏' : '收藏本题'}
        >
          {faved
            ? <BookmarkCheck className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            : <Bookmark className="w-4 h-4 text-slate-400" />
          }
        </button>
      </div>

      {/* 题目内容 */}
      <div className="px-4 py-4">
        <div className="text-base sm:text-lg font-medium mb-4 leading-relaxed">
          {question.question}
        </div>

        {/* 选项 */}
        <div className="space-y-2.5">
          {question.options.map((opt, idx) => {
            const icon = correctIcon(idx);
            const style = getOptionStyle(idx);
            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={showResult || isCompleted}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${style} ${
                  showResult ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                    selectedAnswers.includes(idx)
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {optionLabels[idx]}
                  </span>
                  <span className="flex-1 pt-0.5 text-sm sm:text-base">{opt.replace(/^[A-Z]\.\s*/, '')}</span>
                  {icon && (
                    <span className={`flex-shrink-0 text-lg font-bold ${
                      icon === '✓' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {icon}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2">
            {questionNumber > 1 && (
              <button
                onClick={onPrev}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                上一题
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasAnswered && !showResult && (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"
              >
                查看解析
              </button>
            )}
            {showResult && questionNumber < total && (
              <button
                onClick={onNext}
                className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"
              >
                下一题
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {showResult && questionNumber === total && !isCompleted && (
              <button
                onClick={completeQuiz}
                className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                完成答题
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 解析区域 */}
      <div className={`overflow-hidden transition-all duration-300 ${showResult ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="px-4 pb-4">
          <div className="rounded-xl border bg-slate-50 dark:bg-slate-800/60 p-4">
            <div className="flex items-start gap-2 mb-2">
              <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold text-white ${
                isCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {isCorrect ? '✓ 回答正确' : '✗ 回答错误'}
              </span>
            </div>

            <div className="mb-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">正确答案：</span>
              <span className="text-sm font-bold text-green-700 dark:text-green-400">
                {question.answer.map(i => optionLabels[i]).join('、')}
              </span>
            </div>

            <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
              <span className="font-medium text-slate-500 dark:text-slate-400">📖 解析：</span>
              {question.explanation}
            </div>

            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              📎 来源：
              <a
                href={question.sourceUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary light:underline hover:underline"
                onClick={e => !question.sourceUrl && e.preventDefault()}
              >
                {question.source}
              </a>
              {question.tags.length > 0 && (
                <span className="ml-2 flex items-center gap-1">
                  {question.tags.slice(0, 3).map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">{t}</span>
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
