import type {Activity,Contact,Deal} from "@/lib/types";
import {analyzeRelationship,RelationshipIntelligence} from "@/lib/relationship-intelligence";

export interface AccountBriefing{
  generatedAt:string;
  overview:string;
  metrics:{contacts:number;openDeals:number;pipelineValue:number;attentionNeeded:number;recentInteractions:number};
  priorities:Array<{contact:Contact;deal:Deal|null;intelligence:RelationshipIntelligence}>;
  recommendations:string[];
}

export function buildAccountBriefing(
  contacts:Contact[],
  deals:Deal[],
  activities:Activity[],
):AccountBriefing{
  const intelligence=contacts.map(contact=>{
    const contactDeals=deals.filter(d=>d.contactId===contact.id);
    const contactActivities=activities.filter(a=>a.contactId===contact.id).sort((a,b)=>new Date(b.occurredAt).getTime()-new Date(a.occurredAt).getTime());
    return {
      contact,
      deal:contactDeals.find(d=>d.stage!=="won"&&d.stage!=="lost")||contactDeals[0]||null,
      intelligence:analyzeRelationship(contact,contactDeals,contactActivities)
    };
  });
  const priorities=intelligence
    .filter(item=>item.intelligence.status!=="healthy")
    .sort((a,b)=>a.intelligence.score-b.intelligence.score)
    .slice(0,5);
  const openDeals=deals.filter(d=>d.stage!=="won"&&d.stage!=="lost");
  const pipelineValue=openDeals.reduce((sum,d)=>sum+d.value,0);
  const recentInteractions=activities.filter(a=>Date.now()-new Date(a.occurredAt).getTime()<=14*86400000).length;
  const attentionNeeded=intelligence.filter(item=>item.intelligence.status!=="healthy").length;

  const recommendations:string[]=[];
  if(priorities.some(item=>item.intelligence.momentum==="negative"))recommendations.push("Recover stale relationships before adding more pipeline.");
  if(openDeals.some(d=>d.stage==="qualified"))recommendations.push("Convert qualified opportunities into dated decision or technical milestones.");
  if(recentInteractions===0&&contacts.length)recommendations.push("Log recent customer interactions so relationship signals remain evidence-based.");
  if(!recommendations.length)recommendations.push("Keep the current engagement cadence and continue logging meaningful interactions.");

  return {
    generatedAt:new Date().toISOString(),
    overview:contacts.length
      ? attentionNeeded+" of "+contacts.length+" relationships need attention; "+openDeals.length+" open opportunities represent "+pipelineValue.toLocaleString("en-IN")+" in pipeline."
      :"No contacts are available yet.",
    metrics:{contacts:contacts.length,openDeals:openDeals.length,pipelineValue,attentionNeeded,recentInteractions},
    priorities,
    recommendations
  };
}
