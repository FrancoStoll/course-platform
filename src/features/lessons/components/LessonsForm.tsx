"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { actionToast } from "@/hooks/use-toast";
import { LessonStatus, lessonStatuses } from "@/drizzle/schema";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

import RequiredLabelIcon from "@/components/RequiredLabelIcon";
import { lessonsSchema } from "../schemas/lessons.schema";
import { Textarea } from "@/components/ui/textarea";
import { createLesson, updateLesson } from "../actions/lessons.actions";
import YoutubeVideo from "./YoutubeVideo";

export function LessonForm({
  sections,
  defaultSectionId,
  onSuccess,
  lesson,
}: {
  sections: {
    id: string;
    name: string;
  }[];
  defaultSectionId: string;
  onSuccess?: () => void;
  lesson?: {
    id: string;
    name: string;
    status: LessonStatus;
    youtubeVideoUrl: string | null;
    description: string | null;
    sectionId: string;
  };
}) {
  const form = useForm<z.infer<typeof lessonsSchema>>({
    resolver: zodResolver(lessonsSchema),
    defaultValues: {
      name: lesson?.name ?? "",
      status: lesson?.status ?? "public",
      description: lesson?.description ?? "",
      youtubeVideoUrl: lesson?.youtubeVideoUrl ?? "",
      sectionId: lesson?.sectionId ?? defaultSectionId ?? sections[0]?.id ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof lessonsSchema>) {
    console.log(values);

    const action =
      lesson == null ? createLesson : updateLesson.bind(null, lesson.id);
    const data = await action(values);
    actionToast({ actionData: data });

    if (!data.error) onSuccess?.();
  }

  const videoId = form.watch("youtubeVideoUrl");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col @container"
      >
        <div className="grid grid-cols-1 @lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  Name
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="youtubeVideoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  Youtube Video Id
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {lessonStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sectionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-20 resize-none"
                    {...field}
                    value={field.value ?? ""}
                    placeholder="description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="self-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
        <div className="aspect-video">{videoId && <YoutubeVideo videoId={videoId} />}</div>
      </form>
    </Form>
  );
}
