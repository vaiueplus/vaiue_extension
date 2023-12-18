import { ExtensionMessageStruct } from '@root/src/utility/data_structure';
import { GetEmptyNotePage, NoteBlockType, NotePageType, NoteParagraphType, NoteRowType } from '@root/src/utility/note_data_struct';
import { MessageSender, MessageID, StorageID, DBAction } from '@root/src/utility/static_data';
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import Browser from 'webextension-polyfill';
import {v4 as uuidv4} from 'uuid';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

Browser.runtime.onInstalled.addListener(() => {
    console.log("installed");
});

Browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        try {
            let message : ExtensionMessageStruct = request;
            console.log(message);

            if (message.sender == MessageSender.Tab && message.id == MessageID.ContentPaste) 
                OnContentMessage(message.body);

            if (message.sender == MessageSender.SidePanel && message.id == MessageID.NoteUpdate) 
                OnSidePanelNoteMessage(message.body);


        } catch{

        }
    }
);

//#region Content Page
const OnContentMessage = async function(content: string) {
    let local_record = await GetLocalNotes();
    let message : ExtensionMessageStruct = { sender: MessageSender.Background, id: MessageID.ContentPaste };

    const s_block = GetSingleBlock(content);

    if (local_record.length <= 0) {
        let note : NotePageType = GetEmptyNotePage();
        note._id = uuidv4();
        note.blocks = [s_block];
        note.title = "Note #1";
        note.date = new Date().toDateString();

        local_record = [note];

        message.action = DBAction.Create;
        message.body = local_record;

    } else {
        local_record[0].blocks.push(s_block);

        message.action = DBAction.Insert;
        message.body = {id: local_record[0]._id, block: s_block};
    }

    Browser.runtime.sendMessage(message);
    Browser.storage.local.set({notes: local_record});
}
//#endregion

//#region Side Panel
const OnSidePanelNoteMessage = async function(content: any) {
    const action : number = content.action;
    console.log(content);
    if (action == DBAction.Update)
        UpdateSidePanelNote(content.item);

    if (action == DBAction.Delete)
        DeleteSidePanelNote(content.item);
}

const UpdateSidePanelNote = async function(note_page: NotePageType) {
    let local_notes = await GetLocalNotes();
    let index = local_notes.findIndex(x=>x._id == note_page._id);

    if (index >= 0)
        local_notes[index] = note_page;
    else
        local_notes.push(note_page);

    Browser.storage.local.set({notes: local_notes}); 
}

const DeleteSidePanelNote = async function(note_id: string) {
    let local_notes = await GetLocalNotes();
    let index = local_notes.findIndex(x=>x._id == note_id);

    if (index >= 0)
        local_notes.splice(index, 1);

    Browser.storage.local.set({notes: local_notes}); 
}
//#endregion

//#region  Utility
const GetLocalNotes = async function() {
    let local_record = await Browser.storage.local.get(StorageID.Notes);
    let notes: NotePageType[] = [];

    if (StorageID.Notes in local_record) {
        notes = local_record[StorageID.Notes];
    }

    return notes;
}

const GetSingleBlock = function(content: string) {
    let block : NoteBlockType = {
        _id: uuidv4(),
        row: [GetSingleRow(content)]
    }

    return block;
}

const GetSingleRow = function(content: string) {
    let modified_paragraph : NoteParagraphType = { text: "Hello world", keyword: true, bold: true }

    let row : NoteRowType = {
        type: "paragraph",
        children: [{ text: content }, modified_paragraph]
    };

    return row;
}

//#endregions