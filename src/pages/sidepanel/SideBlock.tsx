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
import { RenderSideActionBar, RenderSourcePanel } from '@root/src/utility/ui/floating_panel';
import { Link, useParams } from 'react-router-dom';
import StorageModel from './storge_model';
import { useMemo } from 'react';
import React from 'react';
import { memo } from 'react';

const SideBlock = ({storage} : {storage: StorageModel}) => {
    let { block_id } = useParams();

    let floatActionbar = new RenderSideActionBar()
    let floatSourcePanel = new RenderSourcePanel()
    const focus_note_id = useNoteFocusStore((state) => state.note_id);
    const focus_blocks = useNoteFocusStore((state) => state.blocks);

    //const note_dict = useNoteDictStore();

    const get_notes_dict = useNoteDictStore((state) => state.notes_dict);
    const get_note_by_id = useNoteDictStore((state) => state.get);

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
        let notePage = get_note_by_id(focus_note_id);
        let block_index = notePage?.blocks.findIndex(x=>x._id == block_id);
        if (notePage == null || block_index == undefined || block_index < 0) return;

        return notePage.blocks[block_index];
    }
    
    const change_block_value = function(block_id: string, operation: (block: NoteBlockType) => NoteBlockType) {
        let notePage = get_note_by_id(focus_note_id);
        let block_index = notePage?.blocks.findIndex(x=>x._id == block_id);
        
        if (notePage == null || block_index == undefined || block_index < 0) return;
        
        notePage.blocks[block_index] = operation(notePage.blocks[block_index]);

        //UpdateNotionBlock(test_account_id, notePage);
        //storage.save_note_to_background(notePage);
    }

    const delete_block = function(index: number) {
        let notePage = get_note_by_id(focus_note_id);
        if (notePage == null) return;


        let delete_blocks = notePage.blocks.splice(index, 1);
        //note_dict.set(notePage);
        storage.save_note_to_background(notePage);

        console.log(notePage.blocks);

        //UpdateNotionBlock(test_account_id, notePage);
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
        ShowFloatingBoard(floatActionbar);
        let block = get_block(id);

        if (block == null) return;

        floatActionbar.set_callback(id, on_action_bar_state_click);
        floatSourcePanel.set_callback(id, (block.source == null) ? "" : block.source, on_source_link_set);
    }

    const on_action_bar_state_click = function(block_id:string, state: FloatActionBarState) {
        if (state == FloatActionBarState.AI_Source) {
            ShowFloatingBoard(floatSourcePanel);
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
    let noteFullBlock = get_note_by_id(focus_note_id);
    if (noteFullBlock == null) return;

    let new_block = GetEmptyNoteBlock();
    new_block._id = uuidv4();
    noteFullBlock.blocks.push(new_block);

    storage.save_note_to_background(noteFullBlock);
}

  let noteFullBlock = get_notes_dict[focus_note_id];
return (
    <div className="preview-comp">
        <Link className='button' to="/">Back</Link>
        <h2>{noteFullBlock.title}</h2>

        <Render_slate_contents note_page={noteFullBlock} on_slate_title_change={on_slate_title_change} on_action_bar_click={on_action_bar_click} />

        <button className="button is-primary is-light" onClick={add_block}>Add+</button>
        { floatSourcePanel.render() }
        { floatActionbar.render() }
    </div>
);
}

const ShowFloatingBoard = function(floating: AbstractMovable) {
floating.show(true);
floating.set_position(MouseHelper.x, MouseHelper.y);
}

const UpdateNotionBlock = function(user_id: string, note_page: NotePageType) {
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


const get_block = function(note_id: string, block_id: string, get_note_callback:(id: string) => NotePageType | undefined) {
    let notePage = get_note_callback(note_id);
    let block_index = notePage?.blocks.findIndex(x=>x._id == block_id);
    if (notePage == null || block_index == undefined || block_index < 0) return;

    return notePage.blocks[block_index];
}

const Render_slate_contents = function(
        {note_page, on_slate_title_change, on_action_bar_click} : 
        {   note_page: NotePageType,
            on_slate_title_change: (id: string, index: number, value: any[]) => void,
            on_action_bar_click: (id: string) => void
        }
    ) {
    if (note_page == undefined) return <div></div>

    let initValue : React.JSX.Element[] = []; 

    const memoizedElement =  useMemo(() => {
            return note_page.blocks.reduce((array, x, index) => {
                if (index == 0) return array;

                array.push(
                    <Render_slate_content note_block={x} index={index} key={x._id}
                        on_slate_title_change={on_slate_title_change} on_action_bar_click={on_action_bar_click}/>
                );

                return array;
            }, initValue)

        }, [note_page.blocks]);

    return (
        <div>
            <div key={note_page.blocks[0]._id} className="note-block-comp">
                <RenderSlateContent index={0} id={note_page.blocks[0]._id} default_data={note_page.blocks[0].row}
                readOnly={false} placeholder_text="Topic . . ."
                finish_edit_event={on_slate_title_change} action_bar_event={(id) => {}}></RenderSlateContent>
            </div>

            <Fragment>
            {
                memoizedElement
            }
            </Fragment>
        </div>
    )
  };

const Render_slate_content = memo(function({ note_block, index, on_slate_title_change, on_action_bar_click }: 
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