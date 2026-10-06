// 최초 조립 기록. 최종 원본·검증은 place-views-2026-10-01.json을 기준으로 한다.
// 실행 단계: 공통 원본 -> 묶음 -> 화면. 기존 화면을 변경하지 않는다.
await figma.loadAllPagesAsync();
await Promise.all(['Regular','Medium','Bold'].map(style=>figma.loadFontAsync({family:'Noto Sans KR',style})));
const page=await figma.getNodeByIdAsync('6:2');
const screensPage=await figma.getNodeByIdAsync('6:3');
if(screensPage.children.some(n=>n.name==='03 암장'))throw Error('이미 제작된 암장 Section이 있습니다. 중복 생성하지 않습니다.');
const vars=Object.fromEntries((await figma.variables.getLocalVariablesAsync()).map(v=>[v.name,v]));
const styles=Object.fromEntries((await figma.getLocalTextStylesAsync()).map(s=>[s.name,s]));
const semantic=await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:4:3');
const made=[];
function token(name,value,type='FLOAT'){
 if(vars[name])return vars[name];
 const v=figma.variables.createVariable(name,semantic,type);v.setValueForMode(semantic.defaultModeId,value);vars[name]=v;return v;
}
function sz(n,key,val,label){const v=token(label||('Size/Place/'+key+'/'+val),val);n.setBoundVariable(key,v);}
function fill(key){return [figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',vars[key])];}
function bind(n,key,name){n.setBoundVariable(key,vars[name]);}
function rad(n,r){for(const p of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])bind(n,p,'Radius/'+r);}
function gaps(n,g=0,p=0){bind(n,'itemSpacing','Space/'+g);for(const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight'])bind(n,k,'Space/'+p);}
const section=figma.createSection();page.appendChild(section);section.name='08 / Place views';section.x=2050;section.y=7390;section.fills=fill('Section/Components');section.resizeWithoutConstraints(2150,6000);
function root(name,w,h,dir='NONE'){
 const n=figma.createComponent();section.appendChild(n);n.name=name;n.fills=[];n.resize(w,h);sz(n,'width',w);sz(n,'height',h);n.layoutMode=dir;
 if(dir!=='NONE'){n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';n.counterAxisAlignItems='CENTER';gaps(n);}
 rad(n,0);made.push(n);return n;
}
function layout(p,name,w,h,dir='VERTICAL',gap=0,pad=0){const n=figma.createFrame();p.appendChild(n);n.name='Layout/'+name;n.fills=[];n.layoutMode=dir;n.resize(w,h);sz(n,'width',w);sz(n,'height',h);n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';gaps(n,gap,pad);rad(n,0);return n;}
function setText(i,value){const key=Object.keys(i.componentProperties).find(k=>k.startsWith('Content#'));if(!key)throw Error('Content missing '+i.name);i.setProperties({[key]:value});}
function inst(p,c,name,x,y){const i=c.createInstance();p.appendChild(i);if(name)i.name=name;if(x!==undefined){i.x=x;i.y=y;}return i;}
const src={};for(const id of ['7:8','7:11','7:14','7:16','7:18','7:28','7:33','7:35','410:4333','142:209','153:294','157:294','140:223','241:451','10:13','10:19','430:9343','144:260','335:758','143:223','234:462','234:468','234:449','144:237','7:80','150:311'])src[id]=await figma.getNodeByIdAsync(id);
function text(p,source,value,w,x,y,name){const i=inst(p,src[source]||source,name||'Label',x,y);setText(i,value);if(w){i.resize(w,i.height);i.setBoundVariable('width',null);}return i;}
function full(i){i.layoutSizingHorizontal='FILL';return i;}
function variants(name,cs){const set=figma.combineAsVariants(cs,section);set.name=name;set.fills=[];set.children.forEach((n,i)=>{n.x=20+i*400;n.y=20;});set.resizeWithoutConstraints(Math.max(...cs.map(c=>c.x+c.width))+20,Math.max(...cs.map(c=>c.y+c.height))+20);made.splice(0,made.length,...made.filter(n=>!cs.includes(n)),set);return set;}
async function glyph(name,svg,tone='Color/Text/Secondary'){
 const c=root(name,24,24);const artwork=figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">'+svg+'</svg>');c.appendChild(artwork);artwork.x=0;artwork.y=0;
 for(const n of artwork.findAll()){if('strokes'in n&&n.strokes.length)n.strokes=fill(tone);if('fills'in n&&n.fills.length)n.fills=fill(tone);}return c;
}
const info=await glyph('Primitive/Icon/Info/Regular','<circle cx="12" cy="12" r="9" fill="none" stroke="#515b80" stroke-width="1.8"/><path d="M12 10.5V17" stroke="#515b80" stroke-width="1.8"/><circle cx="12" cy="7.4" r="1" fill="#515b80"/>');
const locate=await glyph('Primitive/Icon/Locate/Regular','<circle cx="12" cy="12" r="7" fill="none" stroke="#515b80" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="#515b80"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4" stroke="#515b80" stroke-width="1.8"/>');
const arrow=await glyph('Primitive/Icon/ArrowRight/Regular','<path d="M2 12h19m-5-5 5 5-5 5" stroke="#515b80" stroke-width="1.5" fill="none"/>','Color/Text/Muted');
const emphasis=root('Primitive/Text/Emphasis/Link',200,24,'VERTICAL');
const et=figma.createText();emphasis.appendChild(et);await et.setTextStyleIdAsync(styles['Text/Button'].id);et.characters='새로운 벽 평균 75%';et.textAlignHorizontal='LEFT';et.textAutoResize='HEIGHT';et.resize(200,24);et.layoutSizingHorizontal='FILL';et.fills=fill('Color/Text/Link');et.componentPropertyReferences={characters:emphasis.addComponentProperty('Content','TEXT',et.characters)};
const iconLinkCs=[];
for(const tone of ['Link','Secondary']){
 const c=root('Tone='+tone,82,24,'HORIZONTAL');gaps(c,4);text(c,tone==='Link'?'7:18':'7:16','암장 정보',62);const ic=inst(c,src['143:223'],'Chevron');
 for(const n of ic.findAll()){if('strokes'in n&&n.strokes.length)n.strokes=fill('Color/Text/'+tone);if('fills'in n&&n.fills.length)n.fills=fill('Color/Text/'+tone);}iconLinkCs.push(c);
}
const linkSet=variants('Control/InlineChevronLink',iconLinkCs);
const radioCs=[];
for(const state of ['Selected','Default']){
 const c=root('State='+state,24,24);const ring=figma.createEllipse();c.appendChild(ring);ring.resize(20,20);ring.x=2;ring.y=2;ring.fills=[];ring.strokes=fill(state==='Selected'?'Color/Action/Primary':'Color/Text/Muted');ring.strokeWeight=1.5;sz(ring,'strokeWeight',1.5,'Stroke/SelectionRing');
 if(state==='Selected'){const dot=figma.createEllipse();c.appendChild(dot);dot.resize(12,12);dot.x=6;dot.y=6;dot.fills=fill('Color/Action/Primary');}
 radioCs.push(c);
}
const radioSet=variants('Control/ChoiceCircle',radioCs);
const searchCs=[];
for(const state of ['Empty','Filled']){
 const c=root('State='+state,350,44,'HORIZONTAL');gaps(c,12,12);c.fills=fill('Color/Surface/Input');rad(c,12);inst(c,src['430:9343'],'Search');full(text(c,'7:16',state==='Empty'?'암장 이름이나 지역 검색':'피크',290));if(state==='Filled')inst(c,src['234:449'],'Clear');searchCs.push(c);
}
const searchSet=variants('Control/PlaceSearchField',searchCs);
const participant=root('Data/ParticipantInitial/Recommendation',28,28,'HORIZONTAL');participant.fills=fill('Color/Surface/Highlight');rad(participant,999);participant.primaryAxisAlignItems='CENTER';text(participant,'7:35','민',28);
const context=root('Data/PlaceRecommendationContext',350,28,'HORIZONTAL');gaps(context,8);full(text(context,'7:16','10월 2일 금요일 · 참여 3명',226));for(const char of ['민','지','수']){const i=inst(context,participant,'Participant');setText(i.children.find(n=>n.type==='INSTANCE'),char);}
// 큰 도장도 기존 그림·텍스트 원본의 크기 변형으로 추가한다.
const stampLabels=await figma.getNodeByIdAsync('407:4284');
const stampSources={};
for(const [size,fontSize,lineHeight]of [[28,5,7],[60,10,14],[84,14,20]]){
 let label=stampLabels.children.find(n=>n.name==='Size='+size+', Tone=Filled');
 if(!label){
  label=stampLabels.children.find(n=>n.name.includes('Size=44')&&n.name.includes('Filled')).clone();stampLabels.appendChild(label);label.name='Size='+size+', Tone=Filled';label.setBoundVariable('width',null);label.setBoundVariable('height',null);label.resize(Math.round(size*.73),lineHeight);
  let st=styles['Text/PlaceStampLabel/'+size];if(!st){st=figma.createTextStyle();st.name='Text/PlaceStampLabel/'+size;st.fontName={family:'Noto Sans KR',style:'Bold'};st.fontSize=fontSize;st.lineHeight={unit:'PIXELS',value:lineHeight};styles[st.name]=st;}
  const t=label.findOne(n=>n.type==='TEXT');await t.setTextStyleIdAsync(st.id);t.resize(label.width,lineHeight);t.textAlignHorizontal='CENTER';
 }
 for(const [brand,id]of [['Peak','147:223'],['Grip','147:230'],['PeakCoral','202:725']]){
  const old=await figma.getNodeByIdAsync(id);let c=old.parent.children.find(n=>n.name==='Size='+size);
  if(!c){c=old.clone();old.parent.appendChild(c);c.name='Size='+size;c.setBoundVariable('width',null);c.setBoundVariable('height',null);c.rescale(size/44);sz(c,'width',size,'Size/PlaceStamp/'+size);sz(c,'height',size,'Size/PlaceStamp/'+size);const t=c.findOne(n=>n.type==='INSTANCE');t.swapComponent(label);setText(t,brand==='Grip'?'GRIP':'PEAK');t.x=(size-t.width)/2;t.y=size*.62;}
  stampSources[brand+size]=c;
 }
}
const normalStamp=await figma.getNodeByIdAsync('430:16429');
const pinCs=[];
for(const state of ['Default','Selected']){
 const c=root('State='+state,state==='Selected'?52:32,state==='Selected'?66:46);const diameter=state==='Selected'?48:28;
 const st=inst(c,state==='Selected'?normalStamp:stampSources.Peak28,'Brand');st.x=2;st.y=0;
 const dot=figma.createEllipse();c.appendChild(dot);dot.resize(8,8);dot.x=(c.width-8)/2;dot.y=diameter+5;dot.fills=fill('Color/Place/PeakPurple');dot.strokes=fill('Color/Surface/Default');dot.strokeWeight=2;sz(dot,'strokeWeight',2,'Stroke/MapPositionDot');pinCs.push(c);
}
const pinSet=variants('Data/PlaceMapMarker',pinCs);
const mapArt=root('Data/PlaceMapArtwork/SeongsuExample',390,631);
// 예시 지도 그림만 SVG. 글자·표시·버튼은 별도 인스턴스다.
let blocks='';for(let row=-2;row<33;row++)for(let col=-2;col<21;col++){const x=col*25+(row%3)*5,y=row*23;const w=14+(col*7+row*3+300)%7,h=11+(col*3+row*5+300)%6;blocks+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1" fill="#e8ebf0"/>';}
let lanes='';for(let x=-100;x<600;x+=57)lanes+='<path d="M'+x+' -30L'+(x-165)+' 700"/>';for(let y=0;y<650;y+=67)lanes+='<path d="M-40 '+y+'L430 '+(y+185)+'"/>';
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="390" height="631" viewBox="0 0 390 631"><rect width="390" height="631" fill="#f2f4f7"/><g transform="rotate(14 195 300)">'+blocks+'</g><path d="M55 82L104 55L139 100L124 157L135 233L85 276L34 255L2 201L18 149Z" fill="#ddefd5"/><path d="M11 239L55 185L73 209L120 221L106 280L69 283Z" fill="#d4eac9"/><path d="M160 105L209 112L206 158L169 147Z M321 45L362 13L390 33L379 100L341 88Z M249 284L278 270L300 295L287 331L261 316Z" fill="#dcefd7"/><path d="M-45 265Q75 318 196 384T455 506L450 589Q285 501 154 449T-40 352Z" fill="#bce1fc"/><path d="M49 211Q58 195 75 202T95 212Q93 224 69 220Z M54 244Q63 229 81 238T98 250Q78 263 54 254Z" fill="#b8e5ef"/><g fill="none" stroke="#fff" stroke-width="2" opacity=".95">'+lanes+'</g><g fill="none" stroke="#d5dce6" stroke-width="9"><path d="M135 -20L99 245L-20 429M274 -20L302 155L280 348L229 631M425 26L315 174L217 221L-30 173M-10 251L402 417"/></g><g fill="none" stroke="#fff" stroke-width="6"><path d="M135 -20L99 245L-20 429M274 -20L302 155L280 348L229 631M425 26L315 174L217 221L-30 173M-10 251L402 417"/></g><g fill="none" stroke="#d0d7e0" stroke-width="10"><path d="M149 285L120 386L87 482L63 636M315 368L289 439L250 546L220 650"/></g><g fill="none" stroke="#fff" stroke-width="7"><path d="M149 285L120 386L87 482L63 636M315 368L289 439L250 546L220 650"/></g></svg>';
const art=figma.createNodeFromSvg(svg);mapArt.appendChild(art);art.x=0;art.y=0;mapArt.description='시안에 맞춘 예시 지도 콘텐츠. 실제 등록 좌표나 지도 제공자의 공식 지도가 아니다. 제품의 실제 지도는 구현 단계에서 제공자 데이터로 교체한다.';
const preview=root('Data/PlaceMapPreview',362,80,'HORIZONTAL');gaps(preview,12,12);preview.fills=fill('Color/Surface/Default');rad(preview,16);inst(preview,stampSources.Peak60,'Brand');const identity=layout(preview,'Identity',188,48,'VERTICAL',4);full(identity);text(identity,'157:294','피크 성수',180);text(identity,'7:28','서울 성동구 성수동',180);const go=inst(preview,iconLinkCs[0],'Detail');setText(go.children.find(n=>n.type==='INSTANCE'),'암장 상세');
const currentLocation=root('Control/CurrentLocation',48,48,'HORIZONTAL');currentLocation.fills=fill('Color/Surface/Default');rad(currentLocation,999);currentLocation.primaryAxisAlignItems='CENTER';inst(currentLocation,locate,'Locate');
// 하단 메뉴에 암장 선택 변형을 추가하고 기존 일정·기록 변형은 그대로 둔다.
const bottomSet=await figma.getNodeByIdAsync('424:5211');let gymTabs=bottomSet.children.find(n=>n.name==='Tab=Place');
if(!gymTabs){gymTabs=src['150:311'].clone();bottomSet.appendChild(gymTabs);gymTabs.name='Tab=Place';for(let j=0;j<gymTabs.children.length;j++){const i=gymTabs.children[j];i.setProperties({'Property 1':j===2?'Selected':'Default'});if(j===2){const key=Object.keys(i.componentProperties).find(k=>k.startsWith('Icon#'));i.setProperties({[key]:'335:758'});}}}
const recommendationCs=[];
for(const [name,brand,percent,selected,upcoming]of [['성수','Peak',75,true,true],['연남','Grip',58,false,false],['강남','PeakCoral',42,false,false]]){
 const c=root('Place='+name,350,upcoming?124:104,'HORIZONTAL');gaps(c,12,12);rad(c,12);c.fills=fill(selected?'Color/Surface/Highlight':'Color/Surface/Input');c.counterAxisAlignItems='MIN';
 inst(c,stampSources[brand+'60'],'Brand');
 const body=layout(c,'RecommendationBody',254,upcoming?100:80,'VERTICAL',4);full(body);
 const heading=layout(body,'NameAndChoice',254,24,'HORIZONTAL',8);heading.counterAxisAlignItems='CENTER';full(heading);full(text(heading,'157:294',brand==='Grip'?'그립 연남':'피크 '+name,212));inst(heading,radioCs[selected?0:1],'Choice');
 full(text(body,emphasis,'새로운 벽 평균 '+percent+'%',254));
 const summary=layout(body,'SummaryAndInfo',254,24,'HORIZONTAL',0);full(summary);summary.counterAxisAlignItems='CENTER';full(text(summary,'140:223','참여 3명 기준 · 전체 벽 4개',170));inst(summary,iconLinkCs[1],'Information');
 if(upcoming)full(text(body,'140:223','방문일까지 세팅 예정 1개 벽 포함',254));
 recommendationCs.push(c);
}
const recommendationSet=variants('Data/PlaceRecommendationCard',recommendationCs);
const searchRowCs=[];
for(const [name,brand,address,selected]of [['성수','Peak','서울 성동구 성수동',true],['강남','PeakCoral','서울 강남구 역삼동',false],['연남','Grip','서울 마포구 연남동',false]]){
 const c=root('Place='+name,350,96,'VERTICAL',0);c.counterAxisAlignItems='MIN';
 const row=layout(c,'SearchResult',350,95,'HORIZONTAL',12,12);row.counterAxisAlignItems='CENTER';inst(row,stampSources[brand+'60'],'Brand');
 const body=layout(row,'SearchIdentity',242,52,'VERTICAL',4);full(body);
 const head=layout(body,'NameAndChoice',242,24,'HORIZONTAL',8);full(head);head.counterAxisAlignItems='CENTER';full(text(head,'157:294',brand==='Grip'?'그립 연남':'피크 '+name,196));inst(head,radioCs[selected?0:1],'Choice');
 const foot=layout(body,'AddressAndInfo',242,24,'HORIZONTAL',4);full(foot);foot.counterAxisAlignItems='CENTER';full(text(foot,'140:223',address,150));inst(foot,iconLinkCs[1],'Information');
 const div=inst(c,src['7:80'],'Divider');div.resize(350,1);searchRowCs.push(c);
}
const searchRowSet=variants('Data/PlaceSearchResultRow',searchRowCs);
const noticeCs=[];
for(const [state,msg]of [['NoResults','검색 결과가 없어요'],['NoParticipants','참여자가 모이면 추천을 볼 수 있어요.'],['SearchFailure','암장을 불러오지 못했어요'],['RecommendationFailure','추천을 불러오지 못했어요']]){
 const c=root('State='+state,350,state==='NoResults'?100:52,'VERTICAL');c.primaryAxisAlignItems='CENTER';text(c,'7:28',msg,350);noticeCs.push(c);
}
const noticeSet=variants('Data/PlaceQueryNotice',noticeCs);
const gradeCs=[];
const colors=['흰색','노랑','주황','초록','파랑','빨강','핑크','보라','회색','갈색','검정'];
const dots=(await figma.getNodeByIdAsync('430:16155')).children;
for(let j=0;j<11;j++){
 const c=root('Grade='+(j+1),50,64,'VERTICAL');gaps(c,4);c.counterAxisAlignItems='CENTER';
 const circle=inst(c,dots[j],'Difficulty');circle.resize(40,40);circle.setBoundVariable('width',null);circle.setBoundVariable('height',null);
 // 큰 원본을 먼저 만들고 화면에서는 크기를 덮어쓰지 않는다.
 const main=dots[j];const enlarged=main.clone();section.appendChild(enlarged);enlarged.name='Grade='+(j+1)+', Size=40';enlarged.setBoundVariable('width',null);enlarged.setBoundVariable('height',null);enlarged.rescale(40/14);sz(enlarged,'width',40,'Size/PlaceDifficultyCircle');sz(enlarged,'height',40,'Size/PlaceDifficultyCircle');circle.swapComponent(enlarged);
 // 크기 변형은 아래 새 묶음으로 관리한다.
 made.push(enlarged);gradeCs.push(c);text(c,'7:28',colors[j],50);const t=c.children[c.children.length-1];t.findOne(n=>n.type==='TEXT').textAlignHorizontal='CENTER';
}
const largeDots=made.filter(n=>n.name.includes('Size=40'));
const largeDotSet=variants('Primitive/DifficultyDot/PlaceExample',largeDots);
const gradeSet=variants('Data/PlaceDifficultyGrade',gradeCs);
const gradeGrid=root('Data/PlaceDifficultyScale/Example',350,184,'VERTICAL');gaps(gradeGrid,12);
for(let row=0;row<2;row++){
 const r=layout(gradeGrid,'GradeRow'+row,350,64,'HORIZONTAL',10);for(let j=row*6;j<Math.min(11,row*6+6);j++)inst(r,gradeCs[j],'Grade');
}
const direction=layout(gradeGrid,'DifficultyDirection',350,20,'HORIZONTAL',12);direction.counterAxisAlignItems='CENTER';text(direction,'7:28','쉬움',40);const line=inst(direction,src['7:80'],'Line');line.resize(212,1);const arrowI=inst(direction,arrow,'Arrow');arrowI.resize(20,20);text(direction,'7:28','어려움',42);
const badge=root('Data/SettingDateBadge',88,28,'HORIZONTAL');gaps(badge,0,4);badge.fills=fill('Color/Surface/Highlight');rad(badge,12);text(badge,'410:4333','10월 2일 예정',80);
const wallCs=[];
for(const [wall,date,next]of [['A','9월 4일',true],['B','9월 11일',false],['C','9월 18일',false],['D','9월 25일',false]]){
 const c=root('Wall='+wall,350,56,'VERTICAL');
 const row=layout(c,'WallSetting',350,55,'HORIZONTAL',12);row.counterAxisAlignItems='CENTER';text(row,'157:294',wall+'벽',55);
 const sep=inst(row,src['7:80'],'VerticalDivider');sep.resize(1,16);
 full(text(row,'7:28','최근 세팅 '+date,next?170:270));if(next)inst(row,badge,'Upcoming');
 inst(c,src['7:80'],'Divider');wallCs.push(c);
}
const wallSet=variants('Data/PlaceWallSettingRow',wallCs);
const nextSetting=root('Data/NextWallSetting',350,44,'HORIZONTAL');gaps(nextSetting,8,12);nextSetting.fills=fill('Color/Surface/Highlight');rad(nextSetting,12);const cal=inst(nextSetting,src['144:237'],'Calendar');for(const n of cal.findAll()){if('strokes'in n&&n.strokes.length)n.strokes=fill('Color/Text/Link');}full(text(nextSetting,'7:18','다음 세팅 10월 2일 · A벽',282));
const placeIdentity=root('Data/PlaceDetailIdentity',350,120,'VERTICAL');gaps(placeIdentity,12);
const brandrow=layout(placeIdentity,'BrandIdentity',350,84,'HORIZONTAL',16);brandrow.counterAxisAlignItems='CENTER';inst(brandrow,stampSources.Peak84,'Brand');const namecol=layout(brandrow,'Name',250,76,'VERTICAL',4);full(namecol);text(namecol,'7:8','피크 성수',250);text(namecol,'7:16','PEAK',250);
const locrow=layout(placeIdentity,'Location',350,24,'HORIZONTAL',8);locrow.counterAxisAlignItems='CENTER';inst(locrow,src['144:260'],'MapPin');full(text(locrow,'7:28','서울 성동구 성수동',232));const maplink=inst(locrow,iconLinkCs[0],'MapLink');setText(maplink.children[0],'지도 보기');
const detailCs=[];
for(const state of ['Default','MissingInformation']){
 const c=root('State='+state,350,state==='Default'?894:500,'VERTICAL');gaps(c,24);c.counterAxisAlignItems='MIN';inst(c,placeIdentity,'Identity');inst(c,src['7:80'],'Divider');
 const difficulty=layout(c,'DifficultySection',350,state==='Default'?272:100,'VERTICAL',12);text(difficulty,'7:8','난이도',350);text(difficulty,'7:28','PEAK 브랜드 공통.',350);if(state==='Default')inst(difficulty,gradeGrid,'Scale');else text(difficulty,'7:28','정보 없음',350);
 inst(c,src['7:80'],'Divider');
 const walls=layout(c,'WallsSection',350,state==='Default'?404:150,'VERTICAL',12);text(walls,'7:8','벽별 세팅',350);text(walls,'7:28',state==='Default'?'고정 벽 4개.':'정보 없음',350);
 if(state==='Default'){inst(walls,nextSetting,'NextSetting');for(const wc of wallCs)inst(walls,wc,'Wall');}
 detailCs.push(c);
}
const detailSet=variants('Place/DetailBody',detailCs);
const selectionCs=[];
for(const state of ['Recommendation','SearchOnly','NoResults']){
 const c=root('State='+state,390,844);c.fills=fill('Color/Surface/Default');
 const bar=inst(c,src['241:451'],'BackBar',20,20);setText(bar.children.find(n=>n.type==='INSTANCE'&&Object.keys(n.componentProperties).some(k=>k.startsWith('Content#'))),'');
 text(c,'7:8','암장 선택',350,20,68,'Title');
 if(state==='Recommendation')inst(c,context,'Participants',20,116);
 const sy=state==='Recommendation'?152:128;inst(c,searchCs[state==='NoResults'?1:0],'Search',20,sy);
 if(state==='Recommendation'){
  const h=layout(c,'RecommendationTitle',350,28,'HORIZONTAL',8);h.x=20;h.y=228;h.counterAxisAlignItems='CENTER';text(h,'7:11','참여자에게 새로운 암장',280);inst(h,info,'Information');
  text(c,'7:28','마지막 방문 이후 바뀐 벽을 비교해요.',350,20,264);
  inst(c,recommendationCs[0],'Recommendation',20,300);inst(c,recommendationCs[1],'Recommendation',20,436);inst(c,recommendationCs[2],'Recommendation',20,552);
 }else if(state==='SearchOnly'){
  for(let j=0;j<3;j++)inst(c,searchRowCs[j],'SearchResult',20,196+j*96);
 }else{
  const f=c.children.find(n=>n.name==='Search');setText(f.children.find(n=>n.type==='INSTANCE'&&Object.keys(n.componentProperties).some(k=>k.startsWith('Content#'))),'없는 암장');inst(c,noticeCs[0],'NoResults',20,302);
 }
 const button=inst(c,src[state==='NoResults'?'10:19':'10:13'],'Confirm',20,752);button.resize(350,52);setText(button.children[0],state==='NoResults'?'암장 선택':'피크 성수 선택');selectionCs.push(c);
}
const selectionSet=variants('Place/Selection',selectionCs);
const mapview=root('Place/Map',390,844);mapview.fills=fill('Color/Surface/Default');
text(mapview,'153:294','암장',350,20,40,'Title');inst(mapview,searchCs[0],'Search',20,94);
inst(mapview,mapArt,'MapArtwork',0,154);
text(mapview,'7:28','서울숲',60,64,364,'MapLabel');text(mapview,'7:28','성수동',60,184,338,'MapLabel');text(mapview,'7:28','건대입구',70,321,454,'MapLabel');text(mapview,'7:28','한강',50,180,548,'MapLabel');
inst(mapview,pinCs[1],'SelectedMarker',191,366);inst(mapview,pinCs[0],'Marker',106,249);inst(mapview,pinCs[0],'Marker',321,407);
inst(mapview,currentLocation,'CurrentLocation',326,610);inst(mapview,preview,'Preview',14,670);inst(mapview,gymTabs,'BottomTabs',0,785);
// 화면은 공통 묶음의 인스턴스로만 조립한다.
const screenSection=figma.createSection();screensPage.appendChild(screenSection);screenSection.name='03 암장';screenSection.x=7250;screenSection.y=0;screenSection.fills=fill('Section/Place');screenSection.resizeWithoutConstraints(1450,2060);
const frames=[];
function screen(number,title,body,x,y,height=844,detail=false){
 const f=figma.createFrame();screenSection.appendChild(f);f.name=number+' '+title;f.resize(390,height);sz(f,'width',390,'Size/ViewportWidth');sz(f,'height',height);f.fills=fill('Color/Surface/Default');rad(f,0);f.x=x;f.y=y;f.clipsContent=true;
 if(detail){const bar=inst(f,src['241:451'],'Navigation',20,20);setText(bar.children.find(n=>n.type==='INSTANCE'&&Object.keys(n.componentProperties).some(k=>k.startsWith('Content#'))),'암장 상세');inst(f,body,'Body',20,80);}else inst(f,body,'Content',0,0);
 frames.push(f);return f;
}
screen('03.01.01','암장 지도 / 지점 선택',mapview,40,60);
screen('03.02.01','암장 검색·추천·선택 / 참여자 추천',selectionCs[0],490,60);
screen('03.02.02','암장 검색·추천·선택 / 검색만',selectionCs[1],490,944);
screen('03.02.03','암장 검색·추천·선택 / 검색 결과 없음',selectionCs[2],490,1828);
screen('03.03.01','암장 상세 / 기본',detailCs[0],940,60,1014,true);
screen('03.03.02','암장 상세 / 정보 없음',detailCs[1],940,1114,844,true);
screenSection.resizeWithoutConstraints(1370,2712);
// 번호 순서에 맞춰 뒤의 섹션을 이동한다.
(await figma.getNodeByIdAsync('424:9017')).x=8970;
(await figma.getNodeByIdAsync('424:9018')).x=9670;
// 기존 묶음에 추가한 크기/탭 변형만 정리한다.
for(const set of [stampLabels,bottomSet,...['147:223','147:230','202:725'].map(id=>null)].filter(Boolean)){
 let x=20;set.children.forEach(n=>{n.x=x;n.y=20;x+=n.width+24;});set.resizeWithoutConstraints(x,Math.max(...set.children.map(n=>n.height))+40);
}
for(const id of ['147:223','147:230','202:725']){const set=(await figma.getNodeByIdAsync(id)).parent;let x=20;set.children.forEach(n=>{n.x=x;n.y=20;x+=n.width+24;});set.resizeWithoutConstraints(x,124);}
// 새 원본은 서로 겹치지 않게 정리한다.
let x=20,y=40,rowh=0;for(const n of section.children){if(x+n.width>2130&&x>20){x=20;y+=rowh+40;rowh=0;}n.x=x;n.y=y;x+=n.width+40;rowh=Math.max(rowh,n.height);}section.resizeWithoutConstraints(2150,y+rowh+40);
await figma.setCurrentPageAsync(screensPage);figma.viewport.scrollAndZoomIntoView(frames);
return {componentsSection:section.id,screenSection:screenSection.id,components:section.children.map(n=>({id:n.id,name:n.name,type:n.type,variants:n.type==='COMPONENT_SET'?n.children.map(v=>({id:v.id,name:v.name})):undefined})),screens:frames.map(n=>({id:n.id,name:n.name,width:n.width,height:n.height})),addedStampSizes:[28,60,84],mapArtworkSvg:svg};
