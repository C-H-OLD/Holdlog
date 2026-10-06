async function createVariableCollection(name, modeNames) {
 const collection=figma.variables.createVariableCollection(name);
 collection.renameMode(collection.modes[0].modeId,modeNames[0]);
 return collection;
}
const existing=await figma.variables.getLocalVariableCollectionsAsync();
if(existing.some(c=>c.name==="Holdlog Primitives")) throw new Error("Already created; inspect saved state before retry.");
const p=await createVariableCollection("Holdlog Primitives",["Value"]);
const s=await createVariableCollection("Holdlog Semantic",["Light"]);
const values={
 "White":"#FFFFFF","Ink":"#151820","Slate":"#515B80","Muted":"#7A8196",
 "Purple":"#512AFF","PurplePressed":"#3D1DDD","Surface":"#F3F4F7","Lavender":"#E7E9F3",
 "Border":"#DDE1EC","Danger":"#D92D20","DangerPressed":"#B42318","Disabled":"#E4E6ED",
 "DisabledText":"#858CA0","Focus":"#512AFF","GoogleBlue":"#4285F4","GoogleGreen":"#34A853","GoogleYellow":"#FBBC05","GoogleRed":"#EA4335"
};
const all=[];
function make(name,col,type,value,scopes) {
 const v=figma.variables.createVariable(name,col,type);
 v.setValueForMode(col.modes[0].modeId,value); v.scopes=scopes;
 v.setVariableCodeSyntax("WEB","var(--holdlog-"+name.split('/').join('-').split(' ').join('-').toLowerCase()+")");
 all.push(v); return v;
}
function rgb(hex){return {r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255,a:1};}
const raw={};
for(const [key,val]of Object.entries(values)) raw[key]=make("Palette/"+key,p,"COLOR",rgb(val),[]);
const colors={
 "Color/Action/Primary":"Purple","Color/Action/Pressed":"PurplePressed","Color/Text/Primary":"Ink",
 "Color/Text/Secondary":"Slate","Color/Text/Muted":"Muted","Color/Text/OnAction":"White",
 "Color/Text/Link":"Purple","Color/Surface/Default":"White","Color/Surface/Input":"Surface",
 "Color/Surface/Avatar":"Lavender","Color/Border/Default":"Border","Color/Status/Danger":"Danger",
 "Color/Status/DangerPressed":"DangerPressed","Color/Surface/Disabled":"Disabled",
 "Color/Text/Disabled":"DisabledText","Color/Border/Focus":"Focus",
 "Color/Brand/Google/Blue":"GoogleBlue","Color/Brand/Google/Green":"GoogleGreen",
 "Color/Brand/Google/Yellow":"GoogleYellow","Color/Brand/Google/Red":"GoogleRed"
};
for(const [key,val]of Object.entries(colors))make(key,s,"COLOR",{type:"VARIABLE_ALIAS",id:raw[val].id},key.includes("/Text/")?["TEXT_FILL"]:key.includes("/Border/")?["STROKE_COLOR"]:["FRAME_FILL","SHAPE_FILL","TEXT_FILL","STROKE_COLOR"]);
const dimensions={};
for(const n of [0,4,8,12,16,20,24,32,40,48])dimensions["Space/"+n]=[n,["GAP"]];
for(const n of [0,8,12,16,999])dimensions["Radius/"+n]=[n,["CORNER_RADIUS"]];
for(const [name,n]of Object.entries({Touch:44,Button:52,Input:48,Row:68,Avatar:112,AvatarSmall:36,Icon:24,ProviderIcon:32,Screen:390}))dimensions["Size/"+name]=[n,["WIDTH_HEIGHT"]];
dimensions["Stroke/Default"]=[1,["STROKE_FLOAT"]]; dimensions["Stroke/Focus"]=[2,["STROKE_FLOAT"]];
for(const[key,[val,scopes]]of Object.entries(dimensions)){
 const r=make("Value/"+key,p,"FLOAT",val,[]);make(key,s,"FLOAT",{type:"VARIABLE_ALIAS",id:r.id},scopes);
}
await Promise.all(["Regular","Medium","Bold"].map(style=>figma.loadFontAsync({family:"Noto Sans KR",style})));
const typography=[["Text/Title",32,44,"Bold"],["Text/Section",20,28,"Bold"],["Text/Body",16,24,"Regular"],["Text/Label",14,20,"Medium"],["Text/Caption",14,20,"Regular"],["Text/Button",16,24,"Bold"],["Text/Avatar",48,64,"Regular"],["Text/AvatarSmall",16,24,"Medium"]];
const styles=[];
for(const[name,size,line,weight]of typography){const st=figma.createTextStyle();st.name=name;st.fontName={family:"Noto Sans KR",style:weight};st.fontSize=size;st.lineHeight={unit:"PIXELS",value:line};st.letterSpacing={unit:"PIXELS",value:0};st.description="Holdlog 공통 글자 · 사용자 지정 Noto Sans KR";styles.push({id:st.id,name,fontSize:size,lineHeight:line,font:st.fontName});}
return {collections:[p,s].map(c=>({id:c.id,name:c.name,modes:c.modes})),variables:all.map(v=>({id:v.id,name:v.name,collectionId:v.variableCollectionId,type:v.resolvedType,scopes:v.scopes,codeSyntax:v.codeSyntax,values:v.valuesByMode})),styles,createdNodeIds:[],shadowStyles:[],validation:{variables:all.length,missingScopes:all.filter(v=>v.scopes.includes("ALL_SCOPES")).length,missingSyntax:all.filter(v=>!v.codeSyntax.WEB).length}};
