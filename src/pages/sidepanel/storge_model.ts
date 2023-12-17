import { DBAction, MessageID, MessageSender, StorageID } from "@root/src/utility/static_data";
import Browser from "webextension-polyfill";
import { form_note_store, useNoteDictStore } from "./note_zustand";
import { NotePageType } from "@root/src/utility/note_data_struct";
import { ExtensionMessageStruct } from "@root/src/utility/data_structure";

export default class StorageModel {

    constructor() {
        this.registerEvent();
        this.initiate();
    }

    async initiate() {
        let record = await Browser.storage.local.get(StorageID.Notes);
        
        if (StorageID.Notes in record) {
            console.log(record[StorageID.Notes]);
            this.set_notes(record[StorageID.Notes]);
        }
    }

    registerEvent() {
        Browser.storage.local.onChanged.addListener(this.logStorageChange.bind(this));
    }

    dispose() {
        Browser.storage.local.onChanged.removeListener(this.logStorageChange);
    }

    logStorageChange(changes) {
        console.log(changes);
        const changedItems = Object.keys(changes);
      
        for (const item of changedItems) {
            console.log(`${item} has changed:`);
            console.log("Old value: ", changes[item].oldValue);
            console.log("New value: ", changes[item].newValue);
        }

        if (StorageID.Notes in changes) {
            this.set_notes(changes[StorageID.Notes].newValue);
        }
    }

    save_note_to_background(note: NotePageType) {
        let messageStruct: ExtensionMessageStruct = { id: MessageID.NoteUpdate, sender: MessageSender.SidePanel,
             body: {
                action: DBAction.Update,
                item: note
            }
        };
        
        Browser.runtime.sendMessage(messageStruct);
    }

    delete_note_to_background(note_id: string) {
        let messageStruct: ExtensionMessageStruct = { id: MessageID.NoteUpdate, sender: MessageSender.SidePanel,
            body: {
               action: DBAction.Delete,
               item: note_id
           }
       };

       Browser.runtime.sendMessage(messageStruct);
    }

    set_notes(notes: NotePageType[]) {
        form_note_store(notes)
        useNoteDictStore.setState(() => form_note_store(notes));
    }
}