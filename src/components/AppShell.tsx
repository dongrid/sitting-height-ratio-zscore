"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
}

export default function AppShell({
  title,
  subtitle,
  children,
  maxWidth = "4xl",
}: AppShellProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="テーマ切り替え"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className={`flex-1 max-w-${maxWidth} mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 overflow-x-hidden`}>
        {children}
      </main>

      <footer className="px-6 py-6 text-center text-xs text-slate-400 dark:text-slate-600 space-y-1.5">
        <p>本ツールは診療支援目的です。最終判断は必ず医師が行ってください。</p>
        <p className="leading-relaxed">
          基準：杉浦令子, 村田光範. 日本成長学会雑誌 2022;28:51-61.
          日本小児内分泌学会「横断的座高身長比曲線（6.5-17.5歳）」（2000年度乳幼児身体発育調査・学校保健統計調査、LMS法）。
        </p>
        <p className="leading-relaxed">
          LMS 値は学会配布の曲線 PDF の SD 線（−2.5〜+2.5 SD の7本）を数値化して月齢ごとに当てはめたもので、論文の表の値ではありません。
        </p>
      </footer>
    </div>
  );
}
