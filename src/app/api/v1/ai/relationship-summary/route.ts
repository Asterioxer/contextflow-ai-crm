import {NextResponse} from "next/server";
import {z} from "zod";
import {getAuthUser} from "@/lib/auth";
import {getContact} from "@/lib/repository";
import {analyzeRelationship} from "@/lib/relationship-intelligence";

const schema=z.object({contactId:z.string().min(1)});

export async function POST(request:Request){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid relationship request."}},{status:400});
  try{
    const details=await getContact(parsed.data.contactId);
    if(!details)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
    const intelligence=analyzeRelationship(details.contact,details.deals,details.activities);
    return NextResponse.json({success:true,data:{contact:details.contact,intelligence}});
  }catch{
    return NextResponse.json({success:false,error:{code:"RELATIONSHIP_INTELLIGENCE_FAILED",message:"Unable to analyze the relationship."}},{status:500});
  }
}
