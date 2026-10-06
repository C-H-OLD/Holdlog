
const created=[];
await Promise.all(["Regular","Medium","Bold"].map(style=>figma.loadFontAsync({family:"Noto Sans KR",style})));
const vars=Object.fromEntries((await figma.variables.getLocalVariablesAsync()).filter(v=>v.variableCollectionId==="VariableCollectionId:4:3").map(v=>[v.name,v]));
const styles=Object.fromEntries((await figma.getLocalTextStylesAsync()).filter(s=>s.name.startsWith("Text/")).map(s=>[s.name,s]));
function fill(key){return [figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:0,g:0,b:0}},"color",vars[key])];}
function bind(n,k,key){n.setBoundVariable(k,vars[key]);}
function gaps(n,gap=0,pad=0){for(const p of ["paddingTop","paddingBottom","paddingLeft","paddingRight"])bind(n,p,"Space/"+pad);bind(n,"itemSpacing","Space/"+gap);}
function radius(n,size){for(const p of ["topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius"])bind(n,p,"Radius/"+size);}
function layout(parent,name,dir="VERTICAL",gap=0,pad=0){const n=figma.createAutoLayout(dir);n.name=name;n.fills=[];gaps(n,gap,pad);if(parent)parent.appendChild(n);return n;}
function comp(name,dir="HORIZONTAL",w=350,h=52){const n=figma.createComponent();n.name=name;n.layoutMode=dir;n.resize(w,h);n.fills=[];n.primaryAxisSizingMode="FIXED";n.counterAxisSizingMode="FIXED";n.counterAxisAlignItems="CENTER";gaps(n);n.x=100;n.y=100;return n;}
async function rawText(parent,name,content,role="Body",tone="Primary"){const t=figma.createText();t.name=name;await t.setTextStyleIdAsync(styles["Text/"+role].id);t.characters=content;t.fills=fill("Color/Text/"+tone);parent.appendChild(t);return t;}
function setContent(inst,value){const key=Object.keys(inst.componentProperties).find(k=>k.startsWith("Content#"));if(!key)throw new Error("Missing Content: "+inst.name);inst.setProperties({[key]:value});}
function textInst(parent,main,value,name){const i=main.createInstance();parent.appendChild(i);i.name=name||"Label";setContent(i,value);i.isExposedInstance=true;return i;}
function instance(parent,main,name){const i=main.createInstance();parent.appendChild(i);i.name=name;i.isExposedInstance=true;return i;}
function variantSet(parent,name,components,cols=3,colWidth=380,rowHeight=80){const s=figma.combineAsVariants(components,parent);s.name=name;s.description="Holdlog 공통 원본. 인스턴스로 재사용하고 화면에서 임의의 디자인 변경이나 연결 해제를 하지 않습니다.";s.fills=[];s.children.forEach((v,i)=>{v.x=16+(i%cols)*colWidth;v.y=16+Math.floor(i/cols)*rowHeight;});s.resizeWithoutConstraints(Math.max(...s.children.map(n=>n.x+n.width))+16,Math.max(...s.children.map(n=>n.y+n.height))+16);return s;}
async function section(board,title,note){const block=layout(board,title,"VERTICAL",12);await rawText(block,"제목",title,"Section");await rawText(block,"설명",note,"Caption","Secondary");return block;}
function allIds(roots){return [...new Set(roots.flatMap(n=>[n.id,...("findAll"in n?n.findAll().map(x=>x.id):[])]))];}

