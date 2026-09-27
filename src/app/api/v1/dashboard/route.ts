import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {dashboardStats} from "@/lib/repository";

export async function GET(){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  try{return NextResponse.json({success:true,data:await dashboardStats()});}
  catch{return NextResponse.json({success:false,error:{code:"DASHBOARD_FETCH_FAILED",message:"Unable to load dashboard."}},{status:500})}
}