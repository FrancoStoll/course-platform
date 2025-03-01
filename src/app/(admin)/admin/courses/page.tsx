import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { getCourseGlobalTag } from "@/features/courses/cache/courses.cache";
import { CourseTable as CourseTableGrid } from "@/features/courses/components/CourseTable";
import { getUserCourseAccessGlobalTag } from "@/features/courses/cache/userCourseAccess";
import { getCourseSectionGlobalTag } from "@/features/courseSections/db/cache";
import { getLessonGlobalTag } from "@/features/lessons/db/cache/lesson.cache.";
import { asc, countDistinct, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="container my-6">
      <PageHeader title="Courses">
        <Button asChild>
          <Link href={"/admin/courses/new"}>New Course</Link>
        </Button>
      </PageHeader>

      <CourseTableGrid courses={courses} />
    </div>
  );
}

async function getCourses() {
  "use cache";
  cacheTag(
    getCourseGlobalTag(),
    getUserCourseAccessGlobalTag(),
    getCourseSectionGlobalTag(),
    getLessonGlobalTag()
  );

  return db
    .select({
      id: CourseTable.id,
      name: CourseTable.name,
      sectionsCount: countDistinct(CourseSectionTable),
      lessonsCount: countDistinct(LessonTable),
      studentsCount: countDistinct(UserCourseAccessTable),
    })
    .from(CourseTable)
    .leftJoin(
      CourseSectionTable,
      eq(CourseSectionTable.courseId, CourseTable.id)
    )
    .leftJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))
    .leftJoin(
      UserCourseAccessTable,
      eq(UserCourseAccessTable.courseId, CourseTable.id)
    )
    .orderBy(asc(CourseTable.name))
    .groupBy(CourseTable.id);
}
