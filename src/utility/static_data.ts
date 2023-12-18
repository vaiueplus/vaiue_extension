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
    MouseUp : "event@mouse_up",
    Scroll : "event@scroll",
    Resize : "event@resize",
    PageChange : "event@changes",

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

export const MessageSender = Object.freeze({
    Tab : 0,
    SidePanel: 1,
    Background: 2
});

export const MessageID = Object.freeze({
    ContentPaste : 1,
    NoteUpdate: 2
});

export const StorageID = Object.freeze({
    Notes : "notes"
});

export const DBAction = Object.freeze({
    Create: 0,
    Insert: 1,
    Update : 2,
    Delete: 3
});