import withErrorBoundary from "@root/src/shared/hoc/withErrorBoundary";
import withSuspense from "@root/src/shared/hoc/withSuspense";
import RenderSlateContent, { SelectionActionsCallback, withImages } from "@root/src/utility/slate_editor/slate_note_content";
import SideBlock from "../SideBlock";
import { Fragment, memo, useMemo  } from "react";
import { Link } from "react-router-dom";
import { GenerateKeywordDOM, GenerateValidationDOM } from "../SideBlockHelper";
import { GetDomain } from "@root/src/utility/static_utility";
import { SlateUtility } from "@root/src/utility/slate_editor/slate_utility";
import { withHistory } from "slate-history";
import { withReact } from "slate-react";
import { Editor, createEditor } from "slate";
import { NoteBlockType } from "@root/src/utility/note_data_struct";

export const BlockSlateContent = memo(function({ note_block, version, index, on_keyword_validate, on_keyword_delete, on_slate_title_change, on_action_bar_click, on_selection_bar_event}: 
    {   note_block: NoteBlockType, version: number, index: number,
        on_keyword_validate(note_block: NoteBlockType, keyword_id: string, validate: boolean, editor: Editor),
        on_keyword_delete: (note_block: NoteBlockType, keyword_id: string, editor: Editor) => void,
        on_slate_title_change: (id: string, index: number, value: any[]) => void,
        on_action_bar_click: (id: string) => void,
        on_selection_bar_event: (keyword_action: SelectionActionsCallback) => void,
    }) {
        const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), []);
        let keywords = SlateUtility.get_keyword_tags(note_block.row);
        let keyword_dom = [];

        const delete_keyword_action = function(key: string) {
            on_keyword_delete(note_block, key, editor);
        }

        const validate_keyword_action = function(key: string, validate: boolean) {
            on_keyword_validate(note_block, key, validate, editor);
        }

        for (let value of keywords.values()){
            if (value.validation == undefined)
                keyword_dom.push( GenerateKeywordDOM(value, delete_keyword_action));
            else 
                keyword_dom.push( GenerateValidationDOM(value, validate_keyword_action, delete_keyword_action));
        }

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