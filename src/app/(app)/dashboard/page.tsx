"use client";

import {useEffect,useMemo,useState} from "react";
import type {FormEvent} from "react";
import {Activity,ArrowRight,BarChart3,Bot,BriefcaseBusiness,ContactRound,GripVertical,LogOut,Plus,Search,Sparkles,Target,UserRound,X} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import type {Activity as ActivityModel,Contact,Deal,DealStage} from "@/lib/types";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
const stages:DealStage[]=["new","contacted","qualified","won","lost"];
const labels:Record<DealStage,string>={new:"New",contacted:"Contacted",qualified:"Qualified",won:"Won",lost:"Lost"};

type View="dashboard"|"contacts"|"deals";
type ContactForm={firstName:string;lastName:string;email:string;company:string;title:string;notes:string};
const emptyForm:ContactForm={firstName:"",lastName:"",email:"",company:"",title:"",notes:""};

function NavButton({id,label,Icon,active,onSelect}:{id:View;label:string;Icon:LucideIcon;active:boolean;onSelect:(id:View)=>void}){
  return <button onClick={()=>onSelect(id)} className={"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold "+(active?"bg-[#efefff] text-[#574ff2]":"text-slate-600 hover:bg-slate-50")}><Icon size={17}/>{label}</button>;
}

