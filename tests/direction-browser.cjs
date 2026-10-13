const {chromium}=require('@playwright/test');const assert=require('node:assert/strict');
const key='holdem-tutorial:progress:v1';
async function metrics(p,from,to){return p.evaluate(({from,to})=>{
 const svg=document.querySelector('.direction'),path=svg.querySelector('#direction-path'),head=svg.querySelector('.direction-head');
 const screen=point=>{const result=new DOMPoint(point.x,point.y).matrixTransform(path.getScreenCTM());return {x:result.x,y:result.y};};
 const rectDistance=(p,r)=>Math.hypot(Math.max(r.left-p.x,0,p.x-r.right),Math.max(r.top-p.y,0,p.y-r.bottom));
 const occupied=[...document.querySelectorAll('.seat-button,.hole-cards,.seat-label,.position-badge,.pot,.board,.deck')].map(n=>n.getBoundingClientRect());
 const blocked=point=>occupied.some(r=>point.x>r.left-1&&point.x<r.right+1&&point.y>r.top-1&&point.y<r.bottom+1);
 const points=[...head.points].map(screen);const base={x:(points[1].x+points[2].x)/2,y:(points[1].y+points[2].y)/2};
 const samples=Array.from({length:101},(_,i)=>screen(path.getPointAtLength(path.getTotalLength()*i/100)));
 const first=screen(path.getPointAtLength(0)),last=screen(path.getPointAtLength(path.getTotalLength()));
 const stage=document.querySelector('#table-stage').getBoundingClientRect();
 return {startGap:rectDistance(first,document.querySelector(`#seat-${from}`).getBoundingClientRect()),endGap:rectDistance(last,document.querySelector(`#seat-${to}`).getBoundingClientRect()),clipped:[...samples,...points].some(p=>p.x<stage.left||p.x>stage.right||p.y<stage.top||p.y>stage.bottom),blockedHead:points.some(blocked),blockedShaft:samples.some(blocked),length:Math.hypot(points[0].x-base.x,points[0].y-base.y),width:Math.hypot(points[1].x-points[2].x,points[1].y-points[2].y),outside:from===1&&to===2?samples.every(p=>p.x<document.querySelector(`#seat-${from}`).getBoundingClientRect().left-3):true,d:path.getAttribute('d')};
},{from,to});}
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:902,height:871},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:5188');
for(const [lessonId,stepId,hint,from,to] of [['03','03-b-sb',false,5,0],['03','03-b-bb',false,0,1],['prototype','first-actor',true,1,2],['05','05-b',true,1,2],['05','05-b-result',false,1,2],['05','05-d-result',false,5,0]]){
 await p.evaluate(({key,lessonId,stepId})=>localStorage.setItem(key,JSON.stringify({version:1,lessonId,stepId,completedLessonIds:[],reviewLessonIds:[]})),{key,lessonId,stepId});await p.reload();await p.locator('#title').waitFor();
 if(hint){assert.equal(await p.locator('.direction-head').count(),0);await p.locator('#hint').click();}
 await p.locator('.direction-head').waitFor();
 for(const width of [1366,1100,902,801,800,475,390,320]){
  await p.setViewportSize({width,height:871});await p.waitForFunction(()=>Math.abs(document.querySelector('.direction').viewBox.baseVal.width-document.querySelector('#table-stage').getBoundingClientRect().width)<.1);
  const m=await metrics(p,from,to);assert.equal(m.clipped,false);assert.equal(m.outside,true,`${stepId} ${width} outside`);assert.ok(Math.abs(m.startGap-12)<.1);assert.ok(Math.abs(m.endGap-12)<.1);assert.equal(m.blockedHead,false,`${stepId} ${width} head`);assert.equal(m.blockedShaft,false,`${stepId} ${width} shaft`);assert.ok(Math.abs(m.length-10)<.1);assert.ok(Math.abs(m.width-10)<.1);
  if([902,475,320].includes(width))await p.screenshot({path:`test-results/direction-${stepId}-${width}.png`,fullPage:true});
 }
 console.log(`PASS ${stepId}: live resize at8 widths, visible head/shaft, fixed10px head`);
}
await p.setViewportSize({width:902,height:871});
await p.evaluate(({key})=>localStorage.setItem(key,JSON.stringify({version:1,lessonId:'03',stepId:'03-b-bb',completedLessonIds:[],reviewLessonIds:[]})),{key});await p.reload();await p.locator('.direction-head').waitFor();
const oldPath=await p.locator('#direction-path').getAttribute('d');await p.addStyleTag({content:'.seat-1 .seat-button { min-height:80px; }'});await p.waitForFunction(old=>document.querySelector('#direction-path').getAttribute('d')!==old,oldPath);
const resized=await metrics(p,0,1);assert.ok(Math.abs(resized.endGap-12)<.1);assert.equal(resized.blockedHead,false);console.log('PASS description-box size change recalculates arrow without a viewport resize');
assert.deepEqual(errors,[]);await p.locator('#lesson-select').click();await p.locator('[data-lesson-id="01"]').click();assert.equal(await p.locator('.direction-head').count(),0);await p.close();
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
