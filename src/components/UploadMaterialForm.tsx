"use client";

import { useEffect, useState } from "react";
import { uploadMaterialAction } from "@/actions/actions";
import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { EMPTY_FORM_STATE } from "@/constants/formState";
import { useToastMessage } from "@/hooks/useToastMessage";
import { UploadButton } from "@/utils/uploadthing";

export default function UploadMaterialForm({onSuccess}: {onSuccess: ()=>void}) {
    const [state, action] = useActionState(uploadMaterialAction, EMPTY_FORM_STATE);
    const [fileKey, setFileKey] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const toast = useToastMessage(state);

    useEffect(() => {
        if (state.status !== "SUCCESS") return
            onSuccess()
    },[state.status, onSuccess])
  
    return (
      <form action={action} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">Tytuł</label>
          <input
            name="title"
            type="text"
            required
            maxLength={256}
            className="input"
            placeholder="Nazwa pliku / tytuł"
          />
        </div>
  
        <div>
          <label className="text-sm font-medium">Kategoria</label>
          <input
            name="category"
            type="text"
            maxLength={128}
            defaultValue="general"
            className="input"
            placeholder="Kategoria (np. pielęgniarstwo)"
          />
        </div>
  
        <div>
          <label className="text-sm font-medium">Wybierz plik</label>
          <UploadButton
            endpoint="materialUploader"
            onClientUploadComplete={(res) => {
              const uploaded = res?.[0];
              if (!uploaded) {
                alert("Upload failed, no file returned");
                return;
              }
              const key = uploaded.key;
              const url = uploaded.ufsUrl;
              const type = uploaded.type;
  
              if (!key || !url || !type) {
                console.warn("Unexpected upload response:", uploaded);
              }
  
              setFileKey(key ?? null);
              setFileUrl(url ?? null);
              setFileType(type ?? null);
            }}
            onUploadError={(err) => {
              console.error("Upload error:", err);
              alert("Błąd podczas wysyłania pliku: " + (err?.message ?? err));
            }}
          />
        </div>
        {fileKey && <input type="hidden" name="key" value={fileKey} />}
        {fileUrl && <input type="hidden" name="fileUrl" value={fileUrl} />}
        {fileType && <input type="hidden" name="type" value={fileType} />}
  
        <div className="flex items-center gap-3">
          <SubmitButton label="Zapisz materiał" loading="Zapisywanie..." />
          {toast}
        </div>
      </form>
    );
  }
