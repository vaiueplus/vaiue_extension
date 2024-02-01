import '@pages/sidepanel/SideNote.scss';
import '@pages/sidepanel/SlateStyle.scss';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { FloatActionBarState, HighlightActionBarState, UserSSO_Struct } from '@src/utility/data_structure';
import { useEffect } from 'react';
import { GetEmptyNoteBlock, GetEmptyNotePage, NoteBlockType, NotePageType, NoteRowType } from '@root/src/utility/note_data_struct';
import { useNoteDictStore, useNoteFocusStore } from './note_zustand';
import { API, Color, LangaugeCode } from '@root/src/utility/static_data';
import { MouseHelper } from '@root/src/utility/ui/mouse_helper';
import { Fragment } from 'react';
import RenderSlateContent, { SelectionActionsCallback, SelectionCallbackType } from '@root/src/utility/slate_editor/slate_note_content';
import { RenderSideActionBar, RenderSourcePanel, RenderSelectActionBar,  ShowFloatingBoard, RenderTrnaslationActionBar } from '@root/src/utility/ui/floating_panel';
import { Link, redirect, useNavigate, useParams } from 'react-router-dom';
import StorageModel from './storge_model';
import React from 'react';
import { memo } from 'react';
import { SideBlockHelper } from './SideBlockHelper';
import { BaseRange, Descendant, Editor, createEditor } from 'slate';
import { SlateUtility } from '@root/src/utility/slate_editor/slate_utility';
import { useMemo } from 'react';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { an } from 'vitest/dist/reporters-OH1c16Kq';
import { translate } from './block_elements/side_api';
import { GetDomain } from '@root/src/utility/static_utility';

let floatActionbar = new RenderSideActionBar()
let floatSourcePanel = new RenderSourcePanel()
let floatSelectBar = new RenderSelectActionBar()
let floatTranslationBar = new RenderTrnaslationActionBar()

const sideBlockHelper = new SideBlockHelper(floatActionbar, floatSourcePanel, floatSelectBar);

