"use client";

import * as React from "react";
import { Primitive } from "@radix-ui/react-primitive";
import { Ban, CheckCircle2, Upload } from "lucide-react";

import { cn } from "~/lib/utils";
import * as DropzonePrimitive from "./dropzone-primitive";

export const Dropzone = DropzonePrimitive.Dropzone;

export const DropzoneInput = DropzonePrimitive.Input;

export const DropzoneZone = React.forwardRef<
  React.ElementRef<typeof DropzonePrimitive.Zone>,
  React.ComponentPropsWithoutRef<typeof DropzonePrimitive.Zone>
>(({ className, ...props }, ref) => (
  <DropzonePrimitive.Zone
    ref={ref}
    className={cn(
      "border-input hover:border-accent-foreground/50 hover:bg-accent focus-visible:ring-ring data-[drag-active]:border-accent-foreground/50 data-[drag-reject]:border-destructive data-[drag-active]:bg-accent data-[drag-reject]:bg-destructive/30 cursor-pointer rounded-md border-2 border-dashed p-6 shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none data-[disabled]:cursor-not-allowed data-[disabled]:border-inherit data-[disabled]:bg-inherit data-[disabled]:opacity-50 data-[drag-reject]:cursor-no-drop data-[no-click]:cursor-default",
      className,
    )}
    {...props}
  />
));
DropzoneZone.displayName = "DropzoneZone";

export const DropzoneUploadIcon = React.forwardRef<
  React.ElementRef<typeof Upload>,
  React.ComponentPropsWithoutRef<typeof Upload>
>(({ className, ...props }, ref) => (
  <>
    <DropzonePrimitive.DragAccepted>
      <CheckCircle2 ref={ref} className={cn("size-8", className)} {...props} />
    </DropzonePrimitive.DragAccepted>
    <DropzonePrimitive.DragRejected>
      <Ban ref={ref} className={cn("size-8", className)} {...props} />
    </DropzonePrimitive.DragRejected>
    <DropzonePrimitive.DragDefault>
      <Upload ref={ref} className={cn("size-8", className)} {...props} />
    </DropzonePrimitive.DragDefault>
  </>
));
DropzoneUploadIcon.displayName = "DropzoneUploadIcon";

export const DropzoneGroup = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>(({ className, ...props }, ref) => (
  <Primitive.div
    ref={ref}
    className={cn("grid place-items-center gap-1.5", className)}
    {...props}
  />
));
DropzoneGroup.displayName = "DropzoneGroup";

export const DropzoneTitle = React.forwardRef<
  React.ElementRef<typeof Primitive.h3>,
  React.ComponentPropsWithoutRef<typeof Primitive.h3>
>(({ className, ...props }, ref) => (
  <Primitive.h3
    ref={ref}
    className={cn("leading-none font-medium tracking-tight", className)}
    {...props}
  />
));
DropzoneTitle.displayName = "DropzoneTitle";

export const DropzoneDescription = React.forwardRef<
  React.ElementRef<typeof Primitive.p>,
  React.ComponentPropsWithoutRef<typeof Primitive.p>
>(({ className, ...props }, ref) => (
  <Primitive.p
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
DropzoneDescription.displayName = "DropzoneDescription";

export const DropzoneTrigger = DropzonePrimitive.Trigger;

export const DropzoneAccepted = DropzonePrimitive.Accepted;

export const DropzoneRejected = DropzonePrimitive.Rejected;
