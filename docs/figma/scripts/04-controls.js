
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
function textInst(parent,main,value,name){const i=main.createInstance();parent.appendChild(i);i.name=name||"Label";setContent(i,value);i.isExposedInstance=true;i.layoutSizingHorizontal="FILL";return i;}
function instance(parent,main,name){const i=main.createInstance();parent.appendChild(i);i.name=name;return i;}
function variantSet(parent,name,components,cols=3,colWidth=380,rowHeight=80){const s=figma.combineAsVariants(components,parent);s.name=name;s.description="Holdlog 공통 원본. 인스턴스로 재사용하고 화면에서 임의의 디자인 변경이나 연결 해제를 하지 않습니다.";s.fills=[];s.children.forEach((v,i)=>{v.x=16+(i%cols)*colWidth;v.y=16+Math.floor(i/cols)*rowHeight;});s.resizeWithoutConstraints(Math.max(...s.children.map(n=>n.x+n.width))+16,Math.max(...s.children.map(n=>n.y+n.height))+16);return s;}
async function section(board,title,note){const block=layout(board,title,"VERTICAL",12);await rawText(block,"제목",title,"Section");await rawText(block,"설명",note,"Caption","Secondary");return block;}
function allIds(roots){return [...new Set(roots.flatMap(n=>[n.id,...("findAll"in n?n.findAll().map(x=>x.id):[])]))];}

