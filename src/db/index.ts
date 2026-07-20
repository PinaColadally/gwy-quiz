import Dexie, { type Table } from 'dexie';
import type { UserAnswer, QuizSession, DailyStats, CategoryStats } from '../types';

class QuizDatabase extends Dexie {
  userAnswers!: Table<UserAnswer, string>;
  quizSessions!: Table<QuizSession, string>;
  dailyStats!: Table<DailyStats, string>;
  categoryStats!: Table<CategoryStats, string>;

  constructor() {
    super('GwyQuizDB');
    this.version(1).stores({
      userAnswers: 'questionId, sessionId, answeredAt, isCorrect',
      quizSessions: 'id, date, completed',
      dailyStats: 'date',
      categoryStats: 'category',
    });
  }
}

export const db = new QuizDatabase();

/** 保存用户作答 */
export async function saveAnswer(answer: UserAnswer) {
  await db.userAnswers.put(answer);
}

/** 获取某道题的所有作答记录 */
export async function getAnswerHistory(questionId: string) {
  return db.userAnswers.where('questionId').equals(questionId).toArray();
}

/** 获取所有错题ID */
export async function getWrongQuestionIds(): Promise<string[]> {
  const wrong = await db.userAnswers
    .where('isCorrect')
    .equals(false)
    .distinct()
    .toArray();
  // 去重，保留最新的
  const map = new Map<string, UserAnswer>();
  for (const a of wrong) {
    if (!map.has(a.questionId) || map.get(a.questionId)!.answeredAt < a.answeredAt) {
      map.set(a.questionId, a);
    }
  }
  return Array.from(map.keys());
}

/** 获取错题集合（含最新作答信息） */
export async function getWrongAnswers(): Promise<UserAnswer[]> {
  const all = await db.userAnswers.toArray();
  const map = new Map<string, UserAnswer>();
  for (const a of all) {
    if (!map.has(a.questionId) || map.get(a.questionId)!.answeredAt < a.answeredAt) {
      map.set(a.questionId, a);
    }
  }
  return Array.from(map.values()).filter(a => !a.isCorrect);
}

/** 获取收藏题ID（通过localStorage兼容） */
export function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem('gwy-quiz-favorites') || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(questionId: string): boolean {
  const favs = getFavoriteIds();
  const idx = favs.indexOf(questionId);
  if (idx > -1) {
    favs.splice(idx, 1);
    localStorage.setItem('gwy-quiz-favorites', JSON.stringify(favs));
    return false;
  } else {
    favs.push(questionId);
    localStorage.setItem('gwy-quiz-favorites', JSON.stringify(favs));
    return true;
  }
}

export function isFavorite(questionId: string): boolean {
  return getFavoriteIds().includes(questionId);
}

/** 每日统计 */
export async function getTodayStats(): Promise<{ total: number; correct: number }> {
  const today = new Date().toISOString().split('T')[0];
  const answers = await db.userAnswers
    .where('answeredAt')
    .above(new Date(today).getTime())
    .toArray();
  return {
    total: answers.length,
    correct: answers.filter(a => a.isCorrect).length,
  };
}

/** 获取近30天统计数据 */
export async function getDailyStats(days = 30): Promise<DailyStats[]> {
  const result: DailyStats[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const start = new Date(dateStr).getTime();
    const end = start + 86400000;
    const answers = await db.userAnswers
      .where('answeredAt')
      .between(start, end, true, false)
      .toArray();
    result.push({
      date: dateStr,
      total: answers.length,
      correct: answers.filter(a => a.isCorrect).length,
      accuracy: answers.length > 0
        ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100)
        : 0,
    });
  }
  return result;
}

/** 计算连续打卡天数 */
export async function getStreak(): Promise<number> {
  const all = await db.userAnswers.toArray();
  if (all.length === 0) return 0;

  const dateSet = new Set<string>();
  for (const a of all) {
    dateSet.add(new Date(a.answeredAt).toISOString().split('T')[0]);
  }

  let streak = 0;
  const now = new Date();
  // 从今天开始往回检查
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (dateSet.has(ds)) {
      streak++;
    } else if (i > 0) {
      break; // 从今天算起，断了就停（允许今天还没做）
    }
  }
  return streak;
}

/** 按分类统计 */
export async function getCategoryStats(questionBank: import('../types').Question[]): Promise<CategoryStats[]> {
  const all = await db.userAnswers.toArray();
  const catMap = new Map<string, { total: number; correct: number }>();

  for (const a of all) {
    const q = questionBank.find(q => q.id === a.questionId);
    if (!q) continue;
    const cat = q.category;
    if (!catMap.has(cat)) catMap.set(cat, { total: 0, correct: 0 });
    const s = catMap.get(cat)!;
    s.total++;
    if (a.isCorrect) s.correct++;
  }

  return Array.from(catMap.entries()).map(([category, { total, correct }]) => ({
    category,
    total,
    correct,
    wrong: total - correct,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
  }));
}

/** 导出全部数据 */
export async function exportData(): Promise<string> {
  const answers = await db.userAnswers.toArray();
  const sessions = await db.quizSessions.toArray();
  const favorites = getFavoriteIds();
  return JSON.stringify({ answers, sessions, favorites, exportDate: new Date().toISOString() }, null, 2);
}

/** 导入数据 */
export async function importData(json: string): Promise<boolean> {
  try {
    const data = JSON.parse(json);
    if (data.answers) {
      await db.userAnswers.bulkPut(data.answers);
    }
    if (data.sessions) {
      await db.quizSessions.bulkPut(data.sessions);
    }
    if (data.favorites) {
      localStorage.setItem('gwy-quiz-favorites', JSON.stringify(data.favorites));
    }
    return true;
  } catch {
    return false;
  }
}
