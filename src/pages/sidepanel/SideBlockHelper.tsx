import { RenderSelectActionBar, RenderSideActionBar, RenderSourcePanel } from "@root/src/utility/ui/floating_panel";
import { useNoteFocusStore } from "./note_zustand";
import { MouseHelper } from "@root/src/utility/ui/mouse_helper";
import { Combine_API } from "@root/src/utility/static_utility";
import { NoteBlockType, NotePageType, GetEmptyNoteBlock, NoteKeywordType, NoteParagraphType } from "@root/src/utility/note_data_struct";
import { API, Color } from "@root/src/utility/static_data";
import StorageModel from "./storge_model";
import {v4 as uuidv4} from 'uuid';
import { Editor } from "slate";
import { SlateUtility } from "@root/src/utility/slate_editor/slate_utility";
import trash_can_svg from '@assets/img/trash-can.svg';

export class SideBlockHelper {
    floatSourcePanel: RenderSourcePanel;
    floatActionbar: RenderSideActionBar;
    selectActionBar: RenderSelectActionBar;

    insert_dict_action: (id: string, block: NoteBlockType) => void;
    update_dict_action: (id: string, index: number, block: NoteBlockType) => void;
    delete_dict_action : (id: string, index: number) => void;

    storage: StorageModel;
    notePage: NotePageType;

    constructor(floatActionBar: RenderSideActionBar, renderSourcePanel: RenderSourcePanel, renderSelectActionBar : RenderSelectActionBar) {
        this.floatActionbar = floatActionBar;
        this.floatSourcePanel = renderSourcePanel;
        this.selectActionBar = renderSelectActionBar;
    }

    set_parameter(notePage: NotePageType, storage: StorageModel) {
        this.storage = storage;
        this.notePage = notePage;
    }

    set_callback(
                insert_dict_action: (id: string, block: NoteBlockType) => void,
                update_dict_action: (id: string, index: number, block: NoteBlockType) => void, 
                delete_dict_action : (id: string, index: number) => void   
    ) {
        this.insert_dict_action = insert_dict_action;
        this.update_dict_action = update_dict_action;
        this.delete_dict_action = delete_dict_action;
    }

    get_block (block_id: string) {
        let block_index = this.notePage?.blocks.findIndex(x=>x._id == block_id);
        if (this.notePage == null || block_index == undefined || block_index < 0) return;

        return this.notePage.blocks[block_index];
    }

    change_block_value(block_id: string, operation: (block: NoteBlockType) => NoteBlockType) {
        let note_page = this.notePage;

        if (note_page == null) return;

        let block_index = note_page.blocks.findIndex(x=>x._id == block_id);
        
        if (block_index == undefined || block_index < 0) return;

        let new_block = operation(note_page.blocks[block_index]);
        new_block.version++;

        this.update_dict_action(this.notePage._id, block_index, new_block);

        //UpdateNotionBlock(test_account_id, notePage);
    }

    change_paragraph_value = function(note_block: NoteBlockType, keyword_id: string, editor: Editor, callabck: (p: NoteParagraphType) => NoteParagraphType) {
        this.change_block_value(note_block._id, (block: NoteBlockType) => {
            let delete_key_word_row = SlateUtility.paragraph_operation(note_block.row, (p) => {
    
                if (p._id == keyword_id) {
                    p = callabck(p);
                }
    
                return p;
            });
    
            editor.children = delete_key_word_row;
    
            let new_block = {...block};
                new_block = {...new_block, row: delete_key_word_row}
    
            return new_block;
        });
    }

    delete_block(index: number) {
        if (this.notePage == null) return;

        this.delete_dict_action(this.notePage._id, index);
    }

    add_new_row() {
        if (this.notePage == null) return;
    
        let new_block = GetEmptyNoteBlock();
        new_block._id = uuidv4();

        this.insert_dict_action(this.notePage._id, new_block);
    }
}

export const UpdateNotionBlock = function(user_id: string, note_page: NotePageType) {
    let url = Combine_API(API.PostNoteBlock);
    
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_id: user_id,
            note_page: note_page
        })
    });
}



const hover_keyword_tag = function(keyword_id: string, is_hover: boolean, hover_color: string) {
    let target_dom : HTMLElement = document.getElementById(keyword_id.substring(0, 5));

    if (target_dom != undefined) {
        target_dom.style.background = hover_color;
        target_dom.style.color = (is_hover) ?  "white" : "black";

        // target_dom.style.background = (is_hover) ?  Color.DarkOrange : Color.LightYellow;
        // target_dom.style.color = (is_hover) ?  "white" : "black";
    }
}

export const GenerateKeywordDOM = function(keyword: NoteKeywordType, delete_keyword_action: (key: string) => void) {
    return (<div className='keyword_comp' key={keyword._id}
    
    onClick={() => {
        delete_keyword_action(keyword._id);
    }} 
    
    onPointerEnter={() => {
        hover_keyword_tag(keyword._id, true, Color.DarkOrange);
    }}

    onPointerLeave={() => {
        hover_keyword_tag(keyword._id, false, Color.ShallowGreen);
    }}>
        {keyword.text}
    </div> );
}

export const GenerateValidationDOM = function(keyword: NoteKeywordType,
                                                on_keyword_validate: (key: string, validate: boolean) => void,
                                                delete_keyword_action: (key: string) => void) 
{
    return (<div className='validation_comp' key={keyword._id} data-key={keyword._id}
            style={{backgroundColor: (keyword.validation.is_validated) ? Color.ShallowRed : Color.ShallowOrange}}
    
    onClick={(e) => {
        //delete_keyword_action(keyword._id);
    }} 

    onContextMenu={(e) => {
        //e.preventDefault();
    }}
    
    onPointerEnter={() => {
        hover_keyword_tag(keyword._id, true, Color.DarkOrange);
    }}

    onPointerLeave={() => {
        hover_keyword_tag(keyword._id, false, Color.ShallowOrange);
    }}>

    <div className="context_wrapper"><button onClick={() => delete_keyword_action(keyword._id)}>X</button></div>

    <label className="checkbox">

        <input type="checkbox" onChange={(e) => 
            {
                let target_dom : HTMLElement = document.querySelector(`div[data-key="${keyword._id}"]`);
                target_dom.style.background = (e.target.checked) ? Color.ShallowRed : Color.ShallowOrange;

                on_keyword_validate(keyword._id, e.target.checked);
            }
        }
        checked={keyword.validation.is_validated}
        ></input>
        {keyword.text}
    </label>
    </div> );
}
