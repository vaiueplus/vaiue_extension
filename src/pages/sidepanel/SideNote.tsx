
import '@pages/sidepanel/SideNote.scss';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Link, redirect, useNavigate } from "react-router-dom";
import { UserSSO_Struct } from '@src/utility/data_structure';
import { useEffect } from 'react';
import { GetEmptyNotePage, NotePageType } from '@root/src/utility/note_data_struct';
import { useNoteDictStore, useNoteFocusStore } from './note_zustand';
import {v4 as uuidv4} from 'uuid';
import { Combine_API, FormatString } from '@root/src/utility/static_utility';
import { API } from '@root/src/utility/static_data';
import { useState } from 'react';
import StorageModel from './storge_model';


const SidePanel = ({storage} : {storage: StorageModel}) => {
  const static_user : UserSSO_Struct = {
    sub: "hsinpa_browser_extension",
    name: "",
    given_name: "",
    family_name: "",
    picture: "",
    email: "",
  }

  return (
    <div className="tool-note-page">
      {/* <Link to="note/50">Go to the home page</Link> */}
      
      <NoteHeaderComp userStruct={static_user}></NoteHeaderComp>
      <NoteBodyComp userStruct={static_user} storage={storage}></NoteBodyComp>
    </div>
  );
};

const NoteHeaderComp = function({userStruct}: {userStruct: UserSSO_Struct}) {
  const dispatch_note_page_array = useNoteDictStore((state) => state.set_array);

  const notes = useNoteDictStore((state) => state.notes_array);
  const set_note_dict = useNoteDictStore((state) => state.set);
  const note_focus_set = useNoteFocusStore((state) => state.set_id);

  function create_new_note() {      
          let new_block : NotePageType = GetEmptyNotePage();
          new_block._id = uuidv4();
          new_block.title = "Note #" + (notes.length + 1);
          new_block.date = new Date().toDateString();
          new_block.blocks[0]._id = uuidv4();

      set_note_dict(new_block);
      note_focus_set(new_block._id);
  }
  

  return (
      <div className="note-header-comp">
          <h2>Draft</h2>
          <input className="input" type='text' placeholder="Search..."></input>
          <section className="note-header-actions">
              <button className="button is-primary" onClick={create_new_note}>Add</button>
          </section>
      </div>
  );
}

const NoteBodyComp = function({userStruct, storage}: {userStruct: UserSSO_Struct, storage: StorageModel}) {
  const note_list = useNoteDictStore((state) => state.notes_array);
  const get_note_block = useNoteDictStore((state) => state.get)
  const note_focus_id = useNoteFocusStore((state) => state.note_id);

  const [is_account_valid, set_account_valid] = useState<boolean>(false);

  useEffect(() => {
      set_account_valid(userStruct.sub != "" && userStruct.sub != undefined);
  }, []);

  function RenderLoginMessage({is_login} : {is_login: boolean}) {
      if (!is_login)
          return <div className="note-body-login-require"></div>;
  }

  return (
      <div className="note-body-comp">

      <RenderLoginMessage is_login={is_account_valid}></RenderLoginMessage>
      
          <div className="note-item-container">
          {
            [...note_list].reverse().map(x=> {
              let note_block = get_note_block(x);

              if (note_block == undefined) return;
              
              let note_item_class = "note-item-comp";
              let note_title = note_block.title;

              let inner_content = note_block.blocks[0].row.reduce((array, x, index) => { 

                array += x.children.reduce((paragraph, x) => {

                  paragraph += x.text;
                  return paragraph;

                }, "");

                return array;
              }, "");

              // if (inner_content.length > 0) 
              //   note_title = inner_content

              if (note_focus_id == note_block._id) note_item_class += " active"; 
              return (

                  <Link to={ `note/${note_block?._id}` } className={note_item_class} key={note_block._id} onClick={ () => {
                      storage.set_focus_note(note_block?._id);
                      redirect("/note/" + note_block?._id);
                  } }>
                  
                  <section>
                  <h3>{note_title}</h3>
                  <p>{note_block.date}</p>
                  </section>
                  {/* <object data={Combine_Path("texture/platform/expand.svg")} > </object> */}
                  </Link> )
              })
          }
          </div>
      </div>
  );
}

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
