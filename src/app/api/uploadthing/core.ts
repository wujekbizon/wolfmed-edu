import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db/index";
import { materials } from "@/server/db/schema"; 

const f = createUploadthing();

export const ourFileRouter = {
  materialUploader: f({
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "8MB", maxFileCount: 1 },
    text: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const { userId } = await auth();

      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      try {
        await db.insert(materials).values({
          userId: metadata.userId,
          title: file.name,
          key: file.key,
          url: file.ufsUrl,
          type: file.type,
          category: "general",
        });
      } catch (error) {
        console.error("Failed to insert material:", error);
      }

      return { uploadedBy: metadata.userId, fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;