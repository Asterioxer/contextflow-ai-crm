import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {createDeal,listDeals} from "@/lib/repository";
import {dealCreateSchema} from "@/lib/validation";

export async function GET(){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  try{return NextResponse.json({success:true,data:await listDeals()});}
  catch{return NextResponse.json({success:false,error:{code:"DEALS_FETCH_FAILED",message:"Unable to load deals."}},{status:500})}
}

export async function POST(request:Request){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  const parsed=dealCreateSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid deal payload."}},{status:400});
  try{
    const data=await createDeal(parsed.data,user.id);
    return NextResponse.json({success:true,data},{status:201});
  }catch{return NextResponse.json({success:false,error:{code:"DEAL_CREATE_FAILED",message:"Unable to create deal."}},{status:500})}
}