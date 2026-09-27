import type {Activity,Contact,Deal} from "@/lib/types";
const ago=(d:number)=>new Date(Date.now()-d*86400000).toISOString();
export const contacts:Contact[]=[
{id:"c-rahul",firstName:"Rahul",lastName:"Sharma",email:"rahul@acme.example",company:"Acme Corporation",title:"VP Engineering",notes:"Interested in enterprise API. Main concerns are integration time and pricing.",createdAt:ago(18),updatedAt:ago(1)},
{id:"c-maya",firstName:"Maya",lastName:"Chen",email:"maya@northstar.example",company:"Northstar Labs",title:"Head of Product",notes:"Wants analytics demo before annual plan discussion.",createdAt:ago(14),updatedAt:ago(3)},
{id:"c-jon",firstName:"Jon",lastName:"Bell",email:"jon@brightline.example",company:"Brightline",title:"COO",notes:"Evaluating an operational partnership. Needs references.",createdAt:ago(26),updatedAt:ago(9)},
{id:"c-aisha",firstName:"Aisha",lastName:"Khan",email:"aisha@vertex.example",company:"Vertex Systems",title:"Director of Engineering",notes:"Technical fit is strong; wants a security review next.",createdAt:ago(11),updatedAt:ago(2)}];
export const deals:Deal[]=[
{id:"d-acme",contactId:"c-rahul",title:"Enterprise API",value:85000,stage:"qualified",healthScore:78,updatedAt:ago(8)},
{id:"d-northstar",contactId:"c-maya",title:"Analytics Platform",value:120000,stage:"contacted",healthScore:62,updatedAt:ago(3)},
{id:"d-brightline",contactId:"c-jon",title:"Operations Suite",value:65000,stage:"qualified",healthScore:51,updatedAt:ago(9)},
{id:"d-vertex",contactId:"c-aisha",title:"Secure Workspace",value:150000,stage:"new",healthScore:64,updatedAt:ago(2)},
{id:"d-won",contactId:"c-maya",title:"Pilot Expansion",value:55000,stage:"won",healthScore:100,updatedAt:ago(5)}];
export const activities:Activity[]=[
{id:"a1",contactId:"c-rahul",dealId:"d-acme",type:"meeting",title:"Integration discussion",description:"Discussed API authentication and rollout timing.",occurredAt:ago(9)},
{id:"a2",contactId:"c-rahul",dealId:"d-acme",type:"email",title:"Pricing details sent",description:"Shared enterprise pricing and API documentation.",occurredAt:ago(8)},
{id:"a3",contactId:"c-maya",dealId:"d-northstar",type:"call",title:"Discovery call",description:"Confirmed analytics requirements.",occurredAt:ago(3)},
{id:"a4",contactId:"c-aisha",dealId:"d-vertex",type:"note",title:"Security review requested",description:"Customer asked for a security review before moving forward.",occurredAt:ago(2)},
{id:"a5",contactId:"c-jon",dealId:"d-brightline",type:"email",title:"Reference deck shared",description:"Sent two customer references.",occurredAt:ago(9)}];
export const store={contacts,deals,activities};
export const dashboardStats=()=>({leads:124,qualified:38,won:17,pipelineValue:420000,staleDeals:deals.filter(d=>d.stage!=="won"&&d.stage!=="lost"&&Date.now()-new Date(d.updatedAt).getTime()>7*86400000).length});
