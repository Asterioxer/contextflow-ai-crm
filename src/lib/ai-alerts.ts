import type {Contact,Deal} from "@/lib/types";
import type {RelationshipIntelligence} from "@/lib/relationship-intelligence";

export type AlertSeverity="high"|"medium"|"low";
export type AlertKind="relationship_stale"|"deal_stale"|"qualified_milestone"|"deal_risk";
export interface AiAlert{ id:string; kind:AlertKind; severity:AlertSeverity; title:string; description:string; contact:Contact|null; deal:Deal|null; intelligence:RelationshipIntelligence|null; }

type Priority={contact:Contact;deal:Deal|null;intelligence:RelationshipIntelligence};

export function buildAiAlerts(priorities:Priority[],deals:Deal[]):AiAlert[]{
 const alerts:AiAlert[]=[];
 for(const item of priorities){
  const {contact,deal,intelligence}=item;
  if(intelligence.momentum==="negative") alerts.push({id:"relationship-stale:"+contact.id,kind:"relationship_stale",severity:"high",title:"Relationship has gone quiet",description:intelligence.risks[0]||"No recent interaction signal is available.",contact,deal,intelligence});
  else if(intelligence.status==="at_risk") alerts.push({id:"relationship-risk:"+contact.id,kind:"relationship_stale",severity:"medium",title:"Relationship needs attention",description:intelligence.summary,contact,deal,intelligence});
  if(deal && deal.stage!=="won"&&deal.stage!=="lost"&&deal.healthScore<50) alerts.push({id:"deal-risk:"+deal.id,kind:"deal_risk",severity:"high",title:"Deal health is low",description:deal.title+" is at "+deal.healthScore+"% health and needs a concrete recovery action.",contact,deal,intelligence});
 }
 for(const deal of deals.filter(d=>d.stage==="qualified")){
  if(!alerts.some(a=>a.deal?.id===deal.id&&a.kind==="deal_risk")){
   const contact=priorities.find(p=>p.deal?.id===deal.id)?.contact||null;
   alerts.push({id:"qualified-milestone:"+deal.id,kind:"qualified_milestone",severity:"medium",title:"Qualified deal needs a milestone",description:deal.title+" is qualified; add a dated decision or technical milestone.",contact,deal,intelligence:contact?priorities.find(p=>p.contact.id===contact.id)?.intelligence||null:null});
  }
 }
 const rank:Record<AlertSeverity,number>={high:0,medium:1,low:2};
 return alerts.sort((a,b)=>rank[a.severity]-rank[b.severity]||a.title.localeCompare(b.title)).slice(0,12);
}
