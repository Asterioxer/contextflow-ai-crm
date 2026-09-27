import {NextResponse} from "next/server";
import {getAuthUser} from "@/lib/auth";
import {deleteContact,getContact,updateContact} from "@/lib/repository";
import {contactUpdateSchema} from "@/lib/validation";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  try{
    const {id}=await params;const data=await getContact(id);
    if(!data)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
    return NextResponse.json({success:true,data});
  }catch{return NextResponse.json({success:false,error:{code:"CONTACT_FETCH_FAILED",message:"Unable to load contact."}},{status:500})}
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  const parsed=contactUpdateSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid contact update."}},{status:400});
  try{
    const {id}=await params;const data=await updateContact(id,parsed.data);
    if(!data)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
    return NextResponse.json({success:true,data});
  }catch{return NextResponse.json({success:false,error:{code:"CONTACT_UPDATE_FAILED",message:"Unable to update contact."}},{status:500})}
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
  const user=await getAuthUser();
  if(!user)return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Authentication required."}},{status:401});
  try{
    const {id}=await params;const removed=await deleteContact(id);
    if(!removed)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
    return NextResponse.json({success:true,data:null});
  }catch{return NextResponse.json({success:false,error:{code:"CONTACT_DELETE_FAILED",message:"Unable to delete contact."}},{status:500})}
}