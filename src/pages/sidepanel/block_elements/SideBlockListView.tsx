import { NoteBlockType, NotePageType } from "@root/src/utility/note_data_struct";
import { SelectionActionsCallback } from "@root/src/utility/slate_editor/slate_note_content";
import { Editor } from "slate";
import { BlockSlateContent } from "./SideBlockView";
import { Fragment } from "react";

export const BlockSlateContents = function(
    {note_page, focus_event, on_keyword_validate, on_keyword_delete, on_slate_title_change, on_action_bar_click, on_selection_bar_event} : 
    {   note_page: NotePageType,
        focus_event: (id: string, index: number, is_focus: boolean, editor: Editor) => void,
        on_keyword_validate(note_block: NoteBlockType, keyword_id: string, validate: boolean, editor: Editor),
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
        focus_event={focus_event}
        on_keyword_validate={on_keyword_validate}
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