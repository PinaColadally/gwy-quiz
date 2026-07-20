import { useState, useMemo } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { CATEGORIES } from '../types';
import { exportData, importData } from '../db';
import {
  Settings, Moon, Sun, Sliders, Key, Database,
  Download, Upload, CheckCircle, AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success'>('idle');

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gwy-quiz-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus('success');
    setTimeout(() => setExportStatus('idle'), 2000);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const ok = await importData(text);
      setImportStatus(ok ? 'success' : 'error');
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    input.click();
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-500" />
        <h2 className="text-lg font-bold">设置</h2>
      </div>

      {/* 显示设置 */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          显示设置
        </h3>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm">暗色模式</span>
          </div>
          <button
            onClick={() => settings.updateSetting('darkMode', !settings.darkMode)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              settings.darkMode ? 'bg-primary' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                settings.darkMode ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </section>

      {/* 每日设置 */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          每日刷题设置
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">每日总题量</span>
              <span className="text-sm font-bold text-primary">{settings.dailyQuestionCount}题</span>
            </div>
            <input
              type="range"
              min={20}
              max={50}
              value={settings.dailyQuestionCount}
              onChange={e => settings.updateSetting('dailyQuestionCount', parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>20</span>
              <span>35</span>
              <span>50</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">其中历年真题数量</span>
              <span className="text-sm font-bold text-red-500">{settings.dailyRealExamCount}题</span>
            </div>
            <input
              type="range"
              min={5}
              max={20}
              value={settings.dailyRealExamCount}
              onChange={e => settings.updateSetting('dailyRealExamCount', parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>5</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI设置 */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Key className="w-4 h-4" />
          AI出题配置（可选）
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          配置DeepSeek或其他兼容API的Key后，每日刷题将自动生成基于最新时事的题目。无需AI时留空，系统会使用题库补充。
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">API Key</label>
            <div className="flex gap-2">
              <input
                type={apiKeyVisible ? 'text' : 'password'}
                value={settings.aiApiKey}
                onChange={e => settings.updateSetting('aiApiKey', e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
                className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {apiKeyVisible ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">API地址</label>
              <input
                type="text"
                value={settings.aiBaseUrl}
                onChange={e => settings.updateSetting('aiBaseUrl', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">模型</label>
              <input
                type="text"
                value={settings.aiModel}
                onChange={e => settings.updateSetting('aiModel', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 数据管理 */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          数据管理
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          导出备份您的做题记录，或从备份还原数据。所有数据仅存储在浏览器本地。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
          >
            <Download className="w-4 h-4" />
            {exportStatus === 'success' ? '已导出 ✓' : '导出数据'}
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            导入数据
          </button>
          {importStatus === 'success' && (
            <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" /> 导入成功</span>
          )}
          {importStatus === 'error' && (
            <span className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="w-3 h-3" /> 导入失败</span>
          )}
        </div>
      </section>
    </div>
  );
}
