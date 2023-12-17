import { ExtensionMessageStruct } from '@root/src/utility/data_structure';
import { MessageID, MessageSender, StorageID } from '@root/src/utility/static_data';
import { DoDelayAction } from '@root/src/utility/static_utility';
import { RenderHighlightBar } from '@root/src/utility/ui/floating_panel';
import { MouseHelper } from '@root/src/utility/ui/mouse_helper';
import { useEffect } from 'react';
import Browser from 'webextension-polyfill';
import { RuntimePort } from './runtime_port';

// window.addEventListener("mouseup", (e) => {
//   const selection  : any = window.getSelection();
//   const getRange = selection.getRangeAt(0); 

//   console.log(getRange.getBoundingClientRect());

//   Browser.runtime.sendMessage({message: 'hi'});
// });

export default function App() {
  let port_helper = new RuntimePort(StorageID.Notes);
  let mouse_helper = new MouseHelper();
  let highlight_text : string = "";

  const renderHighlightBar = new RenderHighlightBar();
        renderHighlightBar.set_callback(() => { 
          OnHighlightPasteCallback(highlight_text);
          renderHighlightBar.show(false);
        });

  useEffect(() => {
    mouse_helper.register_mouse_up(async (pos) => {
      let has_connection = await port_helper.check_connection();

      if (has_connection)
        highlight_text = await SetHighlightBarPos(renderHighlightBar);
    });

    mouse_helper.register_changes(async () => {
      if (renderHighlightBar.is_show)
          highlight_text = await SetHighlightBarPos(renderHighlightBar);
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

const OnHighlightPasteCallback = function(highlight_text: string) {
  let messageStruct: ExtensionMessageStruct = { id: MessageID.ContentPaste, sender: MessageSender.Tab, body: highlight_text };
  Browser.runtime.sendMessage(messageStruct);
  navigator.clipboard.writeText(highlight_text);

  window.getSelection().removeAllRanges();
}

const SetHighlightBarPos = async function (bar: RenderHighlightBar) {
  await DoDelayAction(100);
  const selection  : any = window.getSelection();

  if (selection.rangeCount <= 0) return;

  const getRange = selection.getRangeAt(0); 

  let full_text : string = selection.toString();
      full_text = full_text.trim();

  if (full_text == "") return;
  console.log(full_text);
  bar.show(true);

  const selection_bound : DOMRect = getRange.getBoundingClientRect();
  const bar_bound = bar.get_bound();

  let y_offset = 20;
  let x_pos = selection_bound.left + (selection_bound.width * 0.5) - (bar_bound.width * 0.5);
  let y_pos = (selection_bound.bottom + y_offset);

  bar.set_position(x_pos, y_pos);

  return full_text;
}