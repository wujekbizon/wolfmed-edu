import { BaseBioEntity, Virus, Bacteria, HumanCell } from "./index";

export class BioSimulation {
  private entities: BaseBioEntity[] = [];
  private lastUpdateTime = performance.now();

  constructor(initialEntities: BaseBioEntity[]) {
    this.entities = initialEntities;
  }

  public update(): void {
    const now = performance.now();
    const delta = (now - this.lastUpdateTime) / 1000; 
    this.lastUpdateTime = now;

    // Move all entities
    for (const entity of this.entities) {
      entity.update(delta);
    }

    // Check collisions
    this.handleCollisions();
  }

  private handleCollisions(): void {
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const a = this.entities[i]!;
        const b = this.entities[j]!;

        if (this.areColliding(a, b)) {
          this.resolveCollision(a, b);
        }
      }
    }
  }

  private areColliding(a: BaseBioEntity, b: BaseBioEntity): boolean {
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
  }

  private areHostile(a: BaseBioEntity, b: BaseBioEntity): boolean {
    return a.canAttack(b) || b.canAttack(a);
  }

  private resolveCollision(a: BaseBioEntity, b: BaseBioEntity): void {

    if(this.areHostile(a,b)) {
      if(a.canAttack(b)) {
        a.attack(b);
        this.removeEntity(b)
      }
      if(b.canAttack(a)) {
        b.attack(a);
        this.removeEntity(a)
      }
      return;
    }

    if (a instanceof HumanCell && b instanceof HumanCell) {
      if (a.canReproduce(b)) {
        const newCell = a.reproduce(b);
        if (newCell) {
          this.addEntity(newCell);
        }
        return;
      }

      if (b.canReproduce(a)) {
        const newCell = b.reproduce(a);
        if (newCell) {
          this.addEntity(newCell);
        }
        return;
      }
    }

    if (a.canMergeWith(b)) {
      const merged = a.mergeWith(b);
      if (merged) {
        this.replaceEntities([a, b], merged);
        return;
      }
    }

    if (b.canMergeWith(a)) {
      const merged = b.mergeWith(a);
      if (merged) {
        this.replaceEntities([a, b], merged);
        return;
      }
    }

    this.bounce(a, b);
  }

  private replaceEntities(oldEntities: BaseBioEntity[], merged: BaseBioEntity): void {
    this.entities = this.entities.filter(e => !oldEntities.includes(e));
    this.entities.push(merged);
  }

  private removeEntity(entity: BaseBioEntity): void {
    this.entities = this.entities.filter(e => e !== entity);
  }

  private addEntity(entity: BaseBioEntity): void {
    this.entities.push(entity);
  }

  private bounce(a: BaseBioEntity, b: BaseBioEntity): void {
    const tempVx = a.velocity.x;
    const tempVy = a.velocity.y;
    a.velocity.x = b.velocity.x;
    a.velocity.y = b.velocity.y;
    b.velocity.x = tempVx;
    b.velocity.y = tempVy;
  }

  public getEntities(): BaseBioEntity[] {
    return this.entities;
  }
}