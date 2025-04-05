"use client";

import {
  Dropzone,
  DropzoneZone,
  DropzoneInput,
  DropzoneGroup,
  DropzoneUploadIcon,
  DropzoneTitle,
  DropzoneDescription,
} from "./ui/dropzone";

export default function UploadForm() {
  return (
    <Dropzone
      accept={{
        "application/pdf": [".pdf"],
      }}
      onDropAccepted={() => {}}
    >
      <DropzoneZone>
        <DropzoneInput />
        <DropzoneGroup className="gap-4">
          <DropzoneUploadIcon />
          <DropzoneGroup>
            <DropzoneTitle>Drop your UPI statement here</DropzoneTitle>
            <DropzoneDescription>Supported formats: PDF</DropzoneDescription>
          </DropzoneGroup>
        </DropzoneGroup>
      </DropzoneZone>
    </Dropzone>
  );
}
