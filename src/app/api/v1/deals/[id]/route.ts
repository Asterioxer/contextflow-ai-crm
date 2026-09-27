import {NextResponse} from "next/server";
import {store} from "@/lib/store";
import {dealPatchSchema} from "@/lib/validation";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const deal=store.deals.find(d=>d.id===id);
 if(!deal)return NextResponse.json({success:false,error:{code:"DEAL_NOT_FOUND",message:"Deal does not exist."}},{status:404});
 const parsed=dealPatchSchema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({success:false,error:{code:"VALIDATION_ERROR",message:"Invalid deal update."}},{status:400});
 Object.assign(deal,parsed.data,{updatedAt:new Date().toISOString()});
 return NextResponse.json({success:true,data:deal});
}
