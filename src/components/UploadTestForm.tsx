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
      className="flex w-full flex-col gap-2 rounded-lg border border-border/40 bg-zinc-800/50 backdrop-blur-sm px-4 py-8 lg:w-2/3"
    >
      <label
        htmlFor="fileUpload"
        className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border  border-border/40 bg-neutral-900 hover:bg-neutral-800"
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <UploadSVG />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Kliknij, aby przesłać</span> lub przeciągnij i upuść
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">JSON</p>
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
