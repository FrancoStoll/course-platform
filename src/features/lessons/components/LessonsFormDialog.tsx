"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { LessonForm } from "./LessonsForm";
import { LessonStatus } from "../../../drizzle/schema/lesson";

export default function LessonFormDialog({
  children,
  sections,
  defaultSectionId,
  lesson,
}: {
  children: React.ReactNode;
  sections: { id: string; name: string }[];
  defaultSectionId: string;
  lesson?: {
    id: string;
    name: string;
    status: LessonStatus;
    youtubeVideoUrl: string | null;
    description: string | null;
    sectionId: string;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {lesson == null ? "New Lesson" : `Edit ${lesson.name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <LessonForm
            sections={sections}
            defaultSectionId={defaultSectionId}
            lesson={lesson}
            onSuccess={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
