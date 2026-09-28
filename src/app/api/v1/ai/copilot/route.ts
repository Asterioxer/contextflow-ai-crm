import {NextResponse} from "next/server";
import {z} from "zod";
import {getAuthUser} from "@/lib/auth";
import {listActivities,listContacts,listDeals} from "@/lib/repository";
import {answerCopilot} from "@/lib/copilot";
const schema=z.object({query:z.string().trim().min(1).max(500)});
export async function POST(request:Request){
 const user=await getAuthUser(); if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
 try{const body=schema.parse(await request.json());const [contacts,deals,activities]=await Promise.all([listContacts(),listDeals(),listActivities()]);return NextResponse.json({success:true,data:answerCopilot(body.query,contacts,deals,activities)});}catch{ return NextResponse.json({success:false,error:{code:"COPILOT_FAILED",message:"Unable to answer the CRM question."}},{status:400}); }
}
