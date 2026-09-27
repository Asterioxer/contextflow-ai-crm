"use client";

import {useState} from "react";
import type {FormEvent} from "react";
import {useRouter} from "next/navigation";
import {Sparkles} from "lucide-react";
import {createClient} from "@/lib/supabase/client";
import {supabaseConfigured} from "@/lib/supabase/config";

export default function UpdatePassword(){
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const router=useRouter();

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError("");
    if(password.length<6||password!==confirm){setError("Use at least 6 characters and make the passwords match.");setBusy(false);return;}
    try{
      if(!supabaseConfigured)throw new Error("Password recovery requires a Supabase connection.");
      const supabase=createClient();
      const {error:authError}=await supabase.auth.updateUser({password});
      if(authError)throw new Error(authError.message);
      router.push("/dashboard");
    }catch(err){setError(err instanceof Error?err.message:"Unable to update your password.");setBusy(false);}
  }

  return <div className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-md rounded-3xl border border-[#e5e8ee] bg-white p-8 shadow-xl sm:p-10"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-[#635bff] text-white"><Sparkles size={17}/></div><b>ContextFlow</b></div><h1 className="mt-8 text-2xl font-bold">Choose a new password</h1><p className="mt-2 text-sm text-slate-500">Set a new password for your ContextFlow account.</p><form onSubmit={submit} className="mt-7"><label className="block text-sm font-semibold">New password</label><input required minLength={6} type="password" className="cf-input mt-2" value={password} onChange={e=>setPassword(e.target.value)}/><label className="mt-5 block text-sm font-semibold">Confirm password</label><input required minLength={6} type="password" className="cf-input mt-2" value={confirm} onChange={e=>setConfirm(e.target.value)}/>{error&&<div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}<button disabled={busy} className="cf-button cf-primary mt-6 w-full justify-center">{busy?"Updating…":"Update password"}</button></form></div></div>;
}
