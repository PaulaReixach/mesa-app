// STATE and ICON_SVGS are injected by the orchestrator. Local MESA components.
const page = await figma.getNodeByIdAsync(STATE.pages.library);
await figma.setCurrentPageAsync(page);
await Promise.all([{family:'Inter',style:'Regular'},{family:'Inter',style:'Medium'},
  {family:'Inter',style:'Semi Bold'},{family:'Fraunces',style:'Regular'}].map(f=>figma.loadFontAsync(f)));
const colors = Object.fromEntries(await Promise.all(Object.entries(STATE.colors).map(async ([k,id])=>[k,await figma.variables.getVariableByIdAsync(id)])));
const space = Object.fromEntries(await Promise.all(Object.entries(STATE.layout).map(async ([k,id])=>[k,await figma.variables.getVariableByIdAsync(id)])));
const made = [], components = {}, properties = {};
const track = n => { made.push(n.id); return n; };
function paint(key) { return figma.variables.setBoundVariableForPaint({type:'SOLID',color:{r:1,g:1,b:1}},'color',colors[key]); }
function frame(parent,name,direction='VERTICAL',width=342,gap=8,bg=null,padding=0,radius=0) {
  const n=track(figma.createAutoLayout(direction)); parent.appendChild(n); n.name=name; n.resize(width,100);
  n.layoutSizingHorizontal='FIXED'; n.layoutSizingVertical='HUG'; n.fills=bg?[paint(bg)]:[];
  n.setBoundVariable('itemSpacing',space[gap]);
  for(const side of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) n.setBoundVariable(side,space[padding]);
  for(const side of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius']) n.setBoundVariable(side,space[radius]);
  return n;
}
function text(parent,name,value,style='Body',color='text',width=null) {
  const n=track(figma.createText()); parent.appendChild(n); n.name=name;
  n.fontName={family:'Inter',style:'Regular'}; n.textStyleId=STATE.styles[style]; n.characters=value; n.fills=[paint(color)];
  if(width){n.resize(width,22);n.textAutoResize='HEIGHT';n.layoutSizingHorizontal='FIXED';} else n.textAutoResize='WIDTH_AND_HEIGHT';
  return n;
}
function component(name,direction,width,gap,bg,padding=0,radius=0) {
  if(page.children.some(n=>n.name===name)) throw new Error(`Component already exists: ${name}`);
  const n=track(figma.createComponent()); page.appendChild(n); n.name=name; n.resize(width,100);
  n.layoutMode=direction;n.layoutSizingHorizontal='FIXED';n.layoutSizingVertical='HUG'; n.fills=bg?[paint(bg)]:[];
  n.setBoundVariable('itemSpacing',space[gap]);
  for(const side of ['paddingTop','paddingBottom','paddingLeft','paddingRight'])n.setBoundVariable(side,space[padding]);
  for(const side of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])n.setBoundVariable(side,space[radius]);
  n.description=`MESA Sobremesa: ${name}. Propuesta visual editable; revisar tamaño dinámico en la app.`;
  components[name]=n.id; properties[name]={}; return n;
}
function property(comp,label,node,value) {
  const key=comp.addComponentProperty(label,'TEXT',value); node.componentPropertyReferences={characters:key};
  properties[comp.name][label]=key;
}
const icons={};
for(const [name,svg] of Object.entries(ICON_SVGS)) {
  const c=component(`Icon/${name}`,'HORIZONTAL',24,0,null);c.resize(24,24);c.primaryAxisSizingMode='FIXED';
  const icon=track(figma.createNodeFromSvg(svg.replaceAll('currentColor','#2D3025')));c.appendChild(icon);
  icon.name=name;icon.resize(24,24);icons[name]=c;
  for(const vector of icon.findAllWithCriteria({types:['VECTOR']})) {
    if(vector.strokes.length)vector.strokes=vector.strokes.map(p=>p.type==='SOLID'?paint('text'):p);
  }
}
function icon(parent,name,size=20,color='text') {
  const n=track(icons[name].createInstance());parent.appendChild(n);n.resize(size,size);
  for(const v of n.findAllWithCriteria({types:['VECTOR']}))if(v.strokes.length)v.strokes=v.strokes.map(p=>p.type==='SOLID'?paint(color):p);
  return n;
}
// Adapted createComponentWithVariants helper: one page switch, deterministic grid.
function createComponentWithVariants(name,styles,states,build) {
  const variants=[];
  for(const style of styles)for(const state of states){const c=build(style,state);c.name=`Style=${style}, State=${state}`;variants.push(c);}
  const set=track(figma.combineAsVariants(variants,page));set.name=name;set.description='Acciones MESA con estados default, loading y disabled.';
  set.children.forEach((c,i)=>{c.x=(i%states.length)*210;c.y=Math.floor(i/states.length)*80;});
  set.resize(640,160);components[name]=set.id;return variants;
}
const buttonVariants=createComponentWithVariants('Button',['Primary','Secondary'],['Default','Loading','Disabled'],(style,state)=>{
  const c=component(`button-${style}-${state}`,'HORIZONTAL',190,8,style==='Primary'?'action':'sage',16,12);
  c.primaryAxisAlignItems='CENTER';c.counterAxisAlignItems='CENTER';c.paddingTop=c.paddingBottom=16;
  const label=text(c,'Label',state==='Loading'?'Guardando…':'Añadir restaurante','Label',style==='Primary'?'surface':'olive');
  property(c,'Label',label,label.characters);c.opacity=state==='Disabled'?0.45:1;return c;
});
components['Button/Primary']=buttonVariants[0].id;components['Button/Secondary']=buttonVariants[3].id;
const iconButton=component('IconButton','HORIZONTAL',48,0,null,12,12);iconButton.resize(48,48);iconButton.primaryAxisSizingMode='FIXED';
const ib=icon(iconButton,'arrow-left',24);const ibKey=iconButton.addComponentProperty('Icon','INSTANCE_SWAP',icons['arrow-left'].id);ib.componentPropertyReferences={mainComponent:ibKey};properties.IconButton.Icon=ibKey;
const avatar=component('Avatar','HORIZONTAL',36,0,'sage',0,16);avatar.resize(36,36);avatar.primaryAxisSizingMode='FIXED';avatar.primaryAxisAlignItems='CENTER';avatar.counterAxisAlignItems='CENTER';
const initial=text(avatar,'Initial','P','Label','olive');property(avatar,'Initial',initial,'P');
for(const active of [false,true]) {
  const c=component(active?'Chip/Active':'Chip/Default','HORIZONTAL',102,4,active?'olive':'surface',12,12);
  c.minHeight=48;
  c.primaryAxisAlignItems='CENTER';c.counterAxisAlignItems='CENTER';
  const label=text(c,'Label','Queremos ir','Caption',active?'surface':'secondary');property(c,'Label',label,'Queremos ir');
}
const restaurant=component('RestaurantRow','HORIZONTAL',342,12,'surface',16,16);restaurant.counterAxisAlignItems='CENTER';
const monogram=frame(restaurant,'Monogram','HORIZONTAL',48,0,'sage',0,12);monogram.resize(48,56);monogram.layoutSizingVertical='FIXED';monogram.primaryAxisAlignItems='CENTER';monogram.counterAxisAlignItems='CENTER';
const mono=text(monogram,'Initial','C','Heading','olive');property(restaurant,'Initial',mono,'C');
const copy=frame(restaurant,'Content','VERTICAL',230,4);copy.layoutSizingHorizontal='FILL';
const name=text(copy,'Name','Casa Nona','Title','text',230);name.layoutSizingHorizontal='FILL';property(restaurant,'Name',name,'Casa Nona');
const meta=text(copy,'Meta','Italiana · Girona','Caption','secondary');property(restaurant,'Meta',meta,'Italiana · Girona');
const details=frame(copy,'Status and rating','HORIZONTAL',230,8);details.layoutSizingHorizontal='FILL';details.counterAxisAlignItems='CENTER';
const status=text(details,'Status','Queremos ir','Caption','olive');property(restaurant,'Status',status,'Queremos ir');
const rating=text(details,'Rating','Sin valorar','Caption','secondary');property(restaurant,'Rating',rating,'Sin valorar');
const heart=icon(restaurant,'heart',18,'action');const favKey=restaurant.addComponentProperty('Favorite','BOOLEAN',false);heart.componentPropertyReferences={visible:favKey};properties.RestaurantRow.Favorite=favKey;heart.visible=false;
icon(restaurant,'chevron-right',16,'secondary');
const group=component('GroupRow','HORIZONTAL',342,12,null,0,0);group.counterAxisAlignItems='CENTER';
const art=frame(group,'Artwork','HORIZONTAL',64,0,'peach',0,16);art.resize(64,64);art.layoutSizingVertical='FIXED';art.primaryAxisAlignItems='CENTER';art.counterAxisAlignItems='CENTER';icon(art,'utensils',26,'action');
const gc=frame(group,'Copy','VERTICAL',220,4);gc.layoutSizingHorizontal='FILL';
const gn=text(gc,'Name','Los de siempre','Title');property(group,'Name',gn,'Los de siempre');
const gm=text(gc,'Meta','3 personas · 8 restaurantes','Caption','secondary');property(group,'Meta',gm,'3 personas · 8 restaurantes');
icon(group,'chevron-right',18,'secondary');
const input=component('SearchInput','HORIZONTAL',342,12,'surface',16,12);input.counterAxisAlignItems='CENTER';input.strokes=[paint('border')];input.strokeWeight=1;icon(input,'search',20,'secondary');
const placeholder=text(input,'Placeholder','Buscar en este grupo','Body','secondary');property(input,'Placeholder',placeholder,'Buscar en este grupo');
const nav=component('Navigation','HORIZONTAL',390,0,'surface',8,0);nav.counterAxisAlignItems='CENTER';
for(const [label,key] of [['Inicio','house'],['Grupos','users-round'],['Añadir','plus'],['Mapa','map'],['Perfil','user-round']]) {
  const entry=frame(nav,label,'VERTICAL',74,4,null,4,0);entry.counterAxisAlignItems='CENTER';
  icon(entry,key,22,label==='Inicio'?'action':'secondary');text(entry,'Label',label,'Caption',label==='Inicio'?'action':'secondary');
}
// Place main components away from the review board; icons in a compact grid.
let index=0;
for(const c of page.children){c.x=100+(index%4)*420;c.y=100+Math.floor(index/4)*220;index++;}
return {components,properties,createdNodeIds:made,componentCount:page.findAllWithCriteria({types:['COMPONENT']}).length,
  buttonVariants:buttonVariants.map(c=>({id:c.id,name:c.name,width:c.width,height:c.height})),
  fonts:['Inter','Fraunces'],pageId:page.id};
