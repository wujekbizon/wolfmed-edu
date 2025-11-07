import { HumanCell, BaseBioEntity , Bacteria, Virus, COLORS} from "@/domain/bio";
import { randomPos, randomVel } from "./randomPlacement";
import { generateUniqueID } from "./generateUniqueID";

type SimulationConfig = {
    cells: number;
    viruses: number;
    bacteria: number;
  };
  
export function createInitialEntities(config: SimulationConfig): BaseBioEntity[] {
    const entities: BaseBioEntity[] = [];
  
    for (let i = 0; i < config.cells; i++) {
      entities.push(
        new HumanCell(
          generateUniqueID('cell'),
          "cell",
          randomPos(),
          { width: 50, height: 50 },
          randomVel(),
          25,
          COLORS.cell
        )
      );
    }
  
    for (let i = 0; i < config.viruses; i++) {
      entities.push(
        new Virus(
          generateUniqueID("virus"),
          "virus",
          randomPos(),
          {width:35, height: 35},
          randomVel(),
          15,
          COLORS.virus
        )
      );
    }
  
    for (let i = 0; i < config.bacteria; i++) {
      entities.push(
        new Bacteria(
          generateUniqueID("bacteria"),
          "bacteria",
          randomPos(),
          { width: 35, height: 35 },
          randomVel(),
          20,
          COLORS.bacteria
        )
      );
    }
  
    return entities;
  }