'use client'

import { BaseEditor, Descendant, Operation, createEditor } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { HistoryEditor, withHistory } from 'slate-history'
import { NoteRowType } from '@src/utility/note_data_struct';
import React, { useCallback } from 'react'

export default function RenderSlatePretty({ editor, default_data, readOnly, onChangeCallback }:
        { editor: BaseEditor & HistoryEditor & ReactEditor, default_data: any[], readOnly: boolean, onChangeCallback: ((x : Descendant[]) => void) | null }) {
          
    const renderLeaf = useCallback( (props: any) => <Leaf {...props} />, [])

    return (
      <Slate editor={editor} initialValue={default_data} onValueChange={(value) => {
        if (readOnly) return;          
        
        const ops = editor.operations

        
        console.log(value);
        onChangeCallback?.(value);
      }} >



        <Editable readOnly={ readOnly } renderElement={props => <Element {...props} />} renderLeaf={renderLeaf}
                  placeholder="Enter some plain text..."  />
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
  
    return <span {...attributes}>{children}</span>
  }