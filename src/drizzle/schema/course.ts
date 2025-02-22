import { createdAt, id, updatedAt } from "@/drizzle/schemaHelper";
import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { CourseProductsTable } from "./courseProducts";
import { UserCourseAccessTable } from "./userCourseAccess";
import { CourseSectionTable } from "./courseSection";



export const CourseTable = pgTable("courses", {
    id,
    name: text().notNull(),
    description: text().notNull(),
    createdAt,
    updatedAt
})


export const CourseRelationships = relations(CourseTable, ({ many }) => ({
    courseProducts: many(CourseProductsTable),
    userCourseAcceses: many(UserCourseAccessTable),
    courseSections: many(CourseSectionTable),
}))