export const DEAL_STAGES=["new","contacted","qualified","won","lost"] as const;
export type DealStage=(typeof DEAL_STAGES)[number];
export type ActivityType="note"|"email"|"call"|"meeting"|"status_change"|"ai_generation";
export interface Contact{id:string;firstName:string;lastName:string;email:string;company:string;title:string;notes:string;createdAt:string;updatedAt:string}
export interface Deal{id:string;contactId:string;title:string;value:number;stage:DealStage;healthScore:number;updatedAt:string}
export interface Activity{id:string;contactId:string;dealId?:string;type:ActivityType;title:string;description:string;occurredAt:string}
export interface AiFollowUpResult{subject:string;body:string;rationale:string[];nextAction:string;provider:"gemini"|"demo"}
