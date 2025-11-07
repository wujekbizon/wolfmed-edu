export type ShapeType = 'bacteria' | 'virus' | 'cell'
export interface Vector2 {  
    x: number 
    y: number
}
export interface Size2D {
    width: number
    height: number
}
export interface BioEntity {
    id: string
    type: ShapeType
    position: Vector2
    velocity: Vector2
    radius: number  
    size: Size2D       
    color: string
    update(delta: number): void
}