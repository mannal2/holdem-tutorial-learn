import test from 'node:test';import assert from 'node:assert/strict';
import {mainFlop} from '../../src/scenarios/main-hand.mjs';import{stateAt}from'../../src/lesson-runtime.mjs';import{applyEvent}from'../../src/rules/table.mjs';
test('a flop bet reopens the earlier checker response and skips folded players',()=>{
 const base=stateAt(mainFlop,4);const start={...base,pendingActorIds:[0,1],seats:base.seats.map(p=>p.id>=2?{...p,status:'folded',dealtCount:0}:p)};
 const checked=applyEvent(start,{type:'act',player:0,action:'check',to:0});const bet=applyEvent(checked,{type:'act',player:1,action:'bet',to:50});assert.deepEqual(bet.pendingActorIds,[0]);assert.equal(bet.potTotal,110);
 const call=applyEvent(bet,{type:'act',player:0,action:'call',to:50});assert.equal(call.potTotal,160);assert.deepEqual(call.pendingActorIds,[]);assert.equal(call.seats[0].stack,40);
});
