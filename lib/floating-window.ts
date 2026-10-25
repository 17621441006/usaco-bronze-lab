export type WindowFrame={x:number;y:number;width:number;height:number};
export type WindowViewport={width:number;height:number};
export type ResizeEdge='n'|'s'|'w'|'e'|'nw'|'ne'|'sw'|'se';
// Keep controls above the host's bottom-right editor badge and within the viewport.
export function fitWindow(frame:WindowFrame,view:WindowViewport):WindowFrame{
 const margin=10,top=Math.min(54,view.height*.12),bottom=Math.min(72,view.height*.15);
 const availableWidth=Math.max(1,view.width-margin*2),availableHeight=Math.max(1,view.height-top-bottom);
 const width=Math.min(availableWidth,Math.max(Math.min(440,availableWidth),frame.width));
 const height=Math.min(availableHeight,Math.max(Math.min(280,availableHeight),frame.height));
 return {width,height,x:Math.max(margin,Math.min(view.width-width-margin,frame.x)),y:Math.max(top,Math.min(view.height-height-bottom,frame.y))};
}
export function initialWindow(tool:'shell'|'editor',view:WindowViewport):WindowFrame{
 const width=tool==='shell'?Math.min(680,Math.max(540,view.width*.5)):Math.min(800,Math.max(600,view.width*.6));
 return fitWindow({x:view.width-width-24,y:66,width,height:tool==='shell'?560:590},view);
}

export function resizeWindow(original:WindowFrame,edge:ResizeEdge,dx:number,dy:number,view:WindowViewport):WindowFrame{
 const frame=fitWindow(original,view),minX=10,maxX=view.width-10,minY=Math.min(54,view.height*.12),maxY=view.height-Math.min(72,view.height*.15);
 const minWidth=Math.min(440,maxX-minX),minHeight=Math.min(280,maxY-minY),clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
 let left=frame.x,right=left+frame.width,top=frame.y,bottom=top+frame.height;
 if(edge.includes('w'))left=clamp(left+dx,minX,right-minWidth);
 if(edge.includes('e'))right=clamp(right+dx,left+minWidth,maxX);
 if(edge.includes('n'))top=clamp(top+dy,minY,bottom-minHeight);
 if(edge.includes('s'))bottom=clamp(bottom+dy,top+minHeight,maxY);
 return {x:left,y:top,width:right-left,height:bottom-top};
}
