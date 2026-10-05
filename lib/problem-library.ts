import type {Problem} from '@/components/practice-workspace';
export type ArchivePeriod='recent'|'classic'|'all';
export type ArchiveFilters={period:ArchivePeriod;query:string;topic:string;year:string;stage:string;order:string};
export const defaultArchiveFilters:ArchiveFilters={period:'recent',query:'',topic:'all',year:'all',stage:'all',order:'newest'};
export const stages=['基础巩固','专项进阶','综合挑战'];
export function topicMatches(p:Problem,topic:string){return topic==='all'||[...(p.learningTopics||[]),...(p.optionalTopics||[])].includes(topic);}
export function inPeriod(p:Problem,period:ArchivePeriod){return period==='all'||(period==='recent'?p.year>=2020:p.year<2020);}
export function filterProblems(problems:Problem[],filters:ArchiveFilters){
 const q=filters.query.trim().toLowerCase();
 return problems.filter(p=>(q?`${p.id} ${p.title} ${p.zhTitle} ${p.roundLabel}`.toLowerCase().includes(q):inPeriod(p,filters.period))&&(filters.year==='all'||p.year===Number(filters.year))&&topicMatches(p,filters.topic)&&(filters.stage==='all'||p.practiceStage===filters.stage)).sort((a,b)=>filters.order==='learning'?(stages.indexOf(a.practiceStage||'综合挑战')-stages.indexOf(b.practiceStage||'综合挑战')||b.id-a.id):b.id-a.id);
}
