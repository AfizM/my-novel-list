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

import { MultiSelect } from "@/components/ui/MultiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOVEL_GENRES } from "@/lib/constants";
import { useUser } from "@clerk/nextjs";

const novelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assoc_names: z.array(z.string()).optional(),
  original_language: z
    .string()
    .min(3, "Original language must be at least 3 characters"),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
  tags: z.array(z.string()).optional(),
  cover_image_url: z
    .string()
    .url("Please enter a valid image URL")
    .refine((url) => {
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".avif",
      ];
      return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
    }, "URL must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp, .avif)")
    .optional(),
  start_year: z.number().int().positive().optional(),
  licensed: z.boolean().optional(),
  original_publisher: z
    .string()
    .min(3, "Original publisher must be at least 3 characters"),
  english_publisher: z.string().optional(),
  complete_original: z.boolean().optional(),
  chapters_original_current: z.string().optional(),
  complete_translated: z.boolean().optional(),
  chapter_latest_translated: z.string().optional(),
  release_freq: z.number().positive().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type NovelFormValues = z.infer<typeof novelSchema>;

const genreOptions = NOVEL_GENRES.map((genre) => ({
  value: genre.toLowerCase(),
  label: genre,
}));

const languageOptions = [
  { value: "Chinese", label: "Chinese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
];

const isValidImageUrl = (url: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
  return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
};

export default function SubmissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const { user } = useUser();

  const form = useForm<NovelFormValues>({
    resolver: zodResolver(novelSchema),
    defaultValues: {
      name: "",
      assoc_names: [],
      original_language: "",
      authors: [],
      genres: [],
      tags: [],
      cover_image_url: "",
      start_year: undefined,
      licensed: false,
      original_publisher: "",
      english_publisher: "",
      complete_original: false,
      chapters_original_current: "",
      complete_translated: false,
      chapter_latest_translated: "",
      release_freq: undefined,
      description: "",
    },
  });

  const onSubmit: SubmitHandler<NovelFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit novel");
      }

      toast.success(
        "Novel submitted successfully! It will be reviewed by an admin.",
      );
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
          <h2 className="text-2xl font-bold mb-6 mt-8">
            Novel Submission Form
          </h2>
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
                        type="text"
                        value={field.value?.join(", ") || ""}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const authors = inputValue ? [inputValue] : [];
                          field.onChange(authors);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter authors separated by commas (e.g., &ldquo;fuyuhara
                      patora, other author&rdquo;)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="original_publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Publisher</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter original publisher (min 3 characters)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="original_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)] text-muted-foreground font-normal">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                        placeholder="Enter novel description (min 10 characters)"
                        className="resize-none shadow-[0_2px_4px_0_var(--shadow-color)]"
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
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setImageLoadFailed(false);
                          }}
                        />
                        {field.value &&
                          isValidImageUrl(field.value) &&
                          !imageLoadFailed && (
                            <div className="relative w-40 h-60 mt-2">
                              <img
                                src={field.value}
                                alt="Cover preview"
                                className="rounded-md object-cover w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  setImageLoadFailed(true);
                                  if (field.value) {
                                    toast.error(
                                      "Failed to load image. Please check the URL.",
                                      {
                                        id: "image-error",
                                        duration: 2000,
                                        dismissible: true,
                                      },
                                    );
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  field.onChange("");
                                  setImageLoadFailed(false);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter a direct URL to an image file (.jpg, .jpeg, .png,
                      .gif, .webp, .avif)
                    </FormDescription>
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

              <Button
                type="submit"
                disabled={isSubmitting || !user}
                className="relative"
              >
                {isSubmitting
                  ? "Submitting..."
                  : !user
                  ? "Please log in to submit"
                  : "Submit Novel"}
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
