import {createClient} from "@/lib/supabase/server";
import {supabaseConfigured} from "@/lib/supabase/config";
import {store} from "@/lib/store";
import type {Activity,Contact,Deal} from "@/lib/types";

type ContactRow={id:string;first_name:string;last_name:string;email:string;company:string;title:string;notes:string;created_at:string;updated_at:string};
type DealRow={id:string;contact_id:string;title:string;value:number|string;stage:Deal["stage"];health_score:number;updated_at:string};
type ActivityRow={id:string;contact_id:string;deal_id?:string|null;type:Activity["type"];title:string;description:string;occurred_at:string};

const toContact=(r:ContactRow):Contact=>({id:r.id,firstName:r.first_name,lastName:r.last_name,email:r.email,company:r.company,title:r.title,notes:r.notes,createdAt:r.created_at,updatedAt:r.updated_at});
const toDeal=(r:DealRow):Deal=>({id:r.id,contactId:r.contact_id,title:r.title,value:Number(r.value),stage:r.stage,healthScore:Number(r.health_score),updatedAt:r.updated_at});
const toActivity=(r:ActivityRow):Activity=>({id:r.id,contactId:r.contact_id,dealId:r.deal_id??undefined,type:r.type,title:r.title,description:r.description,occurredAt:r.occurred_at});

async function db(){
  if(!supabaseConfigured)throw new Error("Supabase is not configured.");
  return createClient();
}

export async function listContacts(q=""){
  if(!supabaseConfigured){
    const needle=q.trim().toLowerCase();
    return store.contacts.filter(c=>(c.firstName+" "+c.lastName+" "+c.company+" "+c.email).toLowerCase().includes(needle));
  }
  const supabase=await db();
  const {data,error}=await supabase.from("cf_contacts").select("*").order("updated_at",{ascending:false});
  if(error)throw new Error(error.message);
  const contacts=(data as ContactRow[]).map(toContact);
  const needle=q.trim().toLowerCase();
  return contacts.filter(c=>(c.firstName+" "+c.lastName+" "+c.company+" "+c.email).toLowerCase().includes(needle));
}

export async function getContact(id:string){
  if(!supabaseConfigured){
    const contact=store.contacts.find(c=>c.id===id);
    if(!contact)return null;
    return {contact,deals:store.deals.filter(d=>d.contactId===id),activities:store.activities.filter(a=>a.contactId===id)};
  }
  const supabase=await db();
  const [{data:contact,error:contactError},{data:deals,error:dealsError},{data:activities,error:activitiesError}]=await Promise.all([
    supabase.from("cf_contacts").select("*").eq("id",id).maybeSingle(),
    supabase.from("cf_deals").select("*").eq("contact_id",id).order("updated_at",{ascending:false}),
    supabase.from("cf_activities").select("*").eq("contact_id",id).order("occurred_at",{ascending:false})
  ]);
  if(contactError||dealsError||activitiesError)throw new Error(contactError?.message||dealsError?.message||activitiesError?.message||"Unable to load contact.");
  if(!contact)return null;
  return {contact:toContact(contact as ContactRow),deals:(deals as DealRow[]).map(toDeal),activities:(activities as ActivityRow[]).map(toActivity)};
}

export async function createContact(input:Omit<Contact,"id"|"createdAt"|"updatedAt">,ownerId:string){
  if(!supabaseConfigured){
    const now=new Date().toISOString();
    const contact={id:"c-"+crypto.randomUUID(),...input,createdAt:now,updatedAt:now};
    store.contacts.unshift(contact);
    return contact;
  }
  const supabase=await db();
  const {data,error}=await supabase.from("cf_contacts").insert({
    owner_id:ownerId,
    first_name:input.firstName,
    last_name:input.lastName,
    email:input.email,
    company:input.company,
    title:input.title,
    notes:input.notes
  }).select("*").single();
  if(error)throw new Error(error.message);
  return toContact(data as ContactRow);
}

export async function updateContact(id:string,input:Partial<Omit<Contact,"id"|"createdAt"|"updatedAt">>){
  if(!supabaseConfigured){
    const contact=store.contacts.find(c=>c.id===id);
    if(!contact)return null;
    Object.assign(contact,input,{updatedAt:new Date().toISOString()});
    return contact;
  }
  const payload:Record<string,string>= {};
  if(input.firstName!==undefined)payload.first_name=input.firstName;
  if(input.lastName!==undefined)payload.last_name=input.lastName;
  if(input.email!==undefined)payload.email=input.email;
  if(input.company!==undefined)payload.company=input.company;
  if(input.title!==undefined)payload.title=input.title;
  if(input.notes!==undefined)payload.notes=input.notes;
  const supabase=await db();
  const {data,error}=await supabase.from("cf_contacts").update(payload).eq("id",id).select("*").maybeSingle();
  if(error)throw new Error(error.message);
  return data?toContact(data as ContactRow):null;
}

