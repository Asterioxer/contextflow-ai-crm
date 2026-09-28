import type {Activity,Contact,Deal} from "@/lib/types";

export interface RelationshipIntelligence{
  score:number;
  status:"healthy"|"watch"|"at_risk";
  momentum:"positive"|"neutral"|"negative";
  summary:string;
  risks:string[];
  signals:string[];
  nextActions:string[];
}

const daysSince=(iso:string)=>Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/86400000));

export function analyzeRelationship(
  contact:Contact,
  deals:Deal[],
  activities:Activity[],
):RelationshipIntelligence{
  const openDeals=deals.filter(d=>d.stage!=="won"&&d.stage!=="lost");
  const recent=activities.filter(a=>daysSince(a.occurredAt)<=14);
  const latest=activities[0];
  const staleDays=latest?daysSince(latest.occurredAt):999;

  let score=50;
  const signals:string[]=[];
  const risks:string[]=[];
  const nextActions:string[]=[];

  if(recent.length>=2){score+=15;signals.push("Multiple interactions recorded in the last 14 days.");}
  else if(recent.length===1){score+=7;signals.push("A recent interaction keeps the relationship active.");}
  else{score-=15;risks.push("No interaction has been recorded in the last 14 days.");}

  const qualified=openDeals.filter(d=>d.stage==="qualified");
  if(qualified.length){score+=15;signals.push(qualified.length+" qualified deal"+(qualified.length>1?"s":"")+" in progress.");}
  if(openDeals.some(d=>d.stage==="contacted"))signals.push("An active deal is in the contacted stage.");
  if(openDeals.some(d=>d.stage==="new"))risks.push("At least one open deal has not progressed beyond new.");

  const maxHealth=Math.max(...openDeals.map(d=>d.healthScore),0);
  if(maxHealth>=75){score+=10;signals.push("At least one open deal has strong health.");}
  else if(openDeals.length&&maxHealth<50){score-=10;risks.push("Open deal health is below 50.");}

  if(staleDays>7&&openDeals.length){
    risks.push("The active relationship has gone "+staleDays+" days without a logged interaction.");
    nextActions.push("Send a context-aware follow-up and propose one concrete next step.");
  }
  if(qualified.length)nextActions.push("Move the qualified opportunity toward a dated decision or technical milestone.");
  if(contact.notes.trim())signals.push("Relationship notes contain explicit customer context.");
  else risks.push("No relationship notes are recorded for this contact.");

  if(!nextActions.length)nextActions.push("Log the next customer interaction and keep the relationship cadence explicit.");

  score=Math.max(0,Math.min(100,score));
  const status=score>=70?"healthy":score>=45?"watch":"at_risk";
  const momentum=recent.length>=2?"positive":staleDays>14?"negative":"neutral";

  const summary=
    status==="healthy"
      ? contact.firstName+" has an active relationship with "+(openDeals.length?"an open opportunity":"no open opportunity")+" and recent engagement."
      : status==="watch"
        ? contact.firstName+" needs attention: the relationship has useful signals but the current cadence or opportunity progression is uneven."
        : contact.firstName+" is at risk of going cold; the available CRM history shows insufficient recent engagement or weak opportunity signals.";

  return {score,status,momentum,summary,risks:[...new Set(risks)].slice(0,4),signals:[...new Set(signals)].slice(0,5),nextActions:[...new Set(nextActions)].slice(0,3)};
}
