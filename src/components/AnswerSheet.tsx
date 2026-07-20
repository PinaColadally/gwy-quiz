import type { Question } from '../types';

interface Props {
  questions: Question[];
  userAnswers: Record<string, number[]>;
  currentIndex: number;
  onGoTo: (idx: number) => void;
  showResult: boolean;
}

export default function AnswerSheet({ questions, userAnswers, currentIndex, onGoTo, showResult }: Props) {
  const getStatus = (q: Question, idx: number) => {
    const ans = userAnswers[q.id];
    if (!ans || ans.length === 0) return 'unanswered';
    if (showResult) {
      const correct = JSON.stringify(ans.sort()) === JSON.stringify(q.answer.sort());
      return correct ? 'correct' : 'wrong';
    }
    return 'answered';
  };

  const statusColors: Record<string, string> = {
    'unanswered': 'bg-slate-200 dark:bg-slate-700 text-slate-500',
    'answered': 'bg-primary/20 text-primary dark:bg-blue-900/40 dark:text-blue-300',
    'correct': 'bg-green-500/20 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'wrong': 'bg-red-500/20 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold mb-3 text-slate-600 dark:text-slate-400">
        答题卡
        <span className="ml-2 text-xs font-normal text-slate-400">
          ({Object.keys(userAnswers).length}/{questions.length})
        </span>
      </h3>
      <div className="answer-grid-xs">
        {questions.map((q, idx) => {
          const status = getStatus(q, idx);
          return (
            <button
              key={q.id}
              onClick={() => onGoTo(idx)}
              className={`w-full aspect-square rounded-md text-xs font-medium transition-colors ${
                statusColors[status]
              } ${
                idx === currentIndex ? 'ring-2 ring-primary dark:ring-blue-400' : ''
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
