import type {SVGProps} from 'react';
export type AnnotationShape='line'|'arrow'|'doubleArrow'|'rect'|'ellipse'|'triangle'|'cuboid';
/** A small preview of the geometry the student will actually draw. */
export function AnnotationShapeIcon({shape,...props}:{shape:AnnotationShape}&SVGProps<SVGSVGElement>){
 return <svg viewBox="0 0 32 26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
  {shape==='line'&&<path d="M5 20 27 6"/>}
  {shape==='arrow'&&<path d="M4 19 27 7m-9-2 9 2-3 9"/>}
  {shape==='doubleArrow'&&<path d="M3 13h26M9 7l-6 6 6 6M23 7l6 6-6 6"/>}
  {shape==='rect'&&<rect x="4" y="5" width="24" height="16" rx=".7"/>}
  {shape==='ellipse'&&<circle cx="16" cy="13" r="10"/>}
  {shape==='triangle'&&<path d="M16 3 29 23H3Z"/>}
  {shape==='cuboid'&&<><path d="m4 9 7-6h17v14l-7 6H4Zm0 0h17v14M21 9l7-6"/><path d="M11 3v14H28M4 23l7-6" strokeDasharray="2.2 2.2" opacity=".45"/></>}
 </svg>;
}
