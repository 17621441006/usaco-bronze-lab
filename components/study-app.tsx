'use client';
import { useEffect,useState,useRef,lazy,Suspense } from 'react';
import { Code2,Route,Library,Box,Timer,BookMarked,ExternalLink,BookOpen,Database } from 'lucide-react';
import { SidebarProvider,SidebarInset,SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { Table,TableHeader,TableBody,TableRow,TableHead,TableCell } from '@/components/ui/table';
import { Tabs,TabsList,TabsTrigger,TabsContent } from '@/components/ui/tabs';
import PracticeWorkspace,{Choice,type Problem,type Attempt} from './practice-workspace';
import {CoursePage} from './course-page';
import {foundationIds,courseCount,pythonLessons,algorithmLessons} from '@/data/course-lessons';
import raw from '@/data/catalog.json';
import statementReport from '@/data/statement-import-report.json';
import { PageTabs,type PageTab } from './page-tabs';
import {AnnotationLauncher} from './annotation-launcher';
import {CodingToolLaunchers} from './coding-tool-launchers';
const CodingTools=lazy(()=>import('./coding-tools'));
const PageAnnotations=lazy(()=>import('./page-annotations'));
import {StudyNavigation} from './study-navigation';
import {RouteHome} from './route-home';
import {ExamPage} from './exam-page';
import {ReviewPage} from './review-page';
import {SourcesPage} from './sources-page';
import {ProblemLibrary,type LibraryRequest} from './problem-library';
import learningTopics from '@/data/learning-topics.json';
import {topicMatches} from '@/lib/problem-library';
const problems=raw as Problem[];
const nav=[['route','学习路线',Route],['python','Python 基础',Code2],['classroom','算法课堂',Box],['library','真题练习',Library],['exam','模拟考试',Timer],['review','错题与笔记',BookMarked],['sources','考点与来源',Database]] as const;
const modules=[
 {num:'01',name:'Python 必要基础',sub:'数据类型 · 常用函数 · 条件循环 · 列表字典',desc:`${pythonLessons.length} 节基础课、${pythonLessons.length*3} 道递进练习，从数据类型到竞赛读入。`,lesson:'types',level:'起步',ids:[987]},
 {num:'02',name:'先选可行的方法',sub:'规模估算 · 模拟 · 枚举 · 区间标记',desc:'看数据范围，画出状态，完整枚举，再用边界样例检查。',lesson:'complexity',level:'基础方法',ids:[1060,855,567]},
 {num:'03',name:'用顺序与频次简化',sub:'排序 · 集合 · 字典 · 贡献计数',desc:'从逐对比较过渡到分组统计，解释省掉了哪些重复计算。',lesson:'sorting',level:'基础方法',ids:[1251,1179]},
 {num:'04',name:'Ad Hoc 与贪心思考',sub:'小例子 · 分类讨论 · 不变量 · 构造与证明',desc:'不急着套模板：寻找规律，尝试反例，说明解法为什么成立。',lesson:'adhoc',level:'思维训练',ids:[1539,1395,1252]},
 {num:'05',name:'建立空间与关系模型',sub:'矩形几何 · 前缀差分 · 递归回溯 · 图',desc:'把图形、区间和关系变成可计算的数据，按专题练习。',lesson:'geometry',level:'专题训练',ids:[759,1203,916]},
 {num:'06',name:'迁移到近年真题',sub:'三维坐标 · 对称分组 · 重复块 · 位掩码',desc:'先理解教学场景，再到完整真题里处理新增限制。',lesson:'grid',level:'综合训练',ids:[1444,1491,1493,1564]},
 {num:'07',name:'进阶衔接与多解比较',sub:'二分边界 · 基础 DP · 可选优化',desc:'了解状态复用等工具；区分题目主解与另一条可行路线。',lesson:'binary',level:'铜升银衔接',ids:[1157,1564]},
 {num:'08',name:'真题、模考与复盘',sub:'近期真题 · 限时训练 · 错题重练',desc:'逐步收起辅助，把课堂知识迁移到陌生题中。',lesson:'exam',level:'冲刺',ids:[1587,1588,1589]},
];
export default function StudyApp(){
 const [annotationOpen,setAnnotationOpen]=useState(false);
 useEffect(()=>{const toggle=()=>setAnnotationOpen(v=>!v);window.addEventListener('usaco-toggle-annotations',toggle);return()=>window.removeEventListener('usaco-toggle-annotations',toggle);},[]);
 const [navOpen,setNavOpen]=useState(true),[openTabs,setOpenTabs]=useState<PageTab[]>([{key:'route',page:'route',label:'学习路线'}]);
 const scrollPositions=useRef<Record<string,number>>({}),currentTab=useRef('route');
 const [page,setPage]=useState('route'),[problemId,setProblemId]=useState(567),[mode,setMode]=useState('learning'),[lessonId,setLessonId]=useState('complexity');
 const [libraryRequest,setLibraryRequest]=useState<LibraryRequest>();
 const [attempts,setAttempts]=useState<Attempt[]>([]),[done,setDone]=useState<string[]>([]),[examRound,setExamRound]=useState('2026 第 3 场'),[examEnd,setExamEnd]=useState<number|null>(null),[now,setNow]=useState(Date.now()),[ready,setReady]=useState(false);
 const audited=problems.filter(p=>p.reviewStatus==='已核验');const rounds=[...new Set(problems.map(p=>p.roundLabel))];
 const activeKey=page==='practice'?`practice/${problemId}`:page;
 function rememberTab(dest:string,id?:number){const actualId=dest==='practice'?(id||problemId):undefined,key=dest==='practice'?`practice/${actualId}`:dest,label=dest==='practice'?(problems.find(p=>p.id===actualId)?.title||'题目'):(nav.find(n=>n[0]===dest)?.[1]||dest);setOpenTabs(tabs=>tabs.some(t=>t.key===key)?tabs:[...tabs,{key,page:dest,label,problemId:actualId}]);return key;}
 function go(dest:string,id?:number){scrollPositions.current[currentTab.current]=window.scrollY;const key=rememberTab(dest,id);currentTab.current=key;setPage(dest);if(dest==='practice')setNavOpen(false);if(id)setProblemId(id);window.location.hash=key;requestAnimationFrame(()=>window.scrollTo({top:scrollPositions.current[key]||0,behavior:'instant'}));}
 function closeTab(key:string){const remaining=openTabs.filter(t=>t.key!==key);setOpenTabs(remaining.length?remaining:[{key:'route',page:'route',label:'学习路线'}]);if(key===activeKey){const next=remaining[Math.max(0,openTabs.findIndex(t=>t.key===key)-1)]||remaining[0];go(next?.page||'route',next?.problemId);}}
 function openProblem(id:number){setMode('learning');go('practice',id);}
 function openLesson(id:string){if(id==='exam'){go('exam');return;}setLessonId(id);go(foundationIds.includes(id)?'python':'classroom');}
 useEffect(()=>{try{setAttempts(JSON.parse(localStorage.getItem('usaco-attempts')||'[]'));setDone(JSON.parse(localStorage.getItem('usaco-course-completed-v2')||'[]'));const end=Number(localStorage.getItem('usaco-exam-end'));if(end>Date.now())setExamEnd(end);}catch{}setReady(true);
  function fromHash(){const [dest,id]=window.location.hash.slice(1).split('/');if(dest==='practice'||nav.some(n=>n[0]===dest)){const validId=id&&problems.some(p=>p.id===+id)?+id:dest==='practice'?567:undefined;rememberTab(dest,validId);currentTab.current=dest==='practice'?`practice/${validId}`:dest;setPage(dest);if(dest==='practice')setNavOpen(false);if(validId)setProblemId(validId);}}
  fromHash();window.addEventListener('hashchange',fromHash);return()=>window.removeEventListener('hashchange',fromHash);},[]);
 useEffect(()=>{if(ready){localStorage.setItem('usaco-attempts',JSON.stringify(attempts.slice(0,200)));localStorage.setItem('usaco-course-completed-v2',JSON.stringify(done));}},[attempts,done,ready]);
 useEffect(()=>{if(!examEnd)return;const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[examEnd]);
 useEffect(()=>{const mc=(document as any).modelContext;if(!mc?.registerTool)return;const lifecycle=new AbortController();try{Promise.resolve(mc.registerTool({name:'open_usaco_problem',description:'打开本平台已收录的铜组题目，不运行或提交代码。',inputSchema:{type:'object',properties:{problemId:{type:'integer'}},required:['problemId'],additionalProperties:false},annotations:{readOnlyHint:false},async execute(input:any){if(!input||!Number.isInteger(input.problemId)||!problems.some(p=>p.id===input.problemId))throw new Error('Unknown problem ID');openProblem(input.problemId);await new Promise(r=>requestAnimationFrame(r));return {opened:input.problemId};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}return()=>lifecycle.abort();},[]);
 const seconds=Math.max(0,Math.floor(((examEnd||now)-now)/1000));const clock=[Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(x=>String(x).padStart(2,'0')).join(':');
 const latestAttempts=new Map<number,Attempt>();attempts.forEach(a=>{if(!latestAttempts.has(a.id))latestAttempts.set(a.id,a);});const wrong=[...latestAttempts.values()].filter(a=>a.status==='待复习');
 function startExam(){const end=Date.now()+4*3600*1000;setExamEnd(end);setNow(Date.now());localStorage.setItem('usaco-exam-end',String(end));setMode('exam');const first=problems.filter(p=>p.roundLabel===examRound).sort((a,b)=>a.id-b.id)[0];go('practice',first.id);}
 return <SidebarProvider open={navOpen} onOpenChange={setNavOpen} style={{'--sidebar-width':'192px','--sidebar-width-icon':'48px'} as React.CSSProperties}>
 <StudyNavigation page={page} wrong={wrong.length} onNavigate={go}/><SidebarInset>
 <PageTabs tools={<CodingToolLaunchers/>} tabs={openTabs} active={activeKey} onSelect={tab=>go(tab.page,tab.problemId)} onClose={closeTab} onOpen={dest=>go(dest)} leading={<SidebarTrigger className="mobile-nav-trigger" aria-label="打开导航"/>} trailing={<div className="page-tab-actions"><AnnotationLauncher/>{examEnd?<Button className="tab-exam-clock" variant="ghost" onClick={()=>go('exam')}><Timer size={14}/>{clock}</Button>:null}</div>}/>
 <main className={'content '+(page==='practice'?'work-content':'')+(['route','python','classroom','library','exam','review','sources'].includes(page)?' lx-page':'')}>
 {page==='route'&&<RouteHome modules={modules} done={done} courseCount={courseCount} problemCount={problems.length} wrongCount={wrong.length} attemptCount={attempts.length} onLesson={openLesson} onProblem={openProblem} onGo={dest=>go(dest)}/>}
 {openTabs.some(t=>t.page==='library')&&<div hidden={page!=='library'}><ProblemLibrary problems={problems} statusById={Object.fromEntries([...latestAttempts.entries()].map(([id,a])=>[id,a.status]))} request={libraryRequest} onOpen={openProblem} onLesson={openLesson} onRound={round=>{setExamRound(round);go('exam');}}/></div>}
 {(page==='python'||page==='classroom')&&<CoursePage section={page==='python'?'python':'algorithm'} selected={lessonId} onSelect={openLesson} onOpenProblem={openProblem} onLessonDone={id=>setDone(prev=>[...new Set([...prev,id])])} done={done}/>}
 {openTabs.filter(t=>t.page==='practice').map(t=>{const problem=problems.find(p=>p.id===t.problemId);return problem?<div key={t.key} hidden={activeKey!==t.key} className="kept-problem-page"><PracticeWorkspace problem={problem} mode={mode} setMode={setMode} onAttempt={a=>setAttempts(prev=>[a,...prev].slice(0,200))} examExpired={mode==='exam'&&!!examEnd&&seconds===0}/></div>:null;})}
 {page==='exam'&&<ExamPage problems={problems} rounds={rounds} examRound={examRound} setExamRound={setExamRound} examEnd={examEnd} seconds={seconds} clock={clock} latest={latestAttempts} onStart={startExam} onEnd={()=>{setExamEnd(null);localStorage.removeItem('usaco-exam-end');setMode('learning');}} onOpen={id=>{setMode('exam');go('practice',id);}}/>}
 {page==='review'&&<ReviewPage problems={problems} attempts={attempts} wrong={wrong} onOpen={openProblem}/>}
 {page==='sources'&&<SourcesPage problems={problems} rounds={rounds} statementReport={statementReport} pythonCount={pythonLessons.length} algorithmCount={algorithmLessons.length} courseCount={courseCount} onProblem={openProblem} onTopic={id=>{setLibraryRequest({topic:id,period:'all',nonce:Date.now()});go('library');}}/>}
 </main></SidebarInset><Suspense fallback={null}><CodingTools/></Suspense>{annotationOpen&&<Suspense fallback={null}><PageAnnotations contextKey={(page==='python'||page==='classroom')?`${page}/${(page==='python'?pythonLessons:algorithmLessons).find(l=>l.id===lessonId)?.id||(page==='python'?pythonLessons:algorithmLessons)[0].id}`:activeKey} onClose={()=>setAnnotationOpen(false)}/></Suspense>}</SidebarProvider>
}
