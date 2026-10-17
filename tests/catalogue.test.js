const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/catalogue.json')));
const families=data.flatMap(c=>c.families), components=families.flatMap(f=>f.components),elements=components.flatMap(c=>c.elements);
test('complete CC:2022 catalogue and unique IDs',()=>{
 assert.equal(data.length,11);assert.equal(families.length,74);assert.equal(components.length,156);assert.equal(elements.length,284);
 for(const entries of [data,families,components,elements]) assert.equal(new Set(entries.map(x=>x.id)).size,entries.length);
});
test('elements belong to their component and preserve normative text',()=>{
 for(const c of components){assert.ok(c.page>=36&&c.page<=156);if(c.id==='FCS_CKM.4'){assert.equal(c.elements.length,0);assert.match(c.relationships,/deprecated/);continue;}
 assert.ok(c.elements.length);for(const e of c.elements){assert.ok(e.id.startsWith(c.id+'.'));assert.ok(e.text.length>20);assert.match(e.text,/shall/);}}
});
test('family entries have definitions and components',()=>{for(const f of families){assert.ok(f.description.length>20,f.id);assert.ok(f.components.length,f.id);}});
