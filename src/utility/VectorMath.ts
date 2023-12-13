import { Lerp } from "./static_utility";

export class Vector2 {
    x: number = 0;
    y: number = 0;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    public set(x: number, y: number) {
        this.x = x;
        this.y = y;

        return this;
    }

    public clone(){
        return new Vector2(this.x, this.y);
    }

    public copy(v: Vector2) {
        return this.set(v.x, v.y);
    }

    public scale(value: number) {
        this.x *= value;
        this.y *= value;

        return this;
    }

    public add(vec: Vector2, scale = 1) {
        this.x += vec.x * scale;
        this.y += vec.y * scale;

        return this;
    }

    public substract(vec: Vector2, scale = 1) {
        this.x -= vec.x * scale;
        this.y -= vec.y * scale;

        return this;
    }


    public add_scalar(value: number) {
        this.x += value;
        this.y += value;

        return this;
    }

    public substract_scalar(value: number) {
        this.x -= value;
        this.y -= value;

        return this;
    }

    public length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)); 
    }

    public normalize() {
        let vi = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.x = this.x / vi;
        this.y = this.y / vi;

        return this;        
    }

    public zero() {
        this.x = 0;
        this.y = 0;

        return this;
    }

    public one() {
        this.x = 1;
        this.y = 1;

        return this;
    }
    //#region  Global Static

    public static perpendicular(vector: Vector2, source? : Vector2) : Vector2
    {
        if (source == undefined) {
            source = new Vector2();
        }

        source.set(vector.y, -vector.x);
        return source;
    }

    public static from_value(x: number, y: number) {
        let v = new Vector2();
        v.x = x;
        v.y = y;
        return v;
    }

    public static distance(vec_a: Vector2, vec_b: Vector2) {
        return Math.sqrt(Math.pow(vec_b.x - vec_a.x, 2) + Math.pow(vec_b.y - vec_a.y, 2));
    }

    public static normalize(vector : Vector2) : Vector2 {
        let vi = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
        return this.from_value(vector.x / vi, vector.y / vi );
    }

    public static dot(vec_a: Vector2, vec_b : Vector2) {
        return (vec_a.x * vec_b.x) + (vec_a.y * vec_b.y);
    }

    public static lerp(vec_a: Vector2, vec_b: Vector2, t: number, source?: Vector2) {
        if (source == undefined) source = new Vector2();

        source.set(
            Lerp(vec_a.x, vec_b.x, t),
            Lerp(vec_a.y, vec_b.y, t)
        );
        
        return source;
    }

    public static add(a: Vector2, b: Vector2, source?: Vector2) {
        if (source == undefined) source = new Vector2();

        return source.set(
            a.x + b.x,
            a.y + b.y
        );
    }

    public static substract(a: Vector2, b: Vector2, source?: Vector2) {
        if (source == undefined) source = new Vector2();

        return source.set(
            a.x - b.x,
            a.y - b.y
        );
    }

    
    /**
     * The Input should be normalized
     *
     * @static
     * @param {Vector2} surface_normal
     * @param {Vector2} direction
     * @param {Vector2} [source]
     * @return {*} 
     * @memberof Vector2
     */
    public static reflect(surface_normal: Vector2, direction: Vector2, source?: Vector2) {
        if (source == undefined) source = new Vector2();

        source.set(surface_normal.x, surface_normal.y);
        let t = this.dot(surface_normal, direction);
        source.scale(t);
        source.scale(2);

        this.substract(source, direction, source);

        return source;
    }


    
    //#endregion

}