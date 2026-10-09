// Original, editable SVG concepts. All places, names and ratings are sample data.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const icons = JSON.parse(fs.readFileSync(path.join(root, 'mesa-icons.json'), 'utf8').replace(/^\uFEFF/, ''));
const c = { bg:'#FAF7F0', white:'#FFFFFF', ink:'#2D3025', muted:'#6B6D60', clay:'#A6412B', olive:'#526043', sage:'#E9EDDF', line:'#E3E1D7', peach:'#F3E1D5', cream:'#FFF8EC' };
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const rect = (x,y,w,h,fill,r=0,stroke='none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const text = (x,y,s,size=15,color=c.ink,font='Inter',weight=400) => `<text x="${x}" y="${y}" fill="${color}" font-family="${font}" font-size="${size}" font-weight="${weight}">${esc(s)}</text>`;
const icon = (name,x,y,size=24,color=c.ink) => `<g transform="translate(${x} ${y}) scale(${size/24})">${icons[name].replace(/<svg[^>]*>/,'').replace('</svg>','').replaceAll('currentColor',color).replace(/<path/g,`<path fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`).replace(/<circle/g,`<circle fill="none" stroke="${color}" stroke-width="1.8"`).replace(/<rect/g,`<rect fill="none" stroke="${color}" stroke-width="1.8"`)}</g>`;
const act = (label,action,content) => `<g role="button" tabindex="0" aria-label="${esc(label)}" data-action="${action}" style="cursor:pointer">${content}</g>`;
const button = (x,y,w,label,action,secondary=false) => act(label,action,rect(x,y,w,52,secondary?c.sage:c.clay,14)+`<text x="${x+w/2}" y="${y+32}" text-anchor="middle" fill="${secondary?c.olive:c.white}" font-family="Inter" font-weight="600" font-size="14">${label}</text>`);
const pill = (x,y,w,label,fill=c.sage,color=c.olive) => rect(x,y,w,32,fill,16)+`<text x="${x+w/2}" y="${y+21}" text-anchor="middle" fill="${color}" font-family="Inter" font-size="12" font-weight="500">${label}</text>`;
const avatar = (x,y,label,fill=c.sage) => rect(x,y,30,30,fill,15)+text(x+10,y+20,label,12,c.olive,'Inter',600);
const divider = y => `<path d="M24 ${y}H366" stroke="${c.line}"/>`;
function statusbar() { return text(26,28,'9:41',13,c.ink,'Inter',600)+`<g fill="${c.ink}"><rect x="310" y="17" width="3" height="4" rx="1"/><rect x="315" y="14" width="3" height="7" rx="1"/><rect x="320" y="11" width="3" height="10" rx="1"/><rect x="349" y="13" width="19" height="9" rx="2"/><rect x="370" y="15" width="2" height="5" rx="1"/></g>`; }
function indicator() { return rect(133,828,124,4,c.ink,2); }
function topbar(title,favorite=false) { return act('Volver a Inicio','home',icon('arrow-left',24,59,24))+`<text x="195" y="77" text-anchor="middle" font-family="Inter" font-size="14" fill="${c.muted}">${title}</text>`+act(favorite?'Favorito del grupo':'Más opciones',favorite?'favorite':'options',icon(favorite?'heart':'ellipsis',334,59,24)); }
function tableIllustration(x,y,scale=1,dark=false) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" aria-label="Ilustración de una mesa, no fotografía del local">
    <path d="M27 121L149 99L169 130L50 150Z" fill="${dark?'#C16546':'#DEC8AD'}"/>
    <path d="M35 117L147 96L164 123L50 144Z" fill="${dark?'#BD6247':'#EEDBC0'}"/>
    <ellipse cx="95" cy="98" rx="47" ry="31" fill="${c.cream}"/>
    <ellipse cx="95" cy="97" rx="34" ry="21" fill="none" stroke="${dark?'#DBB395':'#CFB79A'}" stroke-width="1.5"/>
    <path d="M73 96Q87 78 117 99Q106 112 81 110Z" fill="${c.olive}"/>
    <path d="M88 101Q98 89 110 103" fill="none" stroke="#C7D2A9" stroke-width="3"/>
    <circle cx="82" cy="99" r="5" fill="#CB6947"/><circle cx="110" cy="95" r="5" fill="#CB6947"/>
    <path d="M37 78L39 120M29 72L31 88Q37 94 42 86L41 70M35 72L36 88" fill="none" stroke="${c.cream}" stroke-width="3" stroke-linecap="round"/>
    <path d="M155 65L151 113M155 66Q142 78 152 87" fill="none" stroke="${c.cream}" stroke-width="3" stroke-linecap="round"/>
    <path d="M105 41H132L128 67Q118 80 108 68Z" fill="#C99176" stroke="${c.cream}" stroke-width="1.5"/>
    <path d="M119 73V85M112 86H125" stroke="${c.cream}" stroke-width="2"/>
    <path d="M46 59Q52 39 76 49Q77 70 56 74Z" fill="#849160"/>
    <path d="M51 68L69 50" stroke="#CCD5AE" stroke-width="2"/>
    </g>`;
}
function navigation() {
  let s=rect(0,756,390,88,c.white)+`<path d="M0 756H390" stroke="${c.line}"/>`;
  for(const [i,label,name,action] of [[0,'Inicio','house','home'],[1,'Grupos','users-round','group'],[2,'Añadir','plus','add'],[3,'Mapa','map','map'],[4,'Perfil','user-round','profile']]) {
    const x=18+i*76;const add=i===2;s+=act(label,action,(i===0?rect(x-5,769,61,44,c.sage,16):'')+(add?rect(x+4,765,42,42,c.clay,15):'')+icon(name,x+13,add?774:777,24,add?c.white:i===0?c.olive:c.muted)+`<text x="${x+25}" y="${add?820:816}" text-anchor="middle" fill="${i===0?c.olive:c.muted}" font-family="Inter" font-size="11" font-weight="${i===0?600:400}">${label}</text>`);
  } return s+indicator();
}
function groupRow(y,title,meta,initial='L',fill=c.peach) {
  return act(`Abrir ${title}`,'group',rect(24,y,64,64,fill,18)+icon('utensils',44,y+20,24,c.clay)+text(106,y+26,title,17,c.ink,'Inter',600)+text(106,y+48,meta,12,c.muted)+icon('chevron-right',342,y+23,18,c.muted));
}
function restaurantRow(y,name,meta,status,rating,initial,fill,favorite=false) {
  return act(`Abrir ${name}`,'restaurant',rect(24,y+7,56,66,fill,14)+`<text x="52" y="${y+47}" text-anchor="middle" fill="${c.olive}" font-family="Fraunces" font-size="29">${initial}</text>`+text(96,y+27,name,17,c.ink,'Inter',600)+text(96,y+48,meta,12,c.muted)+text(96,y+71,status,12,c.olive)+text(284,y+71,rating,12,c.muted)+(favorite?icon('heart',340,y+14,18,c.clay):icon('chevron-right',340,y+17,18,c.muted))+divider(y+89));
}
function home() {
  return statusbar()+text(24,83,'mesa.',31,c.ink,'Fraunces')+act('Notificaciones','notifications',icon('bell',286,60,22,c.muted))+act('Perfil','profile',avatar(332,57,'P'))+
    text(24,128,'Hola, Paula',15,c.muted)+text(24,168,'La próxima mesa,',34,c.ink,'Fraunces')+text(24,208,'con los tuyos.',34,c.ink,'Fraunces')+
    act('Ver restaurante recomendado','restaurant',rect(24,232,342,184,c.clay,22)+text(44,260,'Para vuestra próxima cena',12,c.cream)+text(44,299,'Casa Nona',26,c.cream,'Fraunces')+text(44,324,'En Los de siempre',12,c.cream)+rect(44,350,147,42,c.cream,12)+text(59,377,'Ver restaurante',13,c.clay,'Inter',600)+tableIllustration(197,240,0.95,true))+
    text(24,460,'Tus grupos',25,c.ink,'Fraunces')+act('Ver todos los grupos','group',text(292,459,'Ver todos',12,c.olive,'Inter',600))+
    groupRow(484,'Los de siempre','3 personas · 8 restaurantes')+divider(565)+groupRow(582,'Escapadas','2 personas · 6 restaurantes','E',c.sage)+
    text(24,693,'Última actividad',17,c.ink,'Inter',600)+avatar(24,708,'M')+text(66,721,'Mar ha añadido Can Bruc',13)+text(66,740,'En Los de siempre · Hace 2 h',11,c.muted)+navigation();
}
function group(empty=false) {
  let s=statusbar()+topbar('Tus grupos')+icon('lock-keyhole',24,118,14,c.olive)+text(44,130,'Grupo privado',12,c.olive)+text(24,176,'Los de siempre',32,c.ink,'Fraunces')+text(24,207,'Los sitios que queremos compartir.',14,c.muted)+
    avatar(24,229,'P')+avatar(48,229,'M',c.peach)+avatar(72,229,'L')+text(117,249,'3 personas',12,c.muted)+act('Invitar personas','invite',text(298,249,'Invitar',13,c.olive,'Inter',600))+
    button(24,281,342,'Añadir restaurante','add')+text(24,372,'Restaurantes',14,c.ink,'Inter',600)+text(178,372,'Miembros',14,c.muted)+text(284,372,'Actividad',14,c.muted)+`<path d="M24 384H126" stroke="${c.clay}" stroke-width="3"/>`+divider(385);
  if(empty) return s+tableIllustration(109,411,1.1)+`<text x="195" y="640" text-anchor="middle" font-family="Fraunces" font-size="25" fill="${c.ink}">Vuestra lista empieza aquí.</text>`+`<text x="195" y="674" text-anchor="middle" font-family="Inter" font-size="14" fill="${c.muted}">Guardad ese sitio del que tanto habláis.</text>`+button(64,708,262,'Buscar vuestro primer sitio','add')+indicator();
  return s+rect(24,403,342,48,c.white,12,c.line)+icon('search',40,417,20,c.muted)+text(72,433,'Buscar en este grupo',14,c.muted)+act('Mostrar todos','filter-all',pill(24,467,66,'Todos',c.olive,c.white))+act('Filtrar pendientes','filter-pending',pill(100,467,123,'Queremos ir',c.white,c.muted))+act('Filtrar favoritos','filter-favorite',pill(233,467,133,'Favoritos',c.white,c.muted))+
    text(24,531,'8 restaurantes',12,c.muted)+act('Ver mapa del grupo','map',icon('map',311,514,16,c.olive)+text(333,527,'Mapa',11,c.olive,'Inter',600))+
    restaurantRow(543,'Casa Nona','Italiana · Girona','Queremos repetir','★ 4,5','C',c.peach,true)+restaurantRow(637,'Can Bruc','Mediterránea · Girona','Queremos ir','Sin valorar','B',c.sage)+restaurantRow(731,'La Barra','Tapas · Girona','Visitado','★ 4,0','L','#ECE9E2')+indicator();
}
function restaurant(unrated=false) {
  let s=statusbar()+topbar('Los de siempre',true)+rect(24,105,342,151,c.sage,20)+tableIllustration(103,91,1.1)+text(24,303,'Casa Nona',32,c.ink,'Fraunces')+text(24,332,'Italiana · Girona',14,c.muted)+act('Cambiar estado','status',pill(24,350,146,'Queremos repetir'));
  s+=rect(24,402,342,80,c.white,16,c.line);
  if(unrated) s+=icon('star',43,425,26,c.olive)+text(86,436,'Aún sin valoraciones',16,c.ink,'Inter',600)+text(86,459,'Vuestra primera opinión cuenta.',12,c.muted);
  else s+=icon('star',43,425,25,c.olive)+text(79,450,'4,5',30,c.ink,'Fraunces')+text(145,435,'Media del grupo',14,c.ink,'Inter',600)+text(145,458,'2 valoraciones',12,c.muted);
  s+=text(24,523,'Vuestras valoraciones',23,c.ink,'Fraunces');
  if(!unrated) s+=avatar(24,541,'M',c.peach)+text(68,562,'Mar',15)+text(305,562,'★ 5,0',14,c.olive,'Inter',600)+divider(587)+avatar(24,601,'L')+text(68,622,'Leo',15)+text(305,622,'★ 4,0',14,c.olive,'Inter',600);
  else s+=text(24,560,'Aquí aparecerán las opiniones del grupo.',14,c.muted);
  s+=divider(651)+icon('map-pin',24,675,20,c.olive)+text(56,687,'Carrer Nou, 12 · Girona',14,c.ink)+act('Ver ubicación','map',text(56,714,'Ver en mapa',12,c.olive,'Inter',600))+button(24,756,342,'Añadir mi valoración','rate')+indicator();
  return s;
}
function svg(name,body) { return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="390" height="844" viewBox="0 0 390 844" aria-label="${name}"><title>${name} · MESA Sobremesa</title>${rect(0,0,390,844,c.bg,28)}${body}</svg>`; }
for(const [name,body] of Object.entries({'inicio':home(),'grupo':group(),'restaurante':restaurant(),'grupo-vacio':group(true),'restaurante-sin-valoraciones':restaurant(true)}))fs.writeFileSync(path.join(root,`mesa-${name}.svg`),svg(name,body));
fs.writeFileSync(path.join(root,'mesa-icons.json'),JSON.stringify(icons));
console.log('Five editable SVG screens and icon source generated.');
