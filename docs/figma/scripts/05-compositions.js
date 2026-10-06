
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

await figma.setCurrentPageAsync(await figma.getNodeByIdAsync("6:2"));
const ids={"Text/Title/Primary":"7:8","Text/Section/Primary":"7:11","Text/Body/Primary":"7:14","Text/Body/Secondary":"7:16","Text/Body/Link":"7:18","Text/Body/Danger":"7:20","Text/Label/Secondary":"7:23","Text/Label/Danger":"7:25","Text/Caption/Secondary":"7:28","Text/Caption/Danger":"7:30","Text/Button/OnAction":"7:33","Text/Button/Link":"7:35","Text/Button/Disabled":"7:37","Text/Avatar/Secondary":"7:40","Text/AvatarSmall/Secondary":"7:43","Icon/ArrowLeft":"7:57","Icon/ChevronRight":"7:62","Icon/Trash":"7:67","Icon/Google":"7:70","Divider":"7:80","Avatar/Small":"7:81","Avatar/Large":"7:84","Button/Primary/Default":"10:13","Button/Primary/Pressed":"10:16","Button/Primary/Disabled":"10:19","Button/Link/Default":"10:22","Button/Link/Pressed":"10:25","Button/Link/Disabled":"10:28","Button/Danger/Default":"10:31","Button/Danger/Pressed":"10:34","Button/Danger/Disabled":"10:37","IconButton":"10:44","TextField/Default":"10:51","TextField/Focused":"10:57","TextField/Error":"10:63","TextField/Disabled":"10:71","MenuRow/Default":"10:81","MenuRow/Danger":"10:93"};const m={};for(const[k,id]of Object.entries(ids))m[k]=await figma.getNodeByIdAsync(id);
const board=layout(null,"03 / Compositions","VERTICAL",32,32);board.x=2380;board.y=100;board.fills=fill("Color/Surface/Default");
await rawText(board,"제목","03 · 화면에서 다시 쓰는 묶음","Title");await rawText(board,"설명","상단 · 프로필 · 계정 정보 · 하단 행동 / 모두 작은 부품의 인스턴스","Body","Secondary");
const map={};
const hs=await section(board,"화면 상단","뒤로 가기 + 제목 · 하위 화면에서 함께 사용");
const header=comp("Navigation/PageHeader","VERTICAL",350,104);header.primaryAxisSizingMode="AUTO";header.counterAxisAlignItems="MIN";gaps(header,16);
instance(header,m.IconButton,"Back button");
textInst(header,m["Text/Title/Primary"],"프로필 수정","Title");
header.description="하위 화면 공통 상단. Back button은 이전 화면, Title의 Content로 제목 변경.";hs.appendChild(header);map.PageHeader=header.id;
const ps=await section(board,"프로필 편집 영역","Avatar와 사진 변경 버튼을 한 묶음으로 재사용");
const hero=comp("Profile/AvatarEditor","VERTICAL",350,164);hero.primaryAxisSizingMode="AUTO";hero.counterAxisAlignItems="CENTER";gaps(hero,8);
const av=instance(hero,m["Avatar/Large"],"Avatar");av.isExposedInstance=true;
const link=instance(hero,m["Button/Link/Default"],"Change photo");link.resize(120,44);link.isExposedInstance=true;
hero.description="이니셜은 Avatar 내부 Initial의 Content, 사진 변경 문구는 Change photo 내부 Label의 Content로 관리.";ps.appendChild(hero);map.AvatarEditor=hero.id;
const as=await section(board,"로그인 계정 정보","읽기 전용 · 제공자 로고와 이름, 이메일");
const account=comp("Account/Identity","VERTICAL",350,88);account.primaryAxisSizingMode="AUTO";gaps(account,16);account.counterAxisAlignItems="MIN";
textInst(account,m["Text/Label/Secondary"],"로그인 계정","Label");
const row=layout(account,"Identity row","HORIZONTAL",16);row.resize(350,52);row.layoutSizingHorizontal="FILL";row.counterAxisAlignItems="CENTER";
const provider=instance(row,m["Icon/Google"],"Provider icon");const pk=account.addComponentProperty("Provider icon","INSTANCE_SWAP",m["Icon/Google"].id);provider.componentPropertyReferences={mainComponent:pk};
const tx=layout(row,"Identity text","VERTICAL",4);tx.layoutSizingHorizontal="FILL";
textInst(tx,m["Text/Body/Secondary"],"Google 계정","Provider");
textInst(tx,m["Text/Caption/Secondary"],"minsu@example.com","Email");
account.description="로그인 계정은 읽기 전용. 제공자 아이콘은 교체 속성, 제공자 이름과 이메일은 각각 Content로 변경.";as.appendChild(account);map.Identity=account.id;
const fs=await section(board,"하단 주요 행동","화면 좌우 20 · 위아래 24 · 버튼 높이 52");
const footer=comp("Navigation/BottomAction","VERTICAL",390,100);footer.primaryAxisSizingMode="AUTO";gaps(footer,0,24);bind(footer,"paddingLeft","Space/20");bind(footer,"paddingRight","Space/20");footer.fills=fill("Color/Surface/Default");
const action=instance(footer,m["Button/Primary/Default"],"Action");action.layoutSizingHorizontal="FILL";action.isExposedInstance=true;
footer.description="하단 공통 행동 영역. Action의 상태와 Label만 변경. 작은 화면에서는 내용 영역을 스크롤.";fs.appendChild(footer);map.BottomAction=footer.id;
await board.screenshot({scale:1});
return {createdNodeIds:allIds([board]),board:{id:board.id,width:board.width,height:board.height},components:map,validation:{compositions:4,rawTextInsideComponents:[header,hero,account,footer].flatMap(c=>c.children.filter(n=>n.type==="TEXT")).length}};

