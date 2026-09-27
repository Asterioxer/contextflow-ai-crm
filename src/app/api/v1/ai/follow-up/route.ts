import {NextResponse} from "next/server";
import {z} from "zod";
import {getAuthUser} from "@/lib/auth";
import {addActivity,addAiGeneration,getContact} from "@/lib/repository";
import {generateFollowUp} from "@/lib/ai";

const schema=z.object({contactId:z.string().min(1)});

export async function POST(request:Request){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid AI request."}},{status:400});
  try{
    const details=await getContact(parsed.data.contactId);
    if(!details)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
    const deal=details.deals.find(item=>item.stage!=="lost");
    const result=await generateFollowUp(details.contact,deal);
    await addActivity({
      contactId:details.contact.id,
      dealId:deal?.id,
      type:"ai_generation",
      title:"AI follow-up generated",
      description:"Generated "+result.provider+" follow-up for "+(deal?.title||"contact")+"."
    },user.id);
    await addAiGeneration({
      contactId:details.contact.id,
      dealId:deal?.id,
      generationType:"follow_up",
      inputContext:{contact:details.contact,deal:deal||null},
      outputText:JSON.stringify(result),
      model:result.provider==="gemini"?(process.env.GEMINI_MODEL||"configured"):undefined
    },user.id);
    return NextResponse.json({success:true,data:result});
  }catch{return NextResponse.json({success:false,error:{code:"AI_GENERATION_FAILED",message:"Unable to generate the follow-up."}},{status:500})}
}