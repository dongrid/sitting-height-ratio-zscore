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
          基準：Sugiura R, Murata M. The cubic functions for spline smoothed L, M, and S values for
          sitting height and sitting height/height ratio reference charts for Japanese children.{" "}
          <em>日本成長学会雑誌</em> 2022;28(2):51–61.（2000年度学校保健統計、LMS法。Table 5・6 の3次関数で L, M, S を計算）
        </p>
        <p>日本小児内分泌学会「横断的座高身長比曲線（6.5–17.5歳）」と同じ基準です。</p>
      </footer>
    </div>
  );
}
