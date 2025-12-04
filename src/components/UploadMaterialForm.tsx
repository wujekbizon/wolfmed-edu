"use client";

import { useEffect, useState, useRef } from "react";
import { uploadMaterialAction } from "@/actions/materials";
import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { EMPTY_FORM_STATE } from "@/constants/formState";
import { useToastMessage, showToast } from "@/hooks/useToastMessage";
import { UploadButton } from "@/utils/uploadthing";
import { parseUploadError } from "@/helpers/uploadErrors";
import Input from "./ui/Input";
import Label from "./ui/Label";
import FieldError from "./FieldError";

export default function UploadMaterialForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [state, action] = useActionState(
    uploadMaterialAction,
    EMPTY_FORM_STATE
  );
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const fileTypeRef = useRef<string | null>(null);
  const noScriptFallback = useToastMessage(state);

  useEffect(() => {
    if (state.status !== "SUCCESS") return;
    onSuccess();
  }, [state.status, onSuccess]);

  return (
    <form action={action} className="flex flex-col p-4">
      <div className="relative w-full">
        <Input
          id="category"
          name="category"
          className="peer w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-transparent"
        />
        <Label
          htmlFor="category"
          label="Kategoria"
          className="absolute left-3 top-2.5 text-sm text-zinc-400 pointer-events-none transition-all duration-300 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-zinc-400 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#f6aaaa]"
        />
        <FieldError formState={state} name="category" />
      </div>

      <UploadButton
        endpoint="materialUploader"
        onBeforeUploadBegin={(files) => {
          if (files[0]) {
            fileTypeRef.current = files[0].type;
            setFileType(files[0].type);
          }
          return files;
        }}
        onUploadError={(err) => {
          console.error("Upload error:", err);
          const errorMessage = parseUploadError(err, fileTypeRef.current);
          showToast("ERROR", errorMessage);
        }}
        onClientUploadComplete={(res) => {
          const uploaded = res?.[0];
          if (!uploaded) {
            showToast(
              "ERROR",
              "Nie udało się przesłać pliku — brak odpowiedzi z serwera."
            );
            return;
          }

          const key = uploaded.key;
          const url = uploaded.ufsUrl;
          const type = uploaded.type;
          const name = uploaded.name
          const size = uploaded.size

          if (!key || !url || !type) {
            console.warn("Unexpected upload response:", uploaded);
            showToast("ERROR", "Niepoprawna odpowiedź z serwera uploadu.");
          }

          setFileKey(key ?? null);
          setFileUrl(url ?? null);
          setFileType(type ?? null);
          setFileName(name ?? null)
          setFileSize(size ?? null)
        }}
        appearance={{
          button:
            "ut-ready:bg-slate-500 hover:ut-ready:bg-slate-500/80 ut-readying:bg-slate-600 ut-uploading:cursor-not-allowed rounded-r-none bg-red-500 bg-none after:bg-orange-400",
          container: "w-max flex-row rounded-md border-cyan-300 bg-slate-200",
          allowedContent:
            "flex h-8 flex-col items-center justify-center px-2 font-semibold text-zinc-900",
        }}
        uploadProgressGranularity="fine"
      />
      <FieldError formState={state} name="type" />
      {fileName && <input type="hidden" name="title" value={fileName} />}
      {fileKey && <input type="hidden" name="key" value={fileKey} />}
      {fileUrl && <input type="hidden" name="fileUrl" value={fileUrl} />}
      {fileType && <input type="hidden" name="type" value={fileType} />}
      {fileSize && <input type="hidden" name="size" value={fileSize} />}

      <div className="flex items-center gap-3">
        <SubmitButton label="Zapisz materiał" loading="Zapisywanie..." />
        {noScriptFallback}
      </div>
    </form>
  );
}
