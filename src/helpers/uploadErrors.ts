import { UPLOAD_SIZE_LIMITS, FILE_TYPE_NAMES, SupportedFileType } from "@/constants/uploadthing";

export function parseUploadError(
  err: unknown,
  fileType: string | null
): string {
  if (!err || typeof err !== "object" || !("message" in err)) {
    return "Błąd podczas wysyłania pliku: Nieznany błąd";
  }

  const errorMessage = String(err.message || "");
  if (errorMessage.includes("FileSizeMismatch")) {
    if (fileType && fileType in UPLOAD_SIZE_LIMITS) {
      const limit = UPLOAD_SIZE_LIMITS[fileType as SupportedFileType];
      return `Plik za duży, maksymalny rozmiar to ${limit} MB`;
    }
    return "Plik za duży, sprawdź limity rozmiaru";
  }

  if (errorMessage.includes("InvalidFileType")) {
    const allowedTypes = Object.values(FILE_TYPE_NAMES).join(", ");
    return `Nieprawidłowy typ pliku. Dozwolone formaty: ${allowedTypes}`;
  }

  if (errorMessage.includes("Unauthorized") || errorMessage.includes("Forbidden")) {
    return "Brak autoryzacji do przesyłania plików";
  }

  return `Błąd podczas wysyłania pliku: ${errorMessage}`;
}
