import {NextResponse} from "next/server";
import {store} from "@/lib/store";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const contact=store.contacts.find(c=>c.id===id);
 if(!contact)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
 return NextResponse.json({success:true,data:{contact,deals:store.deals.filter(d=>d.contactId===id),activities:store.activities.filter(a=>a.contactId===id)}});
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const index=store.contacts.findIndex(c=>c.id===id);
 if(index<0)return NextResponse.json({success:false,error:{code:"CONTACT_NOT_FOUND",message:"Contact does not exist."}},{status:404});
 store.contacts.splice(index,1);store.deals=store.deals.filter(d=>d.contactId!==id);store.activities=store.activities.filter(a=>a.contactId!==id);
 return NextResponse.json({success:true,data:null});
}
