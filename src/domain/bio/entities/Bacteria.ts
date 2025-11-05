import { BaseBioEntity, Vector2, Size2D, ShapeType, COLORS, HumanCell } from "../index";

export class Bacteria extends BaseBioEntity {
  constructor(
    id: string,
    type: ShapeType = "bacteria",
    position: Vector2,
    size: Size2D = { width: 30, height: 10 },
    velocity: Vector2,
    radius: number = 5,
    color: string = COLORS.bacteria
  ) {
    super(id, type, position, velocity, radius, size, color);
  }

  protected customUpdate(delta: number): void {
    this.velocity.x += (Math.random() - 0.5) * 0.05 * delta;
    this.velocity.y += (Math.random() - 0.5) * 0.05 * delta;
  }

  public canReproduce(other: BaseBioEntity): boolean {
      return false;
  }

  public reproduce(other: BaseBioEntity):  BaseBioEntity | null {
    return null;
  }

  public canMergeWith(other: BaseBioEntity): boolean {
    return other instanceof Bacteria;
  }

  public mergeWith(other: BaseBioEntity): BaseBioEntity | null {
    if (!(other instanceof Bacteria)) return null;

    const mergedRadius = this.radius + other.radius * 0.7;
    const mergedSize: Size2D = {
      width: this.size.width + other.size.width * 0.7,
      height: this.size.height + other.size.height * 0.7,
    };

    const mergedPosition: Vector2 = {
      x: (this.position.x + other.position.x) / 2,
      y: (this.position.y + other.position.y) / 2,
    };

    const mergedVelocity: Vector2 = {
      x: (this.velocity.x + other.velocity.x) / 2,
      y: (this.velocity.y + other.velocity.y) / 2,
    };

    return new Bacteria(
      `bacteria-${Date.now()}-${Math.random()}`,
      this.type,
      mergedPosition,
      mergedSize,
      mergedVelocity,
      mergedRadius,
      this.color
    );
  }

  public canAttack(other: BaseBioEntity): boolean {
    return other instanceof HumanCell;
  }

  public attack(other: BaseBioEntity): boolean {
    if (other instanceof HumanCell) {
      return true; 
    }
    return false;
  }
}
