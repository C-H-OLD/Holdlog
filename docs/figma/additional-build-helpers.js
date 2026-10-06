// Figma Console scripts prepend this helper after selecting a page.
// Uses the bundled bindVariablesToComponent helper and existing local primitives.
const touched=[];
const vars=new Map((await figma.variables.getLocalVariablesAsync()).map(v=>[v.name,v]));
for(const style of ['Regular','Medium','Bold'])await figma.loadFontAsync({family:'Noto Sans KR',style});
const get=async id=>await figma.getNodeByIdAsync(id);
function paint(name){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',vars.get(name));}
function token(n,p,name){n.setBoundVariable(p,vars.get(name));}
function mark(n){touched.push(n.id);return n;}
function content(n,value){const p=Object.keys(n.componentProperties).find(k=>n.componentProperties[k].type==='TEXT');if(p)n.setProperties({[p]:value});else{const child=n.findOne(c=>c.type==='INSTANCE'&&Object.values(c.componentProperties).some(v=>v.type==='TEXT'));if(child)content(child,value);}return n;}
async function inst(id){return mark((await get(id)).createInstance());}
async function txt(value,kind='Body',width=350,tone='Primary'){
 const ids={Body:'7:14',Secondary:'7:16',Caption:'7:28',Label:'7:23',Section:'7:11',Title:'7:8',Display:'153:294'};
 const n=await inst(ids[kind]);content(n,value);if(kind==='Body'&&tone!=='Primary')n.setProperties({Tone:tone});n.resize(width,n.height);return n;
}
async function button(value,width=350,style='Primary'){const n=await inst(style==='Secondary'?'478:37090':style==='Danger'?'10:31':'10:13');content(n,value);n.resize(width,52);return n;}
async function layout(name,width,axis='VERTICAL',gap=16,padding=0,component=false){
 const n=mark(component?figma.createComponent():figma.createFrame());n.name=name;n.resize(width,1);n.fills=[];n.layoutMode=axis;n.primaryAxisSizingMode=axis==='HORIZONTAL'?'FIXED':'AUTO';n.counterAxisSizingMode=axis==='HORIZONTAL'?'AUTO':'FIXED';n.counterAxisAlignItems=axis==='HORIZONTAL'?'CENTER':'MIN';
 const bindings={itemSpacing:vars.get('Space/'+gap).id};for(const p of ['paddingLeft','paddingRight','paddingTop','paddingBottom'])bindings[p]=vars.get('Space/'+padding).id;await bindVariablesToComponent(n,bindings);return n;
}
function add(p,n,fill=false){p.appendChild(n);if(fill)n.layoutSizingHorizontal='FILL';return n;}
async function divider(width=350){const n=await inst('7:80');n.resize(width,1);return n;}
async function component(name,width,axis='VERTICAL',gap=16,padding=0){
 const existing=figma.currentPage.findOne(n=>n.type==='COMPONENT'&&n.name===name);if(existing)throw Error('Existing component '+name);
 const n=await layout(name,width,axis,gap,padding,true);n.description='Holdlog shared component. Reuse linked instances; content and state are editable. New screen inventory 2026-10-02.';return n;
}
async function librarySection(){let n=figma.currentPage.children.find(n=>n.name==='12 / Additional screens');if(!n){n=mark(figma.createSection());n.name='12 / Additional screens';n.x=100;n.y=36300;n.resizeWithoutConstraints(2200,12000);n.fills=[paint('Section/Components')];}return n;}
function organize(sec,list){let y=60;for(const n of list){sec.appendChild(n);n.x=40;n.y=y;y+=n.height+80;}sec.resizeWithoutConstraints(Math.max(900,...list.map(n=>n.width+80)),y+40);}
async function header(title){const n=await inst('473:33103');content(n.children.find(n=>n.name==='Title'),title);return n;}
async function fullScreenComponent(name,title,body,action){const n=await component(name,390,'VERTICAL',24,20);n.fills=[paint('Color/Surface/Default')];add(n,await header(title));add(n,body.createInstance());if(action)add(n,action);return n;}
async function spec(key,title,lines,source){const n=await inst('493:44481');n.name='기능 명세 | '+key;content(n.children.find(n=>n.name==='Title'),key+' '+title);content(n.children.find(n=>n.name==='Details'),lines.map(([h,b])=>h+'\n'+b.split('\n').map(s=>'• '+s).join('\n')).join('\n\n'));content(n.children.find(n=>n.name==='Source'),'원문: 화면 설계 '+key+' · 기능 명세 '+source+'\n문서 기준 2026-10-02');return n;}
async function screenFrame(name,height=844){const f=mark(figma.createFrame());f.name=name;f.resize(390,height);f.fills=[paint('Color/Surface/Default')];f.clipsContent=true;return f;}
function screenPlace(sec,f,x,y){sec.appendChild(f);f.x=x;f.y=y;return f;}
