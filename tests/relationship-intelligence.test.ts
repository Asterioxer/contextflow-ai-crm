import assert from "node:assert/strict";
import test from "node:test";
import {analyzeRelationship} from "../src/lib/relationship-intelligence";
import type {Activity,Contact,Deal} from "../src/lib/types";

const contact:Contact={
  id:"c1",firstName:"Rahul",lastName:"Sharma",email:"rahul@example.com",
  company:"Acme",title:"VP Engineering",notes:"Interested in API integration.",
  createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
};

const deal=(overrides:Partial<Deal>={}):Deal=>({
  id:"d1",contactId:"c1",title:"Enterprise API",value:85000,
  stage:"qualified",healthScore:80,updatedAt:new Date().toISOString(),...overrides
});

const activity=(days:number):Activity=>({
  id:"a"+days,contactId:"c1",dealId:"d1",type:"meeting",title:"Customer meeting",
  description:"Discussed next steps.",occurredAt:new Date(Date.now()-days*86400000).toISOString()
});

test("scores recent qualified relationships as healthy",()=>{
  const result=analyzeRelationship(contact,[deal()],[activity(1),activity(5)]);
  assert.equal(result.status,"healthy");
  assert.equal(result.momentum,"positive");
  assert.ok(result.score>=70);
});

test("flags stale open opportunities",()=>{
  const result=analyzeRelationship(contact,[deal({healthScore:40})],[activity(20)]);
  assert.equal(result.status,"at_risk");
  assert.equal(result.momentum,"negative");
  assert.ok(result.risks.some(r=>r.includes("days without")));
  assert.ok(result.nextActions.length>0);
});

test("does not invent engagement when history is empty",()=>{
  const result=analyzeRelationship({...contact,notes:""},[deal({stage:"new",healthScore:40})],[]);
  assert.ok(result.risks.some(r=>r.includes("No interaction")));
  assert.ok(result.risks.some(r=>r.includes("relationship notes")));
  assert.equal(result.momentum,"negative");
});
