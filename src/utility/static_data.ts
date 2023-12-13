import {Combine_Path} from './static_utility';

export const SUBJECT_LAW_LEARNING = "SUBJECT_LAW_LEARNING";

export const CoockieTable = Object.freeze({
    Procedural_Language_Code : "procedural_language_code",
    UserID : "user_id",
});

export const LocalStorageTable = Object.freeze({
    Account : "account",
});

export const EventID = Object.freeze({
    MouseDown : "event@mouse_down",
});

export const NoteSourceIcon = Object.freeze({
    BingAI : "texture/notes/bing-ai-icon.png",
    ChatGPT : "texture/notes/chatgpt-icon.png",
    Claude : "texture/notes/claude-ai-icon.png",
    Bard : "texture/notes/google-bard-icon.png",
});

export const API = Object.freeze({
    GetHotTopicList : "hottopics_list",
    GetHotTopicItem: "hottopics_item/{0}",
    GetNoteList: "note_list/{0}/{1}",
    GetNoteBlock: "note_block/{0}",

    PostNoteBlock: "create_or_update_note_page",
});

export const Domain = Object.freeze({
    Dev : "http://localhost:8032/",
    Prod : "https://yuri-api.sytes.net/vaiue/",
});