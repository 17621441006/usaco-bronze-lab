// A separate persistent Python namespace. Exercise judging remains isolated.
let runtime,loading;
const base='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
async function initialize(){
 if(!loading)loading=(async()=>{
  importScripts(base+'pyodide.js');runtime=await loadPyodide({indexURL:base});
  runtime.runPython(`
import ast, codeop, contextlib, io, json, sys, traceback
_shell_namespace = {'__name__': '__main__'}
_shell_compiler = codeop.CommandCompiler()
class _ShellOutput(io.StringIO):
    def __init__(self):
        super().__init__()
        self.truncated = False
    def write(self, text):
        remaining = max(0, 20000 - self.tell())
        self.truncated |= len(text) > remaining
        super().write(text[:remaining])
        return len(text)
def _shell_execute(source, data, force):
    out, err = _ShellOutput(), _ShellOutput()
    error = ''
    try:
        compiled = _shell_compiler(source, '<shell>', 'exec')
        if compiled is None:
            if not force:
                return json.dumps({'incomplete': True, 'output': '', 'stderr': '', 'error': ''})
            compiled = compile(source, '<shell>', 'exec')
        tree = ast.parse(source, '<shell>', 'exec')
        old_stdin = sys.stdin
        sys.stdin = io.TextIOWrapper(io.BytesIO(data.encode('utf-8')), encoding='utf-8')
        try:
            with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
                if tree.body and isinstance(tree.body[-1], ast.Expr):
                    last = tree.body.pop()
                    exec(compile(tree, '<shell>', 'exec', flags=compiled.co_flags, dont_inherit=True), _shell_namespace)
                    value = eval(compile(ast.Expression(last.value), '<shell>', 'eval', flags=compiled.co_flags, dont_inherit=True), _shell_namespace)
                    if value is not None:
                        _shell_namespace['_'] = value
                        print(repr(value))
                else:
                    exec(compiled, _shell_namespace)
        finally:
            sys.stdin = old_stdin
    except BaseException as exc:
        detail = traceback.TracebackException.from_exception(exc)
        detail.stack = traceback.StackSummary.from_list([frame for frame in detail.stack if frame.filename == '<shell>'])
        error = ''.join(detail.format())
    return json.dumps({'output': out.getvalue(), 'stderr': err.getvalue(), 'error': error[-12000:], 'truncated': out.truncated or err.truncated})
  `);
 })();
 await loading;
}
self.onmessage=async({data})=>{
 try{
  await initialize();
  if(data.type==='init'){self.postMessage({type:'ready',version:runtime.runPython('sys.version.split()[0]')});return;}
  if(data.type!=='execute')return;
  if(typeof data.code!=='string'||data.code.length>300000||typeof data.input!=='string'||data.input.length>1000000)throw Error('代码或输入数据过长。');
  const start=performance.now(),run=runtime.globals.get('_shell_execute');
  try{const result=JSON.parse(run(data.code,data.input,!!data.force));self.postMessage({type:'result',id:data.id,...result,ms:Math.round(performance.now()-start)});}finally{run.destroy();}
 }catch(error){self.postMessage({type:'error',id:data.id,error:String(error?.message||error)});}
};
