import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {listDeals} from "@/lib/repository";

export async function GET(){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  try{return NextResponse.json({success:true,data:await listDeals()});}
  catch{return NextResponse.json({success:false,error:{code:"DEALS_FETCH_FAILED",message:"Unable to load deals."}},{status:500})}
}