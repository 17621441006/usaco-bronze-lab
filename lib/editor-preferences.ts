export type EditorPreferences={theme:'dark'|'light';fontSize:number;height:number};
export const defaultEditorPreferences:EditorPreferences={theme:'dark',fontSize:15,height:420};
export function readEditorPreferences():EditorPreferences{try{const p=JSON.parse(localStorage.getItem('usaco-editor-preferences')||'{}');return {theme:p.theme==='light'?'light':'dark',fontSize:Math.max(12,Math.min(28,Number(p.fontSize)||15)),height:Math.max(220,Math.min(1400,Number(p.height)||420))};}catch{return defaultEditorPreferences;}}
