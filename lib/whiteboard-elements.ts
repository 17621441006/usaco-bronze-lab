/** Editable teaching props. One vector renderer serves the board, shelf and PNG export. */
export type ElementKind = 'cow'|'farmer'|'fence'|'array'|'dictionary'|'queue'|'stack'|'interval'|'graph'|'text'|'grid'|'pointers'|'prefix'|'tree'|'heap'|'linked'|'state';
export type TeachingElement = {
 id:string;kind:ElementKind;x:number;y:number;w:number;h:number;
 variant:number;label:string;values:string[];
};
export type CatalogEntry = {kind:ElementKind;title:string;group:'农场'|'标注与关系'|'线性结构'|'网格与区间'|'树与图';width:number;height:number;description:string;values:string[];label:string;editHint?:string;maxValues?:number;rows?:boolean};

export const cowNames = ['Bessie','Elsie','Alice','Mildred','Bella','Buttercup','Blue','Beatrice','Belinda','Sue'] as const;
/** Use an insertion counter for cows when a name sequence independent of other props is desired. */
export function cowNameForVariant(index:number):string {const n=Number.isFinite(index)?Math.abs(Math.trunc(index)):0;return cowNames[n%cowNames.length];}

export const elementCatalog:CatalogEntry[] = [
 {kind:'cow',title:'奶牛',group:'农场',width:180,height:158,description:'每次加入的奶牛都有不同名字与花色。',values:[],label:'Bessie',maxValues:0,editHint:'名称可改为题目中的角色名。'},
 {kind:'farmer',title:'Farmer John',group:'农场',width:155,height:232,description:'用农场主表示执行动作的人或当前位置。',values:[],label:'Farmer John',maxValues:0,editHint:'名称可自由修改。'},
 {kind:'fence',title:'栅栏',group:'农场',width:300,height:142,description:'标记刷过的栅栏，演示区间与覆盖。',values:[],label:'栅栏',maxValues:0,editHint:'名称可改为这个区间的含义。'},
 {kind:'text',title:'文字便签',group:'标注与关系',width:320,height:228,description:'记录条件、步骤、结论或变量含义。',values:['先读清输入范围','确定状态与转移','检查边界情况'],label:'思路记录',maxValues:6,rows:true,editHint:'每行一条内容，最多 6 行；名称是便签标题。'},
 {kind:'state',title:'状态转移',group:'标注与关系',width:560,height:220,description:'三个状态与三条带名称的有向转移。',values:['未访问','处理中','已完成','发现','完成','重置'],label:'状态转移',maxValues:6,editHint:'前 3 项是从左到右的状态；后 3 项分别标注 1→2、2→3、3→1 的箭头。'},
 {kind:'array',title:'数组',group:'线性结构',width:410,height:136,description:'一排从 0 开始编号的格子，数值可以编辑。',values:['3','1','4','1','5'],label:'数组 a',maxValues:12,editHint:'每项是一个格子的内容，最多 12 项，下标从 0 开始。'},
 {kind:'pointers',title:'双指针',group:'线性结构',width:480,height:216,description:'数组上的 i、j 指针和它们之间的范围。',values:['2','4','7','9','11','i=1','j=3'],label:'双指针',maxValues:14,editHint:'最多 12 个数组值；额外用 i=1、j=3 指定指针下标（从 0 开始）。省略时指向首尾。'},
 {kind:'prefix',title:'前缀和',group:'线性结构',width:520,height:220,description:'原数组与自动计算的前缀和对齐展示。',values:['3','1','4','1','5'],label:'前缀和',maxValues:10,editHint:'输入最多 10 个数字；p[0]=0，p[k+1]=p[k]+a[k]。'},
 {kind:'dictionary',title:'字典',group:'线性结构',width:290,height:248,description:'每行使用 键:值，例如 Bessie:3。',values:['Bessie:3','Elsie:1','Mildred:4'],label:'字典 counts',maxValues:8,rows:true,editHint:'每行一组 键:值，例如 Bessie:3，最多 8 行。'},
 {kind:'queue',title:'队列',group:'线性结构',width:440,height:158,description:'左侧出队、右侧入队，最先进入的最先离开。',values:['B','E','M','D'],label:'队列',maxValues:12,editHint:'按队首到队尾填写，最多 12 项；左侧出队，右侧入队。'},
 {kind:'stack',title:'栈',group:'线性结构',width:205,height:280,description:'底部先入栈，顶部后入栈、先出栈。',values:['3','1','4'],label:'栈',maxValues:8,editHint:'按栈底到栈顶填写，最多 8 项；最后一项在顶部。'},
 {kind:'linked',title:'单向链表',group:'线性结构',width:560,height:174,description:'从 head 沿 next 指针走到 null。',values:['3','1','4','5'],label:'单向链表',maxValues:6,editHint:'按链表顺序填写节点值，最多 6 项；箭头与末尾 null 自动生成。'},
 {kind:'grid',title:'二维网格',group:'网格与区间',width:420,height:308,description:'用行列下标演示网格、矩阵与路径。',values:['0 0 1 0','1 0 1 0','0 0 0 0'],label:'网格 grid',maxValues:5,rows:true,editHint:'每行一排格子，格子之间用空格分隔；最多 5 行 × 6 列。1 高亮，# 表示障碍。'},
 {kind:'interval',title:'数轴区间',group:'网格与区间',width:440,height:150,description:'填写两个端点，例如 2, 7。',values:['2','7'],label:'区间 [l, r]',maxValues:2,editHint:'填写两个数字端点；端点与区间长度自动更新。'},
 {kind:'tree',title:'二叉树',group:'树与图',width:460,height:300,description:'按层序排列节点，区分根、左孩子和右孩子。',values:['8','4','12','2','6','10','14'],label:'二叉树',maxValues:15,editHint:'按层序填写（根、左、右……），最多 15 项。_ 或 null 留空；空节点下面不显示后代。'},
 {kind:'heap',title:'最小堆',group:'树与图',width:450,height:340,description:'由数字自动建堆，树与下方堆数组保持一致。',values:['8','3','5','1','6','4','7'],label:'最小堆',maxValues:7,editHint:'输入最多 7 个数字；自动构造最小堆，根节点为最小值，下方数组为堆的层序存储。'},
 {kind:'graph',title:'图与连接',group:'树与图',width:320,height:248,description:'五个顶点与固定无向连边，可修改顶点名称。',values:['A','B','C','D','E'],label:'图',maxValues:5,editHint:'5 项依次对应左上、上中、右上、左下、右下的节点；连边固定，可另用画笔补充。'},
];

