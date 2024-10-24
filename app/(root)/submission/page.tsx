"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
// import Select from "react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/MultiSelect";

const novelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assoc_names: z.array(z.string()).optional(),
  original_language: z.string().optional(),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  tags: z.array(z.string()).optional(),
  cover_image_url: z.string().optional(),
  start_year: z.number().int().positive().optional(),
  licensed: z.boolean().optional(),
  original_publisher: z.string().optional(),
  english_publisher: z.string().optional(),
  complete_original: z.boolean().optional(),
  chapters_original_current: z.string().optional(),
  complete_translated: z.boolean().optional(),
  chapter_latest_translated: z.string().optional(),
  release_freq: z.number().positive().optional(),
  description: z.string().optional(),
});

type NovelFormValues = z.infer<typeof novelSchema>;

const genreOptions = [
  { value: "action", label: "Action" },
  { value: "adventure", label: "Adventure" },
  { value: "comedy", label: "Comedy" },
  { value: "drama", label: "Drama" },
  { value: "fantasy", label: "Fantasy" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "sci-fi", label: "Science Fiction" },
  { value: "thriller", label: "Thriller" },
  // Add more genres as needed
];

export default function SubmissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NovelFormValues>({
    resolver: zodResolver(novelSchema),
    defaultValues: {
      name: "",
      assoc_names: [],
      authors: [],
      genres: [],
      tags: [],
    },
  });

  const onSubmit: SubmitHandler<NovelFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit novel");
      }

      toast.success("Novel submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting novel:", error);
      toast.error("Failed to submit novel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto my-0 px-9 flex justify-center">
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6 mt-8">Submit a Novel</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Novel Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter novel name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authors</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter authors (comma-separated)"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((s) => s.trim()),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genres</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={genreOptions}
                        selected={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter novel description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complete_original"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Complete in Original Language</FormLabel>
                      <FormDescription>
                        Is the novel complete in its original language?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Novel"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <style jsx global>{`
        .react-select__control {
          background-color: hsl(var(--input));
          border-color: hsl(var(--input));
        }
        .react-select__menu {
          background-color: hsl(var(--background));
        }
        .react-select__option {
          background-color: hsl(var(--background));
        }
        .react-select__option--is-focused {
          background-color: hsl(var(--accent));
        }
        .react-select__option--is-selected {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        .react-select__multi-value {
          background-color: hsl(var(--accent));
        }
        .react-select__multi-value__label {
          color: hsl(var(--accent-foreground));
        }
        .react-select__multi-value__remove:hover {
          background-color: hsl(var(--destructive));
          color: hsl(var(--destructive-foreground));
        }
      `}</style>
    </div>
  );
}
