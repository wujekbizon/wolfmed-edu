const idCounters: Record<string, number> = {};

export function generateUniqueID(prefix = "id"):string {
    if(!idCounters[prefix]){
        idCounters[prefix] = 0;
    }

    idCounters[prefix]++;
    return `${prefix}-${idCounters[prefix]}}`
}