'use client'

import { BaseEditor, Descendant, Operation, createEditor, Selection, BaseRange } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { HistoryEditor, withHistory } from 'slate-history'
import { NoteRowType } from '@src/utility/note_data_struct';
import React, { Fragment, useCallback, useMemo } from 'react'

export type SelectionFunction = (block_index: number, range: BaseRange, selected_descendents: Descendant[], whole_descendents: Descendant[]) => void;

export default function RenderSlateContent({index, id, placeholder_text, default_data, readOnly, finish_edit_event, action_bar_event, selection_event }: 
    {index: number, id: string, placeholder_text: string, default_data: any[], readOnly: boolean, 
      finish_edit_event: (id: string, index: number, value: Descendant[]) => void, 
      action_bar_event: (id: string) => void,
      selection_event: SelectionFunction } ) {

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const renderLeaf = useCallback( (props: any) => <Leaf {...props} />, [])
    let value_change_flag = false;
    let descendents : Descendant[] = [];

    console.log("RenderSlateContent");

    let _cacheRange: BaseRange;
    let render_addon_btn = function(i: number) {
      if (i <= 0) return <Fragment></Fragment>;
      
      return <button className='note-block-btn' onClick={() => action_bar_event(id)}>+</button>;
    }

    return (
      <Slate editor={editor}  initialValue={default_data}
      
      onValueChange={(value) => {
        if (readOnly) return;       

        descendents = value;
        value_change_flag = true;
      }} 
      
      onSelectionChange={
        (h) => {
          _cacheRange = h;
        }
      }
      >

        <Editable readOnly={ readOnly } renderElement={props => <Element {...props} />} renderLeaf={renderLeaf}
			onBlur={() => {
				if (value_change_flag) {
					value_change_flag = false;
					finish_edit_event(id, index, descendents);
				}
			}
    }

      onSelect={() => {
        // console.log("OnSelect Done");
        // console.log(_cacheRange);
        // console.log(editor.getFragment());
        // console.log(editor.children);

        selection_event(index, _cacheRange, editor.getFragment(), editor.children);
      }}

          placeholder={placeholder_text}  />
          {render_addon_btn(index)}
      </Slate>
    );
}

const Element = (props : any)=> {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'image':
      return <Image {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Image = ({ attributes, children, element } : any) => {
  return (
    <div {...attributes}>
      {children}
      <div>
        <img
          src={element.url}
        />
      </div>
    </div>
  )
}

export function ParseItemsToSlates(blocks: NoteRowType[]) {
    if (blocks == null || blocks.length <= 0) {
      return [
        {
          type: 'paragraph',
          children: [
            { text: 'Sorry no conent here'},
          ],
        }];
    }
    let slate_blocks : any[] = [];
    let block_length = blocks.length;
  
    for (let i = 0; i < block_length; i++) {
      let block = blocks[i];
  
      if (block.type == "paragraph") {
        slate_blocks.push(
          {
            type: 'paragraph',
            children: [
              { text: block.children[0].text },
            ],
          }
        );
      } if (block.type == "image") {
  
        slate_blocks.push(
          {
            type: 'image',
            url: block.children[0].text,
            children: [{ text: '' }],
          }
        );  
      }
    }
    
    return slate_blocks;
  }

  export function SlateToBlock(nodes: Descendant[]) {
    let n = nodes.length;
    let blocks : NoteRowType[] = [];

    for (let i = 0; i < n; i++) {
      let node : any = nodes[i];

      if (node["type"] == "paragraph" && node["children"].length > 0) {
        blocks.push({
          type : "paragraph",
          children: node["children"]
        });
      }
    }

    return blocks;
  }

  const Leaf = ({ attributes, children, leaf } : {attributes: any, children: any, leaf:any}) => {
    if (leaf.bold) {
      children = <strong>{children}</strong>
    }
  
    if (leaf.code) {
      children = <code>{children}</code>
    }
  
    if (leaf.italic) {
      children = <em>{children}</em>
    }
  
    if (leaf.underline) {
      children = <u>{children}</u>
    }

    if (leaf.keyword) {
      children = <span className='slate-keyword'>{children}</span>
    }
  
    return <span {...attributes}>{children}</span>
  }