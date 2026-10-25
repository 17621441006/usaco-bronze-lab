import type {editor as MonacoEditor} from 'monaco-editor';

export function shellIndent(prefix:string){
 return (prefix.match(/^[\t ]*/)?.[0]||'')+(prefix.trimEnd().endsWith(':')?'    ':'');
}

export function insertShellNewline(editor:MonacoEditor.IStandaloneCodeEditor){
 const model=editor.getModel(),selection=editor.getSelection();
 if(!model||!selection)return;
 const prefix=model.getLineContent(selection.startLineNumber).slice(0,selection.startColumn-1),indent=shellIndent(prefix);
 editor.pushUndoStop();
 editor.executeEdits('shell-newline',[{range:selection,text:model.getEOL()+indent,forceMoveMarkers:true}]);
 // Use line/column coordinates: CRLF occupies two offsets but only one newline.
 editor.setPosition({lineNumber:selection.startLineNumber+1,column:indent.length+1});
 editor.pushUndoStop();editor.focus();
}
