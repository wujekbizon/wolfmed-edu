import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  materialUploader: f({
    "pdf": { maxFileSize: "4MB", maxFileCount: 1 },
    "video/mp4": { maxFileSize: "8MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "1MB", maxFileCount: 1 },
    "application/json": { maxFileSize: "1MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth();

      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadError(({ error, fileKey }) => {
      console.log(fileKey);
      console.error("Upload error:", error);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("#CORE: Upload complete for userId:", metadata.userId);
      console.log("#CORE: File available at:", file.ufsUrl);
    }),

  // v1.4.4 Sprint 2: Recording uploader for lecture recordings
  recordingUploader: f({
    "video/webm": { maxFileSize: "512MB", maxFileCount: 1 },
    "video/mp4": { maxFileSize: "512MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth();

      if (!userId) throw new UploadThingError("Unauthorized");

      // Only teachers/admins can upload recordings
      // Note: Role check would ideally be done here, but we'll validate in the action
      return { userId };
    })
    .onUploadError(({ error, fileKey }) => {
      console.log("Recording upload error - fileKey:", fileKey);
      console.error("Recording upload error:", error);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("#CORE: Recording upload complete for userId:", metadata.userId);
      console.log("#CORE: Recording available at:", file.ufsUrl);
      console.log("#CORE: Recording size:", file.size, "bytes");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
