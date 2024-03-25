import { ExtensionMessageStruct } from '@root/src/utility/data_structure';
import { MessageID, MessageSender, StorageID } from '@root/src/utility/static_data';
import { DoDelayAction } from '@root/src/utility/static_utility';
import { RenderHighlightBar } from '@root/src/utility/ui/floating_panels/floating_interface';
import { MouseHelper } from '@root/src/utility/ui/mouse_helper';
import { useEffect } from 'react';
import Browser from 'webextension-polyfill';
import { RuntimePort } from './runtime_port';
import { create_note_row_from_selection } from '../clipboard_tools';
import { NoteRowType } from '@root/src/utility/note_data_struct';

export default function App() {
  let port_helper = new RuntimePort(StorageID.Notes);
  let mouse_helper = new MouseHelper();
  let highlight_nodes : NoteRowType[] = [];

  const renderHighlightBar = new RenderHighlightBar();
  
        renderHighlightBar.set_callback(() => { 
          CreateToCollectionCallback(highlight_nodes)
          renderHighlightBar.show(false);
        },

        () => {
          PasteToCollectionCallback(highlight_nodes)
          renderHighlightBar.show(false);
        }
      );

  useEffect(() => {
    mouse_helper.register_mouse_up(async (pos) => {
      let has_connection = await port_helper.check_connection();

      if (has_connection)
        highlight_nodes = await SetHighlightBarPos(renderHighlightBar);
    });

    mouse_helper.register_changes(async () => {
      if (renderHighlightBar.is_show)
          highlight_nodes = await SetHighlightBarPos(renderHighlightBar);
    });

    mouse_helper.register_mouse_down((pos) => {
      renderHighlightBar.mouse_down_event(pos);
    });
    
    //Dispose
    return () => {
      mouse_helper.dispose();
    };
  }, []);

  return (<div className="vaiue_content">
    {renderHighlightBar.render()}
  </div>);
}

const SetHighlightBarPos = async function (bar: RenderHighlightBar) {
  await DoDelayAction(100);
  const selection  : any = window.getSelection();

  if (selection.rangeCount <= 0) return;

  const getRange = selection.getRangeAt(0); 

  var fragment = getRange.cloneContents()
  var imgs = fragment.querySelectorAll('img');
  let images_source: string[] = [];

  for (let i = 0; i < imgs.length; i++) {
    images_source.push(imgs[i].src);
  }
  
  let full_text : string = selection.toString();
      full_text = full_text.trim();

  if (full_text == "") return;

  const selection_bound : DOMRect = getRange.getBoundingClientRect();

  if (selection_bound.left == 0 && selection_bound.right == 0) return;
  
  bar.show(true);
  const bar_bound = bar.get_bound();

  let y_offset = 20;
  let x_pos = selection_bound.left + (selection_bound.width * 0.5) - (bar_bound.width * 0.5);
  let y_pos = (selection_bound.bottom + y_offset);

  bar.set_position(x_pos, y_pos);
  
  return create_note_row_from_selection(full_text, images_source);
}

const PasteToCollectionCallback = function(nodes: NoteRowType[]) {
  SendTextToBackground(MessageID.ContentPaste, nodes);
}

const CreateToCollectionCallback = function(nodes: NoteRowType[] ) {
  SendTextToBackground(MessageID.ContentCreate, nodes);
}

const SendTextToBackground = function(action_id: number, nodes: NoteRowType[]) {  
  let messageStruct: ExtensionMessageStruct = { 
    id: action_id, sender: MessageSender.Tab, body: nodes, 
    host: window.location.host, source: window.location.href
  };

  Browser.runtime.sendMessage(messageStruct);

  let text = nodes.find(x=>x.type == 'paragraph')?.children[0].text;
  if (text != null)
    navigator.clipboard.writeText(text);

  window.getSelection().removeAllRanges();
}
