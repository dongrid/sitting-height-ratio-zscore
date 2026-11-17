# 使い方: python scripts/fit_lms_from_pdf.py SHHratioBoy.pdf SHHratioGirl.pdf out.json
# JSPE座高身長比曲線PDFのSD線7本（ベクター）を読み取り、月齢ごとにLMSを当てはめる（要 pymupdf numpy scipy）
import fitz,sys,json
import numpy as np
from scipy.optimize import least_squares
sys.stdout.reconfigure(encoding='utf-8')
def axes(p):
  xs=set();ys=set()
  for d in p.get_drawings():
    for it in d['items']:
      if it[0]=='l':
        a,b=it[1],it[2]
        if abs(a.x-b.x)<0.01 and abs(a.y-b.y)>100: xs.add(a.x)
        if abs(a.y-b.y)<0.01 and abs(a.x-b.x)>100: ys.add(a.y)
  w={b[4]:(b[0]+b[2])/2 for b in p.get_text('words')}
  wy={b[4]:(b[1]+b[3])/2 for b in p.get_text('words')}
  near=lambda v,S:min(S,key=lambda s:abs(s-v))
  x6,x18=near(w['6'],xs),near(w['18'],xs)
  return x6,x18,wy,ys,near
def run(path):
  p=fitz.open(path)[0]
  x6,x18,wy,ys,near=axes(p)
  labels=[k for k in wy if k.startswith('0.') and len(k)==4]
  ya,yb=sorted(labels)[0],sorted(labels)[-1]
  Ya,Yb=near(wy[ya],ys),near(wy[yb],ys)
  fx=lambda x:6+(x-x6)/(x18-x6)*12
  fy=lambda y:float(ya)+(y-Ya)/(Yb-Ya)*(float(yb)-float(ya))
  curves=[d for d in p.get_drawings() if len(d['items'])>20]
  out=[]
  for d in curves:
    pts=[d['items'][0][1]]+[it[-1] for it in d['items']]
    out.append(([fx(q.x) for q in pts],[fy(q.y) for q in pts]))
  out.sort(key=lambda c:np.mean(c[1]))
  zs=[-2.5,-2,-1,0,1,2,2.5]
  assert len(out)==7, len(out)
  print(path[-20:],'axis',ya,yb,'x range',round(out[0][0][0],3),round(out[0][0][-1],3))
  rows=[]
  for m in range(0,133):
    age=6.5+m/12
    v=np.array([np.interp(age,c[0],c[1]) for c in out])
    def res(t):
      L,M,S=t
      return (M*(1+L*S*np.array(zs))**(1/L) if abs(L)>1e-6 else M*np.exp(S*np.array(zs)))-v
    r=least_squares(res,[1,v[3],(v[4]-v[2])/2/v[3]])
    L,M,S=r.x
    rows.append(dict(age=round(age,4),L=round(L,4),M=round(M,5),S=round(S,6),maxerr=float(np.abs(r.fun).max())))
  print('max fit err',max(r['maxerr'] for r in rows))
  for r in rows[::24]: print(r)
  return rows
res={'male':run(sys.argv[1]),'female':run(sys.argv[2])}
json.dump({k:[{a:r[a] for a in ('age','L','M','S')} for r in v] for k,v in res.items()},open(sys.argv[3],'w'),indent=0)
