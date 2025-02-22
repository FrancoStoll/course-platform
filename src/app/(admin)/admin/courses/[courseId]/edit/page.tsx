import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/drizzle/db";
import { CourseSectionTable, CourseTable, LessonTable } from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/cache/courses.cache";
import CourseForm from "@/features/courses/components/CourseForm";
import SectionFormDialog from "@/features/courseSections/components/SectionFormDialog";
import SortableSectionList from "@/features/courseSections/components/SortableSectionList";

import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import LessonFormDialog from "@/features/lessons/components/LessonsFormDialog";
import SortableLessonList from "@/features/lessons/components/SortableLessonsList";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lesson.cache.";
import { cn } from "@/lib/utils";

import { asc, eq } from "drizzle-orm";
import { EyeClosedIcon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (!course) return notFound();

  return (
    <div className="container my-6">
      <PageHeader title={course.name} />

      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="lessons" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between flex-row">
              <CardTitle>Sections</CardTitle>
              <SectionFormDialog courseId={course.id}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <PlusIcon /> New
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>

            <CardContent>
              <SortableSectionList
                courseId={course.id}
                sections={course.courseSections}
              />
            </CardContent>
          </Card>
          <hr className="my-2" />
          {course.courseSections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="flex items-center justify-between flex-row gap-4">
                <CardTitle
                  className={cn(
                    "flex items-center gap-2",
                    section.status === "private" && "text-muted-foreground"
                  )}
                >
                  {section.status === "private" && <EyeClosedIcon />}{" "}
                  {section.name}
                </CardTitle>
                <LessonFormDialog
                  defaultSectionId={section.id}
                  sections={course.courseSections}
              
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <PlusIcon /> New lesson
                    </Button>
                  </DialogTrigger>
                </LessonFormDialog>
              </CardHeader>

              <CardContent>
                <SortableLessonList
                  sections={course.courseSections}
                  lessons={section.lessons}
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CourseForm course={course} />
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function getCourse(courseId: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(courseId),
    getCourseSectionCourseTag(courseId),
    getLessonCourseTag(courseId)
  );

  return db.query.CourseTable.findFirst({
    columns: { id: true, name: true, description: true },
    where: eq(CourseTable.id, courseId),
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        columns: { id: true, status: true, name: true },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            columns: {
              id: true,
              name: true,
              status: true,
              description: true,
              youtubeVideoUrl: true,
              sectionId: true,
            },
          },
        },
      },
    },
  });
}
