import { UserRole } from "@/drizzle/schema";




export function canCreateCourse({ role }: { role: UserRole | undefined }) {


    return role === "admin"
}


export function canDeleteCourse({ role }: { role: UserRole | undefined }) {


    return role === "admin"
}


export function canUpdateCourses({ role }: { role: UserRole | undefined }) {


    return role === "admin"
}