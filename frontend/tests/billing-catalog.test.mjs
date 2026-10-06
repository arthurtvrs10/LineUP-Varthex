import test from 'node:test';
import assert from 'node:assert/strict';
import { selectCatalogPlan, orderedPlans, planFeatures, monthlyTotal } from '../lib/billing.ts';
const plans = [{id:'team',name:'Gestão',monthlyPrice:99.90,barberLimit:5,features:'Agenda\nComissões'}, {id:'solo',name:'Individual',monthlyPrice:59.90,barberLimit:1}];
test('monthly amount includes extras once and rounds in cents',()=>{
 assert.equal(monthlyTotal(99.90,19.90,2),139.70);
 assert.equal(monthlyTotal(59.90),59.90);
 assert.equal(monthlyTotal(99.90,19.90,0),99.90);
});
test('preserves a landing plan and never silently selects a different plan',()=>{
 assert.equal(selectCatalogPlan(plans,'team'),'team');
 assert.equal(selectCatalogPlan(plans,null),'');
 assert.equal(selectCatalogPlan(plans,'removed'),'');
});
test('catalog is ordered without mutation and shared benefits tolerate older plans',()=>{
 assert.deepEqual(orderedPlans(plans).map(p=>p.id),['solo','team']);
 assert.equal(plans[0].id,'team');
 assert.deepEqual(planFeatures(plans[0]),['Agenda','Comissões']);
 assert.deepEqual(planFeatures(plans[1]),[]);
});