const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
let fallbackId=0;
export function makeElement(kind:ElementKind,point:{x:number;y:number},variant:number):TeachingElement {
 const item=elementCatalog.find(entry=>entry.kind===kind)||elementCatalog[0];
 const seed=Number.isFinite(variant)?Math.trunc(variant):0;
 const x=Number.isFinite(point.x)?point.x:800,y=Number.isFinite(point.y)?point.y:450;
 const id=globalThis.crypto?.randomUUID?.()||`prop-${Date.now().toString(36)}-${(++fallbackId).toString(36)}`;
 return {id,kind:item.kind,x:clamp(x-item.width/2,0,1600-item.width),y:clamp(y-item.height/2,0,900-item.height),w:item.width,h:item.height,variant:seed,label:item.kind==='cow'?cowNameForVariant(seed):item.label,values:[...item.values]};
}

type Palette={ink:string;muted:string;surface:string;panel:string;border:string;teal:string;tealSoft:string;amber:string;amberSoft:string;blue:string;blueSoft:string;shadow:string};
function palette(dark:boolean):Palette {return dark?{
 ink:'#eef7f5',muted:'#abc5c8',surface:'#213b43',panel:'#2b4852',border:'#73949b',teal:'#78dcc9',tealSoft:'#244d49',amber:'#ffce87',amberSoft:'#51432d',blue:'#9bc2ff',blueSoft:'#2e4260',shadow:'rgba(0,0,0,.16)',
 }:{ink:'#263e47',muted:'#657d83',surface:'#fffef9',panel:'#eef4f2',border:'#a5bdbb',teal:'#087e73',tealSoft:'#dcf1e9',amber:'#a96914',amberSoft:'#ffedca',blue:'#376dba',blueSoft:'#e4edfd',shadow:'rgba(34,58,61,.09)'};}

