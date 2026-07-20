import { useEffect } from 'react';
import { useSettingsStore } from './store/settingsStore';
import { useRouterStore } from './store/routerStore';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import WrongBookPage from './pages/WrongBookPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import QuestionBankPage from './pages/QuestionBankPage';
import FavoritesPage from './pages/FavoritesPage';

export default function App() {
  const { darkMode } = useSettingsStore();
  const { currentPage } = useRouterStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'daily-quiz':
        return <QuizPage />;
      case 'wrong-book':
        return <WrongBookPage />;
      case 'favorites':
        return <FavoritesPage />;
      case 'stats':
        return <StatsPage />;
      case 'question-bank':
        return <QuestionBankPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}
