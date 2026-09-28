import type {Activity,Contact,Deal} from "@/lib/types";
import {analyzeRelationship} from "@/lib/relationship-intelligence";
import {buildAccountBriefing} from "@/lib/account-briefing";

export interface CopilotResult{answer:string;intent:"overview"|"priorities"|"pipeline"|"contact"|"actions";sources:string[]}

export function answerCopilot(query:string,contacts:Contact[],deals:Deal[],activities:Activity[]):CopilotResult{
 const q=query.trim().toLowerCase();
 const briefing=buildAccountBriefing(contacts,deals,activities);
 if(!q) return {answer:"Ask me about your pipeline, relationships, priorities, or a specific contact.",intent:"overview",sources:[]};
 const contact=contacts.find(c=>(c.firstName+" "+c.lastName).toLowerCase()===q)||contacts.find(c=>(c.firstName+" "+c.lastName+" "+c.company).toLowerCase().includes(q));
 if(contact){
  const cd=deals.filter(d=>d.contactId===contact.id); const ca=activities.filter(a=>a.contactId===contact.id); const intelligence=analyzeRelationship(contact,cd,ca);
  return {answer:contact.firstName+" "+contact.lastName+" at "+contact.company+" has a relationship score of "+intelligence.score+"/100 ("+intelligence.status+") with "+intelligence.momentum+" momentum. "+intelligence.summary+(cd.length?" Linked deals: "+cd.map(d=>d.title+" ("+d.stage+", "+d.value.toLocaleString("en-IN")+")").join(", ")+".":" No linked deals."),intent:"contact",sources:["contact record","linked deals","relationship signals"]};
 }
 if(q.includes("pipeline")||q.includes("revenue")||q.includes("deal")) return {answer:"You have "+briefing.metrics.openDeals+" open deals worth "+briefing.metrics.pipelineValue.toLocaleString("en-IN")+" in pipeline, with "+deals.filter(d=>d.stage==="qualified").length+" qualified opportunities. "+(briefing.recommendations.find(r=>r.toLowerCase().includes("qualified"))||"Keep deal stages tied to concrete next milestones."),intent:"pipeline",sources:["deal records","account briefing"]};
 if(q.includes("priority")||q.includes("attention")||q.includes("risk")||q.includes("urgent")){
  const top=briefing.priorities.slice(0,3).map(p=>p.contact.firstName+" "+p.contact.lastName+" ("+p.intelligence.score+"/100)");
  return {answer:briefing.metrics.attentionNeeded+" relationships need attention. Top priorities: "+(top.join(", ")||"none")+". "+briefing.recommendations.join(" "),intent:"priorities",sources:["relationship intelligence","account briefing"]};
 }
 if(q.includes("next")||q.includes("action")||q.includes("what should")||q.includes("do")) return {answer:briefing.recommendations.join(" ")+(briefing.priorities[0]?" Highest-risk relationship: "+briefing.priorities[0].contact.firstName+" "+briefing.priorities[0].contact.lastName+" — "+briefing.priorities[0].intelligence.nextActions[0]:""),intent:"actions",sources:["account briefing","relationship intelligence"]};
 return {answer:briefing.overview+" Try asking: ‘Which relationships need attention?’, ‘What is my pipeline?’, or enter a contact name.",intent:"overview",sources:["account briefing"]};
}