function rounded(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill?:string,stroke?:string,lineWidth=2){
 const radius=Math.min(Math.abs(w)/2,Math.abs(h)/2,r);
 ctx.beginPath();ctx.moveTo(x+radius,y);ctx.lineTo(x+w-radius,y);ctx.quadraticCurveTo(x+w,y,x+w,y+radius);ctx.lineTo(x+w,y+h-radius);ctx.quadraticCurveTo(x+w,y+h,x+w-radius,y+h);ctx.lineTo(x+radius,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-radius);ctx.lineTo(x,y+radius);ctx.quadraticCurveTo(x,y,x+radius,y);ctx.closePath();
 if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}
}
function ellipse(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string,stroke?:string,angle=0,lineWidth=2){ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),angle,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}}
function line(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,width=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function polygon(ctx:CanvasRenderingContext2D,pts:number[][],fill:string,stroke?:string,width=2){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function label(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,maxWidth:number,color:string,size=20,bold=false,align:CanvasTextAlign='center'){
 ctx.font=`${bold?600:400} ${size}px ui-sans-serif, system-ui, sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;
 let text=String(value??'').replace(/[\r\n\t]/g,' ').slice(0,180);
 if(ctx.measureText(text).width>maxWidth){while(text.length&&ctx.measureText(text+'…').width>maxWidth)text=text.slice(0,-1);text+='…';}
 ctx.fillText(text,x,y,Math.max(1,maxWidth));
}
function arrow(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,width=2.5){
 line(ctx,x1,y1,x2,y2,color,width);const a=Math.atan2(y2-y1,x2-x1),l=9;line(ctx,x2,y2,x2-l*Math.cos(a-.5),y2-l*Math.sin(a-.5),color,width);line(ctx,x2,y2,x2-l*Math.cos(a+.5),y2-l*Math.sin(a+.5),color,width);
}
function title(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette,w:number,reserve=0){label(ctx,e.label,14,21,w-28-reserve,p.ink,21,true,'left');}
function extraCount(ctx:CanvasRenderingContext2D,hidden:number,w:number,p:Palette){if(hidden>0){rounded(ctx,w-57,6,45,23,10,p.panel);label(ctx,`+${hidden}`,w-34,18,38,p.muted,14,true);}}
function seedNumber(seed:number,offset:number){const n=Math.sin((seed+7)*127.1+offset*311.7)*43758.5453;return n-Math.floor(n);}

function drawCow(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 // A 200 × 176 view box; variations are deterministic so saved cows keep their identity.
 const variant=Math.abs(Math.trunc(e.variant)),coats=[
  {coat:'#fffdf4',spot:'#354448',head:'#fffdf4',ear:'#354448'},
  {coat:'#f2d0a1',spot:'#9c573c',head:'#f7dfbc',ear:'#9c573c'},
  {coat:'#fff8e9',spot:'#b66c44',head:'#fff1d6',ear:'#b66c44'},
  {coat:'#d1d6d2',spot:'#53605b',head:'#eef0e8',ear:'#53605b'},
  {coat:'#edd7ab',spot:'#c39b5d',head:'#faedce',ear:'#b89051'},
  {coat:'#4b5350',spot:'#f7f2e3',head:'#f5efdc',ear:'#4b5350'},
 ];
 const c=coats[variant%coats.length],outline='#47504b';
 ellipse(ctx,101,147,76,7,p.shadow);
 ctx.save();if(variant%2){ctx.translate(200,0);ctx.scale(-1,1);}
 // The tail and far legs remain behind the body.
 ctx.beginPath();ctx.moveTo(44,73);ctx.bezierCurveTo(17,69,26,39,17,34);ctx.strokeStyle=outline;ctx.lineWidth=4;ctx.stroke();
 ellipse(ctx,18,34,5,10,c.spot,outline,-.25,1.5);
 for(const x of [61,121]){rounded(ctx,x,105,13,39,5,c.coat,outline,2.2);rounded(ctx,x-1,137,15,9,2,'#4d5148');}
 ellipse(ctx,112,116,20,12,'#edb5a4',outline,0,1.7);
 for(const x of [103,115,124])rounded(ctx,x,119,4,10,2,'#edb5a4',outline,1.4);
 ellipse(ctx,95,83,64,40,c.coat,outline,0,2.6);
 ctx.save();ctx.beginPath();ctx.ellipse(95,83,62.5,38.5,0,0,Math.PI*2);ctx.clip();
 for(let i=0;i<3+(variant%2);i++){
  const px=48+seedNumber(variant,i)*88,py=57+seedNumber(variant,i+11)*48,rx=11+seedNumber(variant,i+21)*14,ry=10+seedNumber(variant,i+31)*17;
  ctx.beginPath();ctx.moveTo(px-rx,py);ctx.bezierCurveTo(px-rx*.9,py-ry*1.2,px+rx*.2,py-ry*.8,px+rx*.7,py-ry*.6);ctx.bezierCurveTo(px+rx*1.3,py,px+rx*.6,py+ry*.9,px,py+ry);ctx.bezierCurveTo(px-rx*.7,py+ry*1.2,px-rx*.5,py+ry*.2,px-rx,py);ctx.fillStyle=c.spot;ctx.fill();
 }
 ctx.restore();
 for(const x of [48,126]){rounded(ctx,x,105,14,40,5,c.coat,outline,2.3);rounded(ctx,x-1,137,16,10,2,'#414b44');line(ctx,x+7,139,x+7,145,'#7b8274',1);}
 // Ears, small curved horns and a broad pink muzzle make the silhouette readable.
 ellipse(ctx,140,50,16,8,c.ear,outline,-.45,2);ellipse(ctx,190,49,12,7,c.ear,outline,.4,2);
 ellipse(ctx,139,50,9,3,'#dea595',undefined,-.45);ellipse(ctx,190,49,7,3,'#dea595',undefined,.4);
 if(variant%3!==1){
  ctx.beginPath();ctx.moveTo(148,45);ctx.quadraticCurveTo(139,31,147,24);ctx.quadraticCurveTo(147,35,157,39);ctx.closePath();ctx.fillStyle='#e9dfbd';ctx.fill();ctx.strokeStyle=outline;ctx.lineWidth=1.8;ctx.stroke();
  ctx.beginPath();ctx.moveTo(180,43);ctx.quadraticCurveTo(190,30,184,24);ctx.quadraticCurveTo(181,35,173,39);ctx.closePath();ctx.fill();ctx.stroke();
 }
 rounded(ctx,142,38,45,63,19,c.head,outline,2.4);
 if(variant%3===0){ellipse(ctx,151,55,12,15,c.spot);ellipse(ctx,159,40,11,5,c.spot);}
 else if(variant%3===2)ellipse(ctx,178,53,8,13,c.spot);
 for(const x of [153,177]){ellipse(ctx,x,65,3.5,4.8,'#fffdf8');ellipse(ctx,x+.6,65,2.2,3.3,'#293c38');ellipse(ctx,x+1,64, .8,1,'#fff');}
 ellipse(ctx,166,90,25,15,'#e8b2a2',outline,0,2.2);
 ellipse(ctx,155,88,3.4,2.4,'#9f6c60');ellipse(ctx,177,88,3.4,2.4,'#9f6c60');
 ctx.beginPath();ctx.moveTo(159,97);ctx.quadraticCurveTo(166,101,173,97);ctx.strokeStyle='#9f6c60';ctx.lineWidth=1.6;ctx.stroke();
 line(ctx,141,104,157,109,variant%2?'#c47e37':'#228e83',5);
 polygon(ctx,[[146,109],[155,109],[158,120],[143,120]],'#f0bc55',outline,1.5);ellipse(ctx,151,122,2,2,outline);
 ctx.restore();label(ctx,e.label,100,166,184,p.ink,19,true);
}

function drawFarmer(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const skin='#e9b488',outline='#485550',shirt=Math.abs(e.variant)%2?'#9e7350':'#648d76';
 ellipse(ctx,78,213,51,7,p.shadow);
 // Boots, trouser legs, shirt sleeves and visible hands.
 rounded(ctx,48,153,24,49,7,'#385a70',outline,2);rounded(ctx,84,153,24,49,7,'#41677d',outline,2);
 rounded(ctx,40,192,34,19,6,'#67513f',outline,2);rounded(ctx,83,192,35,19,6,'#67513f',outline,2);
 line(ctx,43,208,72,208,'#382f28',3);line(ctx,85,208,116,208,'#382f28',3);
 ctx.save();ctx.translate(43,91);ctx.rotate(.2);rounded(ctx,-11,0,23,63,10,shirt,outline,2);ellipse(ctx,0,66,10,13,skin,outline,0,2);ctx.restore();
 ctx.save();ctx.translate(111,91);ctx.rotate(-.2);rounded(ctx,-11,0,23,63,10,shirt,outline,2);ellipse(ctx,0,66,10,13,skin,outline,0,2);ctx.restore();
 rounded(ctx,46,82,63,83,18,shirt,outline,2.5);
 // Checked shirt details remain quiet behind the blue bib.
 for(const yy of [95,110,125])line(ctx,48,yy,107,yy,'#bfd1b5',1.1);
 for(const xx of [54,68,83,98])line(ctx,xx,86,xx,148,'#bfd1b5',1.1);
 polygon(ctx,[[52,91],[62,91],[64,115],[91,115],[94,91],[104,91],[106,165],[48,165]],'#527d91',outline,2.2);
 rounded(ctx,62,125,31,22,4,'#618fa0','#385a70',1.5);line(ctx,65,129,91,129,'#a2bdc4',1.2);
 for(const xx of [59,97])ellipse(ctx,xx,115,2.7,2.7,'#edc16d',outline,0,1);
 // Neck, ears, face and moustache.
 rounded(ctx,67,72,21,22,5,skin,outline,1.8);
 ellipse(ctx,50,60,7,11,skin,outline,0,1.8);ellipse(ctx,104,60,7,11,skin,outline,0,1.8);
 rounded(ctx,51,35,52,49,20,skin,outline,2.2);
 ellipse(ctx,62,63,8,5,'#e2a17d');ellipse(ctx,94,63,8,5,'#e2a17d');
 for(const xx of [65,89]){line(ctx,xx-4,49,xx+4,48,'#6e5441',2.5);ellipse(ctx,xx,56,2.2,3,'#354942');}
 ctx.beginPath();ctx.moveTo(77,57);ctx.quadraticCurveTo(73,65,79,65);ctx.strokeStyle='#b37e5e';ctx.lineWidth=1.5;ctx.stroke();
 ellipse(ctx,71,69,8,3.5,'#77614a',undefined,-.15);ellipse(ctx,84,69,8,3.5,'#77614a',undefined,.15);
 ctx.beginPath();ctx.moveTo(72,75);ctx.quadraticCurveTo(78,78,84,74);ctx.strokeStyle='#9c684d';ctx.lineWidth=1.5;ctx.stroke();
 // Wide straw hat: crown and brim are distinct, rather than a flat rectangle.
 ctx.beginPath();ctx.moveTo(51,36);ctx.lineTo(55,14);ctx.quadraticCurveTo(77,4,99,14);ctx.lineTo(104,36);ctx.closePath();ctx.fillStyle='#ddbf78';ctx.fill();ctx.strokeStyle=outline;ctx.lineWidth=2;ctx.stroke();
 for(const xx of [62,72,83,93])line(ctx,xx,15,xx,31,'#c5a663',1.1);
 rounded(ctx,52,29,51,9,3,'#9e7650');ellipse(ctx,77,38,48,8,'#e9cf8a',outline,0,2.2);line(ctx,43,38,111,38,'#c1a56c',1);
 label(ctx,e.label,77.5,226,151,p.ink,17,true);
}

function drawFence(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const painted=Math.abs(e.variant)%4,outline='#84633f';
 ellipse(ctx,150,114,142,6,p.shadow);
 for(const yy of [49,84])rounded(ctx,8,yy,284,18,3,'#cfaa73',outline,2);
 for(let i=0;i<7;i++){
  const x=17+i*41,paintedHere=painted===0?i>=2&&i<=4:painted===1?i<=3:painted===2?i>=3:false;
  const fill=paintedHere?'#e6ddd0':i%2?'#dfbd89':'#e9c996';
  polygon(ctx,[[x,33],[x+11,23],[x+22,33],[x+22,116],[x,116]],fill,outline,2);
  line(ctx,x+6,43,x+6,104,paintedHere?'#c9c0b2':'#c09b69',1.2);line(ctx,x+16,61,x+16,100,paintedHere?'#cbc3b7':'#c09b69',1);
  for(const yy of [58,93])ellipse(ctx,x+11,yy,1.8,1.8,'#9b7d53');
 }
 label(ctx,e.label,150,133,280,p.ink,19,true);
}

function drawArray(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const values=e.values.slice(0,12),n=Math.max(1,values.length),gap=5,cell=(382-gap*(n-1))/n;
 title(ctx,e,p,410);extraCount(ctx,e.values.length-12,410,p);
 for(let i=0;i<n;i++){
  const x=14+i*(cell+gap);rounded(ctx,x,49,cell,51,7,i%2?p.surface:p.tealSoft,p.border,2);
  label(ctx,values[i]??'·',x+cell/2,75,cell-5,p.ink,n>8?16:25,true);label(ctx,String(i),x+cell/2,118,cell-4,p.muted,16);
 }
}

function drawDictionary(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const values=e.values.slice(0,8),n=Math.max(1,values.length),row=Math.min(51,193/n),top=46;
 title(ctx,e,p,290);extraCount(ctx,e.values.length-8,290,p);
 for(let i=0;i<n;i++){
  const value=values[i]??'key:value',colon=value.search(/[:：]/),key=colon>=0?value.slice(0,colon):value,val=colon>=0?value.slice(colon+1):'·',y=top+i*row;
  rounded(ctx,14,y,262,row-4,6,p.surface,p.border,1.6);rounded(ctx,15,y+1,119,row-6,5,p.tealSoft);
  label(ctx,key,74,y+(row-4)/2,106,p.teal,row<30?16:19,true);arrow(ctx,145,y+(row-4)/2,165,y+(row-4)/2,p.muted,1.6);
  label(ctx,val,216,y+(row-4)/2,90,p.ink,row<30?16:21,true);
 }
}

function drawQueue(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const values=e.values.slice(0,12),n=Math.max(1,values.length),gap=5,cell=(350-gap*(n-1))/n;
 title(ctx,e,p,440);extraCount(ctx,e.values.length-12,440,p);
 arrow(ctx,37,80,12,80,p.teal,3);arrow(ctx,428,80,404,80,p.blue,3);
 for(let i=0;i<n;i++){
  const x=45+i*(cell+gap);rounded(ctx,x,54,cell,51,7,i===0?p.tealSoft:p.surface,p.border,2);
  label(ctx,values[i]??'·',x+cell/2,80,cell-4,p.ink,n>8?14:23,true);
 }
 label(ctx,'队首 · 出队',50,127,96,p.teal,16,true,'left');label(ctx,'队尾 · 入队',391,127,96,p.blue,16,true,'right');
 label(ctx,'先进先出',220,148,150,p.muted,14);
}

function drawStack(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const values=e.values.slice(0,8),n=Math.max(1,values.length),row=Math.min(48,178/n),bottom=243,left=36,w=119;
 title(ctx,e,p,205);extraCount(ctx,e.values.length-8,205,p);
 ctx.beginPath();ctx.moveTo(left-6,58);ctx.lineTo(left-6,bottom+2);ctx.quadraticCurveTo(left-6,bottom+8,left,bottom+8);ctx.lineTo(left+w,bottom+8);ctx.quadraticCurveTo(left+w+6,bottom+8,left+w+6,bottom+2);ctx.lineTo(left+w+6,58);ctx.strokeStyle=p.border;ctx.lineWidth=2.5;ctx.stroke();
 for(let i=0;i<n;i++){
  const y=bottom-(i+1)*row;rounded(ctx,left,y,w,row-4,5,i===n-1?p.amberSoft:p.surface,p.border,1.7);
  label(ctx,values[i]??'·',left+w/2,y+(row-4)/2,w-15,p.ink,row<28?16:24,true);
 }
 const top=bottom-n*row;arrow(ctx,175,Math.max(48,top-20),175,Math.max(60,top+10),p.amber,2.4);label(ctx,'顶',181,Math.max(49,top-35),26,p.amber,15,true);
 label(ctx,'后进先出',97,269,175,p.muted,16);
}

function drawInterval(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 title(ctx,e,p,440);
 const first=Number(e.values[0]),second=Number(e.values[1]),valid=Number.isFinite(first)&&Number.isFinite(second)&&Math.abs(first)<1e9&&Math.abs(second)<1e9;
 const lo=valid?Math.min(first,second):2,hi=valid?Math.max(first,second):7;
 const span=Math.max(1,hi-lo),min=lo-span*.35,max=hi+span*.35,toX=(v:number)=>35+(v-min)/(max-min)*370;
 const a=toX(lo),b=toX(hi);line(ctx,26,97,416,97,p.muted,2);arrow(ctx,405,97,420,97,p.muted,2);
 for(let i=0;i<=10;i++){const x=35+i*37;line(ctx,x,91,x,103,p.border,1.4);}
 if(hi>lo)rounded(ctx,a,66,b-a,31,5,p.tealSoft);
 line(ctx,a,79,b,79,p.teal,5);
 for(const [x,value] of [[a,lo],[b,hi]]){line(ctx,x,74,x,104,p.teal,2.4);ellipse(ctx,x,79,5,5,p.teal);label(ctx,String(value),x,120,75,p.ink,19,true);}
 label(ctx,valid?`长度 ${Number((hi-lo).toPrecision(8))}`:'填写两个数字端点',220,145,240,p.muted,15);
}

function drawGraph(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 title(ctx,e,p,320);
 const nodes=[[57,88],[160,64],[263,101],[95,195],[232,197]],edges=[[0,1],[1,2],[0,3],[1,3],[2,4],[3,4]];
 for(const [a,b]of edges)line(ctx,nodes[a][0],nodes[a][1],nodes[b][0],nodes[b][1],p.border,2.5);
 for(let i=0;i<nodes.length;i++){
  const [x,y]=nodes[i];ellipse(ctx,x,y,25,25,i===0?p.tealSoft:p.surface,i===0?p.teal:p.border,0,2.5);
  label(ctx,e.values[i]??String.fromCharCode(65+i),x,y,39,p.ink,19,true);
 }
}

function drawText(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 rounded(ctx,4,4,312,220,12,p.amberSoft,p.border,1.6);
 rounded(ctx,14,19,4,186,2,p.amber);
 label(ctx,e.label,30,29,254,p.ink,21,true,'left');line(ctx,30,48,292,48,p.border,1);
 const rows=e.values.slice(0,6);
 rows.forEach((row,i)=>label(ctx,row,30,73+i*24,262,p.ink,19,false,'left'));
 if(!rows.length)label(ctx,'双击编辑内容',30,78,260,p.muted,18,false,'left');
}

function drawGrid(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const raw=e.values.slice(0,5).map(row=>row.trim()?row.trim().split(/\s+/):[]),rows=Math.max(1,raw.length),cols=Math.max(1,Math.min(6,Math.max(0,...raw.map(row=>row.length))));
 const left=53,top=74,cw=348/cols,ch=Math.min(62,205/rows),hidden=e.values.length-5;
 title(ctx,e,p,420,hidden>0?53:0);extraCount(ctx,hidden,420,p);
 label(ctx,'c',31,53,20,p.muted,15,true);label(ctx,'r',23,top-8,20,p.muted,15,true);
 for(let c=0;c<cols;c++)label(ctx,String(c),left+(c+.5)*cw,53,cw-5,p.muted,17);
 for(let r=0;r<rows;r++){
  label(ctx,String(r),26,top+(r+.5)*ch,32,p.muted,17);
  for(let c=0;c<cols;c++){
   const value=raw[r]?.[c]??'·',x=left+c*cw,y=top+r*ch,blocked=value==='#',highlight=value==='1';
   rounded(ctx,x+2,y+2,cw-4,ch-4,6,blocked?p.panel:highlight?p.tealSoft:p.surface,p.border,1.6);
   if(blocked){line(ctx,x+cw*.35,y+ch*.35,x+cw*.65,y+ch*.65,p.muted,2);line(ctx,x+cw*.65,y+ch*.35,x+cw*.35,y+ch*.65,p.muted,2);}
   else label(ctx,value,x+cw/2,y+ch/2,cw-12,highlight?p.teal:p.ink,21,highlight);
  }
 }
 const cropped=raw.some(row=>row.length>6);label(ctx,cropped?'仅展示前 6 列':'grid[r][c]',227,296,350,p.muted,15);
}

function pointerData(values:string[]){
 const data:string[]=[];let i:number|undefined,j:number|undefined;
 for(const value of values){const pointer=value.trim().match(/^([ij])\s*=\s*(-?\d+)$/i);if(pointer){if(pointer[1].toLowerCase()==='i')i=Number(pointer[2]);else j=Number(pointer[2]);}else data.push(value);}
 const end=Math.max(0,Math.min(12,data.length)-1);return {data:data.slice(0,12),hidden:data.length-12,i:clamp(i??0,0,end),j:clamp(j??end,0,end)};
}
function drawPointers(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const {data,hidden,i,j}=pointerData(e.values),n=Math.max(1,data.length),gap=5,cw=(452-gap*(n-1))/n,left=14;
 title(ctx,e,p,480,hidden>0?53:0);extraCount(ctx,hidden,480,p);
 for(let k=0;k<n;k++){
  const x=left+k*(cw+gap),between=k>=Math.min(i,j)&&k<=Math.max(i,j);
  rounded(ctx,x,83,cw,48,7,k===i?p.tealSoft:k===j?p.blueSoft:between?p.panel:p.surface,k===i?p.teal:k===j?p.blue:p.border,2);
  label(ctx,data[k]??'·',x+cw/2,107,cw-7,p.ink,n>9?16:24,true);label(ctx,String(k),x+cw/2,150,cw-4,p.muted,16);
 }
 const ix=left+i*(cw+gap)+cw/2,jx=left+j*(cw+gap)+cw/2;
 label(ctx,`i = ${i}`,ix,49,Math.max(cw,60),p.teal,17,true);arrow(ctx,ix,62,ix,78,p.teal,2.5);
 arrow(ctx,jx,188,jx,163,p.blue,2.5);label(ctx,`j = ${j}`,jx,205,Math.max(cw,60),p.blue,17,true);
}

function numberValue(value:string):number|null {if(!value?.trim())return null;const n=Number(value);return Number.isFinite(n)?n:null;}
function numberLabel(value:number):string {return Number.isInteger(value)?String(value):String(Number(value.toPrecision(12)));}
function drawPrefix(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const data=e.values.slice(0,10),n=data.length,gap=4,cw=(452-gap*n)/(n+1),left=54,hidden=e.values.length-10,prefix:(number|null)[]=[0];
 for(const value of data){const a=numberValue(value),previous=prefix[prefix.length-1];prefix.push(a===null||previous===null||!Number.isFinite(previous+a)?null:previous+a);}
 title(ctx,e,p,520,hidden>0?53:0);extraCount(ctx,hidden,520,p);
 label(ctx,'a',29,76,28,p.ink,21,true);label(ctx,'p',29,152,28,p.teal,21,true);
 for(let k=0;k<=n;k++){
  const x=left+k*(cw+gap);
  if(k>0){rounded(ctx,x,54,cw,43,6,p.surface,p.border,1.6);label(ctx,data[k-1],x+cw/2,76,cw-7,p.ink,n>7?16:23,true);label(ctx,String(k-1),x+cw/2,112,cw-3,p.muted,14);}
  rounded(ctx,x,130,cw,43,6,k===0?p.panel:p.tealSoft,p.border,1.6);label(ctx,prefix[k]===null?'—':numberLabel(prefix[k]!),x+cw/2,152,cw-7,p.teal,n>7?16:22,true);label(ctx,String(k),x+cw/2,187,cw-3,p.muted,14);
 }
 label(ctx,prefix.some(value=>value===null)?'请输入有效数字，才能计算后续前缀和':'p[0] = 0    p[k+1] = p[k] + a[k]',275,211,480,p.muted,15);
}

function treePositions(count:number,width:number,top:number,bottom:number){
 const levels=Math.max(1,Math.ceil(Math.log2(count+1))),positions:{x:number;y:number}[]=[];
 for(let i=0;i<count;i++){const level=Math.floor(Math.log2(i+1)),first=2**level-1,slots=2**level;positions.push({x:(i-first+.5)*width/slots,y:levels===1?top:top+level*(bottom-top)/(levels-1)});}
 return positions;
}
function treeLinks(ctx:CanvasRenderingContext2D,positions:{x:number;y:number}[],visible:boolean[],p:Palette){
 for(let i=1;i<positions.length;i++)if(visible[i]&&visible[Math.floor((i-1)/2)]){const a=positions[Math.floor((i-1)/2)],b=positions[i];line(ctx,a.x,a.y,b.x,b.y,p.border,2.3);}
}
function drawTree(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const data=e.values.slice(0,15),n=data.length,hidden=e.values.length-15,positions=treePositions(n,460,71,251),visible:boolean[]=[];
 title(ctx,e,p,460,hidden>0?53:0);extraCount(ctx,hidden,460,p);
 for(let i=0;i<n;i++)visible[i]=!!data[i].trim()&&!/^(_|null)$/i.test(data[i].trim())&&(i===0||visible[Math.floor((i-1)/2)]);
 treeLinks(ctx,positions,visible,p);
 positions.forEach(({x,y},i)=>{if(!visible[i])return;ellipse(ctx,x,y,21,21,i===0?p.tealSoft:p.surface,i===0?p.teal:p.border,0,2.3);label(ctx,data[i],x,y,35,p.ink,18,true);});
 if(!visible.some(Boolean))label(ctx,'填写根节点与孩子节点',230,151,410,p.muted,18);
 label(ctx,'层序 · 左孩子 2i+1，右孩子 2i+2',230,289,430,p.muted,14);
}

/** Bottom-up heap construction; the rendered tree and storage row use the same result. */
function minHeap(values:number[]):number[]{
 const heap=[...values];
 for(let root=Math.floor(heap.length/2)-1;root>=0;root--){let parent=root;while(parent*2+1<heap.length){let child=parent*2+1;if(child+1<heap.length&&heap[child+1]<heap[child])child++;if(heap[parent]<=heap[child])break;[heap[parent],heap[child]]=[heap[child],heap[parent]];parent=child;}}
 return heap;
}
function drawHeap(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const data=e.values.slice(0,7),numbers=data.map(numberValue),valid=numbers.every(n=>n!==null),heap=valid?minHeap(numbers as number[]):[],n=data.length,hidden=e.values.length-7;
 title(ctx,e,p,450,hidden>0?53:0);extraCount(ctx,hidden,450,p);
 if(valid&&n){
  const positions=treePositions(n,450,76,202);treeLinks(ctx,positions,positions.map(()=>true),p);
  positions.forEach(({x,y},i)=>{ellipse(ctx,x,y,24,24,i===0?p.tealSoft:p.surface,i===0?p.teal:p.border,0,2.3);label(ctx,numberLabel(heap[i]),x,y,40,p.ink,20,true);});
  label(ctx,'最小值',263,76,123,p.teal,16,true,'left');
 }else label(ctx,n?'请输入有效数字':'填写数字后自动建堆',225,135,414,p.muted,19);
 label(ctx,'堆数组 · 层序存储',225,250,420,p.muted,16);
 const cells=Math.max(1,n),gap=5,cw=(422-gap*(cells-1))/cells;
 for(let i=0;i<cells;i++){const x=14+i*(cw+gap);rounded(ctx,x,270,cw,39,6,i===0?p.tealSoft:p.surface,p.border,1.6);label(ctx,valid?(heap[i]===undefined?'·':numberLabel(heap[i])):data[i],x+cw/2,290,cw-8,p.ink,21,true);label(ctx,String(i),x+cw/2,327,cw-4,p.muted,15);}
}

function drawLinked(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 const data=e.values.slice(0,6),n=data.length,hidden=e.values.length-6;
 title(ctx,e,p,560,hidden>0?53:0);extraCount(ctx,hidden,560,p);
 if(!n){label(ctx,'head',44,96,70,p.teal,20,true);arrow(ctx,89,96,132,96,p.muted,2);label(ctx,'null',163,96,65,p.muted,21);return;}
 const gap=22,cw=(530-52-gap*n)/n;
 label(ctx,'head',14+cw/2,47,Math.max(44,cw),p.teal,16,true);arrow(ctx,14+cw/2,59,14+cw/2,67,p.teal,2);
 for(let i=0;i<n;i++){
  const x=14+i*(cw+gap),divider=x+cw*.7;rounded(ctx,x,73,cw,49,6,i===0?p.tealSoft:p.surface,p.border,1.8);line(ctx,divider,74,divider,121,p.border,1.6);
  label(ctx,data[i],x+cw*.35,97,cw*.7-7,p.ink,n>4?18:23,true);ellipse(ctx,x+cw*.85,97,2.6,2.6,p.muted);arrow(ctx,x+cw*.85+4,97,x+cw+gap-3,97,p.muted,1.8);
  label(ctx,String(i),x+cw/2,142,cw-3,p.muted,14);
 }
 label(ctx,'null',14+n*(cw+gap)+26,97,52,p.muted,19,true);
 label(ctx,'value | next',280,165,510,p.muted,14);
}

function drawState(ctx:CanvasRenderingContext2D,e:TeachingElement,p:Palette){
 title(ctx,e,p,560);
 const names=[e.values[0]??'S0',e.values[1]??'S1',e.values[2]??'S2'],edges=[e.values[3]??'a',e.values[4]??'b',e.values[5]??'reset'],centers=[84,280,476];
 for(let i=0;i<3;i++){
  const x=centers[i];rounded(ctx,x-68,93,136,52,13,i===0?p.tealSoft:i===2?p.amberSoft:p.surface,i===0?p.teal:i===2?p.amber:p.border,2);
  label(ctx,names[i],x,119,118,p.ink,21,true);
  if(i<2){arrow(ctx,x+73,119,centers[i+1]-73,119,p.muted,2.3);label(ctx,edges[i],(x+centers[i+1])/2,81,84,p.muted,17,true);}
 }
 ctx.beginPath();ctx.moveTo(476,151);ctx.lineTo(476,179);ctx.quadraticCurveTo(476,190,465,190);ctx.lineTo(95,190);ctx.quadraticCurveTo(84,190,84,179);ctx.lineTo(84,151);ctx.strokeStyle=p.blue;ctx.lineWidth=2.3;ctx.stroke();
 arrow(ctx,84,167,84,151,p.blue,2.3);
 rounded(ctx,218,177,124,26,9,p.surface);label(ctx,edges[2],280,190,113,p.blue,17,true);
}

/** Draw within the element's own bounds; never changes the caller's canvas state. */
export function drawElement(ctx:CanvasRenderingContext2D,e:TeachingElement,dark:boolean):void {
 if(!Number.isFinite(e.x)||!Number.isFinite(e.y)||!Number.isFinite(e.w)||!Number.isFinite(e.h)||e.w<=0||e.h<=0)return;
 const item=elementCatalog.find(entry=>entry.kind===e.kind);if(!item)return;
 const p=palette(dark);ctx.save();ctx.translate(e.x,e.y);ctx.scale(e.w/item.width,e.h/item.height);
 ctx.beginPath();ctx.rect(0,0,item.width,item.height);ctx.clip();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash([]);
 switch(e.kind){
  case 'cow':ctx.scale(item.width/200,item.height/176);drawCow(ctx,e,p);break;
  case 'farmer':drawFarmer(ctx,e,p);break;
  case 'fence':drawFence(ctx,e,p);break;
  case 'array':drawArray(ctx,e,p);break;
  case 'dictionary':drawDictionary(ctx,e,p);break;
  case 'queue':drawQueue(ctx,e,p);break;
  case 'stack':drawStack(ctx,e,p);break;
  case 'interval':drawInterval(ctx,e,p);break;
  case 'graph':drawGraph(ctx,e,p);break;
  case 'text':drawText(ctx,e,p);break;
  case 'grid':drawGrid(ctx,e,p);break;
  case 'pointers':drawPointers(ctx,e,p);break;
  case 'prefix':drawPrefix(ctx,e,p);break;
  case 'tree':drawTree(ctx,e,p);break;
  case 'heap':drawHeap(ctx,e,p);break;
  case 'linked':drawLinked(ctx,e,p);break;
  case 'state':drawState(ctx,e,p);break;
 }
 ctx.restore();
}
