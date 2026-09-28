import assert from "node:assert/strict";
import test from "node:test";
import {buildAccountBriefing} from "../src/lib/account-briefing";
import {contacts,deals,activities} from "../src/lib/store";

test("builds a portfolio briefing with measurable metrics",()=>{
  const result=buildAccountBriefing(contacts,deals,activities);
  assert.equal(result.metrics.contacts,contacts.length);
  assert.equal(result.metrics.openDeals,deals.filter(d=>d.stage!=="won"&&d.stage!=="lost").length);
  assert.equal(result.metrics.pipelineValue,420000);
  assert.ok(result.overview.includes("relationships"));
});

test("prioritizes non-healthy relationships by lowest score",()=>{
  const result=buildAccountBriefing(contacts,deals,activities);
  for(let i=1;i<result.priorities.length;i++){
    assert.ok(result.priorities[i-1].intelligence.score<=result.priorities[i].intelligence.score);
  }
  assert.ok(result.priorities.length>0);
});
