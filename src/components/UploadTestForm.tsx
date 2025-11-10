"use client";

import { useActionState } from "react";
import { EMPTY_FORM_STATE } from "@/constants/formState";
import { useToastMessage } from "@/hooks/useToastMessage";
import SubmitButton from "./SubmitButton";
import FieldError from "./FieldError";
import Input from "./ui/Input";
import UploadSVG from "./UploadSVG";
import { uploadTestsFromFile } from "@/actions/actions";

export default function UploadTestForm() {
  const [formState, action] = useActionState(
    uploadTestsFromFile,
    EMPTY_FORM_STATE,
  );
  const noScriptFallback = useToastMessage(formState);

  return (
    <form
      action={action}
      className="flex w-full text-zinc-800 flex-col bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 hover:shadow-lg transition-all duration-300 px-4 py-6"
    >
      <label
        htmlFor="fileUpload"
        className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border  border-border/40 bg-neutral-900 hover:bg-neutral-800"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <UploadSVG />
          <p className="mb-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
            <span className="font-semibold">Kliknij, aby przesłać</span> lub przeciągnij i upuść
          </p>
          <p className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-400">JSON</p>
        </div>
        <Input type="file" id="fileUpload" name="file" className="hidden" />
      </label>

      <FieldError formState={formState} name="file" />
      <div className="flex w-full self-center md:w-1/3">
        <SubmitButton label="Prześlij Plik" loading="Przesyłanie..." />
      </div>
      {noScriptFallback}
    </form>
  );
}
