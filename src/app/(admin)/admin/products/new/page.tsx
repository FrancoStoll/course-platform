import PageHeader from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { CourseTable } from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses/cache/courses.cache";

import { ProductForm } from "@/features/products/components/ProductsForm";
import { asc } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export default async function NewProductPage() {

    const courses = await getCourses()
  return (
    <div className="container my-6">
        <PageHeader title="New Course" />
        <ProductForm courses={courses} />
    </div>
  )
}


async function getCourses() {
    "use cache";
    cacheTag(getCourseGlobalTag());

    return db.query.CourseTable.findMany({
        orderBy: asc(CourseTable.name),
        columns: {id: true, name: true}
    })
}