'use client'

import { EventID } from "@src/utility/static_data";
import EventSystem from "@src/utility/EventSystem";
import { Vector2 } from "@src/utility/VectorMath";

export class MouseHelper {
    static x: number = 0;
    static y: number = 0;
    private _event_system : EventSystem;

    private _mouse_down: (event: MouseEvent) => void;
    private _mouse_move: (event: MouseEvent) => void;

    constructor() {
        this._event_system = new EventSystem();
        this._mouse_down = this.on_mouse_down.bind(this);
        this._mouse_move = this.on_mouse_move.bind(this);

        window.addEventListener("mousedown", this._mouse_down);
        window.addEventListener("mouseup", this._mouse_move);
        window.addEventListener("mousemove", this._mouse_move);
    }

    public register_mouse_down(callback: (pos: Vector2) => void) {
        this._event_system.ListenToEvent(EventID.MouseDown, callback);
    }

    public dispose() {
        window.removeEventListener("mousedown", this._mouse_down);
        window.removeEventListener("mouseup", this._mouse_move);
        window.removeEventListener("mousemove", this._mouse_move); 
    }

    private on_mouse_down(event: MouseEvent) {
        this.on_mouse_move(event);

        this._event_system.Notify(EventID.MouseDown, new Vector2(event.clientX, event.clientY));
    }

    private on_mouse_move(event: MouseEvent) {
        MouseHelper.x = event.clientX;
        MouseHelper.y = event.clientY;
    }

    
}