import type * as Monaco from 'monaco-editor';

type Editor=Monaco.editor.IStandaloneCodeEditor;
type Shortcut=Monaco.editor.IActionDescriptor;

// addCommand registers a global keybinding. addAction scopes it to editorId.
function bind(editor:Editor,shortcuts:Shortcut[],extra:Monaco.IDisposable[]=[]){
 const items=[...extra,...shortcuts.map(shortcut=>editor.addAction(shortcut))];
 const cleanup=editor.onDidDispose(()=>{items.forEach(item=>item.dispose());cleanup.dispose();});
}

export function bindShellShortcuts(editor:Editor,m:typeof Monaco,actions:{execute:(force:boolean)=>void;nextLine:()=>void;recall:(direction:number)=>void}){
 const singleLine=editor.createContextKey('usacoShellSingleLine',editor.getModel()?.getLineCount()===1);
 const change=editor.onDidChangeModelContent(()=>singleLine.set(editor.getModel()?.getLineCount()===1));
 const precondition='editorTextFocus && !editorReadonly';
 bind(editor,[
  {id:'usaco.shell.execute',label:'执行 Shell 代码',keybindings:[m.KeyCode.Enter],precondition,keybindingContext:'!suggestWidgetVisible',run:()=>actions.execute(false)},
  {id:'usaco.shell.executeForce',label:'执行完整 Shell 代码',keybindings:[m.KeyMod.CtrlCmd|m.KeyCode.Enter],precondition,run:()=>actions.execute(true)},
  {id:'usaco.shell.newline',label:'Shell 换行',keybindings:[m.KeyMod.Shift|m.KeyCode.Enter],precondition,run:actions.nextLine},
  {id:'usaco.shell.previous',label:'上一条 Shell 命令',keybindings:[m.KeyCode.UpArrow],precondition,keybindingContext:'!suggestWidgetVisible && usacoShellSingleLine',run:()=>actions.recall(-1)},
  {id:'usaco.shell.next',label:'下一条 Shell 命令',keybindings:[m.KeyCode.DownArrow],precondition,keybindingContext:'!suggestWidgetVisible && usacoShellSingleLine',run:()=>actions.recall(1)},
  {id:'usaco.shell.previousAny',label:'上一条 Shell 命令',keybindings:[m.KeyMod.Alt|m.KeyCode.UpArrow],precondition,run:()=>actions.recall(-1)},
  {id:'usaco.shell.nextAny',label:'下一条 Shell 命令',keybindings:[m.KeyMod.Alt|m.KeyCode.DownArrow],precondition,run:()=>actions.recall(1)},
 ],[change]);
}

export function bindProjectShortcuts(editor:Editor,m:typeof Monaco,actions:{run:()=>void;save:()=>void}){
 bind(editor,[
  {id:'usaco.project.run',label:'运行代码',keybindings:[m.KeyMod.CtrlCmd|m.KeyCode.Enter],precondition:'editorTextFocus',run:actions.run},
  {id:'usaco.project.save',label:'保存代码',keybindings:[m.KeyMod.CtrlCmd|m.KeyCode.KeyS],precondition:'editorTextFocus',run:actions.save},
 ]);
}
