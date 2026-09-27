import {NextResponse} from "next/server";
import {z} from "zod";
import {store} from "@/lib/store";
const schema=z.object({dealId:z.string().min(1)});
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid request."}},{status:400});
 const deal=store.deals.find(d=>d.id===parsed.data.dealId);
 if(!deal)return NextResponse.json({success:false,error:{code:"DEAL_NOT_FOUND",message:"Deal does not exist."}},{status:404});
 const recent=store.activities.filter(a=>a.dealId===deal.id).sort((a,b)=>new Date(b.occurredAt).getTime()-new Date(a.occurredAt).getTime())[0];
 const stale=!recent||Date.now()-new Date(recent.occurredAt).getTime()>7*86400000;
 return NextResponse.json({success:true,data:{attention:stale,recommendation:stale?"Send a context-aware follow-up and schedule the next concrete step.":"Keep the current cadence and log the next interaction.",evidence:stale?["No recent interaction recorded.","Deal is currently in "+deal.stage+"."]:["Recent interaction exists.","Deal is currently in "+deal.stage+"."]}});
}
