import {test} from "node:test";
import assert from "node:assert/strict";
import {store} from "../src/lib/store";

test("seeded workspace has qualified deals",()=>{assert.ok(store.deals.some(d=>d.stage==="qualified"))});
test("every deal points to a known contact",()=>{for(const deal of store.deals)assert.ok(store.contacts.some(c=>c.id===deal.contactId))});
test("demo pipeline totals 420000",()=>{const value=store.deals.filter(d=>d.stage!=="won"&&d.stage!=="lost").reduce((n,d)=>n+d.value,0);assert.equal(value,420000)});
