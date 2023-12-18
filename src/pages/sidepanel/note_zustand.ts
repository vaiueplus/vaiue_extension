import { List , Map } from 'immutable';
import {create} from 'zustand';
import { NoteBlockType, NoteRowType, NotePageType } from '@src/utility/note_data_struct';

export type NotePageZusStore = {
    notes_dict: Map <string, NotePageType>,
    notes_array: List<string>,

    get: (id: string) => NotePageType | undefined,

    //Page
    set: (note: NotePageType) => void,
    set_array: (notes: NotePageType[]) => void,

    //Block
    set_block:(note_id:string, index: number, NoteBlockType) => void,

    //Removal
    remove: (id: string) => void,
    removeAll: () => void,
    delete_block:(note_id:string, index: number) => void,
}

// Who is currently pick
type NoteFocusZusStore = {
    note_id: string,
    set_id: (id: string | undefined) => void,
    is_valid: () => boolean,
}

export const useNoteDictStore = create<NotePageZusStore>( (set, get) => ({
    notes_dict: Map<string, NotePageType>(),
    notes_array: List<string>(),

    get(id) {
        return get().notes_dict.get(id);
    },


    //Note Page
    set_array(notes: NotePageType[]) {
        set(state => {
            return (form_note_store(notes)) 
        });
    },
    
    set(note: NotePageType) {
        set(state => {

            if (state.notes_dict.has(note._id)) {
                return ({ notes_dict: state.notes_dict.set(note._id, note) }) ;
            }   
            

            return ({notes_dict: state.notes_dict.set(note._id, note), notes_array: state.notes_array.push(note._id) }) 
        });
    },

    //Note Block
    set_block(note_id:string, index: number, NoteBlockType)  {

    },

    //Removal
    remove(id) {
        set(state => {
            let index = state.notes_array.findIndex(x=>x == id);
            return ({notes_dict: state.notes_dict.remove(id), notes_array: state.notes_array.delete(index)}) 
        });
    },

    removeAll: () => {
        set( state => ({ notes_dict: state.notes_dict.clear(), notes_array: state.notes_array.clear() }) );
    },

    delete_block(note_id:string, index: number) {

    },
}));

export const useNoteFocusStore = create<NoteFocusZusStore>(
    (set, get) => ({
    note_id: "",
    set_id: (id: string | undefined) => {
        if(id == undefined) return;
        if(get().note_id == id) return;

        set( () => {
            return ({...get(), note_id: id}) 
        });
    },
    is_valid: () => get().note_id != undefined && get().note_id != ""
}));


export const form_note_store = function(notes: NotePageType[]) {
    let cache_dict = Map<string, NotePageType>();
    let cache_array = List<string>();

    for (let n of notes) {
        cache_dict = cache_dict.set(n._id, n);
        cache_array = cache_array.push(n._id);
    }

    return ({notes_dict: cache_dict, notes_array: cache_array}) 
}