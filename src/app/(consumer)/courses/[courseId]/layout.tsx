import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema";

import { getCourseIdTag } from "@/features/courses/cache/courses.cache";

import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/section.permissions";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lesson.cache.";
import { wherePublicLessons } from "@/features/lessons/permissions/lesson.permissions";
import { getCurrentUser } from "@/services/clerk";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CoursePageClient } from "../_client";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/userLessonComplete.cache";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await getCourse(courseId);

  if (course == null) return notFound();

  return (
    <div className="grid grid-cols-[300px,1fr] gap-8 container">
      <div className="py-4">
        <div className="text-lg font-semibold">{course.name}</div>
        <Suspense fallback={"Sidebar"}>
          <SuspenseBoundary course={course} />
        </Suspense>
      </div>
      <div className="py-4">{children}</div>
    </div>
  );
}

async function SuspenseBoundary({
  course,
}: {
  course: {
    name: string;
    id: string;
    courseSections: {
      name: string;
      id: string;
      order: number;
      lessons: {
        name: string;
        id: string;
      }[];
    }[];
  };
}) {
  const { userId } = await getCurrentUser();

  if (userId == null) return notFound();
  const completedLessonIds =
    userId == null ? [] : await getCompletedLessonIds(userId);

  return <CoursePageClient course={mapCourse(course, completedLessonIds)} />;
}

async function getCompletedLessonIds(userId: string) {
  "use cache";
  cacheTag(getUserLessonCompleteUserTag(userId));
  const data = await db.query.UserLessonCompleteTable.findMany({
    where: eq(UserLessonCompleteTable.userId, userId),
    columns: {
      lessonId: true,
    },
  });

  return data.map(({ lessonId }) => lessonId);
}

async function getCourse(courseId: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(courseId),
    getCourseSectionCourseTag(courseId),
    getLessonCourseTag(courseId)
  );

  return db.query.CourseTable.findFirst({
    where: eq(CourseTable.id, courseId),
    columns: {
      id: true,
      name: true,
    },
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        where: wherePublicCourseSections,
        columns: {
          id: true,
          name: true,
          order: true,
        },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            columns: {
              id: true,
              name: true,
            },
            where: wherePublicLessons,
          },
        },
      },
    },
  });
}

function mapCourse<
  T extends { courseSections: { lessons: { id: string }[] }[] }
>(course: T, completedLessonIds: string[]) {
  return {
    ...course,
    courseSections: course.courseSections.map((section) => {
      return {
        ...section,
        lessons: section.lessons.map((lesson) => {
          return {
            ...lesson,
            isCompleted: completedLessonIds.includes(lesson.id),
          };
        }),
      };
    }),
  };
}
