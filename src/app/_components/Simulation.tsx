"use client";

import { useEffect, useRef, useState } from "react";
import { Bacteria, BioSimulation, HumanCell, Virus } from "@/domain/bio";
import { HumanCellSVG } from "@/domain/bio/components/HumanCellSVG";
import { createInitialEntities } from "@/domain/bio/lib/createInitialEntities";
import { BacteriaSVG } from "@/domain/bio/components/BacteriaSVG";
import { VirusSVG } from "@/domain/bio/components/VirusSVG";

export default function Simulation() {
  const sim = useRef<BioSimulation | null>(null);
  const [, setTick] = useState(0);

  const initialEntities = createInitialEntities({
    cells: 6,
    viruses: 4,
    bacteria: 4
  });
  

  useEffect(() => {
    const entities = initialEntities

    sim.current = new BioSimulation(entities);

    let frame: number;
    const loop = () => {
      sim.current?.update();
      setTick(t => t + 1); 
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frame);
  }, [initialEntities]);

  const entities = sim.current?.getEntities() ?? [];

  return (
    <div className="absolute w-full h-full pointer-events-none">
      {entities.map((e) => {
        if (e instanceof HumanCell) {
          return (
            <HumanCellSVG
              key={e.id}
              id={e.id}
              type={e.type}
              position={e.position}
              size={e.size}
              velocity={e.velocity}
              radius={e.radius}
              color={e.color}
            />
          );
        }
  
        if (e instanceof Bacteria) {
          return (
            <BacteriaSVG
              key={e.id}
              id={e.id}
              type={e.type}
              position={e.position}
              size={e.size}
              velocity={e.velocity}
              radius={e.radius}
              color={e.color}
            />
          );
        }
  
        if (e instanceof Virus) {
          return (
            <VirusSVG
              key={e.id}
              id={e.id}
              type={e.type}
              position={e.position}
              size={e.size}
              velocity={e.velocity}
              radius={e.radius}
              color={e.color}
            />
          );
        }
      })}
    </div>
  );
}