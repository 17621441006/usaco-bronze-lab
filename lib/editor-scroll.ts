// Monaco's focus() has no preventScroll option. Keep the page and enclosing
// panels in place while allowing the editor itself to reveal the inserted code.
export function withPreservedPageScroll(root:HTMLElement|null,action:()=>void){
 const positions:{element:HTMLElement;top:number;left:number}[]=[];
 for(let element=root;element;element=element.parentElement){
  positions.push({element,top:element.scrollTop,left:element.scrollLeft});
 }
 try{action();}finally{
  for(const {element,top,left} of positions){
   if(element.scrollTop!==top||element.scrollLeft!==left){
    element.scrollTo({top,left,behavior:'instant'});
   }
  }
 }
}
