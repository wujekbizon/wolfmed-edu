import { BioEntity, ShapeType, Size2D, Vector2 } from "../types";

export abstract class BaseBioEntity implements BioEntity {
    id: string;
    type: ShapeType;
    position: Vector2;
    velocity: Vector2;
    radius: number;
    size: Size2D;
    color: string;

    constructor(id: string, type: ShapeType, position: Vector2, velocity: Vector2, radius: number, size: Size2D, color: string) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.size = size;
        this.color = color;
    }

    public update(delta: number): void {
        this.position.x += this.velocity.x * delta
        this.position.y += this.velocity.y * delta
    
        // bounce from screen edges
        if (this.position.x < 0 || this.position.x > window.innerWidth) this.velocity.x *= -1
        if (this.position.y < 0 || this.position.y > window.innerHeight) this.velocity.y *= -1

        this.customUpdate(delta);
    }

    protected abstract customUpdate(delta: number): void;

    public abstract canMergeWith(other: BaseBioEntity): boolean; 

    public abstract mergeWith(other: BaseBioEntity): BaseBioEntity | null;

    public abstract canAttack(other: BaseBioEntity): boolean;

    public abstract attack(other: BaseBioEntity): void;

    public abstract canReproduce(other: BaseBioEntity): boolean;
    public abstract reproduce(other: BaseBioEntity):  BaseBioEntity | null
}