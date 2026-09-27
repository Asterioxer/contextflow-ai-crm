import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {addActivity,getContact} from "@/lib/repository";
import {activityCreateSchema} from "@/lib/validation";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  const parsed=activityCreateSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid activity payload."}},{status:400});
  try{
    const {id}=await params;
    const detail=await getContact(id);
    if(!detail)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
    if(parsed.data.dealId&&!detail.deals.some(d=>d.id===parsed.data.dealId))return NextResponse.json({success:false,error:{code:"DEAL_NOT_FOUND",message:"Linked deal does not belong to this contact."}},{status:404});
    const data=await addActivity({contactId:id,...parsed.data},user.id);
    return NextResponse.json({success:true,data},{status:201});
  }catch{return NextResponse.json({success:false,error:{code:"ACTIVITY_CREATE_FAILED",message:"Unable to record interaction."}},{status:500})}
}