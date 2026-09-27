import {NextResponse} from "next/server";
import {z} from "zod";
import {store} from "@/lib/store";
import {generateFollowUp} from "@/lib/ai";
const schema=z.object({contactId:z.string().min(1)});
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid AI request."}},{status:400});
 const contact=store.contacts.find(c=>c.id===parsed.data.contactId);
 if(!contact)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
 const deal=store.deals.find(d=>d.contactId===contact.id&&d.stage!=="lost");
 const result=await generateFollowUp(contact,deal);
 store.activities.unshift({id:"a-"+crypto.randomUUID(),contactId:contact.id,dealId:deal?.id,type:"ai_generation",title:"AI follow-up generated",description:"Generated "+result.provider+" follow-up for "+(deal?.title||"contact")+".",occurredAt:new Date().toISOString()});
 return NextResponse.json({success:true,data:result});
}
