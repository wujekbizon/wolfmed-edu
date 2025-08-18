"use client";

import { useEffect, useState, startTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { usePlaygroundStore } from "@/store/usePlaygroundStore";
import TeachingPlaygroundHero from "./TeachingPlaygroundHero";
import { initializeTeachingPlayground } from "@/actions/teachingPlayground";
import type { Lecture } from "@/lib/teaching-playground/interfaces";

interface TeachingPlaygroundContentProps {
  children: React.ReactNode;
  events: Lecture[];
}

export default function TeachingPlaygroundContent({
  children,
  events,
}: TeachingPlaygroundContentProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { setUser, reset, isPlaygroundInitialized } = usePlaygroundStore();
  const [isPending, startServerTransition] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !isPlaygroundInitialized) {
      startServerTransition(true);
      startTransition(async () => {
        try {
          const serverUser = await initializeTeachingPlayground();
          setUser(serverUser);
        } catch (error) {
          console.error("Failed to initialize playground:", error);
          setUser(null);
        } finally {
          startServerTransition(false); 
        }
      });
    } else if (!isSignedIn) {
      setUser(null);
      reset();
    }
  }, [isLoaded, isSignedIn, user, isPlaygroundInitialized, setUser, reset]);

  if (!isLoaded || (!isSignedIn && !user)) {
    return <TeachingPlaygroundHero />;
  }

  if (!isPlaygroundInitialized && isPending) {
    return (
      <div className="flex items-center justify-center h-screen text-zinc-400">
        Loading Teaching Playground...
      </div>
    );
  }

  return children;
}