const SideBlock = ({storage} : {storage: StorageModel}) => {
    let { page_id } = useParams();
    const navigate = useNavigate();

    const append_block_action = useNoteDictStore((state) => state.append_block);
    const insert_block_action = useNoteDictStore((state) => state.insert_block);
    const update_block_action = useNoteDictStore((state) => state.update_block);
    const delete_block_action = useNoteDictStore((state) => state.delete_block);
    const delete_block_by_id_action = useNoteDictStore((state) => state.delete_block_by_id);
    const offset_block_action = useNoteDictStore((state) => state.offset);

    const set_page_action = useNoteDictStore((state) => state.set);
    const remove_note_action = useNoteDictStore((state) => state.remove);

    let notes_dict = useNoteDictStore((state) => state.notes_dict);
    let noteFullPage = notes_dict[page_id];

    console.log('SideBlock');
    console.log(noteFullPage.blocks);

    sideBlockHelper.set_callback(append_block_action, update_block_action, delete_block_action);
    sideBlockHelper.set_parameter(noteFullPage, storage);
    storage.save_note_to_background(noteFullPage);

    // //OnDestroy
    useEffect(() => {
        let mouse_helper = new MouseHelper();

        mouse_helper.register_mouse_down((pos) => {
            floatSourcePanel.mouse_down_event(pos);
            floatActionbar.mouse_down_event(pos);
            floatSelectBar.mouse_down_event(pos);
            floatTranslationBar.mouse_down_event(pos);
        });

        mouse_helper.register_changes(() => {
            floatSelectBar.show(false);
            floatActionbar.show(false);
            floatTranslationBar.show(false);
        });

        return () => {
            floatSourcePanel.dispose();
            floatActionbar.dispose();
            floatSelectBar.dispose();
            floatTranslationBar.dispose();

            mouse_helper.dispose();
        };
    }, []);

//#region UI Event
    const on_slate_title_change = function(id: string, index: number, value: any[]) {

        let paragraph : NoteRowType[] = 
        value.map( x => {
            return {
                type: x.type,
                children: x.children,
            }
        });

        let concat = "";
        paragraph.forEach(x=> {
            concat += x.children.reduce( (accumulator, currentValue) => { return accumulator + currentValue.text}, "");
        }); 

        if (concat == "") {
            sideBlockHelper.delete_block(index);
            return;
        }
        
        sideBlockHelper.change_block_value(id, (block: NoteBlockType) => {
            let new_block = {...block};
                new_block = {...new_block, row: paragraph}
            return new_block;
        });
    }

    const on_action_bar_click = function(id: string) {
        ShowFloatingBoard(floatActionbar, MouseHelper.x, MouseHelper.y);
        let block = sideBlockHelper.get_block(id);

        if (block == null) return;

        floatActionbar.set_callback(id, on_action_bar_state_click);
        floatSourcePanel.set_callback(id, (block.source == null) ? "" : block.source, on_source_link_set);
    }

    const on_action_bar_state_click = function(block_id:string, state: FloatActionBarState) {
        // if (state == FloatActionBarState.AI_Source) {
        //     ShowFloatingBoard(floatSourcePanel, MouseHelper.x, MouseHelper.y);
        //     floatActionbar.show(false);
        // }

        if (state == FloatActionBarState.Delete) {
            delete_block_by_id_action(page_id, block_id);
        }

        if (state == FloatActionBarState.Move_Down) {
            offset_block_action(page_id, block_id, 1);
        }

        if (state == FloatActionBarState.Move_Up) {
            offset_block_action(page_id, block_id, -1);
        }

        floatActionbar.show(false);
    }

    const trigger_keyword_action = function(selection_type: SelectionCallbackType ) {

            let block_index = selection_type.block_index;
            let range = selection_type.range;
            let whole_descendents = selection_type.editor.children;

            let block_id = noteFullPage.blocks[block_index]._id;
            const new_keyword_rows = SlateUtility.create_highLight_rows(range, whole_descendents);

            if (new_keyword_rows == undefined) return undefined;

            sideBlockHelper.change_block_value(block_id, (block: NoteBlockType) => {
            let new_block = {...block};

                new_block.row = new_keyword_rows
                new_block.version++;

            return new_block;
        });

        return new_keyword_rows;
    }

    const trigger_translation_action = async function(selection_type: SelectionCallbackType) {
        let selected_descendents = selection_type.fragment;
        const concat_string = SlateUtility.concat_node_row_string(selected_descendents);

        floatTranslationBar.set_callback(translate, 
            (translation_text: string) => {
                insert_block_action(page_id, selection_type.block_index + 1, GetEmptyNoteBlock(translation_text));
                floatTranslationBar.show(false);
            },
            () => {
                floatTranslationBar.show(false);
            }
        )

        floatTranslationBar.setup(concat_string);
        floatTranslationBar.set_position(
            (document.body.clientWidth - floatTranslationBar.get_bound().width) * 0.5
            , document.body.clientHeight / 2 
        );
        // let t_string = await translate(concat_string, LangaugeCode.English, LangaugeCode.TraditionalChinese);
        // insert_block_action(page_id, selection_type.block_index + 1, GetEmptyNoteBlock(t_string));
    }

    const on_selection_bar_event = function(selection_callback: SelectionActionsCallback) {
        const selection : any = window.getSelection();

        if (selection.rangeCount <= 0) return;

        floatSelectBar.show(true);
        const getRange = selection.getRangeAt(0); 
        const selection_bound : DOMRect = getRange.getBoundingClientRect();
        const bar_bound = floatSelectBar.get_bound();

        let full_text : string = selection.toString();
            full_text = full_text.trim();

        if (full_text == "") {
            floatSelectBar.show(false);
            return;
        } 

        let y_offset = -90;
        let x_pos = selection_bound.left + (selection_bound.width * 0.5) - (bar_bound.width * 0.5);
        let y_pos = (selection_bound.top + y_offset);
        
        ShowFloatingBoard(floatSelectBar, x_pos, y_pos);
      
        floatSelectBar.set_callback((action_type: HighlightActionBarState) => {
            const keyword_struct = selection_callback();

            floatSelectBar.show(false);

            if (action_type == HighlightActionBarState.Keyword) {

                let high_light_children = trigger_keyword_action(keyword_struct);
    
                if (high_light_children != undefined)
                    keyword_struct.editor.children = high_light_children;    
            }

            if (action_type == HighlightActionBarState.Translation) {
                trigger_translation_action(keyword_struct);
            }
        });
    }

    const on_source_link_set = function(id: string, link: string) {
        sideBlockHelper.change_block_value(id, (block: NoteBlockType) => {
            let new_block = {...block};
                new_block = {...new_block, source: link}

            return new_block;
        });
    }

    const on_keyword_delete = function(note_block: NoteBlockType, keyword_id: string, editor: Editor ) {
        sideBlockHelper.change_block_value(note_block._id, (block: NoteBlockType) => {

            let delete_key_word_row = SlateUtility.paragraph_operation(note_block.row, (p) => {

                if (p._id == keyword_id) {
                    p._id = undefined;
                    p.keyword = undefined;
                }
    
                return p;
            });

            editor.children = delete_key_word_row;

            let new_block = {...block};
                new_block = {...new_block, row: delete_key_word_row}

            return new_block;
        });
    }

    const on_title_change = function(new_title: string) {
        let copy_page = {...noteFullPage}
        copy_page.title = new_title;
        set_page_action(copy_page)
    }

    const on_note_delete = function() {
        navigate("/");
        storage.delete_note_to_background(page_id);
        remove_note_action(page_id);
    }
//#endregion


const add_new_row = function() {    
    sideBlockHelper.add_new_row();
}

return (
    <div className="preview-comp">
        <Link className='button' to="/">Back</Link>
        <h2 onClick={(e) => {
            let title_dom : any = e.target;
            const innerDOM_value : string = "" + title_dom.innerHTML;
            title_dom.innerHTML = (`<input type='text' value='${innerDOM_value}'></input>`);
            
            const h_dom_input : HTMLInputElement = title_dom.querySelector("input");

            if (h_dom_input != null) {
                h_dom_input.focus();
                h_dom_input.setSelectionRange(0, innerDOM_value.length);

                //Resume
                h_dom_input.onblur = () => {
                    title_dom.innerHTML = h_dom_input.value;
                    on_title_change(""+title_dom.innerHTML);
                }
            }
        }
    }
        >{noteFullPage.title}</h2>

        <BlockSlateContents note_page={noteFullPage} 
            on_keyword_delete={on_keyword_delete}
            on_selection_bar_event={on_selection_bar_event}
            on_slate_title_change={on_slate_title_change}
            on_action_bar_click={on_action_bar_click} />

        <div className='note_component_footer'>
            <button className="button is-primary is-light" onClick={add_new_row}>Add+</button>
            <button className='button is-danger is-light' onClick={on_note_delete}>x</button>
        </div>

        <div className='floating-container'>
            { floatSourcePanel.render() }
            { floatActionbar.render() }
            { floatSelectBar.render() }
            { floatTranslationBar.render() }
        </div>
    </div>
);
}

