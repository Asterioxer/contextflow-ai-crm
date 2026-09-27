import {test} from "node:test";
import assert from "node:assert/strict";
import {activityCreateSchema,contactSchema,dealCreateSchema,dealPatchSchema} from "../src/lib/validation";

test("contact schema rejects invalid email",()=>{
  const result=contactSchema.safeParse({firstName:"A",lastName:"B",email:"bad",company:"C",title:"T",notes:""});
  assert.equal(result.success,false);
});

test("contact schema trims accepted fields",()=>{
  const result=contactSchema.parse({firstName:"  A ",lastName:" B ",email:"a@example.com",company:"C",title:"T",notes:""});
  assert.equal(result.firstName,"A");
  assert.equal(result.lastName,"B");
});

test("deal schema constrains stage and value",()=>{
  assert.equal(dealCreateSchema.safeParse({contactId:"c1",title:"Deal",value:100,stage:"qualified"}).success,true);
  assert.equal(dealCreateSchema.safeParse({contactId:"c1",title:"Deal",value:-1,stage:"new"}).success,false);
  assert.equal(dealPatchSchema.safeParse({stage:"unknown"}).success,false);
});

test("activity schema limits activity type to logged interaction types",()=>{
  assert.equal(activityCreateSchema.safeParse({type:"call",title:"Call",description:"x"}).success,true);
  assert.equal(activityCreateSchema.safeParse({type:"ai_generation",title:"AI",description:"x"}).success,false);
});
