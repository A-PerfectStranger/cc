import re,json
from pathlib import Path
pages=Path('/tmp/cc.txt').read_text().split('\f')
lines=[]
for page in pages:
 m=re.search(r'Page (\d+) of 297',page)
 if not m or not 36<=int(m[1])<=156: continue
 for l in page.splitlines():
  l=l.strip()
  if not l or re.match(r'^(Page \d+|November 2022|Class F[A-Z]{2}:)',l): continue
  lines.append((l,int(m[1])))
classes=[]; family=None; component=None; element=None; section=None
for l,p in lines:
 m=re.match(r'^\d+\s+Class (F[A-Z]{2}): (.+)',l)
 if m:
  cls={'id':m[1],'name':m[2],'families':[]};classes.append(cls);family=None;component=None;element=None;continue
 m=re.match(r'^\d+\.\d+\s+(.+?)\s*\((F[A-Z]{2}_[A-Z]+)\)',l)
 if m:
  family={'id':m[2],'name':m[1],'page':p,'description':'','components':[]};cls['families'].append(family); component=None;element=None;section=None;continue
 m=re.match(r'^\d+\.\d+\.\d+\s+(F[A-Z]{2}_[A-Z]+\.\d+)\s+(.+)',l)
 if m:
  component={'id':m[1],'name':m[2],'page':p,'elements':[],'relationships':''};family['components'].append(component);element=None;continue
 m=re.match(r'^(F[A-Z]{2}_[A-Z]+\.\d+\.\d+)\s*(.*)$',l)
 if m and component and m[1].startswith(component['id']+'.'):
  element={'id':m[1],'text':m[2]};component['elements'].append(element);continue
 if re.match(r'^\d+\.\d+\.\d+\s+',l):
  section='family' if ('Family behaviour' in l or 'Family behavior' in l) else None;component=None;element=None;continue
 if element: element['text']+=' '+l
 elif component: component['relationships']+=' '+l
 elif family and section=='family': family['description']+=' '+l
for c in classes:
 for f in c['families']:
  f['description']=f['description'].strip()
  for co in f['components']:
   for e in co['elements']:
    e['text']=e['text'].strip()
    t=re.sub(r'\[assignment:.*?\]','the specified details',e['text'])
    t=re.sub(r'\[selection(?:, choose one of)?:\s*(.*?)\]',r'one of these options: \1',t)
    t=t.replace('The TSF shall be able to','The security functions must be able to').replace('The TSF shall','The security functions must').replace('The TOE shall','The product must')
    e['summary']=t
Path('/workspace/cc/public/catalogue.json').write_text(json.dumps(classes,ensure_ascii=False,indent=2))
print([(c['id'],len(c['families']),sum(len(f['components']) for f in c['families'])) for c in classes])
print('Elements',sum(len(co['elements']) for c in classes for f in c['families'] for co in f['components']))
print('Empty components',[(co['id']) for c in classes for f in c['families'] for co in f['components'] if not co['elements']])
