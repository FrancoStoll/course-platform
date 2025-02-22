'use client'
import { CourseSectionStatus } from "@/drizzle/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
;
import { useState } from "react";
import { SectionForm } from "./SectionForm";

export default function SectionFormDialog({
  courseId,
  section,
  children,
}: {
  children: React.ReactNode;
  courseId: string;
  section?: { id: string; name: string; status: CourseSectionStatus };
}) {

    const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {section == null ? "New Section" : "Edit Section"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
            <SectionForm section={section}  courseId={courseId} onSuccess={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
