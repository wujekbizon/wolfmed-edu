import { useEffect, useRef, useState, useCallback } from "react";
import { BioSimulation, BaseBioEntity } from "@/domain/bio";

type Options = {
  initialEntities: BaseBioEntity[];
  frameIntervalMs?: number;
};

export function useBioSimulation({
    initialEntities,
    frameIntervalMs = 1000 / 30, // default: ~30fps render update
  }: Options) {
    const sim = useRef<BioSimulation | null>(null);
    const [entities, setEntities] = useState<BaseBioEntity[]>([]);
  
    // Initialize on client
    useEffect(() => {
      sim.current = new BioSimulation(initialEntities);
      // seed first render after sim is ready
      setEntities(sim.current.getEntities());
      return () => {
        sim.current = null;
      };
    }, [initialEntities]);
  
    // Physics loop: runs every requestAnimationFrame
    useEffect(() => {
      if (!sim.current) return;
  
      let frameId: number;
      const runPhysics = () => {
        sim.current!.update();
        frameId = requestAnimationFrame(runPhysics);
      };
  
      frameId = requestAnimationFrame(runPhysics);
      return () => cancelAnimationFrame(frameId);
    }, []);
  
    // Render loop: runs at a fixed interval to update React
    useEffect(() => {
      if (!sim.current) return;
  
      const interval = setInterval(() => {
        setEntities(sim.current!.getEntities());
      }, frameIntervalMs);
  
      return () => clearInterval(interval);
    }, [frameIntervalMs]);
  
    const getEntities = useCallback(() => {
      return sim.current?.getEntities() ?? [];
    }, []);
  
    return { entities, getEntities };
  }
  
