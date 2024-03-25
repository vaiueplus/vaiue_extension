import { LangaugeCode, StorageID } from "../../static_data";
import { GetLocalStorageValue } from "../../static_utility";
import { AbstractMovable } from "../movable_view";

export class RenderTrnaslationActionBar extends AbstractMovable {
    private _translation_action: (source: string, source_lang: string, target_lang: string) => Promise<string> | null = null;
    private _confirm_callback: (translation_result: string) => void;
    private _cancel_callback: () => void;

    private _source: string = "";
    private _translation: string = "";

    private _language_options = [
                                {'code': LangaugeCode.AutoDetect, 'value': 'Auto' },
                                {'code': LangaugeCode.English, 'value': 'English' },
                                {'code': LangaugeCode.Japanese, 'value': '日本語' },
                                {'code': LangaugeCode.Korea, 'value': '한국어' },
                                {'code': LangaugeCode.TraditionalChinese, 'value': '正體中文'},
                                {'code': LangaugeCode.SimplifiedChinese, 'value': '簡體中文'},
                                ];

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

        let sourcearea_dom: HTMLTextAreaElement = document.querySelector(".language_content .source_preview");
        let textarea_dom: HTMLTextAreaElement = document.querySelector(".language_content .source_translated");

        textarea_dom.value = "Translating . . .";
        sourcearea_dom.value = this._source;

        textarea_dom.value = await this._translation_action(this._source, source_select.value, target_select.value);
    }

    get_option_dom(lang_key:string, default_code: string = null) {
        return (
            <select onChange={
                (e) => {
                    localStorage.setItem(lang_key, e.target.value);
                    this.process_translation();
                }}>
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
        let default_source_lang = GetLocalStorageValue(StorageID.TranslationSource, LangaugeCode.AutoDetect);
        let default_targetg_lang = GetLocalStorageValue(StorageID.TranslationTarget, LangaugeCode.TraditionalChinese);
        return(
            <div id={this.id}>

                <div className="language_header">
                    <div className="select is-small" id="translation_select_source">
                        {this.get_option_dom(StorageID.TranslationSource, default_source_lang)}
                    </div>
                    <p> to </p>
                    <div className="select is-small" id="translation_select_target">
                        {this.get_option_dom(StorageID.TranslationTarget, default_targetg_lang)}
                    </div>

                    <div className='float_translation_bar_options'>
                        <button className="button is-danger" onClick={() => {
                            this._cancel_callback();
                        }}>Discard</button>
                        <button className="button is-primary" onClick={() => {
                            let textarea_dom: HTMLTextAreaElement = document.querySelector(".language_content .source_translated");
                            this._confirm_callback(textarea_dom.value);
                        }}>Confirm</button>
                    </div>
                </div>

                <div className="language_content">
                    <textarea className="textarea source_preview" disabled={true}></textarea>
                    <textarea className="textarea source_translated"></textarea>
                </div>

            </div>
        )
    }
}