import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {updateDeal} from "@/lib/repository";
import {dealPatchSchema} from "@/lib/validation";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  const parsed=dealPatchSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid deal update."}},{status:400});
  try{
    const {id}=await params;const data=await updateDeal(id,parsed.data);
    if(!data)return NextResponse.json({success:false,error:{code:"DEAL_NOT_FOUND",message:"Deal does not exist."}},{status:404});
    return NextResponse.json({success:true,data});
  }catch{return NextResponse.json({success:false,error:{code:"DEAL_UPDATE_FAILED",message:"Unable to update deal."}},{status:500})}
}