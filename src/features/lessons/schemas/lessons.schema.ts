



import { lessonStatuses } from "@/drizzle/schema";
import { z } from "zod";


export const lessonsSchema = z.object({
    name: z.string().min(1),
    status: z.enum(lessonStatuses).default("private"),
    sectionId: z.string(),
    youtubeVideoUrl: z.string().min(5),
    description: z.string().transform(v => (v === "" ? null : v)).nullable(),
})