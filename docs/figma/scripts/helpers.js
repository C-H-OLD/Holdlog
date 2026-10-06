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
