import { AbstractMovable } from "./movable_view";
import { Vector2 } from "@src/utility/VectorMath";
import { MouseEventHandler, useEffect, useMemo, useState } from "react";
import { PointBoxSection } from "@src/utility/static_utility";
import { FloatActionBarState, HighlightActionBarState } from "@src/utility/data_structure";
import { LangaugeCode } from "../static_data";

export class RenderSourcePanel extends AbstractMovable {
    _callback: ((id: string, link:string) => void) | null = null;
    private _block_id: string = "";

    constructor() {
        super();
        this.id = "float_source_panel";
    }

    show(is_show: boolean) {
        super.show(is_show);
    }

    set_callback(block_id: string, link_address: string, callback: (id: string, link:string) => void) {
        this._callback = callback;
        this.set_input_value(link_address);
        this._block_id = block_id;
    }

    private on_source_confirm_click() {
        let input_value = this.get_input_value();

        if (input_value == null) return;

        this._callback?.(this._block_id, input_value);
        this.show(false);
    }

    private get_input_value() {
        let input_dom = document.querySelector<HTMLInputElement>("#"+this.id +" input[type='text']");
        let input_value = input_dom?.value;

        return input_value;
    }

    private set_input_value(v: string) {
        let input_dom = document.querySelector<HTMLInputElement>("#"+this.id +" input[type='text']");
        let input_value = input_dom?.value;

        if (input_dom == null || input_value == null) return;

        input_dom.value = v;
    }

    render() {
        return(
            <div id={this.id}>
                <h2>AI Tool</h2>
                <section>
                    <label>Source</label>
                    <input type="text"></input>
                </section>
                <button className="button" onClick={this.on_source_confirm_click.bind(this)}>Set Link</button>
            </div>
        )
    }
}

export class RenderSideActionBar extends AbstractMovable {
    private _callback: ((block_id: string, state: FloatActionBarState) => void) | null = null;
    private _block_id: string = "";

    constructor() {
        super();
        this.id = "float_action_bar";
    }

    set_callback(block_id: string, callback: (block_id: string, state: FloatActionBarState) => void) {
        this._callback = callback;
        this._block_id = block_id;
    }

    show(is_show: boolean) {
        super.show(is_show);
    }

    render() {
        return(
            <div id={this.id}>
                <button onClick={() => this._callback?.(this._block_id, FloatActionBarState.Delete)}>Remove</button>
                <hr></hr>
                <button onClick={() => this._callback?.(this._block_id, FloatActionBarState.Move_Up)}>Up</button>
                <hr></hr>
                <button onClick={() => this._callback?.(this._block_id, FloatActionBarState.Move_Down)}>Down</button>
            </div>
        )
    }
}

export class RenderHighlightBar extends AbstractMovable {
    private _create_new_callback: (() => void) | null = null;
    private _insert_to_last_collection_callback: (() => void) | null = null;

    constructor() {
        super();
        this.id = "float_highlight_bar";
    }

    set_callback(create_new_callback: () => void, 
                insert_to_last_collection_callback: () => void) {
        this._create_new_callback = create_new_callback;
        this._insert_to_last_collection_callback = insert_to_last_collection_callback;
    }

    show(is_show: boolean) {
        super.show(is_show);
    }

    render() {
        return(
            <div id={this.id}>
                <button onClick={() => this._create_new_callback?.()}>Create</button>
                <button onClick={() => this._insert_to_last_collection_callback?.()}>Paste</button>
            </div>
        )
    }
}

export class RenderSelectActionBar extends AbstractMovable {
    private _callback: ((action_type: HighlightActionBarState) => void) | null = null;

    constructor() {
        super();
        this.id = "float_select_bar";
    }

    set_callback(callback: (action_type: HighlightActionBarState) => void) {
        this._callback = callback;
    }

    show(is_show: boolean) {
        super.show(is_show);
    }

    render() {
        return(
            <div id={this.id}>
                <button onClick={() => this._callback?.(HighlightActionBarState.Keyword)}>Keyword</button>
                <button onClick={() => this._callback?.(HighlightActionBarState.DoubleCheck)}>To Check</button>
                <button onClick={() => this._callback?.(HighlightActionBarState.Translation)}>Translate</button>
            </div>
        )
    }
}

export class RenderTrnaslationActionBar extends AbstractMovable {
    private _translation_action: (source: string, source_lang: string, target_lang: string) => Promise<string> | null = null;
    private _confirm_callback: (translation_result: string) => void;
    private _cancel_callback: () => void;

    private _source: string = "";
    private _translation: string = "";

    private _language_options = [{'code': LangaugeCode.TraditionalChinese, 'value': '中文'},
                                {'code': LangaugeCode.English, 'value': 'English' }];

    constructor() {
        super();
        this.id = "float_translation_bar";
    }

    set_callback(translation_action: (source: string, source_lang: string, target_lang: string) => Promise<string>, 
                confirm_callback: (translation_result: string) => void,
                cancel_callback: () => void) {
        this._translation_action = translation_action;
        this._confirm_callback = confirm_callback;
        this._cancel_callback = cancel_callback;
    }

    show(is_show: boolean) {
        super.show(is_show);
    }

    async setup(source: string) {
        this._source = source;
        this.show(true);
        this.render();

        this.process_translation();
    }

    private async process_translation() {
        let source_select: HTMLSelectElement = document.querySelector("#translation_select_source select");
        let target_select: HTMLSelectElement = document.querySelector("#translation_select_target select");
        let textarea_dom: HTMLTextAreaElement = document.querySelector(".language_content textarea");

        textarea_dom.value = await this._translation_action(this._source, source_select.value, target_select.value);
    }

    get_option_dom(default_code: string = null) {
        return (
            <select onChange={this.process_translation.bind(this)}>
                {
                    this._language_options.map(x =>
                        (
                            <option value={x.code} selected={default_code==x.code}>{x.value}</option>
                        )
                    )
                }
            </select>
        )
    }

    render() {
        return(
            <div id={this.id}>

                <div className="language_header">
                    <div className="select is-small" id="translation_select_source">
                        {this.get_option_dom(LangaugeCode.English)}
                    </div>
                    <p> to </p>
                    <div className="select is-small" id="translation_select_target">
                        {this.get_option_dom(LangaugeCode.TraditionalChinese)}
                    </div>

                    <div className='float_translation_bar_options'>
                        <button className="button is-danger" onClick={this._cancel_callback}>Delete</button>
                        <button className="button is-primary" onClick={() => {
                            let textarea_dom: HTMLTextAreaElement = document.querySelector(".language_content textarea");
                            this._confirm_callback(textarea_dom.value);
                        }}>Confirm</button>
                    </div>
                </div>

                <div className="language_content">
                    <textarea className="textarea"></textarea>
                </div>

            </div>
        )
    }
}

export const MovePanelToPos = function(target: HTMLBaseElement, bound: DOMRect, x: number, y: number) {
    let body_width = document.body.clientWidth;
    let body_height = document.body.clientHeight;

    //No stick into right wall
    let offset_x = (x + bound.width) - body_width;
    if (offset_x > 0) x -= offset_x;

    //No stick into bottom wall
    let offset_y = (y + bound.height) - body_height;
    if (offset_y > 0) y -= offset_y;

    target.style.left = x + 'px';
    target.style.top = y + 'px';
}

export const ShowFloatingBoard = function(floating: AbstractMovable, pos_x: number, pos_y: number) {
    floating.show(true);
    floating.set_position(pos_x, pos_y);
}