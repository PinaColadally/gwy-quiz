import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuizStore } from '../store/quizStore';
import { useRouterStore } from '../store/routerStore';
import { useSettingsStore } from '../store/settingsStore';
import QuestionCard from '../components/QuestionCard';
import AnswerSheet from '../components/AnswerSheet';
import Timer from '../components/Timer';
import { ChevronLeft, X, FileText } from 'lucide-react';

export default function QuizPage() {
  const {
    dailyQuestions, currentIndex, userAnswers, showResult,
    isCompleted, quizMode, timeRemaining, isLoading,
    setCurrentIndex, answerQuestion, toggleShowResult,
    tickTimer, completeQuiz,
  } = useQuizStore();
  const { navigate } = useRouterStore();
  const { examTimeLimit } = useSettingsStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  // 考试模式计时器
  useEffect(() => {
    if (quizMode === 'exam' && timeRemaining !== null && !isCompleted) {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizMode, timeRemaining, isCompleted, tickTimer]);

  const currentQ = dailyQuestions[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex, setCurrentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < dailyQuestions.length - 1) setCurrentIndex(currentIndex + 1);
  }, [currentIndex, dailyQuestions.length, setCurrentIndex]);

  // 键盘快捷键
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Enter' && !showResult && userAnswers[currentQ?.id]?.length) toggleShowResult();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handlePrev, handleNext, showResult, currentQ?.id, userAnswers, toggleShowResult]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-slate-500">正在生成题目...</p>
        <p className="text-xs text-slate-400 mt-1">如果配置了AI，正在获取最新时事题目</p>
      </div>
    );
  }

  if (isCompleted) {
    let correctCount = 0;
    let wrongCount = 0;
    dailyQuestions.forEach(q => {
      const ans = userAnswers[q.id];
      if (ans && JSON.stringify([...ans].sort()) === JSON.stringify([...q.answer].sort())) {
        correctCount++;
      } else if (ans) {
        wrongCount++;
      }
    });

    return (
      <div className="max-w-lg mx-auto space-y-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
          <div className="text-5xl mb-3">
            {correctCount >= dailyQuestions.length * 0.8 ? '🎉' : correctCount >= dailyQuestions.length * 0.6 ? '👍' : '💪'}
          </div>
          <h2 className="text-xl font-bold mb-2">答题完成！</h2>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div>
              <div className="text-2xl font-bold text-green-500">{correctCount}</div>
              <div className="text-xs text-slate-400">正确</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{wrongCount}</div>
              <div className="text-xs text-slate-400">错误</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{dailyQuestions.length}</div>
              <div className="text-xs text-slate-400">总题</div>
            </div>
          </div>
          <div className="text-sm text-slate-500 mb-6">
            正确率：
            <span className={`font-bold text-lg ${
              correctCount >= dailyQuestions.length * 0.8 ? 'text-green-500' : 'text-orange-500'
            }`}>
              {Math.round((correctCount / dailyQuestions.length) * 100)}%
            </span>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('home')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => navigate('wrong-book')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
            >
              查看错题
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileText className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500">暂无题目</p>
        <button
          onClick={() => navigate('home')}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 顶部控制栏 */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 px-4 py-2.5">
        <button onClick={() => navigate('home')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          退出
        </button>
        <div className="flex items-center gap-3">
          {quizMode === 'exam' && timeRemaining !== null && (
            <Timer timeRemaining={timeRemaining} totalMinutes={examTimeLimit} />
          )}
          <button
            onClick={() => setShowSheet(!showSheet)}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="hidden sm:inline">答题卡</span>
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {Object.keys(userAnswers).length}/{dailyQuestions.length}
            </span>
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <QuestionCard
            question={currentQ}
            questionNumber={currentIndex + 1}
            total={dailyQuestions.length}
            selectedAnswers={userAnswers[currentQ.id] || []}
            onAnswer={(answers) => answerQuestion(currentQ.id, answers)}
            showResult={showResult}
            onToggleResult={toggleShowResult}
            onNext={handleNext}
            onPrev={handlePrev}
          />

          <div className="hidden md:flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
            <span><kbd>←</kbd> 上一题</span>
            <span><kbd>→</kbd> 下一题</span>
            <span><kbd>Enter</kbd> 查看解析</span>
            <span><kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd> 选择选项</span>
          </div>
        </div>

        <div className="hidden md:block w-48 flex-shrink-0">
          <AnswerSheet
            questions={dailyQuestions}
            userAnswers={userAnswers}
            currentIndex={currentIndex}
            onGoTo={setCurrentIndex}
            showResult={showResult}
          />
        </div>
      </div>

      {/* 答题卡浮层 (移动端) */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl md:rounded-2xl w-full md:w-80 max-h-[60vh] overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">答题卡</h3>
              <button onClick={() => setShowSheet(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <AnswerSheet
              questions={dailyQuestions}
              userAnswers={userAnswers}
              currentIndex={currentIndex}
              onGoTo={(idx) => { setCurrentIndex(idx); setShowSheet(false); }}
              showResult={showResult}
            />
          </div>
        </div>
      )}
    </div>
  );
}