const page=await figma.getNodeByIdAsync("6:2");await figma.setCurrentPageAsync(page);
if(page.children.some(n=>n.name==="01 / Atoms"))throw new Error("Atoms already exist; inspect first.");
const board=layout(null,"01 / Atoms","VERTICAL",32,32);board.x=100;board.y=100;board.fills=fill("Color/Surface/Default");
await rawText(board,"제목","01 · 가장 작은 공통 부품","Title");
await rawText(board,"설명","글자 · 아이콘 · 구분선 · 프로필 / 검토 대기","Body","Secondary");
const map={};const sets={};
const textSection=await section(board,"글자","Content로 문구를 바꾸고, Tone으로 의미에 맞는 색을 선택합니다.");
const roles={Title:["Primary"],Section:["Primary"],Body:["Primary","Secondary","Link","Danger"],Label:["Secondary","Danger"],Caption:["Secondary","Danger"],Button:["OnAction","Link","Disabled"],Avatar:["Secondary"],AvatarSmall:["Secondary"]};
for(const [role,tones]of Object.entries(roles)){
 const variants=[];
 for(const tone of tones){
 const c=comp("Tone="+tone,"HORIZONTAL",100,30);c.primaryAxisSizingMode="AUTO";c.counterAxisSizingMode="AUTO";const t=await rawText(c,"Content",role==="Avatar"?"민":role==="AvatarSmall"?"민":role==="Title"?"프로필 수정":role==="Button"?"저장":role==="Caption"?"안내 문구":"이름과 계정",role,tone);
 if(tone==="Danger")t.fills=fill("Color/Status/Danger");
 const k=c.addComponentProperty("Content","TEXT",t.characters);t.componentPropertyReferences={characters:k};variants.push(c);map["Text/"+role+"/"+tone]=c.id;
 }
 const s=variantSet(textSection,"Primitive/Text/"+role,variants,4,250,72);sets[s.name]=s.id;
}
const iconsSection=await section(board,"아이콘","라이브러리 원본을 감싼 공통 부품. Google은 공식 SVG 원본 색상을 유지합니다.");
const iconRow=layout(iconsSection,"Icons","HORIZONTAL",24);
const imports=[];
for(const [name,key,tone]of [["ArrowLeft","ae5f850b1184d211331653bf569a037fa79b3122","Color/Text/Secondary"],["ChevronRight","fe0b03d7163766975df53c0a6dbf5d1f7d3491b1","Color/Text/Secondary"],["Trash","4061103dec468a50bb1a0a72324e8cb11ce2a77a","Color/Status/Danger"]]){
 const remote=await figma.importComponentByKeyAsync(key);imports.push({name,key,id:remote.id});
 const c=comp("Primitive/Icon/"+name,"HORIZONTAL",24,24);c.primaryAxisAlignItems="CENTER";bind(c,"width","Size/Icon");bind(c,"height","Size/Icon");const i=remote.createInstance();c.appendChild(i);i.name="Library glyph";i.resize(24,24);
 for(const n of i.findAll()){if("fills"in n&&Array.isArray(n.fills)&&n.fills.length)n.fills=n.fills.map(p=>p.type==="SOLID"?fill(tone)[0]:p);if("strokes"in n&&Array.isArray(n.strokes)&&n.strokes.length)n.strokes=n.strokes.map(p=>p.type==="SOLID"?fill(tone)[0]:p);}
 c.description="외부 아이콘 원본을 재사용한 Holdlog 아이콘. 색상은 이 원본에서 공통 관리.";iconRow.appendChild(c);map["Icon/"+name]=c.id;
}
const g=comp("Primitive/Icon/Google","HORIZONTAL",32,32);g.primaryAxisAlignItems="CENTER";bind(g,"width","Size/ProviderIcon");bind(g,"height","Size/ProviderIcon");
const svg=figma.createNodeFromSvg("<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\"><path d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\" fill=\"#4285F4\"/><path d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\" fill=\"#34A853\"/><path d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\" fill=\"#FBBC05\"/><path d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\" fill=\"#EA4335\"/><path d=\"M1 1h22v22H1z\" fill=\"none\"/></svg>");svg.name="Google official G";svg.resize(32,32);g.appendChild(svg);
for(const n of svg.findAll()){if("fills"in n&&Array.isArray(n.fills)){n.fills=n.fills.map(p=>{if(p.type!=="SOLID")return p;const col=p.color;let key=col.b>0.8?"Blue":col.r>0.95?"Yellow":col.g>0.5?"Green":"Red";return fill("Color/Brand/Google/"+key)[0];});}}
g.description="Google 공식 로고 · https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg";iconRow.appendChild(g);map["Icon/Google"]=g.id;
const dataSection=await section(board,"구분선 · 프로필","사진이 없는 프로필은 이름 한 글자를 사용합니다. 크기는 36 또는 112입니다.");
const divider=comp("Primitive/Divider","HORIZONTAL",350,1);divider.fills=fill("Color/Border/Default");dataSection.appendChild(divider);map.Divider=divider.id;
const avatars=[];
for(const size of ["Small","Large"]){const c=comp("Size="+size,"HORIZONTAL",size==="Small"?36:112,size==="Small"?36:112);c.primaryAxisAlignItems="CENTER";c.fills=fill("Color/Surface/Avatar");radius(c,999);bind(c,"width",size==="Small"?"Size/AvatarSmall":"Size/Avatar");bind(c,"height",size==="Small"?"Size/AvatarSmall":"Size/Avatar");const main=await figma.getNodeByIdAsync(map["Text/"+(size==="Small"?"AvatarSmall":"Avatar")+"/Secondary"]);textInst(c,main,"민","Initial");avatars.push(c);map["Avatar/"+size]=c.id;}
const as=variantSet(dataSection,"Data/Avatar",avatars,2,180,150);sets[as.name]=as.id;
await board.screenshot();
return {createdNodeIds:allIds([board]),board:{id:board.id,width:board.width,height:board.height},components:map,sets,imports,validation:{textVariants:Object.values(roles).reduce((s,a)=>s+a.length,0),icons:4,avatarVariants:2}};

