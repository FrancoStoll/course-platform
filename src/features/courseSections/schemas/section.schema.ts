


import { courseSectionStatuses } from "@/drizzle/schema";
import { z } from "zod";


export const sectionSchema = z.object({
    name: z.string().min(1),
    status: z.enum(courseSectionStatuses).default("private"),
})