import type * as Monaco from 'monaco-editor';
import {registerCodeCompletions} from './code-completions';

const configured=new WeakSet<object>();
export function configureCodeEditor(monaco:typeof Monaco){
 registerCodeCompletions(monaco);
 if(configured.has(monaco))return;
 configured.add(monaco);
 monaco.editor.defineTheme('usaco-idea',{base:'vs-dark',inherit:true,rules:[
  {token:'comment',foreground:'7A7E85'},{token:'keyword',foreground:'CF8E6D'},
  {token:'string',foreground:'6AAB73'},{token:'number',foreground:'2AACB8'},
  {token:'type.identifier',foreground:'BCBEC4'},{token:'function',foreground:'56A8F5'},
 ],colors:{'editor.background':'#1E1F22','editor.foreground':'#BCBEC4','editorLineNumber.foreground':'#61656D','editorLineNumber.activeForeground':'#A8ADBD','editor.lineHighlightBackground':'#26282E','editor.selectionBackground':'#214283','editorCursor.foreground':'#CED0D6','editorIndentGuide.background1':'#31343A','editorInfo.foreground':'#6B8799','editorWarning.foreground':'#D0AA66','editorError.foreground':'#E46A70'}});
}
