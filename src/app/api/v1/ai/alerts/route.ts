import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {listActivities,listContacts,listDeals} from "@/lib/repository";
import {analyzeRelationship} from "@/lib/relationship-intelligence";
import {buildAiAlerts} from "@/lib/ai-alerts";

export async function GET(){
 const user=await getAuthUser();
 if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
 try{
  const [contacts,deals,activities]=await Promise.all([listContacts(),listDeals(),listActivities()]);
  const priorities=contacts.map(contact=>({contact,deal:deals.find(d=>d.contactId===contact.id&&d.stage!=="won"&&d.stage!=="lost")||null,intelligence:analyzeRelationship(contact,deals.filter(d=>d.contactId===contact.id),activities.filter(a=>a.contactId===contact.id))}));
  return NextResponse.json({success:true,data:{generatedAt:new Date().toISOString(),alerts:buildAiAlerts(priorities,deals)}});
 }catch{return NextResponse.json({success:false,error:{code:"AI_ALERTS_FAILED",message:"Unable to build AI alerts."}},{status:500});}
}
