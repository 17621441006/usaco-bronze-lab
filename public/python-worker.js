let runtime;
const base='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
async function init(){if(!runtime){importScripts(base+'pyodide.js');runtime=await loadPyodide({indexURL:base});runtime.runPython('import sys, io, os, contextlib, json, shutil, importlib');}self.postMessage({type:'ready',version:runtime.runPython('import sys; sys.version.split()[0]')});}
self.onmessage=async({data})=>{
 try{
  if(data.type==='init'){await init();return;}
  if(!runtime)await init();
  const {code,input,inputFile,caseId,files={},entryFile="main.py"}=data;
  runtime.globals.set('_student_code',code);runtime.globals.set('_student_input',input);runtime.globals.set('_input_filename',inputFile||'');
  runtime.globals.set('_project_files_json',JSON.stringify(files));runtime.globals.set('_entry_filename',entryFile);
  self.postMessage({type:'started',caseId});const start=performance.now();
  try{
   const output=runtime.runPython(`
import sys, io, os, contextlib, json, shutil, importlib
os.chdir('/')
for _name, _module in list(sys.modules.items()):
    if str(getattr(_module, '__file__', '')).startswith('/workspace/'):
        sys.modules.pop(_name, None)
if os.path.exists('/workspace'): shutil.rmtree('/workspace')
os.mkdir('/workspace')
os.chdir('/workspace')
if '/workspace' not in sys.path: sys.path.insert(0, '/workspace')
for _name, _content in json.loads(_project_files_json).items():
    _path = os.path.normpath('/workspace/' + _name)
    if not _path.startswith('/workspace/') or chr(92) in _name:
        raise ValueError('Invalid project file path')
    os.makedirs(os.path.dirname(_path), exist_ok=True)
    with open(_path, 'w', encoding='utf-8') as _file: _file.write(_content)
importlib.invalidate_caches()
class _BoundedOutput(io.BytesIO):
    def write(self, value):
        if self.tell() + len(value) > 20000000:
            raise RuntimeError('Output limit exceeded: 20 MB')
        return super().write(value)
if _input_filename:
    with open(_input_filename, 'w') as _f: _f.write(_student_input)
    _outname = _input_filename.rsplit('.', 1)[0] + '.out'
    if os.path.exists(_outname): os.remove(_outname)
_capture_bytes = _BoundedOutput()
_capture = io.TextIOWrapper(_capture_bytes, encoding='utf-8', write_through=True)
_old_stdin = sys.stdin
sys.stdin = io.TextIOWrapper(io.BytesIO(_student_input.encode('utf-8')), encoding='utf-8')
try:
    with contextlib.redirect_stdout(_capture):
        try:
            exec(compile(_student_code, _entry_filename, 'exec'), {'__name__': '__main__', '__file__': '/workspace/' + _entry_filename, '__package__': None})
        except SystemExit as _exit:
            if _exit.code not in (None, 0): raise
finally:
    sys.stdin = _old_stdin
_capture.flush()
_result = _capture_bytes.getvalue().decode('utf-8', errors='replace')
if _input_filename and os.path.exists(_outname):
    if os.path.getsize(_outname) > 20000000: raise RuntimeError('Output limit exceeded: 20 MB')
    with open(_outname) as _f: _result = _f.read()
_result
`);
   self.postMessage({type:'result',caseId,output:String(output),ms:Math.round(performance.now()-start)});
  }catch(error){self.postMessage({type:'result',caseId,error:String(error),ms:Math.round(performance.now()-start)});}
 }catch(error){self.postMessage({type:'error',error:String(error)});}
};
