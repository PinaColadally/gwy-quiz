import { useSettingsStore } from '../store/settingsStore';
import { useRouterStore } from '../store/routerStore';
import { CATEGORIES } from '../types';
import {
  Home, BookOpen, FileText, Bookmark, BarChart3,
  Library, Settings, ScrollText, Award, Sun, Moon,
  ChevronRight, ArrowRight, TrendingUp, Calendar,
} from 'lucide-react';

const navItems = [
  { id: 'home' as const, label: '首页', icon: Home },
  { id: 'daily-quiz' as const, label: '今日刷题', icon: BookOpen },
  { id: 'wrong-book' as const, label: '错题本', icon: ScrollText },
  { id: 'stats' as const, label: '统计', icon: BarChart3 },
];

const mobileNavItems = [
  { id: 'home' as const, label: '首页', icon: Home },
  { id: 'daily-quiz' as const, label: '刷题', icon: BookOpen },
  { id: 'wrong-book' as const, label: '错题', icon: ScrollText },
  { id: 'stats' as const, label: '统计', icon: BarChart3 },
  { id: 'settings' as const, label: '设置', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { darkMode, updateSetting } = useSettingsStore();
  const { currentPage, navigate } = useRouterStore();

  // 不在答题页面显示导航
  const hideNav = currentPage === 'daily-quiz';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        {/* 顶部导航 (桌面) */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-red-600" />
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">公考常识每日刷题</h1>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 mr-4">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <button
              onClick={() => updateSetting('darkMode', !darkMode)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={darkMode ? '切换亮色模式' : '切换暗色模式'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate('settings')}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 'settings'
                  ? 'bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-blue-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="设置"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 主内容 */}
        <main className={`max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 ${hideNav ? '' : 'pb-24 md:pb-6'}`}>
          {children}
        </main>

        {/* 底部导航 (移动端) */}
        <nav className="mobile-bottom-nav md:hidden">
          {mobileNavItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 ${
                  isActive
                    ? 'text-primary dark:text-blue-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current/10' : ''}`} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
