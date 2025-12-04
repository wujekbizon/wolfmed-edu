import { CurriculumBlock } from "@/types/careerPathsTypes";

export function groupByYear(
  blocks: CurriculumBlock[]
): Record<number, CurriculumBlock[]> {
  return blocks.reduce<Record<number, CurriculumBlock[]>>((acc, block) => {
    const yearKey = block.year;
    if (!acc[yearKey]) acc[yearKey] = [];
    acc[yearKey]!.push(block);
    return acc;
  }, {});
}
