export const directionSpacing = { gap:12, headLength:10, headWidth:10 };

// Rectangles are measured in viewport pixels; SVG coordinates are local to stage.
export function directionGeometry(stage, from, to, board) {
  const center = r => ({x:r.left+r.width/2-stage.left,y:r.top+r.height/2-stage.top});
  const a=center(from),b=center(to),gap=directionSpacing.gap;
  let start,end,firstControl,lastControl;
  if(Math.abs(a.x-b.x)<Math.abs(a.y-b.y)*.5){
    // Use the outside edge; reserve panel clearance before choosing the bow.
    const side=a.x<stage.width/2?-1:1;
    start={x:a.x+side*(from.width/2+gap),y:a.y};
    end={x:b.x+side*(to.width/2+gap),y:b.y};
    const room=side<0?Math.min(start.x,end.x)-4:stage.width-Math.max(start.x,end.x)-4;
    const bow=Math.min(Math.abs(end.y-start.y)*.22,room);
    firstControl={x:start.x+side*bow,y:start.y+(end.y-start.y)*.25};
    lastControl={x:end.x+side*bow,y:end.y-(end.y-start.y)*.25};
  } else {
    const side=a.x<b.x?1:-1,vertical=b.y>a.y?1:-1;
    // Use the perimeter-facing edge so compact boards stay unobstructed.
    if(Math.abs(a.x-stage.width/2)>Math.abs(b.x-stage.width/2)){
      start={x:a.x,y:a.y+vertical*(from.height/2+gap)};
      end={x:b.x-side*(to.width/2+gap),y:b.y};
      firstControl={x:start.x,y:end.y};
      lastControl={x:end.x-side*20,y:end.y};
    } else {
      start={x:a.x+side*(from.width/2+gap),y:a.y};
      end={x:b.x,y:b.y-vertical*(to.height/2+gap)};
      firstControl={x:end.x,y:start.y};
      lastControl={x:end.x,y:end.y-vertical*20};
    }
  }
  let d=`M${start.x} ${start.y} C${firstControl.x} ${firstControl.y} ${lastControl.x} ${lastControl.y} ${end.x} ${end.y}`;
  const length=Math.hypot(end.x-lastControl.x,end.y-lastControl.y);
  const ux=(end.x-lastControl.x)/length,uy=(end.y-lastControl.y)/length;
  const base={x:end.x-directionSpacing.headLength*ux,y:end.y-directionSpacing.headLength*uy};
  const head=[end,{x:base.x-directionSpacing.headWidth/2*uy,y:base.y+directionSpacing.headWidth/2*ux},{x:base.x+directionSpacing.headWidth/2*uy,y:base.y-directionSpacing.headWidth/2*ux}];
  return {width:stage.width,height:stage.height,start,end,d,head:head.map(p=>`${p.x},${p.y}`).join(' ')};
}
