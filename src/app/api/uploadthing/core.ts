import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { authorizeMaterialUpload } from '@/server/authorizeMaterialUpload'

const f = createUploadthing();

export const ourFileRouter = {
  materialUploader: f({
    "pdf": { maxFileSize: "4MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "1MB", maxFileCount: 1 },
    "video/mp4": { maxFileSize: "8MB", maxFileCount: 1 },
    "application/json": { maxFileSize: "1MB", maxFileCount: 1 },
  })
    .middleware(authorizeMaterialUpload)
    .onUploadError(({ error, fileKey }) => {
      console.error("Upload error:", fileKey, error);
    })
    .onUploadComplete(async () => {
      // The material row and its indexing are created by uploadMaterialAction,
      // which the client calls once the upload resolves. Nothing to do here.
    }),
  essayMaterialUploader: f({
    pdf: { maxFileSize: '4MB', maxFileCount: 1 },
    'text/plain': { maxFileSize: '1MB', maxFileCount: 1 },
  }).middleware(authorizeMaterialUpload).onUploadComplete(async () => {}),
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
