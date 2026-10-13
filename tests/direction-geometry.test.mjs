import test from 'node:test';import assert from 'node:assert/strict';import {directionGeometry} from '../src/direction-geometry.mjs';
const rect=(left,top,width,height)=>({left,top,width,height});
test('vertical neighbors use the outer edge and bow out on both sides',()=>{
 const stage=rect(0,0,400,490);
 for(const [left,side]of [[35,-1],[275,1]]){const from=rect(left,330,90,57),to=rect(left,140,90,57),g=directionGeometry(stage,from,to,rect(120,230,160,40));const edge=side<0?left:left+90;assert.equal(g.start.x,edge+side*12);assert.equal(g.end.x,edge+side*12);assert.ok(g.head.split(' ').every(p=>{const[x,y]=p.split(',').map(Number);return x>=4&&x<=396&&y>=0&&y<=490;}));assert.match(g.d,/ C/);assert.ok(!g.d.includes(' L'));}
});
