"use client";

import {useState} from "react";
import type {FormEvent} from "react";
import Link from "next/link";
import {Sparkles,ArrowLeft} from "lucide-react";
import {createClient} from "@/lib/supabase/client";
import {supabaseConfigured} from "@/lib/supabase/config";

export default function ForgotPassword(){
  const [email,setEmail]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError("");setMessage("");
    try{
      if(!supabaseConfigured)throw new Error("Password recovery requires a Supabase connection.");
      const supabase=createClient();
      const redirectTo=window.location.origin+"/auth/update-password";
      const {error:authError}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});
      if(authError)throw new Error(authError.message);
      setMessage("If the account exists, a password reset link has been sent.");
    }catch(err){setError(err instanceof Error?err.message:"Unable to send reset email.");}
    finally{setBusy(false);}
  }

  return <div className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-md rounded-3xl border border-[#e5e8ee] bg-white p-8 shadow-xl sm:p-10"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-[#635bff] text-white"><Sparkles size={17}/></div><b>ContextFlow</b></div><Link href="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={14}/> Back to sign in</Link><h1 className="mt-6 text-2xl font-bold">Reset your password</h1><p className="mt-2 text-sm text-slate-500">We’ll email you a secure recovery link.</p><form onSubmit={submit} className="mt-7"><label className="block text-sm font-semibold">Email</label><input required type="email" className="cf-input mt-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>{error&&<div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}{message&&<div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}<button disabled={busy} className="cf-button cf-primary mt-6 w-full justify-center">{busy?"Sending…":"Send reset link"}</button></form></div></div>;
}
