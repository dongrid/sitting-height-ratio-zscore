// 座高身長比の基準：杉浦令子, 村田光範. The cubic functions for spline smoothed L, M, and S
// values for sitting height and sitting height/height ratio reference charts for Japanese
// children. 日本成長学会雑誌 2022;28(2):51-61.（2000年度学校保健統計の身長・座高相関表、LMS法）
// 日本小児内分泌学会「横断的座高身長比曲線（6.5-17.5歳）」と同じ基準。
//
// z = [(X/M)^L − 1] / (L·S)   (L ≠ 0)
// z = ln(X/M) / S            (L = 0)

import { SEGMENTS, type LMSRow, type Sex } from "./lmsTable";

export type { Sex };
export const AGE_MIN = 6.5;
export const AGE_MAX = 17.5;

export function getLMS(sex: Sex, age: number): LMSRow {
  const a = Math.min(Math.max(age, AGE_MIN), AGE_MAX);
  const segs = SEGMENTS[sex];
  let seg = segs[0];
  for (const s of segs) if (s.knot <= a) seg = s;
  const D = a - seg.knot;
  const f = ([a3, a2, a1, a0]: readonly number[]) => ((a3 * D + a2) * D + a1) * D + a0;
  return { age: a, L: f(seg.L), M: f(seg.M), S: f(seg.S) };
}

export function calcZScore(x: number, L: number, M: number, S: number): number {
  if (Math.abs(L) < 1e-6) return Math.log(x / M) / S;
  return (Math.pow(x / M, L) - 1) / (L * S);
}

export function zToValue(z: number, L: number, M: number, S: number): number {
  if (Math.abs(L) < 1e-6) return M * Math.exp(z * S);
  const inner = 1 + L * S * z;
  if (inner <= 0) return 0;
  return M * Math.pow(inner, 1 / L);
}
