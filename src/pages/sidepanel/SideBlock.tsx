import '@pages/sidepanel/SideNote.scss';
import '@pages/sidepanel/SlateStyle.scss';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { FloatActionBarState, UserSSO_Struct } from '@src/utility/data_structure';
import { useEffect } from 'react';
import { GetEmptyNoteBlock, GetEmptyNotePage, NoteBlockType, NotePageType, NoteRowType } from '@root/src/utility/note_data_struct';
import { useNoteDictStore, useNoteFocusStore } from './note_zustand';
import {v4 as uuidv4} from 'uuid';
import { Combine_API, FormatString } from '@root/src/utility/static_utility';
import { API } from '@root/src/utility/static_data';
import { MouseHelper } from '@root/src/utility/ui/mouse_helper';
import { Fragment } from 'react';
import RenderSlateContent from '@root/src/utility/slate_editor/slate_note_content';
import { RenderSideActionBar, RenderSourcePanel, ShowFloatingBoard } from '@root/src/utility/ui/floating_panel';
import { Link, useParams } from 'react-router-dom';
import StorageModel from './storge_model';
import React from 'react';
import { memo } from 'react';
import { ReactNode } from 'react';
import { SideBlockHelper } from './SideBlockHelper';
import { BaseRange, Descendant } from 'slate';
import { SlateUtility } from '@root/src/utility/slate_editor/slate_utility';

let floatActionbar = new RenderSideActionBar()
let floatSourcePanel = new RenderSourcePanel()
const sideBlockHelper = new SideBlockHelper(floatActionbar, floatSourcePanel);


const SideBlock = ({storage} : {storage: StorageModel}) => {
    let { page_id } = useParams();

    const insert_block_action = useNoteDictStore((state) => state.insert_block);
    const update_block_action = useNoteDictStore((state) => state.update_block);
    const delete_block_action = useNoteDictStore((state) => state.delete_block);

    let notes_dict = useNoteDictStore((state) => state.notes_dict);
    let noteFullPage = notes_dict[page_id];

    sideBlockHelper.set_callback(insert_block_action, update_block_action, delete_block_action);
    sideBlockHelper.set_parameter(noteFullPage, storage);

    storage.save_note_to_background(noteFullPage);

    // //OnDestroy
    useEffect(() => {
        let mouse_helper = new MouseHelper();
        mouse_helper.register_mouse_down((pos) => {
            floatSourcePanel.mouse_down_event(pos);
            floatActionbar.mouse_down_event(pos);
        });

        return () => {
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
            console.log("Concat " + concat);

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
        if (state == FloatActionBarState.AI_Source) {
            ShowFloatingBoard(floatSourcePanel, MouseHelper.x, MouseHelper.y);
            floatActionbar.show(false);
        }
    }

    const on_selection_action = function(block_index: number, range: BaseRange, selected_descendents: Descendant[], whole_descendents: Descendant[]) {
        let block_id = noteFullPage.blocks[block_index]._id;
        const new_keyword_rows = SlateUtility.create_highLight_rows(noteFullPage.blocks[block_index].row, range, selected_descendents, whole_descendents);

        if (new_keyword_rows == undefined) return undefined;

        sideBlockHelper.change_block_value(block_id, (block: NoteBlockType) => {
            let new_block = {...block};

                console.log("sideBlockHelper.change_block_value");

                new_block.row = new_keyword_rows
                new_block.version++;

                console.log(new_block);

            return new_block;
        });

        return new_keyword_rows;
    }

    const on_source_link_set = function(id: string, link: string) {
        sideBlockHelper.change_block_value(id, (block: NoteBlockType) => {
            let new_block = {...block};
                new_block = {...new_block, source: link}

            return new_block;
        });
    }
//#endregion



const add_new_row = function() {    
    sideBlockHelper.add_new_row();
}

return (
    <div className="preview-comp">
        <Link className='button' to="/">Back</Link>
        <h2>{noteFullPage.title}</h2>

        <BlockSlateContents note_page={noteFullPage} 
            on_selection_action={on_selection_action}
            on_slate_title_change={on_slate_title_change} on_action_bar_click={on_action_bar_click}>
        </BlockSlateContents>

        <button className="button is-primary is-light" onClick={add_new_row}>Add+</button>
        { floatSourcePanel.render() }
        { floatActionbar.render() }
    </div>
);
}

const BlockSlateContents = function(
        {note_page, on_slate_title_change, on_action_bar_click, on_selection_action} : 
        {   note_page: NotePageType,
            // children?: ReactNode ,
            on_selection_action: (block_index:number, range: BaseRange, selected_descendents: Descendant[], whole_descendents: Descendant[]) => NoteRowType[],
            on_slate_title_change: (id: string, index: number, value: any[]) => void,
            on_action_bar_click: (id: string) => void
        }
    ) {
    if (note_page == undefined) return <div></div>

    let initValue : React.JSX.Element[] = []; 

    return (
        <div>
            <div key={note_page.blocks[0]._id} className="note-block-comp">
                <RenderSlateContent index={0} version={note_page.blocks[0].version} id={note_page.blocks[0]._id} default_data={note_page.blocks[0].row}
                readOnly={false} placeholder_text="Topic . . ."
                selection_event={on_selection_action}
                finish_edit_event={on_slate_title_change} action_bar_event={(id) => {}}></RenderSlateContent>
            </div>

            <Fragment>
            {
                note_page.blocks.reduce((array, x, index) => {
                    if (index == 0) return array;

                    array.push(
                        <BlockSlateContent note_block={x} version={x.version} index={index} key={x._id}
                        on_selection_action={on_selection_action}
                        on_slate_title_change={on_slate_title_change}
                        on_action_bar_click={on_action_bar_click}
                        />
                    );

                    return array;
                }, initValue)
            }
            
            </Fragment>
        </div>
    )
};


const BlockSlateContent = memo(function({ note_block, version, index, on_slate_title_change, on_action_bar_click, on_selection_action}: 
    {   note_block: NoteBlockType, version: number, index: number,
        on_selection_action: (block_index:number, range: BaseRange, selected_descendents: Descendant[], whole_descendents: Descendant[]) => NoteRowType[],
        on_slate_title_change: (id: string, index: number, value: any[]) => void,
        on_action_bar_click: (id: string) => void
    }) {
        return (
            <div className="note-block-comp">
                <RenderSlateContent id={note_block._id} default_data={note_block.row} index={index} version={version}
                readOnly={false} 
                finish_edit_event={on_slate_title_change} 
                action_bar_event={on_action_bar_click}
                selection_event={on_selection_action}
                placeholder_text="Text from gpt"></RenderSlateContent>
            </div>
        )
}, (prev, next) => {
    return prev.version == next.version;
});

export default withErrorBoundary(withSuspense(SideBlock, <div> Loading ... </div>), <div> Error Occur </div>);