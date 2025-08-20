import { Suspense } from "react";
import { fileData } from "@/server/fetchData";
import { updateLectureStatuses } from "@/helpers/updateLectureStatuses";
import { LecturesLoadingState } from "./components/LecturesLoadingState";
import { FilteredLectureList } from "./components/FilteredLectureList";
import CreateLectureButton from "./components/CreateLectureButton";
import { initializeTeachingPlayground } from "@/actions/teachingPlayground";
import { currentUser } from "@clerk/nextjs/server";

async function LectureList() {
  const events = await fileData.getAllEvents();
  const updatedEvents = await updateLectureStatuses(events);

  return <FilteredLectureList events={updatedEvents} />;
}

export default async function TeachingPlaygroundPage() {
  const user = currentUser();
  if (!user) {
    return null;
  }

  try {
    // Initialization of the Teaching Playground
    await initializeTeachingPlayground();
  } catch (error) {
    throw new Error("Initialization error");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Lectures</h1>
          <p className="text-zinc-400 mt-1">
            Manage your scheduled lectures and sessions.
          </p>
        </div>
        <CreateLectureButton />
      </div>
      <Suspense fallback={<LecturesLoadingState />}>
        <LectureList />
      </Suspense>
    </div>
  );
}
