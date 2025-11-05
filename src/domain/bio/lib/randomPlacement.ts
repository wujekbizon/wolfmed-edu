import { Vector2 } from "../types";

export const randomPos = (): Vector2 => {
  const width = typeof window !== "undefined" ? window.innerWidth : 800 
  const height = typeof window !== "undefined" ? window.innerHeight : 600

  return {
    x: Math.random() * width,
    y: Math.random() * height,
  }
};
export const randomVel = (): Vector2 => ({
  x: (Math.random() - 0.5) * 50,
  y: (Math.random() - 0.5) * 50,
});
