declare module 'katex/contrib/auto-render' {
 const render:(element:HTMLElement,options:{delimiters:{left:string;right:string;display:boolean}[];throwOnError:boolean;trust:boolean;maxExpand:number;strict:string})=>void;
 export default render;
}
