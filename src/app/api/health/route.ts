import {NextResponse} from "next/server";
import {supabaseConfigured} from "@/lib/supabase/config";

export const dynamic="force-dynamic";

export async function GET(){
  return NextResponse.json({
    status:"ok",
    service:"contextflow-crm",
    timestamp:new Date().toISOString(),
    supabaseConfigured,
    aiConfigured:Boolean(process.env.GEMINI_API_KEY)
  },{headers:{"Cache-Control":"no-store"}});
}