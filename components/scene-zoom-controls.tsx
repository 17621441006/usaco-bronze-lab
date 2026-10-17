'use client';
import {Minus,Plus,Scan} from 'lucide-react';
export const MIN_SCENE_ZOOM=.6,MAX_SCENE_ZOOM=2;
export const clampSceneZoom=(value:number)=>Math.max(MIN_SCENE_ZOOM,Math.min(MAX_SCENE_ZOOM,Math.round(value*100)/100));
export function SceneZoomControls({zoom,onChange,onFit}:{zoom:number;onChange:(value:number)=>void;onFit:()=>void}){
 return <div className="scene-zoom-controls" role="toolbar" aria-label="画面缩放">
  <button type="button" aria-label="缩小画面" title="缩小" disabled={zoom<=MIN_SCENE_ZOOM} onClick={()=>onChange(clampSceneZoom(zoom-.15))}><Minus size={15}/></button>
  <output aria-label="画面缩放比例">{Math.round(zoom*100)}%</output>
  <button type="button" aria-label="放大画面" title="放大" disabled={zoom>=MAX_SCENE_ZOOM} onClick={()=>onChange(clampSceneZoom(zoom+.15))}><Plus size={15}/></button>
  <button type="button" className="scene-fit" aria-label="恢复合适视角" title="恢复合适视角与缩放" onClick={onFit}><Scan size={14}/><span>适合窗口</span></button>
 </div>;
}
