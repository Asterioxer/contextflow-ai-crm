"use client";

import {useState} from "react";
import type {FormEvent} from "react";
import {Sparkles} from "lucide-react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {supabaseConfigured} from "@/lib/supabase/config";

export default function Login(){
  const [mode,setMode]=useState<"signin"|"signup">("signin");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const router=useRouter();
  const demoEnabled=process.env.NEXT_PUBLIC_DEMO_MODE!=="false";
  const liveAuthEnabled=supabaseConfigured&&process.env.NEXT_PUBLIC_DEMO_MODE==="false";

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError("");setNotice("");
    try{
      if(liveAuthEnabled){
        const supabase=createClient();
        if(mode==="signin"){
          const {error:authError}=await supabase.auth.signInWithPassword({email,password});
          if(authError)throw new Error(authError.message);
          router.push("/dashboard");return;
        }
        const {data,error:authError}=await supabase.auth.signUp({email,password});
        if(authError)throw new Error(authError.message);
        if(data.session)router.push("/dashboard");
        else setNotice("Account created. Check your email if confirmation is enabled, then sign in.");
      }else{
        const res=await fetch("/api/auth/demo-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email||"demo@contextflow.local",password:password||"demo1234"})});
        if(!res.ok)throw new Error("Use the demo credentials shown below.");
        router.push("/dashboard");
      }
    }catch(err){setError(err instanceof Error?err.message:"Authentication failed.");}
    finally{setBusy(false);}
  }

  return <div className="flex min-h-screen items-center justify-center p-6"><div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-[#e5e8ee] bg-white shadow-xl md:grid-cols-2">
    <div className="hidden bg-[#17181d] p-12 text-white md:block"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-[#635bff]"><Sparkles size={17}/></div><b>ContextFlow</b></div><div className="mt-24 text-4xl font-bold leading-tight">Remember the relationship, not just the contact.</div><p className="mt-5 text-slate-300">A focused CRM with relationship memory, deal health, and an AI follow-up copilot.</p></div>
    <form onSubmit={submit} className="p-8 sm:p-12"><div className="mb-8 flex items-center gap-3 md:hidden"><div className="flex size-9 items-center justify-center rounded-xl bg-[#635bff] text-white"><Sparkles size={17}/></div><b>ContextFlow</b></div>
      <h1 className="text-2xl font-bold">{mode==="signin"?"Welcome back":"Create your workspace"}</h1><p className="mt-2 text-sm text-slate-500">{liveAuthEnabled?"Supabase Auth is connected.":"Demo mode is available for assessment playback."}</p>
      <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-bold"><button type="button" onClick={()=>setMode("signin")} className={"rounded-lg px-3 py-2 "+(mode==="signin"?"bg-white shadow-sm":"text-slate-500")}>Sign in</button><button type="button" onClick={()=>setMode("signup")} className={"rounded-lg px-3 py-2 "+(mode==="signup"?"bg-white shadow-sm":"text-slate-500")}>Sign up</button></div>
      <label className="mt-6 block text-sm font-semibold">Email</label><input required className="cf-input mt-2" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com"/>
      <label className="mt-5 block text-sm font-semibold">Password</label><input required minLength={6} className="cf-input mt-2" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="At least 6 characters"/>
      {error&&<div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}{notice&&<div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
      <button disabled={busy} className="cf-button cf-primary mt-6 w-full justify-center">{busy?(mode==="signin"?"Signing in…":"Creating…"):(mode==="signin"?"Sign in":"Create account")}</button>
      {demoEnabled&&<div className="mt-6 rounded-2xl bg-slate-50 p-4"><div className="text-xs font-bold uppercase tracking-wide text-slate-400">Assessment demo</div><p className="mt-2 text-xs leading-5 text-slate-500">demo@contextflow.local / demo1234</p><button type="button" onClick={()=>{setEmail("demo@contextflow.local");setPassword("demo1234");setMode("signin")}} className="mt-3 text-sm font-bold text-[#635bff]">Use demo credentials</button></div>}
    </form>
  </div></div>;
}