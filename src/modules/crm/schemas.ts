import { z } from "zod";
export const companySchema = z.object({
  name: z.string().trim().min(1).max(160),
  source: z.string().trim().max(200),
});
export const opportunitySchema = z.object({
  title: z.string().trim().min(1).max(160),
  company_id: z.uuid(),
  stage_id: z.uuid(),
});
export const callSchema = z.object({
  opportunity: z.uuid(),
  note: z.string().trim().max(5000),
  followup_title: z.string().trim().min(1).max(200),
  followup_at: z.iso.datetime({ offset: true }),
  request: z.uuid(),
});
export const activitySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  due_at: z.iso.datetime({ offset: true }),
});
