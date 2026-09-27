import {GoogleGenAI} from "@google/genai";
import type {AiFollowUpResult,Contact,Deal} from "@/lib/types";

function fallback(contact:Contact,deal:Deal|undefined):AiFollowUpResult{
  return {subject:"Following up on "+(deal?.title||"our conversation"),body:"Hi "+contact.firstName+",\n\nI wanted to follow up on "+(deal?.title||"our recent conversation")+". "+contact.notes+"\n\nWould it be useful to schedule a short follow-up this week to align on the remaining questions?\n\nBest,\nSoham",rationale:["Uses recorded relationship context.","References the current deal stage without inventing facts.","Ends with one clear call to action."],nextAction:deal?.stage==="qualified"?"Send the draft and propose a concrete technical next step.":"Confirm the next concrete action with the contact.",provider:"demo"};
}
export async function generateFollowUp(contact:Contact,deal:Deal|undefined){
  const apiKey=process.env.GEMINI_API_KEY;
  if(!apiKey)return fallback(contact,deal);
  try{
    const ai=new GoogleGenAI({apiKey});
    const response=await ai.models.generateContent({model:process.env.GEMINI_MODEL||"gemini-3.5-flash",contents:[
      "You are an AI CRM copilot. Draft a concise professional follow-up email using only supplied CRM context.",
      "Do not invent facts, names, commitments, dates, prices, or product capabilities.",
      "Return JSON only with subject, body, rationale (array of 3 strings), nextAction.",
      "CONTACT: "+JSON.stringify(contact),
      "DEAL: "+JSON.stringify(deal||null)
    ].join("\n")});
    const text=response.text?.trim()||"";
    const parsed=JSON.parse(text);
    if(typeof parsed.subject!=="string"||typeof parsed.body!=="string"||!Array.isArray(parsed.rationale)||typeof parsed.nextAction!=="string")throw new Error("Invalid AI shape");
    return {...parsed,provider:"gemini" as const} as AiFollowUpResult;
  }catch{return fallback(contact,deal)}
}
