import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";

export async function updateSession(request:NextRequest){
  let supabaseResponse=NextResponse.next({request});
  const path=request.nextUrl.pathname;
  const isDashboard=path.startsWith("/dashboard");
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if(process.env.DEMO_MODE!=="false"){
    if(isDashboard&&request.cookies.get("cf_demo")?.value!=="1"){
      return NextResponse.redirect(new URL("/login",request.url));
    }
    return supabaseResponse;
  }

  if(!url||!key)return supabaseResponse;

  const supabase=createServerClient(url,key,{
    cookies:{
      getAll(){return request.cookies.getAll();},
      setAll(cookiesToSet){
        cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));
        supabaseResponse=NextResponse.next({request});
        cookiesToSet.forEach(({name,value,options})=>supabaseResponse.cookies.set(name,value,options));
      }
    }
  });

  const {data}=await supabase.auth.getClaims();
  if(!data?.claims&&isDashboard){
    const loginUrl=new URL("/login",request.url);
    loginUrl.searchParams.set("next",path);
    return NextResponse.redirect(loginUrl);
  }
  return supabaseResponse;
}