import assert from "node:assert/strict";
import test from "node:test";
import {answerCopilot} from "../src/lib/copilot";
import {contacts,deals,activities} from "../src/lib/store";
test("answers pipeline questions from CRM data",()=>{const r=answerCopilot("pipeline",contacts,deals,activities);assert.equal(r.intent,"pipeline");assert.match(r.answer,/open deals/);});
test("answers contact questions with relationship evidence",()=>{const c=contacts[0];const r=answerCopilot(c.firstName+" "+c.lastName,contacts,deals,activities);assert.equal(r.intent,"contact");assert.match(r.answer,/relationship score/);});
test("prioritizes attention queries",()=>{const r=answerCopilot("who needs attention?",contacts,deals,activities);assert.equal(r.intent,"priorities");assert.ok(r.sources.length>0);});
