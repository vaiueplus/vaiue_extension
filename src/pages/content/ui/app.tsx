import { RenderHighlightBar } from '@root/src/utility/ui/floating_panel';
import { MouseHelper } from '@root/src/utility/ui/mouse_helper';
import { useEffect } from 'react';
import Browser from 'webextension-polyfill';

// window.addEventListener("mouseup", (e) => {
//   const selection  : any = window.getSelection();
//   const getRange = selection.getRangeAt(0); 

//   console.log(getRange.getBoundingClientRect());

//   Browser.runtime.sendMessage({message: 'hi'});
// });

export default function App() {
  let mouse_helper = new MouseHelper();
  let highlight_text : string = "";

  const renderHighlightBar = new RenderHighlightBar();
        renderHighlightBar.set_callback(() => { OnHighlightPasteCallback(highlight_text) });

  useEffect(() => {
    mouse_helper.register_mouse_up((pos) => {
      highlight_text = SetHighlightBarPos(renderHighlightBar);
    });

    mouse_helper.register_changes(() => {
      if (renderHighlightBar.is_show)
      highlight_text = SetHighlightBarPos(renderHighlightBar);
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
    <p>Hello</p>
    {renderHighlightBar.render()}
  </div>);
}

const OnHighlightPasteCallback = function(highlight_text: string) {
  Browser.runtime.sendMessage({message: highlight_text});
  navigator.clipboard.writeText(highlight_text);
}

const SetHighlightBarPos = function (bar: RenderHighlightBar) {
  const selection  : any = window.getSelection();
  const getRange = selection.getRangeAt(0); 

  let full_text : string = selection.toString();
      full_text = full_text.trim();

  if (full_text == "") return;
  bar.show(true);

  const selection_bound : DOMRect = getRange.getBoundingClientRect();
  const bar_bound = bar.get_bound();

  let y_offset = 20;
  let x_pos = selection_bound.left + (selection_bound.width * 0.5) - (bar_bound.width * 0.5);
  let y_pos = (selection_bound.bottom + y_offset);

  bar.set_position(x_pos, y_pos);

  return full_text;
}