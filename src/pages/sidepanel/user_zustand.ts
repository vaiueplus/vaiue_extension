import { UserInfo } from "@root/src/utility/static_data_type";
import { produce } from "immer";
import {create} from 'zustand';

type UserInfoZusStore = {
    user_info: UserInfo | null,
    set_user: (info: UserInfo | null) => void,
    is_login: () => boolean,
}

export const useUserInfoStore = create<UserInfoZusStore>( (set, get) => ({
    user_info: null,

    set_user(info: UserInfo) {
        set( produce( (state : UserInfoZusStore) => {
            state.user_info = info;
        }));
    },

    is_login() {
        return get().user_info != null;
    }
}));

