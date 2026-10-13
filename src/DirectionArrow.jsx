import React, { useLayoutEffect, useRef, useState } from 'react';
import { directionGeometry } from './direction-geometry.mjs';

export default function DirectionArrow({direction,layoutKey}) {
  const svgRef=useRef(null);
  const [geometry,setGeometry]=useState(null);
  const from=direction?.from,to=direction?.to;
  useLayoutEffect(()=>{
    const stage=svgRef.current.parentElement;
    const source=stage.querySelector(`[data-seat="${from}"]`);
    const target=stage.querySelector(`[data-seat="${to}"]`);
    if(!source||!target){setGeometry(null);return;}
    const measure=()=>setGeometry(directionGeometry(stage.getBoundingClientRect(),source.getBoundingClientRect(),target.getBoundingClientRect(),stage.querySelector('.board').getBoundingClientRect()));
    measure();
    const observer=new ResizeObserver(measure);
    for(const node of [stage,source,target,source.parentElement,target.parentElement])observer.observe(node);
    return ()=>observer.disconnect();
  },[from,to,layoutKey]);
  return <svg ref={svgRef} className="direction" viewBox={geometry?`0 0 ${geometry.width} ${geometry.height}`:'0 0 1 1'} aria-hidden="true">
    <path id="direction-path" d={geometry?.d??''} />
    {geometry&&<polygon className="direction-head" points={geometry.head} />}
  </svg>;
}