export default function Dashboard(){
  const [view,setView]=useState<View>("dashboard");
  const [query,setQuery]=useState("");
  const [contacts,setContacts]=useState<Contact[]>([]);
  const [deals,setDeals]=useState<Deal[]>([]);
  const [stats,setStats]=useState({leads:0,qualified:0,won:0,pipelineValue:0,staleDeals:0,interactions:0});
  const [selected,setSelected]=useState<Contact|null>(null);
  const [profileDeals,setProfileDeals]=useState<Deal[]>([]);
  const [profileActivities,setProfileActivities]=useState<ActivityModel[]>([]);
  const [ai,setAi]=useState<{subject:string;body:string;rationale:string[];nextAction:string;provider:string}|null>(null);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [draggingId,setDraggingId]=useState<string|null>(null);
  const [contactForm,setContactForm]=useState<ContactForm>(emptyForm);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [showContactForm,setShowContactForm]=useState(false);
  const open=deals.filter(d=>d.stage!=="won"&&d.stage!=="lost");
  const pipeline=open.reduce((sum,d)=>sum+d.value,0);
  const filteredContacts=useMemo(()=>contacts.filter(c=>(c.firstName+" "+c.lastName+" "+c.company+" "+c.email).toLowerCase().includes(query.toLowerCase())),[contacts,query]);

  async function loadWorkspace(){
    setLoading(true);setError("");
    try{
      const [contactsRes,dealsRes,statsRes]=await Promise.all([
        fetch("/api/v1/contacts"),
        fetch("/api/v1/deals"),
        fetch("/api/v1/dashboard")
      ]);
      if(!contactsRes.ok||!dealsRes.ok||!statsRes.ok)throw new Error("Unable to load workspace");
      const [contactsBody,dealsBody,statsBody]=await Promise.all([contactsRes.json(),dealsRes.json(),statsRes.json()]);
      setContacts(contactsBody.data);setDeals(dealsBody.data);setStats(statsBody.data);
    }catch{setError("We could not load your workspace. Refresh and try again.");}
    finally{setLoading(false);}
  }

  useEffect(()=>{void loadWorkspace();},[]);

  const handleNav=(id:View)=>{setView(id);setSelected(null);setAi(null);setError("");};

  async function openContact(contact:Contact){
    setSelected(contact);setAi(null);setError("");
    try{
      const res=await fetch("/api/v1/contacts/"+contact.id);
      const body=await res.json();
      if(!res.ok)throw new Error();
      setProfileDeals(body.data.deals);setProfileActivities(body.data.activities);
    }catch{setError("Unable to load the relationship timeline.");}
  }

  function startCreate(){
    setEditingId(null);setContactForm(emptyForm);setShowContactForm(true);setError("");
  }

  function startEdit(contact:Contact){
    setEditingId(contact.id);
    setContactForm({firstName:contact.firstName,lastName:contact.lastName,email:contact.email,company:contact.company,title:contact.title,notes:contact.notes});
    setShowContactForm(true);setError("");
  }

  async function saveContact(event:FormEvent){
    event.preventDefault();setBusy(true);setError("");
    try{
      const editing=Boolean(editingId);
      const res=await fetch(editing?"/api/v1/contacts/"+editingId:"/api/v1/contacts",{
        method:editing?"PATCH":"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(contactForm)
      });
      const body=await res.json();
      if(!res.ok)throw new Error(body?.error?.message||"Unable to save contact");
      const contact:Contact=body.data;
      setContacts(items=>editing?items.map(item=>item.id===contact.id?contact:item):[contact,...items]);
      setShowContactForm(false);
      setSelected(contact);
      await openContact(contact);
    }catch(err){setError(err instanceof Error?err.message:"Unable to save contact.");}
    finally{setBusy(false);}
  }

  async function deleteSelected(){
    if(!selected||!window.confirm("Delete this contact and its linked deals and activity?"))return;
    setBusy(true);setError("");
    try{
      const res=await fetch("/api/v1/contacts/"+selected.id,{method:"DELETE"});
      if(!res.ok)throw new Error();
      setContacts(items=>items.filter(item=>item.id!==selected.id));
      setDeals(items=>items.filter(item=>item.contactId!==selected.id));
      setSelected(null);setProfileDeals([]);setProfileActivities([]);
      await loadWorkspace();
    }catch{setError("Unable to delete this contact.");}
    finally{setBusy(false);}
  }

  async function generate(contact:Contact){
    setSelected(contact);setAi(null);setBusy(true);setError("");
    try{
      const detailRes=await fetch("/api/v1/contacts/"+contact.id);
      const detail=await detailRes.json();
      if(detailRes.ok){setProfileDeals(detail.data.deals);setProfileActivities(detail.data.activities);}
      const res=await fetch("/api/v1/ai/follow-up",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contactId:contact.id})});
      const body=await res.json();
      if(!res.ok)throw new Error(body?.error?.message||"AI generation failed");
      setAi(body.data);
      setProfileActivities(items=>[{id:"local-"+Date.now(),contactId:contact.id,dealId:body.data.dealId,type:"ai_generation",title:"AI follow-up generated",description:"Draft created for this relationship.",occurredAt:new Date().toISOString()},...items]);
    }catch(err){setError(err instanceof Error?err.message:"Unable to generate the follow-up.");}
    finally{setBusy(false);}
  }

  async function move(id:string,stage:DealStage){
    const previous=deals;
    setDeals(items=>items.map(d=>d.id===id?{...d,stage,updatedAt:new Date().toISOString()}:d));
    setError("");
    try{
      const res=await fetch("/api/v1/deals/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({stage})});
      const body=await res.json();
      if(!res.ok)throw new Error();
      setDeals(items=>items.map(d=>d.id===id?body.data:d));
      const refreshed=await fetch("/api/v1/dashboard");
      if(refreshed.ok)setStats((await refreshed.json()).data);
    }catch{setDeals(previous);setError("That deal could not be moved.");}
  }

  async function signOut(){
    await fetch("/api/auth/signout",{method:"POST"}).catch(()=>undefined);
    window.location.href="/login";
  }

  return <div className="flex min-h-screen">
    <aside className="hidden w-60 shrink-0 border-r border-[#e5e8ee] bg-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 px-6"><div className="flex size-9 items-center justify-center rounded-xl bg-[#635bff] text-white"><Sparkles size={17}/></div><div><div className="font-bold">ContextFlow</div><div className="text-xs text-slate-400">AI-native CRM</div></div></div>
      <nav className="flex-1 space-y-1 px-3 py-4"><NavButton id="dashboard" label="Dashboard" Icon={BarChart3} active={view==="dashboard"} onSelect={handleNav}/><NavButton id="contacts" label="Contacts" Icon={ContactRound} active={view==="contacts"} onSelect={handleNav}/><NavButton id="deals" label="Deals" Icon={BriefcaseBusiness} active={view==="deals"} onSelect={handleNav}/></nav>
      <button onClick={signOut} className="border-t border-[#e5e8ee] p-4 text-left text-sm text-slate-500 hover:bg-slate-50"><LogOut size={16} className="mr-2 inline"/>Sign out</button>
    </aside>

    <main className="min-w-0 flex-1 p-6 md:p-8"><div className="mx-auto max-w-7xl">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="text-sm font-bold text-[#635bff]">Context intelligence</div><h1 className="mt-1 text-3xl font-bold tracking-tight">Your relationship workspace</h1><p className="mt-2 text-sm text-slate-500">Contacts, pipeline momentum, and useful next actions without the CRM busywork.</p></div>
        <button onClick={startCreate} className="cf-button cf-primary"><Plus size={16}/> Add contact</button>
      </header>

      {error&&<div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      {loading&&<div className="mt-8 rounded-2xl border border-[#e5e8ee] bg-white p-8 text-sm text-slate-500">Loading workspace…</div>}

      {!loading&&view==="dashboard"&&<div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Leads",String(stats.leads),"Active contacts"],
            ["Qualified",String(stats.qualified),"Sales-ready deals"],
            ["Won",String(stats.won),"Closed opportunities"],
            ["Pipeline",money.format(pipeline),"Open opportunity value"]
          ].map(([label,value,hint])=><div className="cf-card p-5" key={label}><div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-3 text-3xl font-bold">{value}</div><div className="mt-2 text-xs text-slate-500">{hint}</div></div>)}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
          <section className="cf-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">Deal pipeline</h2><p className="mt-1 text-sm text-slate-500">{stats.interactions} recorded interactions · drag deals on the board to change stage.</p></div><button onClick={()=>setView("deals")} className="text-sm font-bold text-[#635bff]">Open board <ArrowRight className="ml-1 inline" size={14}/></button></div>
            <div className="mt-5 space-y-3">{deals.slice(0,5).map(d=>{const c=contacts.find(x=>x.id===d.contactId);return <div key={d.id} className="flex items-center justify-between rounded-2xl border border-[#eef0f4] p-4"><div><div className="text-sm font-bold">{d.title}</div><div className="mt-1 text-xs text-slate-500">{c?.company||"Unknown account"}</div></div><div className="text-right"><div className="text-sm font-bold">{money.format(d.value)}</div><div className="mt-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{labels[d.stage]}</div></div></div>})}</div>
          </section>
          <section className="cf-card p-6"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-[#efefff] text-[#635bff]"><Bot size={18}/></div><div><h2 className="font-bold">AI attention</h2><p className="text-sm text-slate-500">Deterministic signals, contextual drafting.</p></div></div>
            <div className="mt-5 rounded-2xl bg-amber-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-amber-800"><Target size={15}/> {stats.staleDeals} deal{stats.staleDeals===1?"":"s"} need attention</div><p className="mt-1 text-xs leading-5 text-amber-700">Open opportunities with more than a week since their last update.</p></div>
            {contacts[0]&&<button onClick={()=>generate(contacts[0])} className="mt-3 w-full rounded-2xl bg-slate-50 p-4 text-left hover:bg-slate-100"><div className="flex items-center gap-2 text-sm font-bold"><Sparkles size={15} className="text-[#635bff]"/> Generate next action</div><p className="mt-1 text-xs leading-5 text-slate-500">Draft a follow-up using the first relationship in your workspace.</p></button>}
          </section>
        </div>
      </div>}

      {!loading&&view==="contacts"&&<section className="mt-8"><div className="relative max-w-lg"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} className="cf-input pl-9" placeholder="Search contacts, companies, email…"/></div>
        <div className="cf-card mt-5 overflow-hidden"><div className="grid grid-cols-[2fr_1.2fr_1fr_auto] gap-4 border-b border-[#eef0f4] px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400"><div>Contact</div><div>Company</div><div>Deal</div><div/></div>
          {filteredContacts.length===0?<div className="p-8 text-center text-sm text-slate-500">No contacts match this search.</div>:filteredContacts.map(c=>{const d=deals.find(x=>x.contactId===c.id&&x.stage!=="lost");return <div key={c.id} className="grid grid-cols-[2fr_1.2fr_1fr_auto] items-center gap-4 border-b border-[#f2f3f6] px-5 py-4"><button onClick={()=>openContact(c)} className="text-left"><div className="font-bold">{c.firstName} {c.lastName}</div><div className="mt-1 text-xs text-slate-500">{c.title} · {c.email}</div></button><div className="text-sm text-slate-600">{c.company}</div><div className="text-sm text-slate-600">{d?money.format(d.value):"—"}</div><button onClick={()=>openContact(c)} className="rounded-lg px-3 py-2 text-xs font-bold text-[#635bff] hover:bg-[#efefff]">View</button></div>})}
        </div>
      </section>}

      {!loading&&view==="deals"&&<section className="mt-8"><div className="mb-4 flex items-center gap-2 text-sm text-slate-500"><GripVertical size={16}/> Drag a deal card into another stage, or use the stage selector for keyboard access.</div><div className="grid gap-4 xl:grid-cols-5">{stages.map(stage=><div key={stage} onDragOver={event=>event.preventDefault()} onDrop={()=>{if(draggingId)void move(draggingId,stage)}} className={"min-h-64 rounded-2xl border p-3 transition "+(draggingId?"border-dashed border-[#c9c5ff] bg-[#fbfaff]":"border-[#e5e8ee] bg-[#fafbfc]")}><div className="flex items-center justify-between px-2 pb-2"><div className="text-sm font-bold">{labels[stage]}</div><div className="text-xs text-slate-400">{deals.filter(d=>d.stage===stage).length}</div></div><div className="space-y-3">{deals.filter(d=>d.stage===stage).map(d=>{const c=contacts.find(x=>x.id===d.contactId);return <article key={d.id} draggable onDragStart={()=>setDraggingId(d.id)} onDragEnd={()=>setDraggingId(null)} className={"cf-card cursor-grab p-4 active:cursor-grabbing "+(draggingId===d.id?"opacity-60":"")}><div className="flex items-start gap-2"><GripVertical size={16} className="mt-0.5 shrink-0 text-slate-300"/><div className="min-w-0 flex-1"><div className="text-sm font-bold">{d.title}</div><div className="mt-1 text-xs text-slate-500">{c?.company||"Unknown account"}</div></div></div><div className="mt-3 text-lg font-bold">{money.format(d.value)}</div><div className="mt-2 flex items-center justify-between text-xs"><span className="text-slate-400">Health</span><b>{d.healthScore}%</b></div><div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#635bff]" style={{width:d.healthScore+"%"}}/></div><select aria-label={"Move "+d.title} value={d.stage} onChange={e=>void move(d.id,e.target.value as DealStage)} className="cf-input mt-3 py-2 text-xs">{stages.map(option=><option key={option} value={option}>{labels[option]}</option>)}</select></article>})}</div></div>)}</div></section>}

      {selected&&<div className="fixed inset-0 z-40 overflow-auto bg-black/30 p-4 md:p-8" onClick={()=>setSelected(null)}><div className="mx-auto max-w-5xl" onClick={e=>e.stopPropagation()}><div className="cf-card p-6">
        <div className="flex items-center justify-between"><button onClick={()=>setSelected(null)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><X size={16}/> Close</button><div className="flex gap-2"><button onClick={()=>startEdit(selected)} className="cf-button cf-secondary">Edit</button><button disabled={busy} onClick={()=>void deleteSelected()} className="cf-button rounded-xl bg-rose-50 text-rose-700">Delete</button></div></div>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]"><div><div className="text-xs font-bold uppercase tracking-wide text-[#635bff]">Relationship profile</div><h2 className="mt-2 text-3xl font-bold">{selected.firstName} {selected.lastName}</h2><p className="mt-1 text-slate-500">{selected.title} · {selected.company} · {selected.email}</p><div className="mt-5 rounded-2xl bg-[#fafaff] p-5"><div className="flex items-center gap-2 text-sm font-bold"><UserRound size={16} className="text-[#635bff]"/> Relationship memory</div><p className="mt-2 text-sm leading-6 text-slate-600">{selected.notes||"No relationship notes recorded yet."}</p></div><div className="mt-5 rounded-2xl border border-[#eef0f4] p-5"><div className="flex items-center gap-2 text-sm font-bold"><Activity size={16}/> Timeline</div>{profileActivities.length===0?<div className="mt-4 text-sm text-slate-500">No interactions recorded yet.</div>:profileActivities.map(item=><div key={item.id} className="mt-4 border-l-2 border-[#e1dfff] pl-4"><div className="text-sm font-bold">{item.title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{item.description}</div><div className="mt-1 text-[11px] text-slate-400">{new Date(item.occurredAt).toLocaleString()}</div></div>)}</div></div>
          <div>{busy?<div className="rounded-2xl bg-[#fafaff] p-5 text-sm text-slate-500">Working…</div>:ai?<div className="rounded-2xl border border-[#ddd9ff] bg-[#fafaff] p-5"><div className="flex items-center gap-2 font-bold"><Sparkles size={16} className="text-[#635bff]"/> AI follow-up <span className="ml-auto text-xs font-medium text-slate-400">{ai.provider}</span></div><h3 className="mt-4 font-bold">{ai.subject}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{ai.body}</p><div className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Why this draft</div><div className="mt-2 space-y-2 text-xs text-slate-500">{ai.rationale.map(item=><div key={item}>• {item}</div>)}</div><div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800"><b>Next action:</b> {ai.nextAction}</div></div>:<button onClick={()=>void generate(selected)} className="cf-button cf-primary w-full justify-center"><Sparkles size={16}/> Generate contextual follow-up</button>}{profileDeals.length>0&&<div className="mt-4 rounded-2xl border border-[#eef0f4] p-4"><div className="text-xs font-bold uppercase tracking-wide text-slate-400">Linked deals</div>{profileDeals.map(d=><div key={d.id} className="mt-3 flex items-center justify-between text-sm"><span className="font-semibold">{d.title}</span><span className="text-slate-500">{money.format(d.value)} · {labels[d.stage]}</span></div>)}</div>}</div>
        </div>
      </div></div></div>}

      {showContactForm&&<div className="fixed inset-0 z-50 overflow-auto bg-black/30 p-4 md:p-8" onClick={()=>setShowContactForm(false)}><div className="mx-auto max-w-2xl" onClick={e=>e.stopPropagation()}><form onSubmit={saveContact} className="cf-card p-6"><div className="flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-wide text-[#635bff]">{editingId?"Edit":"Create"} contact</div><h2 className="mt-1 text-2xl font-bold">{editingId?"Update relationship":"Add a relationship"}</h2></div><button type="button" onClick={()=>setShowContactForm(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{(["firstName","lastName","email","company","title"] as const).map(field=><label key={field} className="block text-sm font-semibold">{field==="firstName"?"First name":field==="lastName"?"Last name":field[0].toUpperCase()+field.slice(1)}<input required className="cf-input mt-2" type={field==="email"?"email":"text"} value={contactForm[field]} onChange={e=>setContactForm(form=>({...form,[field]:e.target.value}))}/></label>)}</div><label className="mt-4 block text-sm font-semibold">Notes<textarea className="cf-input mt-2 min-h-32" value={contactForm.notes} onChange={e=>setContactForm(form=>({...form,notes:e.target.value}))} placeholder="What should ContextFlow remember about this relationship?"/></label><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={()=>setShowContactForm(false)} className="cf-button cf-secondary">Cancel</button><button disabled={busy} className="cf-button cf-primary">{busy?"Saving…":editingId?"Save changes":"Create contact"}</button></div></form></div></div>}
    </div></main>
  </div>;
}
