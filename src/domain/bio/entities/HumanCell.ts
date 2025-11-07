import { BaseBioEntity, COLORS, Vector2, Size2D, ShapeType} from "../index";
import { generateUniqueID } from "../lib/generateUniqueID";

export class HumanCell extends BaseBioEntity {
  private reproductionCooldown: number;
  private timeSinceLastReproduction: number;

  constructor(
    id: string,
    type: ShapeType,
    position: Vector2,
    size: Size2D,
    velocity: Vector2,
    radius: number,
    color: string,
    reproductionCooldown: number = 10
  ) {
    super(id, type, position, velocity, radius, size, color);
    this.reproductionCooldown = reproductionCooldown;
    this.timeSinceLastReproduction = 0;
  }

  protected customUpdate(delta: number): void {
    const breathing = Math.sin(Date.now() * 0.002) * 0.5;
    this.size.width = 50 + breathing;
    this.size.height = 50 + breathing;
    this.timeSinceLastReproduction += delta;
  }

  public canMergeWith(other: BaseBioEntity): boolean {
    return false;
  }

  public mergeWith(other: BaseBioEntity): BaseBioEntity | null {
    return null;
  }

  public canReproduce(other: BaseBioEntity): boolean {
    if (!(other instanceof HumanCell)) return false;

    return (
      this.timeSinceLastReproduction >= this.reproductionCooldown &&
      other.timeSinceLastReproduction >= other.reproductionCooldown
    );
  }

  public maybeReproduce(): HumanCell | null {
  if (this.timeSinceLastReproduction >= this.reproductionCooldown) {
    this.timeSinceLastReproduction = 0;
    return this.createOffspring();
  }
  return null;
}

  private createOffspring(): HumanCell {
    const distance = 150; 
    const angle = Math.random() * Math.PI * 2;
    const newPosition: Vector2 = {
      x: this.position.x + (angle) * distance,
      y: this.position.y + (angle) * distance,
    };
    const newVelocity: Vector2 = {
      x: (Math.random() - 0.5) * 50,
      y: (Math.random() - 0.5) * 50,
    };

    return new HumanCell(
      generateUniqueID("cell"),
      "cell",
      newPosition,
      { width: 50, height: 50 },
      newVelocity,
      25,
      COLORS.cell,
      this.reproductionCooldown
    );
  }

  public reproduce(other: BaseBioEntity):  BaseBioEntity | null {
    if (!(other instanceof HumanCell)) return null;
    if (!this.canReproduce(other)) return null;

    this.timeSinceLastReproduction = 0;
    other.timeSinceLastReproduction = 0;

  return this.createOffspring();
  }

  public canAttack(other: BaseBioEntity): boolean {
    return false;
  }

  public attack(other: BaseBioEntity): void {

  }
}
