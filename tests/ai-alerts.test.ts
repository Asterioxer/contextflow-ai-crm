import assert from "node:assert/strict";
import test from "node:test";
import {buildAiAlerts} from "../src/lib/ai-alerts";
import {analyzeRelationship} from "../src/lib/relationship-intelligence";
import {contacts,deals,activities} from "../src/lib/store";

test("builds actionable alerts with deterministic severity",()=>{
 const priorities=contacts.map(contact=>({contact,deal:deals.find(d=>d.contactId===contact.id&&d.stage!=="won"&&d.stage!=="lost")||null,intelligence:analyzeRelationship(contact,deals.filter(d=>d.contactId===contact.id),activities.filter(a=>a.contactId===contact.id))}));
 const alerts=buildAiAlerts(priorities,deals);
 assert.ok(alerts.length>0);
 assert.ok(alerts.every(alert=>["high","medium","low"].includes(alert.severity)));
 for(let i=1;i<alerts.length;i++)assert.ok(({high:0,medium:1,low:2} as const)[alerts[i-1].severity]<=({high:0,medium:1,low:2} as const)[alerts[i].severity]);
});

test("does not emit duplicate alert ids",()=>{
 const priorities=contacts.map(contact=>({contact,deal:null,intelligence:analyzeRelationship(contact,[],[])}));
 const alerts=buildAiAlerts(priorities,deals);
 assert.equal(new Set(alerts.map(a=>a.id)).size,alerts.length);
});
