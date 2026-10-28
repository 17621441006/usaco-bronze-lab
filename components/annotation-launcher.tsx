'use client';
import {PenLine} from 'lucide-react';
export function AnnotationLauncher(){return <button type="button" className="lx-tool lx-tool-annotate annotation-launcher" aria-label="页面标注" title="页面标注：直接在页面上画写" onClick={()=>window.dispatchEvent(new Event('usaco-toggle-annotations'))}><span className="lx-tool-ico"><PenLine size={14}/></span><span className="lx-tool-text">标注</span></button>;}
