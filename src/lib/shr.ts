// 座高身長比の基準：杉浦令子, 村田光範. 日本成長学会雑誌 2022;28:51-61.
// 日本小児内分泌学会「横断的座高身長比曲線（6.5-17.5歳）」男子・女子
// （2000年度乳幼児身体発育調査・学校保健統計調査、LMS法）
//
// 論文の LMS 表は未入手のため、学会配布の曲線 PDF（SHHratioBoy.pdf / SHHratioGirl.pdf）の
// ベクター線（−2.5, −2, −1, 平均, +1, +2, +2.5 SD の7本）の座標を読み取り、
// 月齢ごとに LMS を最小二乗で当てはめた。7本の再現誤差は比で 0.00002 未満。
//
// z = [(X/M)^L − 1] / (L·S)   (L ≠ 0)
// z = ln(X/M) / S            (L = 0)

import { LMS_TABLE, type LMSRow, type Sex } from "./lmsTable";

export type { Sex };
export const AGE_MIN = 6.5;
export const AGE_MAX = 17.5;

export function getLMS(sex: Sex, age: number): LMSRow {
  const t = LMS_TABLE[sex];
  if (age <= t[0].age) return t[0];
  if (age >= t[t.length - 1].age) return t[t.length - 1];
  let i = 0;
  while (i < t.length - 2 && t[i + 1].age < age) i++;
  const a = t[i];
  const b = t[i + 1];
  const f = (age - a.age) / (b.age - a.age);
  return {
    age,
    L: a.L + f * (b.L - a.L),
    M: a.M + f * (b.M - a.M),
    S: a.S + f * (b.S - a.S),
  };
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
