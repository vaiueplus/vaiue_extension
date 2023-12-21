import { RenderSideActionBar, RenderSourcePanel } from "@root/src/utility/ui/floating_panel";
import { useNoteFocusStore } from "./note_zustand";
import { MouseHelper } from "@root/src/utility/ui/mouse_helper";
import { Combine_API } from "@root/src/utility/static_utility";
import { NoteBlockType, NotePageType, GetEmptyNoteBlock, GetEmptyNotePage } from "@root/src/utility/note_data_struct";
import { API } from "@root/src/utility/static_data";
import StorageModel from "./storge_model";
import {v4 as uuidv4} from 'uuid';

export class SideBlockHelper {
    floatSourcePanel: RenderSourcePanel;
    floatActionbar: RenderSideActionBar;

    insert_dict_action: (id: string, block: NoteBlockType) => void;
    update_dict_action: (id: string, index: number, block: NoteBlockType) => void;
    delete_dict_action : (id: string, index: number) => void;

    storage: StorageModel;
    notePage: NotePageType;

    constructor(floatActionBar: RenderSideActionBar, renderSourcePanel: RenderSourcePanel) {
        this.floatActionbar = floatActionBar;
        this.floatSourcePanel = renderSourcePanel;
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

        this.update_dict_action(this.notePage._id, block_index, new_block);

        //UpdateNotionBlock(test_account_id, notePage);
    }

    delete_block(index: number) {
        if (this.notePage == null) return;

        this.delete_dict_action(this.notePage._id, index);
    }

    add_new_row() {
        if (this.notePage == null) return;
    
        let new_block = GetEmptyNoteBlock();
        new_block._id = uuidv4();

        console.log("add_new_row");

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