const page=await figma.getNodeByIdAsync("6:2");await figma.setCurrentPageAsync(page);
const atomIds={"Text/Title/Primary":"7:8","Text/Section/Primary":"7:11","Text/Body/Primary":"7:14","Text/Body/Secondary":"7:16","Text/Body/Link":"7:18","Text/Body/Danger":"7:20","Text/Label/Secondary":"7:23","Text/Label/Danger":"7:25","Text/Caption/Secondary":"7:28","Text/Caption/Danger":"7:30","Text/Button/OnAction":"7:33","Text/Button/Link":"7:35","Text/Button/Disabled":"7:37","Text/Avatar/Secondary":"7:40","Text/AvatarSmall/Secondary":"7:43","Icon/ArrowLeft":"7:57","Icon/ChevronRight":"7:62","Icon/Trash":"7:67","Icon/Google":"7:70","Divider":"7:80","Avatar/Small":"7:81","Avatar/Large":"7:84"};
const atoms={};for(const [k,id] of Object.entries(atomIds))atoms[k]=await figma.getNodeByIdAsync(id);
const mutated=[];
for(const [key,c]of Object.entries(atoms)){if(!key.startsWith("Text/"))continue;const t=c.findOne(n=>n.type==="TEXT");c.layoutMode="VERTICAL";c.primaryAxisSizingMode="AUTO";c.counterAxisSizingMode="FIXED";c.resize(key.includes("/Title/")?300:key.includes("/Avatar")?112:200,c.height);t.textAutoResize="HEIGHT";t.resize(c.width,t.height);t.layoutSizingHorizontal="FILL";if(key.includes("/Button/")||key.includes("/Avatar"))t.textAlignHorizontal="CENTER";mutated.push(c.id,t.id);}
const bodySet=await figma.getNodeByIdAsync("7:22");bodySet.resizeWithoutConstraints(1000,64);
const board=layout(null,"02 / Controls","VERTICAL",32,32);board.x=1200;board.y=100;board.fills=fill("Color/Surface/Default");
await rawText(board,"제목","02 · 행동과 입력 부품","Title");await rawText(board,"설명","기본 부품의 인스턴스로 구성 · 상태와 내용만 변경","Body","Secondary");
const map={},sets={};
const bs=await section(board,"버튼","Style: Primary / Link / Danger   ·   State: Default / Pressed / Disabled");
const buttons=[];
for(const style of ["Primary","Link","Danger"])for(const state of ["Default","Pressed","Disabled"]){
 const c=comp("Style="+style+", State="+state,"HORIZONTAL",300,style==="Link"?44:52);c.primaryAxisAlignItems="CENTER";gaps(c,8,12);bind(c,"height",style==="Link"?"Size/Touch":"Size/Button");radius(c,12);
 c.fills=style==="Link"?[]:fill(state==="Disabled"?"Color/Surface/Disabled":style==="Danger"?(state==="Pressed"?"Color/Status/DangerPressed":"Color/Status/Danger"):(state==="Pressed"?"Color/Action/Pressed":"Color/Action/Primary"));
 textInst(c,atoms["Text/Button/"+(state==="Disabled"?"Disabled":style==="Link"?"Link":"OnAction")],style==="Link"?"사진 변경":style==="Danger"?"삭제":"저장","Label");
 if(style==="Link"&&state==="Pressed")c.fills=fill("Color/Surface/Input");
 buttons.push(c);map["Button/"+style+"/"+state]=c.id;
}
sets.Button=variantSet(bs,"Control/Button",buttons,3,332,76).id;
const is=await section(board,"아이콘 버튼","최소 44 × 44 누르기 영역 · Icon 속성으로 아이콘 교체");
const ib=comp("Control/IconButton","HORIZONTAL",44,44);ib.primaryAxisAlignItems="CENTER";bind(ib,"width","Size/Touch");bind(ib,"height","Size/Touch");radius(ib,12);
const icon=instance(ib,atoms["Icon/ArrowLeft"],"Icon");const ik=ib.addComponentProperty("Icon","INSTANCE_SWAP",atoms["Icon/ArrowLeft"].id);icon.componentPropertyReferences={mainComponent:ik};is.appendChild(ib);map.IconButton=ib.id;
const fs=await section(board,"입력칸","State: Default / Focused / Error / Disabled · Value는 내용, Helper는 오류 안내");
const fields=[];
for(const state of ["Default","Focused","Error","Disabled"]){
 const c=comp("State="+state,"VERTICAL",300,80);c.primaryAxisSizingMode="AUTO";gaps(c,8);c.counterAxisAlignItems="MIN";
 textInst(c,atoms["Text/Label/Secondary"],"이름","Label");
 const field=layout(c,"Input surface","HORIZONTAL",8,12);field.resize(300,48);field.layoutSizingHorizontal="FILL";field.layoutSizingVertical="FIXED";bind(field,"height","Size/Input");field.counterAxisAlignItems="CENTER";radius(field,8);field.fills=fill(state==="Disabled"?"Color/Surface/Disabled":"Color/Surface/Input");
 if(state==="Focused"||state==="Error"){field.strokes=fill(state==="Error"?"Color/Status/Danger":"Color/Border/Focus");bind(field,"strokeWeight","Stroke/Focus");}
 textInst(field,atoms["Text/Body/"+(state==="Disabled"?"Secondary":"Primary")],"민수","Value");
 if(state==="Error")textInst(c,atoms["Text/Caption/Danger"],"이름을 입력해 주세요.","Helper");
 fields.push(c);map["TextField/"+state]=c.id;
}
sets.TextField=variantSet(fs,"Control/TextField",fields,2,332,136).id;
const ms=await section(board,"메뉴 행","기본·위험 동작 모두 같은 높이와 정렬 · 아이콘과 문구 교체 가능");
const rows=[];
for(const tone of ["Default","Danger"]){
 const c=comp("Tone="+tone,"VERTICAL",350,70);c.primaryAxisSizingMode="AUTO";
 const top=instance(c,atoms.Divider,"Divider top");top.layoutSizingHorizontal="FILL";
 const row=layout(c,"Row content","HORIZONTAL",16);row.resize(350,68);row.layoutSizingHorizontal="FILL";row.layoutSizingVertical="FIXED";bind(row,"height","Size/Row");row.counterAxisAlignItems="CENTER";
 const leading=instance(row,atoms[tone==="Danger"?"Icon/Trash":"Icon/ArrowLeft"],"Leading icon");const prop=c.addComponentProperty("Icon","INSTANCE_SWAP",atoms[tone==="Danger"?"Icon/Trash":"Icon/ArrowLeft"].id);leading.componentPropertyReferences={mainComponent:prop};
 textInst(row,atoms["Text/Body/"+(tone==="Danger"?"Danger":"Primary")],tone==="Danger"?"계정 삭제":"메뉴 이름","Label");
 instance(row,atoms["Icon/ChevronRight"],"Trailing icon");
 const bottom=instance(c,atoms.Divider,"Divider bottom");bottom.layoutSizingHorizontal="FILL";
 rows.push(c);map["MenuRow/"+tone]=c.id;
}
sets.MenuRow=variantSet(ms,"Navigation/MenuRow",rows,2,382,110).id;
await board.screenshot({scale:0.85});
return {createdNodeIds:allIds([board]),mutatedNodeIds:[...mutated,bodySet.id],board:{id:board.id,width:board.width,height:board.height},components:map,sets,validation:{buttonVariants:9,fieldVariants:4,rowVariants:2,iconButtonTouch:44}};

