import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {supabaseConfigured} from "@/lib/supabase/config";

export async function POST(){
  if(supabaseConfigured&&process.env.DEMO_MODE==="false"){
    const supabase=await createClient();
    await supabase.auth.signOut();
  }
  const response=NextResponse.json({success:true});
  response.cookies.set("cf_demo","",{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:0});
  return response;
}