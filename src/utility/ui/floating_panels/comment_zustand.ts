import { UserInfo } from "@root/src/utility/static_data_type";
import { produce } from "immer";
import {create} from 'zustand';
import { NoteCommentsType } from "../../note_data_struct";

type CommentZusStore = {
    comment_index: number,
    comment_flag: boolean,
    comments: NoteCommentsType[],
    option_idex: number,

    set_option_index: (index: number) => void,
    set_comment_index: (index: number) => void,
    set_comment_flag: (flag: boolean) => void,
    set_comments: (comments: NoteCommentsType[]) => void,
}

export const useCommentStore = create<CommentZusStore>( (set, get) => ({
    option_idex: -1,

    comment_index: 0,
    comment_flag: false,
    comments: [],

    set_option_index(index: number) {
        set( produce( (state : CommentZusStore) => {
            state.option_idex = index;
        }));
    },

    set_comment_index(index: number) {
        set( produce( (state : CommentZusStore) => {
            state.comment_index = index;
        }));
    },

    set_comment_flag(flag: boolean) {
        set( produce( (state : CommentZusStore) => {
            state.comment_flag = flag;
        }));
    },

    set_comments(comments: NoteCommentsType[]) {
        set( produce( (state : CommentZusStore) => {
            state.comments = comments;
        }));
    }
}));

