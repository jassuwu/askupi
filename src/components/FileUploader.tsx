"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X, FileIcon, ArrowLeft } from "lucide-react";
import { ErrorCode } from "react-dropzone";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import prettyBytes from "pretty-bytes";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dropzone,
  DropzoneDescription,
  DropzoneInput,
  DropzoneTitle,
  DropzoneUploadIcon,
  DropzoneZone,
} from "~/components/ui/dropzone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";

// 1 MB
const MAX_FILE_SIZE = 1e6;

const FormSchema = z.object({
  files: z
    .array(
      z.object({
        file: z
          .instanceof(File)
          .refine(
            (file) => file.size <= MAX_FILE_SIZE,
            "File exceeds max file size",
          )
          .refine(
            (file) => file.type === "application/pdf",
            "Only PDF files are allowed",
          ),
      }),
    )
    .min(1, { message: "Minimum one file is required." })
    .max(1, { message: "Maximum one file is allowed." }),
});

export type FileSubmission = z.infer<typeof FormSchema>;

interface FileUploaderProps {
  onSubmit: (data: FileSubmission) => Promise<void>;
  isProcessing?: boolean;
  onReset?: () => void;
  showBackButton?: boolean;
}

export function FileUploader({
  onSubmit,
  isProcessing = false,
  onReset,
  showBackButton = false,
}: FileUploaderProps) {
  const form = useForm<FileSubmission>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      files: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "files",
  });

  const handleSubmit = async (data: FileSubmission) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex w-full flex-col items-center gap-6"
      >
        {showBackButton && (
          <div className="mb-2 flex w-full items-center justify-start">
            <Button variant="outline" onClick={onReset} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Try Another File
            </Button>
          </div>
        )}

        <Dropzone
          maxSize={MAX_FILE_SIZE}
          onDropAccepted={(acceptedFiles) =>
            append(acceptedFiles.map((file) => ({ file })))
          }
          onDropRejected={(fileRejections) => {
            fileRejections.forEach((fileRejection) => {
              const errors = fileRejection.errors.map((err) => err.code);

              if (errors.includes(ErrorCode.FileTooLarge)) {
                toast.error("Whoa there, that file's too big!", {
                  description: `Keep it under ${prettyBytes(MAX_FILE_SIZE)}, please.`,
                });
              } else if (errors.includes(ErrorCode.FileInvalidType)) {
                toast.error("PDF files only!", {
                  description: "We can't read anything else right now.",
                });
              }

              // Remove all files
              fields.forEach((_, index) => remove(index));
            });
          }}
        >
          {({ maxSize }) => (
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <DropzoneZone className="flex justify-center">
                    <FormControl>
                      <DropzoneInput
                        disabled={field.disabled || isProcessing}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        accept="application/pdf"
                      />
                    </FormControl>
                    <div className="flex flex-col items-center gap-4">
                      <DropzoneUploadIcon />
                      <div className="grid gap-2">
                        <DropzoneTitle className="text-center font-bold">
                          Drop your UPI statement here
                        </DropzoneTitle>
                        <DropzoneDescription className="text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="flex items-center gap-1">
                              Max size:{" "}
                              <span className="font-bold">
                                {prettyBytes(maxSize ?? 0)}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              Format:{" "}
                              <span className="font-bold">PDF only</span>
                            </span>
                          </div>
                        </DropzoneDescription>
                      </div>
                    </div>
                  </DropzoneZone>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
          )}
        </Dropzone>
        {!!fields.length && (
          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <FileIcon />
                  {field.file.name}
                </div>
                <div className="flex items-center gap-2">
                  {prettyBytes(field.file.size)}
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isProcessing}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button
          className="cursor-pointer"
          type="submit"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Let's Go!"}
        </Button>
      </form>
    </Form>
  );
}
