import {NextResponse} from "next/server";
import {store} from "@/lib/store";
import {contactSchema} from "@/lib/validation";
export async function GET(request:Request){
 const q=new URL(request.url).searchParams.get("q")?.trim().toLowerCase()||"";
 const data=store.contacts.filter(c=>(c.firstName+" "+c.lastName+" "+c.company+" "+c.email).toLowerCase().includes(q));
 return NextResponse.json({success:true,data});
}
export async function POST(request:Request){
 const parsed=contactSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid contact payload."}},{status:400});
 const now=new Date().toISOString();
 const contact={id:"c-"+crypto.randomUUID(),...parsed.data,createdAt:now,updatedAt:now};
 store.contacts.unshift(contact);
 return NextResponse.json({success:true,data:contact},{status:201});
}
