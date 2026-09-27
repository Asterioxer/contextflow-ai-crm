import {NextResponse} from "next/server";
import {z} from "zod";
import {getAuthUser} from "@/lib/auth";
import {getContact,listActivities,listDeals} from "@/lib/repository";

const schema=z.object({dealId:z.string().min(1)});

export async function POST(request:Request){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid request."}},{status:400});
  try{
    const deals=await listDeals();
    const deal=deals.find(item=>item.id===parsed.data.dealId);
    if(!deal)return NextResponse.json({success:false,error:{code:"DEAL_NOT_FOUND",message:"Deal does not exist."}},{status:404});
    const recent=(await listActivities(deal.contactId)).find(item=>item.dealId===deal.id);
    const stale=!recent||Date.now()-new Date(recent.occurredAt).getTime()>7*86400000;
    return NextResponse.json({success:true,data:{
      attention:stale,
      recommendation:stale?"Send a context-aware follow-up and schedule the next concrete step.":"Keep the current cadence and log the next interaction.",
      evidence:stale?["No recent interaction recorded.","Deal is currently in "+deal.stage+"."]:["Recent interaction exists.","Deal is currently in "+deal.stage+"."],
      contact:(await getContact(deal.contactId))?.contact||null
    }});
  }catch{return NextResponse.json({success:false,error:{code:"NEXT_ACTION_FAILED",message:"Unable to calculate the next action."}},{status:500})}
}