export async function deleteContact(id:string){
  if(!supabaseConfigured){
    const index=store.contacts.findIndex(c=>c.id===id);
    if(index<0)return false;
    store.contacts.splice(index,1);
    store.deals=store.deals.filter(d=>d.contactId!==id);
    store.activities=store.activities.filter(a=>a.contactId!==id);
    return true;
  }
  const supabase=await db();
  const {data,error}=await supabase.from("cf_contacts").delete().eq("id",id).select("id");
  if(error)throw new Error(error.message);
  return Boolean(data?.length);
}

export async function listDeals(){
  if(!supabaseConfigured)return store.deals;
  const supabase=await db();
  const {data,error}=await supabase.from("cf_deals").select("*").order("updated_at",{ascending:false});
  if(error)throw new Error(error.message);
  return (data as DealRow[]).map(toDeal);
}

export async function updateDeal(id:string,input:Partial<Pick<Deal,"stage"|"value">>){
  if(!supabaseConfigured){
    const deal=store.deals.find(d=>d.id===id);
    if(!deal)return null;
    Object.assign(deal,input,{updatedAt:new Date().toISOString()});
    return deal;
  }
  const payload:Record<string,string|number>= {};
  if(input.stage!==undefined)payload.stage=input.stage;
  if(input.value!==undefined)payload.value=input.value;
  const supabase=await db();
  const {data,error}=await supabase.from("cf_deals").update(payload).eq("id",id).select("*").maybeSingle();
  if(error)throw new Error(error.message);
  return data?toDeal(data as DealRow):null;
}

export async function listActivities(contactId?:string){
  if(!supabaseConfigured){
    return (contactId?store.activities.filter(a=>a.contactId===contactId):store.activities).slice().sort((a,b)=>new Date(b.occurredAt).getTime()-new Date(a.occurredAt).getTime());
  }
  const supabase=await db();
  let query=supabase.from("cf_activities").select("*").order("occurred_at",{ascending:false});
  if(contactId)query=query.eq("contact_id",contactId);
  const {data,error}=await query;
  if(error)throw new Error(error.message);
  return (data as ActivityRow[]).map(toActivity);
}

export async function addActivity(input:{contactId:string;dealId?:string;type:Activity["type"];title:string;description:string},ownerId:string){
  if(!supabaseConfigured){
    const item:Activity={id:"a-"+crypto.randomUUID(),...input,occurredAt:new Date().toISOString()};
    store.activities.unshift(item);
    return item;
  }
  const supabase=await db();
  const {data,error}=await supabase.from("cf_activities").insert({
    owner_id:ownerId,
    contact_id:input.contactId,
    deal_id:input.dealId??null,
    type:input.type,
    title:input.title,
    description:input.description,
  }).select("*").single();
  if(error)throw new Error(error.message);
  return toActivity(data as ActivityRow);
}

export async function addAiGeneration(input:{contactId:string;dealId?:string;generationType:string;inputContext:Record<string,unknown>;outputText:string;model?:string},ownerId:string){
  if(!supabaseConfigured)return null;
  const supabase=await db();
  const {error}=await supabase.from("cf_ai_generations").insert({
    owner_id:ownerId,
    contact_id:input.contactId,
    deal_id:input.dealId??null,
    generation_type:input.generationType,
    input_context:input.inputContext,
    output_text:input.outputText,
    model:input.model??null
  });
  if(error)throw new Error(error.message);
  return true;
}

export async function dashboardStats(){
  const [contacts,deals,activities]=await Promise.all([listContacts(),listDeals(),listActivities()]);
  const open=deals.filter(d=>d.stage!=="won"&&d.stage!=="lost");
  const staleDeals=open.filter(d=>Date.now()-new Date(d.updatedAt).getTime()>7*86400000).length;
  return {
    leads:contacts.length,
    qualified:deals.filter(d=>d.stage==="qualified").length,
    won:deals.filter(d=>d.stage==="won").length,
    pipelineValue:open.reduce((sum,d)=>sum+d.value,0),
    staleDeals,
    interactions:activities.length
  };
}
