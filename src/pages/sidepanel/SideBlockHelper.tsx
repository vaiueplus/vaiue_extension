import { RenderSideActionBar, RenderSourcePanel } from "@root/src/utility/ui/floating_panel";
import { useNoteFocusStore } from "./note_zustand";
import { MouseHelper } from "@root/src/utility/ui/mouse_helper";
import { Combine_API } from "@root/src/utility/static_utility";
import { NoteBlockType, NotePageType } from "@root/src/utility/note_data_struct";
import { API } from "@root/src/utility/static_data";

export class SideBlockHelper {
    floatSourcePanel: RenderSourcePanel;
    floatActionbar: RenderSideActionBar;
    update_dict_action: (id: string, index: number, block: NoteBlockType) => void;
    delete_dict_action : (id: string, index: number) => void;

    constructor(floatActionBar: RenderSideActionBar, renderSourcePanel: RenderSourcePanel) {
        this.floatActionbar = floatActionBar;
        this.floatSourcePanel = renderSourcePanel;
    }

    setCallback(update_dict_action: (id: string, index: number, block: NoteBlockType) => void, 
                delete_dict_action : (id: string, index: number) => void   
    ) {
        this.update_dict_action = update_dict_action;
        this.delete_dict_action = delete_dict_action;
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