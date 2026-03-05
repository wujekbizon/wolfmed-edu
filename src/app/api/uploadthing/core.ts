import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { getUserStorageUsage } from "@/server/queries";

const f = createUploadthing();

export const ourFileRouter = {
  materialUploader: f({
    "pdf": { maxFileSize: "4MB", maxFileCount: 1 },
    "video/mp4": { maxFileSize: "8MB", maxFileCount: 1 },
    "application/json": { maxFileSize: "1MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth();

      if (!userId) throw new UploadThingError("Unauthorized");

      const { storageUsed, storageLimit } = await getUserStorageUsage(userId);
      if (storageUsed >= storageLimit) {
        throw new UploadThingError("Przekroczono limit miejsca. Usuń niektóre pliki aby zwolnić miejsce.");
      }

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
  lectureAudio: f({ "audio/mpeg": { maxFileSize: "32MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
