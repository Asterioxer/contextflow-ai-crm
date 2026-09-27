"use client";
import {useMemo,useState} from "react";
import {Activity,ArrowRight,BarChart3,Bot,BriefcaseBusiness,ContactRound,LogOut,Plus,Search,Sparkles,Target,UserRound} from "lucide-react";
import {store} from "@/lib/store";
import type {Contact,DealStage} from "@/lib/types";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
const stages:DealStage[]=["new","contacted","qualified","won","lost"];
const labels:Record<DealStage,string>={new:"New",contacted:"Contacted",qualified:"Qualified",won:"Won",lost:"Lost"};
const daysSince=(iso:string)=>Math.floor((Date.now()-new Date(iso).getTime())/86400000);

function NavButton({id,label,Icon,active,onSelect}:{id:"dashboard"|"contacts"|"deals";label:string;Icon:typeof BarChart3;active:boolean;onSelect:(id:"dashboard"|"contacts"|"deals")=>void}){
  return <button onClick={()=>onSelect(id)} className={"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold "+(active?"bg-[#efefff] text-[#574ff2]":"text-slate-600 hover:bg-slate-50")}><Icon size={17}/>{label}</button>
}

export default function Dashboard(){
  const [view,setView]=useState<"dashboard"|"contacts"|"deals">("dashboard");
  const [query,setQuery]=useState("");
  const [selected,setSelected]=useState<Contact|null>(null);
  const [ai,setAi]=useState<{subject:string;body:string;rationale:string[];nextAction:string;provider:string}|null>(null);
  const [busy,setBusy]=useState(false);
  const [dealState,setDealState]=useState(store.deals);
  const open=dealState.filter(d=>d.stage!=="won"&&d.stage!=="lost");
  const pipeline=open.reduce((sum,d)=>sum+d.value,0);
  const stale=open.filter(d=>daysSince(d.updatedAt)>7).length;
  const contacts=useMemo(()=>store.contacts.filter(c=>(c.firstName+" "+c.lastName+" "+c.company+" "+c.email).toLowerCase().includes(query.toLowerCase())),[query]);

  async function generate(contact:Contact){
    setSelected(contact);setAi(null);setBusy(true);
    try{const res=await fetch("/api/v1/ai/follow-up",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contactId:contact.id})});const body=await res.json();if(res.ok)setAi(body.data);}
    finally{setBusy(false)}
  }

  async function move(id:string,stage:DealStage){
    const previous=dealState;
    setDealState(items=>items.map(d=>d.id===id?{...d,stage,updatedAt:new Date().toISOString()}:d));
    try{const res=await fetch("/api/v1/deals/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({stage})});if(!res.ok)throw new Error()}
    catch{setDealState(previous)}
  }

  const handleNav=(id:"dashboard"|"contacts"|"deals")=>{setView(id);setSelected(null);setAi(null)};

  return <div className="flex min-h-screen">
    <aside className="hidden w-60 shrink-0 border-r border-[#e5e8ee] bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 px-6"><div className="flex size-9 items-center justify-center rounded-xl bg-[#635bff] text-white"><Sparkles size={17}/></div><div><div className="font-bold">ContextFlow</div><div className="text-xs text-slate-400">AI-native CRM</div></div></div>
      <nav className="flex-1 space-y-1 px-3 py-4"><NavButton id="dashboard" label="Dashboard" Icon={BarChart3} active={view==="dashboard"} onSelect={handleNav}/><NavButton id="contacts" label="Contacts" Icon={ContactRound} active={view==="contacts"} onSelect={handleNav}/><NavButton id="deals" label="Deals" Icon={BriefcaseBusiness} active={view==="deals"} onSelect={handleNav}/></nav>
      <a href="/login" className="border-t border-[#e5e8ee] p-4 text-sm text-slate-500"><LogOut size={16} className="mr-2 inline"/>Sign out</a>
    </aside>

    <main className="min-w-0 flex-1 p-6 md:p-8"><div className="mx-auto max-w-7xl">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="text-sm font-bold text-[#635bff]">Context intelligence</div><h1 className="mt-1 text-3xl font-bold tracking-tight">Good evening, Soham</h1><p className="mt-2 text-sm text-slate-500">Your pipeline, relationships, and next actions in one place.</p></div>
        <button onClick={()=>setView("contacts")} className="cf-button cf-primary"><Plus size={16}/> Add contact</button>
      </header>

      {view==="dashboard"&&<div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[["Leads","124","Active contacts"],["Qualified","38","Sales-ready deals"],["Won","17","Closed opportunities"],["Pipeline",money.format(pipeline),"Open opportunity value"]].map(([l,v,h])=><div className="cf-card p-5" key={l}><div className="text-xs font-bold uppercase tracking-wide text-slate-400">{l}</div><div className="mt-3 text-3xl font-bold">{v}</div><div className="mt-2 text-xs text-slate-500">{h}</div></div>)}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <section className="cf-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">Deal pipeline</h2><p className="mt-1 text-sm text-slate-500">Momentum at a glance.</p></div><button onClick={()=>setView("deals")} className="text-sm font-bold text-[#635bff]">Open board <ArrowRight className="ml-1 inline" size={14}/></button></div>
            <div className="mt-5 space-y-3">{dealState.slice(0,5).map(d=>{const c=store.contacts.find(x=>x.id===d.contactId);return <div key={d.id} className="flex items-center justify-between rounded-2xl border border-[#eef0f4] p-4"><div><div className="text-sm font-bold">{d.title}</div><div className="mt-1 text-xs text-slate-500">{c?.company}</div></div><div className="text-right"><div className="text-sm font-bold">{money.format(d.value)}</div><div className="mt-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{labels[d.stage]}</div></div></div>})}</div>
          </section>
          <section className="cf-card p-6"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-[#efefff] text-[#635bff]"><Bot size={18}/></div><div><h2 className="font-bold">AI attention</h2><p className="text-sm text-slate-500">ContextFlow watches for stalled momentum.</p></div></div>
            <div className="mt-5 rounded-2xl bg-amber-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-amber-800"><Target size={15}/> {stale} deal{stale===1?"":"s"} need attention</div><p className="mt-1 text-xs leading-5 text-amber-700">Active opportunities with more than a week since the last recorded update.</p></div>
            <button onClick={()=>generate(store.contacts[0])} className="mt-3 w-full rounded-2xl bg-slate-50 p-4 text-left hover:bg-slate-100"><div className="flex items-center gap-2 text-sm font-bold"><Sparkles size={15} className="text-[#635bff]"/> Next best action</div><p className="mt-1 text-xs leading-5 text-slate-500">Generate a context-aware follow-up for Acme Corporation.</p></button>
          </section>
        </div>
      </div>}

      {view==="contacts"&&<section className="mt-8"><div className="relative max-w-lg"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} className="cf-input pl-9" placeholder="Search contacts, companies, email…"/></div><div className="cf-card mt-5 overflow-hidden"><div className="grid grid-cols-[2fr_1.2fr_1fr] gap-4 border-b border-[#eef0f4] px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400"><div>Contact</div><div>Company</div><div>Deal</div></div>{contacts.map(c=>{const d=dealState.find(x=>x.contactId===c.id&&x.stage!=="lost");return <button onClick={()=>generate(c)} key={c.id} className="grid w-full grid-cols-[2fr_1.2fr_1fr] gap-4 border-b border-[#f2f3f6] px-5 py-4 text-left text-sm hover:bg-slate-50"><div><div className="font-bold">{c.firstName} {c.lastName}</div><div className="mt-1 text-xs text-slate-500">{c.title} · {c.email}</div></div><div className="self-center text-slate-600">{c.company}</div><div className="self-center text-slate-600">{d?money.format(d.value):"—"}</div></button>})}</div></section>}

      {view==="deals"&&<section className="mt-8"><div className="grid gap-4 xl:grid-cols-5">{stages.map(stage=><div key={stage} className="rounded-2xl border border-[#e5e8ee] bg-[#fafbfc] p-3"><div className="flex items-center justify-between px-2 pb-2"><div className="text-sm font-bold">{labels[stage]}</div><div className="text-xs text-slate-400">{dealState.filter(d=>d.stage===stage).length}</div></div><div className="space-y-3">{dealState.filter(d=>d.stage===stage).map(d=>{const c=store.contacts.find(x=>x.id===d.contactId);return <div className="cf-card p-4" key={d.id}><div className="text-sm font-bold">{d.title}</div><div className="mt-1 text-xs text-slate-500">{c?.company}</div><div className="mt-3 text-lg font-bold">{money.format(d.value)}</div><div className="mt-2 flex items-center justify-between text-xs"><span className="text-slate-400">Health</span><b>{d.healthScore}%</b></div><div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#635bff]" style={{width:d.healthScore+"%"}}/></div><select aria-label={"Move "+d.title} value={d.stage} onChange={e=>move(d.id,e.target.value as DealStage)} className="cf-input mt-3 py-2 text-xs">{stages.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></div>})}</div></div>)}</div></section>}

      {selected&&<div className="fixed inset-0 z-40 overflow-auto bg-black/30 p-4 md:p-8" onClick={()=>setSelected(null)}><div className="mx-auto max-w-5xl" onClick={e=>e.stopPropagation()}><div className="cf-card p-6"><button onClick={()=>setSelected(null)} className="mb-4 text-sm font-bold text-slate-500">Close</button><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div><div className="text-xs font-bold uppercase tracking-wide text-[#635bff]">Relationship profile</div><h2 className="mt-2 text-3xl font-bold">{selected.firstName} {selected.lastName}</h2><p className="mt-1 text-slate-500">{selected.title} · {selected.company}</p><div className="mt-5 rounded-2xl bg-[#fafaff] p-5"><div className="flex items-center gap-2 text-sm font-bold"><UserRound size={16} className="text-[#635bff]"/> Memory</div><p className="mt-2 text-sm leading-6 text-slate-600">{selected.notes}</p></div><div className="mt-5 rounded-2xl border border-[#eef0f4] p-5"><div className="flex items-center gap-2 text-sm font-bold"><Activity size={16}/> Recent interactions</div>{store.activities.filter(a=>a.contactId===selected.id).map(a=><div key={a.id} className="mt-4 border-l-2 border-[#e1dfff] pl-4"><div className="text-sm font-bold">{a.title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{a.description}</div></div>)}</div></div><div>{busy?<div className="rounded-2xl bg-[#fafaff] p-5 text-sm text-slate-500">Generating contextual follow-up…</div>:ai?<div className="rounded-2xl border border-[#ddd9ff] bg-[#fafaff] p-5"><div className="flex items-center gap-2 font-bold"><Sparkles size={16} className="text-[#635bff]"/> AI draft <span className="ml-auto text-xs font-medium text-slate-400">{ai.provider}</span></div><h3 className="mt-4 font-bold">{ai.subject}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{ai.body}</p><div className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Why this draft</div><div className="mt-2 space-y-2 text-xs text-slate-500">{ai.rationale.map(r=><div key={r}>• {r}</div>)}</div><div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800"><b>Next action:</b> {ai.nextAction}</div></div>:<button onClick={()=>generate(selected)} className="cf-button cf-primary w-full justify-center"><Sparkles size={16}/> Generate follow-up</button>}</div></div></div></div></div>}
    </div></main>
  </div>
}
