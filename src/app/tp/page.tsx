import { Suspense } from "react";
import { updateLectureStatuses } from "@/helpers/updateLectureStatuses";
import { LecturesLoadingState } from "./components/LecturesLoadingState";
import { initializeTeachingPlayground, getLectures } from "@/actions/teachingPlayground";
import { currentUser } from "@clerk/nextjs/server";
import PlaygroundControls from "./components/PlaygroundControls";

async function LectureList() {
  const events = await getLectures();
  const updatedEvents = await updateLectureStatuses(events);

  return <PlaygroundControls events={updatedEvents} />;
}

export default async function TeachingPlaygroundPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userRole = user.publicMetadata?.role as 'teacher' | 'student' | 'admin' || 'student';

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
