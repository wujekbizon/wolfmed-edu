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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
