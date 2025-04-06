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

// 4 MB
const MAX_FILE_SIZE = 4e6;

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
        className="flex w-full flex-col items-center gap-4">
        {showBackButton && (
          <div className="mb-2 flex w-full items-center justify-start">
            <Button
              variant="outline"
              onClick={onReset}
              size="sm"
              className="gap-1.5"
              disabled={isProcessing}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
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
                toast.error("File too large", {
                  description: `Max size: ${prettyBytes(MAX_FILE_SIZE)}`,
                });
              } else if (errors.includes(ErrorCode.FileInvalidType)) {
                toast.error("Unsupported file format", {
                  description: "We only accept PDF files",
                });
              }

              // Remove all files
              fields.forEach((_, index) => remove(index));
            });
          }}
          disabled={isProcessing}>
          {({ maxSize }) => (
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <DropzoneZone
                    className={`flex justify-center transition-colors ${isProcessing ? "cursor-not-allowed opacity-60" : ""}`}>
                    <FormControl>
                      <DropzoneInput
                        disabled={field.disabled || isProcessing}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        accept="application/pdf"
                      />
                    </FormControl>
                    <div className="flex flex-col items-center gap-3 py-8">
                      <DropzoneUploadIcon />
                      <div className="text-center">
                        <DropzoneTitle className="text-base font-medium">
                          {isProcessing
                            ? "Processing your statement..."
                            : "Drop your UPI statement"}
                        </DropzoneTitle>
                        <DropzoneDescription className="text-muted-foreground mt-1 text-xs">
                          {isProcessing
                            ? "Please wait while we analyze your data"
                            : `PDF • ${prettyBytes(maxSize ?? 0)} max`}
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
        {!!fields.length && !isProcessing && (
          <div className="flex items-center gap-2 text-sm">
            <FileIcon className="h-4 w-4" />
            <span className="max-w-[150px] truncate">
              {fields[0].file.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {prettyBytes(fields[0].file.size)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => remove(0)}
              disabled={isProcessing}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        {isProcessing && (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <div className="bg-primary h-3 w-3 animate-pulse rounded-full"></div>
            <span>
              {fields.length > 0
                ? `Processing ${fields[0].file.name}...`
                : "Processing..."}
            </span>
          </div>
        )}
        <Button
          className="mt-2"
          type="submit"
          disabled={isProcessing || fields.length === 0}
          size={fields.length ? "default" : "lg"}>
          {isProcessing
            ? "Processing..."
            : fields.length
              ? "Analyze"
              : "Upload UPI Statement"}
        </Button>
      </form>
    </Form>
  );
}
