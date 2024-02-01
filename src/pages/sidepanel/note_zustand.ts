import { List , Map } from 'immutable';
import {create} from 'zustand';
import { NoteBlockType, NoteRowType, NotePageType } from '@src/utility/note_data_struct';
import {produce} from "immer"
import { Clamp } from '@root/src/utility/static_utility';

export type NotePageZusStore = {
    notes_dict:  { [id: string] : NotePageType; },
    notes_array: string[],

    get: (id: string) => NotePageType | undefined,

    //Page
    set: (note: NotePageType) => void,
    set_array: (notes: NotePageType[]) => void,
    offset:(id:string, block_id: string, offset: number) => void,

    insert_block:(id: string, index: number, block: NoteBlockType) => void,
    append_block:(id: string, block: NoteBlockType) => void,
    update_block:(id: string, index: number, block: NoteBlockType) => void,
    delete_block:(id:string, index: number) => void,
    delete_block_by_id: (id:string, block_id: string) => void,

    //Removal
    remove: (id: string) => void,
    removeAll: () => void,
}

// Who is currently pick
type NoteFocusZusStore = {
    note_id: string,
    blocks: NoteBlockType[],
    set_id: (id: string | undefined) => void,

    insert_block:(block: NoteBlockType) => void,

    is_valid: () => boolean,
}

export const useNoteDictStore = create<NotePageZusStore>( (set, get) => ({
    notes_dict: {},
    notes_array: [],

    get(id) {
        return get().notes_dict[id];
    },

    //Note Page
    set_array(notes: NotePageType[]) {
        set(state => {
            return (form_note_store(notes)) 
        });
    },
    
    set(note: NotePageType) {
        set( produce( (state : NotePageZusStore) => {

            if (!(note._id in state.notes_dict)) {
                state.notes_array.push(note._id);
            }

            state.notes_dict[note._id] = note;
        }));
    },
    
    offset(id, block_id, offset) {
        set( produce( (state : NotePageZusStore) => {
            let note = state.notes_dict[id];
            let index = note.blocks.findIndex(x => x._id == block_id);
            let block = note.blocks[index];

            let new_index = Clamp(index + offset, 0, note.blocks.length - 1);

            note.blocks.splice(index, 1);
            note.blocks.splice(new_index, 0, block);

            state.notes_dict[id].blocks = note.blocks;
        })); 
    },

    append_block(id: string, block: NoteBlockType) {
        set( produce( (state : NotePageZusStore) => {
            state.notes_dict[id].blocks.push(block);
        }));
    },

    insert_block(id: string, index: number, block: NoteBlockType) {
        //If out of index
        const note_block = get().notes_dict[id];
        if (index >= note_block.blocks.length) {
            get().append_block(id, block);
            return;
        }

        set( produce( (state : NotePageZusStore) => {
            state.notes_dict[id].blocks.splice(index, 0, block);
        }));
    },

    update_block(id: string, index: number, block: NoteBlockType) {
        //If out of index
        const note_block = get().notes_dict[id];
        if (index >= note_block.blocks.length) {
            get().append_block(id, block);
            return;
        }

        set( produce( (state : NotePageZusStore) => {
            state.notes_dict[id].blocks[index] = (block);
        }));
    },

    delete_block(id:string, index: number) {
        set( produce( (state : NotePageZusStore) => {
            state.notes_dict[id].blocks.splice(index, 1);
        }));
    },

    delete_block_by_id(id:string, block_id: string) {
        set( produce( (state : NotePageZusStore) => {
            let index = state.notes_dict[id].blocks.findIndex(x=>x._id == block_id);
            state.notes_dict[id].blocks.splice(index, 1);
        }));
    },

    //Removal
    remove(id) {
        set(produce( (state : NotePageZusStore) => {
            let index = state.notes_array.findIndex(x=>x == id);
            delete state.notes_dict[id];
            state.notes_array.splice(index, 1);
        }));
    },

    removeAll: () => {
        set( state => ({ 
            notes_dict: {}, 
            notes_array: [] 
        }) );
    },

}));

export const useNoteFocusStore = create<NoteFocusZusStore>(
    (set, get) => ({
    note_id: "",
    blocks: [],

    set_id: (id: string | undefined) => {
        if(id == undefined) return;
        if(get().note_id == id) return;

        set( () => {
            return ({...get(), note_id: id}) 
        });

        
    },

    //Note Block
    insert_block(block: NoteBlockType)  {
        set(produce((state: NoteFocusZusStore)  => {
            state.blocks.push(block);
        })); 
    },

    is_valid: () => get().note_id != undefined && get().note_id != ""
}));


export const form_note_store = function(notes: NotePageType[]) {
    let cache_dict :  { [id: string] : NotePageType; } = {};
    let cache_array : string[]= [];

    for (let n of notes) {
        cache_dict[n._id] = n;
        cache_array.push(n._id);
    }

    return ({notes_dict: cache_dict, notes_array: cache_array}) 
}