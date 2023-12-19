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
import { useState } from 'react';
import { AbstractMovable } from '@root/src/utility/ui/movable_view';
import { MouseHelper } from '@root/src/utility/ui/mouse_helper';
import { Fragment } from 'react';
import RenderSlateContent from '@root/src/utility/slate_editor/slate_note_content';
import { RenderSideActionBar, RenderSourcePanel, ShowFloatingBoard } from '@root/src/utility/ui/floating_panel';
import { Link, useParams } from 'react-router-dom';
import StorageModel from './storge_model';
import { useMemo } from 'react';
import React from 'react';
import { memo } from 'react';
import { ReactNode } from 'react';
import { SideBlockHelper } from './SideBlockHelper';

let floatActionbar = new RenderSideActionBar()
let floatSourcePanel = new RenderSourcePanel()
const sideBlockHelper = new SideBlockHelper(floatActionbar, floatSourcePanel);


const SideBlock = ({storage} : {storage: StorageModel}) => {
    let { page_id } = useParams();

    const insert_block_action = useNoteDictStore((state) => state.insert_block);
    const update_block_action = useNoteDictStore((state) => state.update_block);
    const delete_block_action = useNoteDictStore((state) => state.delete_block);
    sideBlockHelper.setCallback(update_block_action, delete_block_action);

    const get_notes_dict = useNoteDictStore((state) => state.notes_dict);
    let noteFullPage = get_notes_dict[page_id];

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

    const get_block = function(block_id: string) {
        let notePage = noteFullPage;
        let block_index = notePage?.blocks.findIndex(x=>x._id == block_id);
        if (notePage == null || block_index == undefined || block_index < 0) return;

        return notePage.blocks[block_index];
    }
    
    const change_block_value = function(block_id: string, operation: (block: NoteBlockType) => NoteBlockType) {
        let notePage = noteFullPage;
        let block_index = notePage?.blocks.findIndex(x=>x._id == block_id);
        
        if (notePage == null || block_index == undefined || block_index < 0) return;
        
        notePage.blocks[block_index] = operation(notePage.blocks[block_index]);
        update_block_action(noteFullPage._id, block_index, notePage.blocks[block_index]);

        //UpdateNotionBlock(test_account_id, notePage);
        storage.save_note_to_background(notePage);
    }

    const delete_block = function(index: number) {
        let notePage = noteFullPage;
        if (notePage == null) return;

        delete_block_action(noteFullPage._id, index);
        storage.save_note_to_background(notePage);
    }

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

            delete_block(index);
            return;
        }
        
        change_block_value(id, (block: NoteBlockType) => {
            block.row = paragraph;
            return block;
        });
    }

    const on_action_bar_click = function(id: string) {
        ShowFloatingBoard(floatActionbar, MouseHelper.x, MouseHelper.y);
        let block = get_block(id);

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

    const on_source_link_set = function(id: string, link: string) {
        change_block_value(id, (block: NoteBlockType) => {
            block.source = link;
            return block;
        });
    }
//#endregion

const add_block = function() {
    add_new_row();
}

const add_new_row = function() {
    let noteFullBlock = noteFullPage;
    if (noteFullBlock == null) return;

    let new_block = GetEmptyNoteBlock();
    new_block._id = uuidv4();
    insert_block_action(noteFullBlock._id, new_block);
}

return (
    <div className="preview-comp">
        <Link className='button' to="/">Back</Link>
        <h2>{noteFullPage.title}</h2>

        <BlockSlateContents note_page={noteFullPage} on_slate_title_change={on_slate_title_change} on_action_bar_click={on_action_bar_click}>
        </BlockSlateContents>

        <button className="button is-primary is-light" onClick={add_block}>Add+</button>
        { floatSourcePanel.render() }
        { floatActionbar.render() }
    </div>
);
}

const BlockSlateContents = function(
        {note_page, on_slate_title_change, on_action_bar_click} : 
        {   note_page: NotePageType,
            // children?: ReactNode ,
            on_slate_title_change: (id: string, index: number, value: any[]) => void,
            on_action_bar_click: (id: string) => void
        }
    ) {
    if (note_page == undefined) return <div></div>

    let initValue : React.JSX.Element[] = []; 

    return (
        <div>
            <div key={note_page.blocks[0]._id} className="note-block-comp">
                <RenderSlateContent index={0} id={note_page.blocks[0]._id} default_data={note_page.blocks[0].row}
                readOnly={false} placeholder_text="Topic . . ."
                finish_edit_event={on_slate_title_change} action_bar_event={(id) => {}}></RenderSlateContent>
            </div>

            <Fragment>
            {
                note_page.blocks.reduce((array, x, index) => {
                    if (index == 0) return array;

                    array.push(
                        <BlockSlateContent note_block={x} index={index} key={x._id}
                            on_slate_title_change={on_slate_title_change} on_action_bar_click={on_action_bar_click}/>
                    );

                    return array;
                }, initValue)
            }
            
            </Fragment>
        </div>
    )
};

const BlockSlateContent = memo(function({ note_block, index, on_slate_title_change, on_action_bar_click }: 
    {note_block: NoteBlockType,
    index: number,
    on_slate_title_change: (id: string, index: number, value: any[]) => void,
    on_action_bar_click: (id: string) => void
    }) {
        return (
            <div key={note_block._id} className="note-block-comp">
                <RenderSlateContent id={note_block._id} default_data={note_block.row} index={index}
                readOnly={false} 
                finish_edit_event={on_slate_title_change} 
                action_bar_event={on_action_bar_click}
                placeholder_text="Text from gpt"></RenderSlateContent>
            </div>
        )
}, (prev, next) => prev.note_block.version == next.note_block.version);

export default withErrorBoundary(withSuspense(SideBlock, <div> Loading ... </div>), <div> Error Occur </div>);