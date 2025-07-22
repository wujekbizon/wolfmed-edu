import { useEffect, useRef } from "react";
import { Bacteria, BioSimulation, HumanCell, Virus } from "@/domain/bio";
import type { BaseBioEntity } from "@/domain/bio";

export function useCanvasSimulation(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    initialEntities: BaseBioEntity[],
    svgContainerRef: React.RefObject<HTMLDivElement>
  ) {
    const sim = useRef<BioSimulation | null>(null);
    const animationFrame = useRef<number | null>(null);
  
    useEffect(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      sim.current = new BioSimulation(initialEntities);
  
      const resize = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      };
      window.addEventListener("resize", resize);
      resize();
  
      const loop = () => {
        // 1) physics step
        sim.current!.update();
  
        // 2) clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        // 3) update SVGs directly
        const svgContainer = svgContainerRef.current!;
        svgContainer.innerHTML = ""; // Clear previous SVGs
  
        sim.current!.getEntities().forEach((e) => {
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("width", e.size.width.toString()); // Use e.size.width
          svg.setAttribute("height", e.size.height.toString()); // Use e.size.height
          svg.setAttribute("viewBox", `0 0 ${e.size.width} ${e.size.height}`);
          svg.setAttribute("style", `position: absolute; left: ${e.position.x}px; top: ${e.position.y}px;`);
  
          if (e instanceof HumanCell) {
            svg.innerHTML = `
              <circle cx="${e.size.width / 2}" cy="${e.size.height / 2}" r="${e.radius}" fill="${e.color}" stroke="#3388aa" stroke-width="2" />
              <defs>
                <radialGradient id="cytoplasmGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="${e.color}" />
                </radialGradient>
              </defs>
              <circle cx="${e.size.width / 2}" cy="${e.size.height / 2}" r="${e.radius * 0.95}" fill="url(#cytoplasmGradient)" />
              <circle cx="${e.size.width / 2 + e.radius * 0.2}" cy="${e.size.height / 2 - e.radius * 0.1}" r="${e.radius * 0.35}" fill="#7da4d6" stroke="#456a96" stroke-width="2" />
              <circle cx="${e.size.width / 2 + e.radius * 0.2}" cy="${e.size.height / 2 - e.radius * 0.1}" r="${e.radius * 0.12}" fill="#3f5b82" />
              <circle cx="${e.size.width / 2 - e.radius * 0.3}" cy="${e.size.height / 2 - e.radius * 0.2}" r="${e.radius * 0.08}" fill="#ff9e80" />
              <circle cx="${e.size.width / 2 + e.radius * 0.4}" cy="${e.size.height / 2 - e.radius * 0.25}" r="${e.radius * 0.08 * 0.8}" fill="#ffcd80" />
              <circle cx="${e.size.width / 2 - e.radius * 0.2}" cy="${e.size.height / 2 + e.radius * 0.3}" r="${e.radius * 0.08 * 1.2}" fill="#a1e3a1" />
              <circle cx="${e.size.width / 2 + e.radius * 0.35}" cy="${e.size.height / 2 + e.radius * 0.2}" r="${e.radius * 0.08}" fill="#d5a1e3" />
              <circle cx="${e.size.width / 2 - e.radius * 0.4}" cy="${e.size.height / 2 + e.radius * 0.1}" r="${e.radius * 0.08 * 0.8}" fill="#f4a1d6" />
              <ellipse cx="${e.size.width / 2}" cy="${e.size.height / 2 - e.radius * 0.2}" rx="${e.radius * 0.4}" ry="${e.radius * 0.2}" fill="white" opacity="0.2" />
            `;
          } else if (e instanceof Bacteria) {
            svg.innerHTML = `
              <rect x="1" y="1" rx="${e.size.width / 2}" ry="${e.size.height / 2}" width="${e.size.width}" height="${e.size.height}" fill="${e.color}" stroke="black" stroke-width="1" />
              <ellipse cx="${e.size.width / 2}" cy="${e.size.height / 2}" rx="${e.size.width * 0.25}" ry="${e.size.height * 0.4}" fill="rgba(0,0,0,0.15)" />
              <line x1="${e.size.width}" y1="${e.size.height * 0.3}" x2="${e.size.width + 5}" y2="${e.size.height * 0.3 + 1.5}" stroke="black" stroke-width="0.5" />
              <line x1="${e.size.width}" y1="${e.size.height * 0.7}" x2="${e.size.width + 5}" y2="${e.size.height * 0.7 - 1.5}" stroke="black" stroke-width="0.5" />
            `;
          } else if (e instanceof Virus) {
            const spikeCount = 12;
            const spikeLength = e.radius * 0.6;
            const spikes = Array.from({ length: spikeCount }).map((_, i) => {
              const angle = (i / spikeCount) * Math.PI * 2;
              const innerX = e.radius * Math.cos(angle) + e.size.width / 2;
              const innerY = e.radius * Math.sin(angle) + e.size.height / 2;
              const outerX = (e.radius + spikeLength) * Math.cos(angle) + e.size.width / 2;
              const outerY = (e.radius + spikeLength) * Math.sin(angle) + e.size.height / 2;
              return { innerX, innerY, outerX, outerY };
            });
  
            svg.innerHTML = `
              ${spikes.map((s, idx) => `
                <line x1="${s.innerX}" y1="${s.innerY}" x2="${s.outerX}" y2="${s.outerY}" stroke="${e.color}" stroke-width="1" />
              `).join("")}
              <circle cx="${e.size.width / 2}" cy="${e.size.height / 2}" r="${e.radius * 0.9}" fill="${e.color}" stroke="black" stroke-width="0.5" />
              <circle cx="${e.size.width / 2}" cy="${e.size.height / 2}" r="${e.radius * 0.4}" fill="rgba(0,0,0,0.15)" />
            `;
          }
  
          svgContainer.appendChild(svg);
        });
  
        animationFrame.current = requestAnimationFrame(loop);
      };
  
      animationFrame.current = requestAnimationFrame(loop);
      return () => {
        cancelAnimationFrame(animationFrame.current!);
        window.removeEventListener("resize", resize);
      };
    }, [canvasRef, initialEntities, svgContainerRef]);
  }