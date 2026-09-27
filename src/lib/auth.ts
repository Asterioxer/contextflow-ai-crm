import {cookies} from "next/headers";
import {createClient as createSupabaseServerClient} from "@/lib/supabase/server";
import {demoMode,supabaseConfigured} from "@/lib/supabase/config";

export interface AuthUser{
  id:string;
  email?:string;
}

export async function getAuthUser():Promise<AuthUser|null>{
  if(supabaseConfigured&&process.env.DEMO_MODE==="false"){
    const supabase=await createSupabaseServerClient();
    const {data}=await supabase.auth.getClaims();
    const claims=data?.claims;
    if(claims?.sub)return {id:String(claims.sub),email:typeof claims.email==="string"?claims.email:undefined};
  }

  if(demoMode){
    const cookieStore=await cookies();
    if(cookieStore.get("cf_demo")?.value==="1")return {id:"demo",email:"demo@contextflow.local"};
  }

  return null;
}