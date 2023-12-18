import { List , Map } from 'immutable';
import {create} from 'zustand';
import { NoteBlockType, NoteRowType, NotePageType } from '@src/utility/note_data_struct';
import {produce} from "immer"

export type NotePageZusStore = {
    notes_dict:  { [id: string] : NotePageType; },
    notes_array: string[],

    get: (id: string) => NotePageType | undefined,

    //Page
    set: (note: NotePageType) => void,
    set_array: (notes: NotePageType[]) => void,

    insert_block:(id: string, block: NoteBlockType) => void,

    //Removal
    remove: (id: string) => void,
    removeAll: () => void,
    delete_block:(note_id:string, index: number) => void,
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

    insert_block(id: string, block: NoteBlockType) {
        set( produce( (state : NotePageZusStore) => {
            state.notes_dict[id].blocks.push(block);
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

    delete_block(note_id:string, index: number) {

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