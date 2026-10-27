import type * as Monaco from 'monaco-editor';
import {registerCodeCompletions} from './code-completions';

const configured=new WeakSet<object>();
export function configureCodeEditor(monaco:typeof Monaco){
 registerCodeCompletions(monaco);
 if(configured.has(monaco))return;
 configured.add(monaco);
 monaco.editor.defineTheme('usaco-idea',{base:'vs-dark',inherit:true,rules:[
  {token:'comment',foreground:'64748B',fontStyle:'italic'},
  {token:'keyword',foreground:'C084FC',fontStyle:'bold'},
  {token:'string',foreground:'34D399'},
  {token:'number',foreground:'FBBF24'},
  {token:'type.identifier',foreground:'E2E8F0'},
  {token:'function',foreground:'38BDF8'},
 ],colors:{
  'editor.background':'#0F172A',
  'editor.foreground':'#E2E8F0',
  'editorLineNumber.foreground':'#475569',
  'editorLineNumber.activeForeground':'#94A3B8',
  'editor.lineHighlightBackground':'#1E293B',
  'editor.selectionBackground':'#312E81',
  'editorCursor.foreground':'#38BDF8',
  'editorIndentGuide.background1':'#1E293B',
  'editorInfo.foreground':'#38BDF8',
  'editorWarning.foreground':'#F59E0B',
  'editorError.foreground':'#F87171',
 }});
}
