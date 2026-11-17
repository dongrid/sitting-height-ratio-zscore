"use client";

import { useMemo } from "react";
import { getLMS, zToValue, AGE_MIN, AGE_MAX, type Sex } from "@/lib/shr";

interface Props {
  sex: Sex;
  ageYears: number | null;
  ratio: number | null;
  zScore: number | null;
}

const VB = { w: 620, h: 380 };
const PAD = { top: 24, right: 64, bottom: 48, left: 56 };
const plotW = VB.w - PAD.left - PAD.right;
const plotH = VB.h - PAD.top - PAD.bottom;
const plotX0 = PAD.left;
const plotY0 = PAD.top;
const plotX1 = plotX0 + plotW;
const plotY1 = plotY0 + plotH;
const X_MIN = 6;
const X_MAX = 18;
const N = 220;

const SD_LINES = [
  { z: 2.5, label: "+2.5 SD", color: "#ef4444", dash: "6,3" },
  { z: 2.0, label: "+2 SD", color: "#f59e0b", dash: "4,2" },
  { z: 1.0, label: "+1 SD", color: "#94a3b8", dash: "3,2" },
  { z: 0, label: "平均", color: "#22c55e", dash: "" },
  { z: -1.0, label: "−1 SD", color: "#94a3b8", dash: "3,2" },
  { z: -2.0, label: "−2 SD", color: "#f59e0b", dash: "4,2" },
  { z: -2.5, label: "−2.5 SD", color: "#ef4444", dash: "6,3" },
];

type P = { x: number; y: number };
const toPath = (pts: P[]) =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
const toBand = (top: P[], bot: P[]) =>
  `${toPath(top)} ${[...bot].reverse().map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")} Z`;

export default function ShrChart({ sex, ageYears, ratio, zScore }: Props) {
  const { ages, val, toX, toY, yTicks } = useMemo(() => {
    const ages = Array.from({ length: N + 1 }, (_, i) => AGE_MIN + (i / N) * (AGE_MAX - AGE_MIN));
    const val = (z: number) =>
      ages.map((a) => {
        const { L, M, S } = getLMS(sex, a);
        return zToValue(z, L, M, S);
      });
    const all = [...val(-2.5), ...val(2.5)];
    if (ratio !== null) all.push(ratio);
    const lo = Math.floor((Math.min(...all) - 0.005) * 100) / 100;
    const hi = Math.ceil((Math.max(...all) + 0.005) * 100) / 100;
    const toX = (a: number) => plotX0 + ((a - X_MIN) / (X_MAX - X_MIN)) * plotW;
    const toY = (v: number) => plotY1 - ((v - lo) / (hi - lo)) * plotH;
    const yTicks: number[] = [];
    for (let v = lo; v <= hi + 1e-9; v += 0.01) yTicks.push(Math.round(v * 100) / 100);
    return { ages, val, toX, toY, yTicks };
  }, [sex, ratio]);

  const line = (z: number) => {
    const v = val(z);
    return ages.map((a, i) => ({ x: toX(a), y: toY(v[i]) }));
  };

  const xTicks = Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => X_MIN + i);
  const grid = "rgba(100,116,139,0.2)";
  const axis = "#94a3b8";
  const text = "#64748b";
  const showPoint =
    ageYears !== null && ratio !== null && ageYears >= AGE_MIN && ageYears <= AGE_MAX;

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full h-auto" aria-label="座高身長比曲線">
      {yTicks.map((v) => (
        <line key={v} x1={plotX0} y1={toY(v)} x2={plotX1} y2={toY(v)} stroke={grid} />
      ))}
      {xTicks.map((a) => (
        <line key={a} x1={toX(a)} y1={plotY0} x2={toX(a)} y2={plotY1} stroke={grid} />
      ))}

      <path d={toBand(line(1), line(-1))} fill="rgba(34,197,94,0.10)" />
      <path d={toBand(line(2), line(1))} fill="rgba(245,158,11,0.12)" />
      <path d={toBand(line(-1), line(-2))} fill="rgba(245,158,11,0.12)" />
      <path
        d={toBand(line(2.5), line(2.5).map((p) => ({ x: p.x, y: plotY0 })))}
        fill="rgba(239,68,68,0.08)"
      />

      {SD_LINES.map(({ z, label, color, dash }) => {
        const pts = line(z);
        return (
          <g key={label}>
            <path d={toPath(pts)} fill="none" stroke={color} strokeWidth={z === 0 ? 2 : 1.5} strokeDasharray={dash || undefined} />
            <text x={pts[pts.length - 1].x + 4} y={pts[pts.length - 1].y + 4} fontSize={9} fill={color} fontWeight={500}>
              {label}
            </text>
          </g>
        );
      })}

      {showPoint && (
        <g>
          <circle cx={toX(ageYears!)} cy={toY(ratio!)} r={7} fill="#3b82f6" stroke="white" strokeWidth={3} />
          {zScore !== null && (
            <text x={toX(ageYears!)} y={toY(ratio!) - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#3b82f6">
              Z={zScore >= 0 ? "+" : ""}{zScore.toFixed(2)}
            </text>
          )}
        </g>
      )}

      <line x1={plotX0} y1={plotY0} x2={plotX0} y2={plotY1} stroke={axis} />
      <line x1={plotX0} y1={plotY1} x2={plotX1} y2={plotY1} stroke={axis} />
      {xTicks.map((a) => (
        <g key={a}>
          <line x1={toX(a)} y1={plotY1} x2={toX(a)} y2={plotY1 + 4} stroke={axis} />
          <text x={toX(a)} y={plotY1 + 16} textAnchor="middle" fontSize={11} fill={text}>{a}</text>
        </g>
      ))}
      <text x={plotX0 + plotW / 2} y={VB.h - 6} textAnchor="middle" fontSize={11} fill={text}>年齢（歳）</text>
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={plotX0 - 4} y1={toY(v)} x2={plotX0} y2={toY(v)} stroke={axis} />
          <text x={plotX0 - 8} y={toY(v) + 4} textAnchor="end" fontSize={10} fill={text}>{v.toFixed(2)}</text>
        </g>
      ))}
      <text x={16} y={plotY0 + plotH / 2} textAnchor="middle" fontSize={11} fill={text} transform={`rotate(-90, 16, ${plotY0 + plotH / 2})`}>
        座高 / 身長
      </text>
    </svg>
  );
}
