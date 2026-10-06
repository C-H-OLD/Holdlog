const created=[],mutated=[];
await Promise.all(["Regular","Medium","Bold"].map(style=>figma.loadFontAsync({family:"Noto Sans KR",style})));
const vars=Object.fromEntries((await figma.variables.getLocalVariablesAsync()).map(v=>[v.name,v]));
const styles=Object.fromEntries((await figma.getLocalTextStylesAsync()).map(s=>[s.name,s]));
function fill(name){return [figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:0,g:0,b:0}},"color",vars[name])];}
function bind(n,k,v){n.setBoundVariable(k,vars[v]);}
let page=figma.root.children.find(p=>p.name==="00 Foundations");
if(!page){page=await figma.getNodeByIdAsync("0:1");page.name="00 Foundations";mutated.push(page.id);}
for(const name of ["01 Components","02 Screens"]){if(!figma.root.children.find(p=>p.name===name)){const p=figma.createPage();p.name=name;created.push(p.id);}}
await figma.setCurrentPageAsync(page);
if(page.children.some(c=>c.name==="Holdlog / Foundations"))throw new Error("Foundation documentation exists");
const doc=figma.createAutoLayout("VERTICAL");doc.name="Holdlog / Foundations";doc.x=100;doc.y=100;doc.resize(1120,100);doc.layoutSizingHorizontal="FIXED";doc.fills=fill("Color/Surface/Default");
for(const k of ["paddingTop","paddingBottom","paddingLeft","paddingRight"])bind(doc,k,"Space/40");bind(doc,"itemSpacing","Space/24");
async function text(parent,name,value,style="Text/Body",color="Color/Text/Primary"){const t=figma.createText();t.name=name;await t.setTextStyleIdAsync(styles[style].id);t.characters=value;t.fills=fill(color);parent.appendChild(t);return t;}
await text(doc,"제목","Holdlog · 공통 디자인 기준","Text/Title");
await text(doc,"원칙","작은 부품을 먼저 만들고, 원본에 연결된 복사본으로 화면을 조립합니다.","Text/Body","Color/Text/Secondary");
await text(doc,"상태","v0.1 · 검토 대기  /  모바일 390  /  Noto Sans KR  /  밝은 화면","Text/Caption","Color/Text/Secondary");
await text(doc,"색상 제목","01  같은 역할에는 같은 색","Text/Section");
const row=figma.createAutoLayout("HORIZONTAL");row.name="색상 견본";row.fills=[];bind(row,"itemSpacing","Space/16");doc.appendChild(row);
for(const [name,key,hex]of [["주요 행동","Color/Action/Primary","#512AFF"],["기본 글자","Color/Text/Primary","#151820"],["보조 글자","Color/Text/Secondary","#515B80"],["입력 배경","Color/Surface/Input","#F3F4F7"],["구분선","Color/Border/Default","#DDE1EC"],["위험 동작","Color/Status/Danger","#D92D20"]]){
const card=figma.createAutoLayout("VERTICAL");card.name=name;card.fills=[];card.resize(154,100);card.layoutSizingHorizontal="FIXED";bind(card,"itemSpacing","Space/8");row.appendChild(card);
const sw=figma.createRectangle();sw.name=key;sw.resize(154,56);sw.fills=fill(key);card.appendChild(sw);bind(sw,"topLeftRadius","Radius/8");bind(sw,"topRightRadius","Radius/8");bind(sw,"bottomLeftRadius","Radius/8");bind(sw,"bottomRightRadius","Radius/8");
await text(card,"이름",name,"Text/Label");await text(card,"값",hex,"Text/Caption","Color/Text/Secondary");
}
await text(doc,"글자 제목","02  글자도 원본 스타일로 통일","Text/Section");
for(const [name,content]of [["Text/Title","프로필 수정 · 제목 32 / 44"],["Text/Section","같은 화면 경험 · 소제목 20 / 28"],["Text/Body","이름과 계정 정보를 확인해 주세요. · 본문 16 / 24"],["Text/Label","이름 · 항목 이름 14 / 20"],["Text/Caption","minsu@example.com · 보조 글자 14 / 20"],["Text/Button","저장 · 버튼 16 / 24"]])await text(doc,name,content,name);
await text(doc,"간격 제목","03  일정한 간격과 누르기 영역","Text/Section");
await text(doc,"간격 설명","간격 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48   /   화면 좌우 20\n버튼 높이 52   /   아이콘 버튼 44 × 44   /   입력칸 48   /   메뉴 행 68","Text/Body","Color/Text/Secondary");
await text(doc,"사용 원칙","사용 순서: 공통 값 → 글자·아이콘 → 버튼·입력칸 → 공통 묶음 → 화면\n화면에서는 문구·사진·상태만 바꿉니다. 원본 연결을 끊거나 색상·간격을 따로 바꾸지 않습니다.","Text/Body","Color/Text/Secondary");
created.push(doc.id,...doc.findAll().map(n=>n.id));
await doc.screenshot({scale:1});
return {createdNodeIds:created,mutatedNodeIds:mutated,pages:figma.root.children.map(p=>({id:p.id,name:p.name})),documentation:{id:doc.id,width:doc.width,height:doc.height}};
