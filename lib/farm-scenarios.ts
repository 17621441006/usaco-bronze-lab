export const storyKinds=['complexity','buckets','pairs','herd','breeds','balance','feed','pasture','hayline','choices','barns'] as const;
export type StoryKind=(typeof storyKinds)[number];
export type FarmNode={id:string;name:string;value:string|number;x:number;z:number;type:'cow'|'bucket'|'hay'|'barn';active?:boolean;done?:boolean;capacity?:number};
export type FarmFrame={title:string;task:string;unit:string;nodes:FarmNode[];facts:string[];edges?:[number,number][];selection?:number[]};
export function isStoryKind(kind:string):kind is StoryKind{return (storyKinds as readonly string[]).includes(kind);}
const names=['A','B','C','D','E'];
export function farmFrame(kind:StoryKind,rawStep:number):FarmFrame{
 const s=Math.max(0,Math.min(3,rawStep));
 const row=(values:(string|number)[],type:FarmNode['type']='cow'):FarmNode[]=>values.map((v,i)=>({id:names[i],name:names[i],value:v,x:(i-(values.length-1)/2)*2,z:0,type}));
 switch(kind){
 case 'complexity':return {title:'FJ 检查牛群',task:'一次检查一头，还是检查每一对？',unit:'数字表示牛的编号；连线是一组待比较的牛',nodes:row(['A','B','C','D']).map((n,i)=>({...n,active:s===0||i===0,done:s===3})),edges:s>0?[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]:[],facts:[s===0?'逐头检查：4 次':'不同的无序对：6 组',s>1?'N=100,000 时：4,999,950,000 对':'N=4']};
 case 'buckets':{const amounts=[[3,4,5],[0,7,5],[0,0,12],[10,0,2]][s];return {title:'FJ 倒牛奶',task:'倒出量不能超过源桶现有量，也不能超过目标桶剩余容量。',unit:'桶内蓝色表示牛奶，桶上方显示当前量 / 容量',nodes:row(amounts,'bucket').map((n,i)=>({...n,name:`${i+1} 号桶`,capacity:[10,11,12][i],active:s>0&&i===[1,2,0][s-1]})),edges:s>0?[[[0,1,2][s-1],[1,2,0][s-1]]]:[],facts:[`各桶牛奶：${amounts.join(' / ')}`,'总量始终为 12',s?`本次倒出：${[0,3,7,10][s]}`:'尚未倒奶']};}
 case 'pairs':return {title:'Bessie 选择两袋饲料',task:'目标总重 9，只能选择两个不同位置。',unit:'每堆草下方是编号，上方是重量',nodes:row([2,4,7,5],'hay').map((n,i)=>({...n,active:(s===1?[0,2]:s===2?[1,3]:[]).includes(i),done:s===3})),edges:s===1?[[0,2]]:s===2?[[1,3]]:s===3?[[0,2],[1,3]]:[],facts:['候选对：6',s===0?'合法对：待检查':s===1?'已找到：A+C = 2+7 = 9':s===2?'又找到：B+D = 4+5 = 9':'合法对：2']};
 case 'herd':{const order=[[0,1,2,3],[3,0,1,2],[3,1,0,2],[3,1,0,2]][s];return {title:'按身高给牛排队',task:'身高从小到大；编号随牛一起移动。',unit:'数字是身高，字母是牛的固定编号',nodes:order.map((i,pos)=>({id:names[i],name:names[i],value:[4,2,7,1][i],type:'cow',x:(pos-1.5)*2,z:0,active:pos===s-1,done:s===3})),facts:[`队伍：${order.map(i=>names[i]).join(' → ')}`,`身高：${order.map(i=>[4,2,7,1][i]).join(', ')}`]};}
 case 'breeds':{const count=[0,1,2,5][s];return {title:'FJ 按品种登记',task:'每头牛只登记一次，再用各品种的数量计算配对。',unit:'G / H 是品种；橙色为当前登记，绿色为已登记',nodes:row(['G','H','G','G','H']).map((n,i)=>({...n,done:i<count,active:i===count-1})),facts:[`G：${[0,1,1,3][s]}`,`H：${[0,0,1,2][s]}`,s===3?'同品种配对：4 组':'登记顺序与最终频次无关']};}
 case 'balance':{const vals=s<3?[4,2,6,4]:[4,4,4,4];return {title:'把草料搬得一样多',task:'每次搬一捆，可以从任意栏搬到任意另一栏。',unit:'每叠是一栏草料，数字是捆数；牛栏目标均为 4',nodes:row(vals,'hay').map((n,i)=>({...n,active:s>0&&[1,2].includes(i),done:s===3})),edges:s===2?[[2,1]]:[],facts:['总量：16','目标：每栏 4',s<2?'缺口：2':'最少搬运：2 次']};}
 case 'feed':return {title:'给沿路的牛设饲喂站',task:'站点可任意摆放，每站覆盖左右各 1 单位。',unit:'数字是牛的位置，橙色标志是饲喂站',nodes:row([1,2,5,6]).map((n,i)=>({...n,x:(Number(n.value)-3.5)*1.2,done:s>=1&&i<2||s>=2&&i>=2,active:s===0&&i===0||s===1&&i===2})),facts:[`已放站：${s===0?'无':s===1?'2':'2、6'}`,`已覆盖：${s===0?0:s===1?2:4} / 4`],selection:s===0?[]:s===1?[2]:[2,6]};
 case 'pasture':return {title:'两块草地的总面积',task:'FJ 的 A 草地和 Bessie 的 B 草地有重叠。',unit:'网格每格 1×1；蓝色 A，橙色 B，紫色为共同部分',nodes:[],facts:['A 面积：12','B 面积：9',s>0?'重叠面积：4':'观察两块草地',s===3?'并集面积：17':'交集长×宽：2×2']};
 case 'hayline':return {title:'Bessie 查询一段牛槽',task:'只计算第 1、2 号牛槽，即 [1,3) 的草量。',unit:'每堆是一个牛槽，数字是草量；绿色为查询范围',nodes:row([4,2,7,1],'hay').map((n,i)=>({...n,name:`槽 ${i}`,done:s>=2&&[1,2].includes(i)})),facts:[s>0?'p = [0,4,6,13,14]':'a = [4,2,7,1]',s>=2?'[1,3)：p[3] − p[1] = 13 − 4 = 9':'p[i] 累计前 i 个槽']};
 case 'choices':{const masks=[0,0,4,2],mask=masks[s];return {title:'Bessie 挑选三袋饲料',task:'每袋都有“取”和“不取”两条分支。',unit:'橙色表示当前选取的袋子；线表示递归的选择顺序',nodes:row([2,4,7],'hay').map((n,i)=>({...n,active:!!(mask&(1<<i))})),facts:['完整选择树：8 个叶子',`当前分支：${s===0?'尚未开始':s===1?'空集':s===2?'{C}':'{B}'}`,s===3?'撤回 C，再探索 B 分支':'选择 / 递归 / 撤回']};}
 case 'barns':return {title:'Bessie 能到哪些牛棚？',task:'道路为 A—B 和 B—C；D 独立。',unit:'点代表牛棚，线代表双向道路；绿色代表已经到达',nodes:[[-3,-1],[0,1],[3,-1],[3,3]].map(([x,z],i)=>({id:names[i],name:`牛棚 ${names[i]}`,value:names[i],x,z,type:'barn',done:i<=Math.min(s,2),active:i===Math.min(s,2)})),edges:[[0,1],[1,2]],facts:[`visited = {${names.slice(0,Math.min(s,2)+1).join(', ')}}`,s===3?'可达 3 个；D 不可达':'走过的牛棚不重复加入']};
 }
}
