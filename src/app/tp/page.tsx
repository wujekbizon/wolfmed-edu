import { Suspense } from "react";
import { fileData } from "@/server/fetchData";
import { updateLectureStatuses } from "@/helpers/updateLectureStatuses";
import { LecturesLoadingState } from "./components/LecturesLoadingState";
import { initializeTeachingPlayground } from "@/actions/teachingPlayground";
import { currentUser } from "@clerk/nextjs/server";
import PlaygroundControls from "./components/PlaygroundControls";

async function LectureList() {
  const events = await fileData.getAllEvents();
  const updatedEvents = await updateLectureStatuses(events);

  return <PlaygroundControls events={updatedEvents} />;
}

export default async function TeachingPlaygroundPage() {
  const user = currentUser();
  if (!user) {
    return null;
  }

  try {
    // Initialization of Teaching Playground
    await initializeTeachingPlayground();
  } catch (error) {
    throw new Error("Initialization error");
  }

  return (
      <Suspense fallback={<LecturesLoadingState />}>
        <LectureList />
      </Suspense>
  );
}
