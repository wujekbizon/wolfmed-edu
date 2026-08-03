import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { getUserStorageUsage } from "@/server/queries";
import { getIsPremium } from "@/server/premium";

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

      // Gated here, not only in the server action: this middleware runs before
      // any bytes are accepted, so a non-premium upload costs neither storage
      // nor the extraction call that follows it.
      const isPremium = await getIsPremium();
      if (!isPremium) {
        throw new UploadThingError("Wgrywanie materiałów jest dostępne w planie premium.");
      }

      const { storageUsed, storageLimit } = await getUserStorageUsage(userId);
      if (storageUsed >= storageLimit) {
        throw new UploadThingError("Przekroczono limit miejsca. Usuń niektóre pliki aby zwolnić miejsce.");
      }

      return { userId };
    })
    .onUploadError(({ error, fileKey }) => {
      console.error("Upload error:", fileKey, error);
    })
    .onUploadComplete(async () => {
      // The material row and its indexing are created by uploadMaterialAction,
      // which the client calls once the upload resolves. Nothing to do here.
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
