export const dynamic="force-dynamic";
import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {createContact,listContacts} from "@/lib/repository";
import {contactSchema} from "@/lib/validation";

export async function GET(request:Request){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  try{
    const q=new URL(request.url).searchParams.get("q")||"";
    return NextResponse.json({success:true,data:await listContacts(q)});
  }catch{return NextResponse.json({success:false,error:{code:"CONTACTS_FETCH_FAILED",message:"Unable to load contacts."}},{status:500})}
}

export async function POST(request:Request){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  const parsed=contactSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid contact payload."}},{status:400});
  try{
    const data=await createContact(parsed.data,user.id);
    return NextResponse.json({success:true,data},{status:201});
  }catch{return NextResponse.json({success:false,error:{code:"CONTACT_CREATE_FAILED",message:"Unable to create contact."}},{status:500})}
}