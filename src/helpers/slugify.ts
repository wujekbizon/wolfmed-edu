/**
 * Converts a string to a URL-friendly slug
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces with hyphens
 * - Handles Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż)
 */
export function generateProcedureSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace Polish characters with ASCII equivalents
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    // Replace spaces and non-alphanumeric characters with hyphens
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}

// Examples:
// "Cewnikowanie pęcherza" → "cewnikowanie-pecherza"
// "RKO - Resuscytacja" → "rko-resuscytacja"
// "Zakładanie wkłucia obwodowego" → "zakladanie-wklucia-obwodowego"
