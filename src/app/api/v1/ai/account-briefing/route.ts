import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {listActivities,listContacts,listDeals} from "@/lib/repository";
import {buildAccountBriefing} from "@/lib/account-briefing";

export async function GET(){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  try{
    const [contacts,deals,activities]=await Promise.all([listContacts(),listDeals(),listActivities()]);
    return NextResponse.json({success:true,data:buildAccountBriefing(contacts,deals,activities)});
  }catch{
    return NextResponse.json({success:false,error:{code:"ACCOUNT_BRIEFING_FAILED",message:"Unable to build the account briefing."}},{status:500});
  }
}
