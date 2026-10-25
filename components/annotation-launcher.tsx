'use client';
import {PenLine} from 'lucide-react';
import {Button} from './ui/button';
export function AnnotationLauncher(){return <Button className="annotation-launcher" variant="ghost" size="sm" aria-label="页面标注" title="直接在页面上画写" onClick={()=>window.dispatchEvent(new Event('usaco-toggle-annotations'))}><PenLine size={16}/><span>标注</span></Button>;}