const BlockSlateContents = function(
        {note_page, on_keyword_delete, on_slate_title_change, on_action_bar_click, on_selection_bar_event} : 
        {   note_page: NotePageType,
            on_keyword_delete: (note_block: NoteBlockType, keyword_id: string, editor: Editor) => void,
            on_selection_bar_event: (keyword_action: SelectionActionsCallback) => void,
            on_slate_title_change: (id: string, index: number, value: any[]) => void,
            on_action_bar_click: (id: string) => void
        }
    ) {
    if (note_page == undefined) return <div></div>

    let initValue : React.JSX.Element[] = []; 
    note_page.blocks.reduce((array, x, index) => {

        array.push(
            <BlockSlateContent note_block={x} version={x.version} index={index} key={x._id}
            on_keyword_delete={on_keyword_delete}
            on_selection_bar_event={on_selection_bar_event}
            on_slate_title_change={on_slate_title_change}
            on_action_bar_click={on_action_bar_click}
            />
        );

        return array;
    }, initValue)

    return (
        <div>
            <Fragment>
            {
                initValue
            }
            
            </Fragment>
        </div>
    )
};


const BlockSlateContent = memo(function({ note_block, version, index, on_keyword_delete, on_slate_title_change, on_action_bar_click, on_selection_bar_event}: 
    {   note_block: NoteBlockType, version: number, index: number,
        on_keyword_delete: (note_block: NoteBlockType, keyword_id: string, editor: Editor) => void,
        on_slate_title_change: (id: string, index: number, value: any[]) => void,
        on_action_bar_click: (id: string) => void,
        on_selection_bar_event: (keyword_action: SelectionActionsCallback) => void,
    }) {
        const editor = useMemo(() => withHistory(withReact(createEditor())), []);
        let keywords = SlateUtility.get_keyword_tags(note_block.row);
        let keyword_dom = [];

        const delete_keyword_action = function(key: string) {
            on_keyword_delete(note_block, key, editor);
        }

        const hover_keyword_tag = function(keyword_id: string, is_hover: boolean) {
            let target_dom : HTMLElement = document.getElementById(keyword_id.substring(0, 5));

            if (target_dom != undefined) {
                target_dom.style.background = (is_hover) ?  Color.DarkOrange : Color.LightYellow;
                target_dom.style.color = (is_hover) ?  "white" : "black";

            }
        }

        keywords.forEach((value, key) => {
            keyword_dom.push(
            <div className='keyword_comp' key={key} 
            onClick={() => {
                delete_keyword_action(key);
            }} 
            
            onPointerEnter={() => {
                hover_keyword_tag(key, true);
            }}

            onPointerLeave={() => {
                hover_keyword_tag(key, false);
            }}>
                {value}
            </div>)
        }); 
        
        let display_source_dom = () => {
            if (note_block.source != null)
                return (<div className='source_comp'>
                    <Link to={note_block.source}>{GetDomain(note_block.source)}</Link>
                </div>)
            return (<Fragment></Fragment>)
        }

        return (
            <div className="note-block-comp">
                {display_source_dom()}
                <div className='block-draggable' onMouseDown={(e:any) => {
                    let m : HTMLDivElement = e.target;

                    // let parent_node = m.parentNode.parentNode;
                    // cache_draggable_dom = m.parentNode.cloneNode(true) as any;
                    
                    // cache_draggable_dom.classList.add('block-draggable-component')

                    // console.log(cache_draggable_dom.classList);
                    

                    // parent_node.append(cache_draggable_dom);
                }}></div>



                <RenderSlateContent id={note_block._id} default_data={note_block.row} editor={editor}
                index={index} version={version}
                readOnly={false} 
                finish_edit_event={on_slate_title_change} 
                action_bar_event={on_action_bar_click}
                selection_bar_event={on_selection_bar_event}
                placeholder_text="Text from gpt"></RenderSlateContent>
         
                <div className='keyword_container'>
                    {keyword_dom}
                </div>
            </div>
        )
}, (prev, next) => {
    return prev.version == next.version;
});

export default withErrorBoundary(withSuspense(SideBlock, <div> Loading ... </div>), <div> Error Occur </div>);