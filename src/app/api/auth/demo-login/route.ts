import {NextResponse} from "next/server";
import {z} from "zod";
const schema=z.object({email:z.string().email(),password:z.string().min(1)});
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json().catch(()=>null));
 if(!parsed.success||parsed.data.email!=="demo@contextflow.local"||parsed.data.password!=="demo1234")return NextResponse.json({success:false,error:{code:"INVALID_LOGIN",message:"Invalid demo credentials."}},{status:401});
 const response=NextResponse.json({success:true});
 response.cookies.set("cf_demo","1",{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:604800});
 return response;
}
