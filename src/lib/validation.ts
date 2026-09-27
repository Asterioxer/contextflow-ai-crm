import {z} from "zod";

export const contactSchema=z.object({
  firstName:z.string().trim().min(1).max(80),
  lastName:z.string().trim().min(1).max(80),
  email:z.string().trim().email().max(254),
  company:z.string().trim().min(1).max(120),
  title:z.string().trim().min(1).max(120),
  notes:z.string().trim().max(4000).default("")
});

export const contactUpdateSchema=contactSchema.partial();

export const dealCreateSchema=z.object({
  contactId:z.string().min(1).max(100),
  title:z.string().trim().min(1).max(160),
  value:z.coerce.number().finite().min(0).max(1000000000),
  stage:z.enum(["new","contacted","qualified","won","lost"]).default("new")
});

export const dealPatchSchema=z.object({
  stage:z.enum(["new","contacted","qualified","won","lost"]).optional(),
  value:z.coerce.number().finite().min(0).max(1000000000).optional()
});

export const activityCreateSchema=z.object({
  type:z.enum(["note","email","call","meeting"]),
  title:z.string().trim().min(1).max(160),
  description:z.string().trim().max(2000).default(""),
  dealId:z.string().min(1).max(100).optional()
});
