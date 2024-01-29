import { BaseRange, Descendant } from "slate";
import { NoteParagraphType, NoteRowType } from "../note_data_struct";
import {v4 as uuidv4} from 'uuid';

export class SlateUtility {

    static reorder_base_range(range: BaseRange) {
        let new_order : BaseRange = { ...range };

        let reverse_plz = false;

        if (!reverse_plz && new_order.anchor.offset > new_order.focus.offset &&
            new_order.anchor.path[0] == new_order.focus.path[0] &&
            new_order.anchor.path[1] == new_order.focus.path[1])
            reverse_plz = true;

        if ( new_order.anchor.path[0] == new_order.focus.path[0] && 
            new_order.anchor.path[1] > new_order.focus.path[1])
            reverse_plz = true;

        if (!reverse_plz && new_order.anchor.path[0] > new_order.focus.path[0])
            reverse_plz = true;

        if (reverse_plz) {
            let temp_focus =   { ...new_order.focus };
            let temp_anchor =   { ...new_order.anchor };

            new_order.anchor = temp_focus;
            new_order.focus = temp_anchor;
        }
        return new_order;
    }

    static create_paragraph( paragraph: NoteParagraphType, 
        current_x: number, current_y: number, 
        start_x: number, start_y: number, start_offset: number,
        end_x: number, end_y: number, end_offset: number) : NoteParagraphType[] {

            if (start_y < current_y && end_y > current_y
                || (
                    start_y == current_y && end_y == current_y &&
                    start_x < current_x && end_x > current_x
                )

                ) {
                paragraph.keyword = true;
                return [paragraph];
            }   

            if (start_y == current_y && current_x == start_x
                && end_y == current_y && current_x == end_x) {
                    return [
                        {text: paragraph.text.substring(0, start_offset)},
                        {text: paragraph.text.substring(start_offset, end_offset), keyword: true},
                        {text: paragraph.text.substring(end_offset, paragraph.text.length)},
                    ];
                }

            //First Part
            if (start_y == current_y && current_x == start_x) {
                return [
                    {text: paragraph.text.substring(0, start_offset)},
                    {text: paragraph.text.substring(start_offset, paragraph.text.length), keyword: true},
                ];
            }

            //End part
            if (end_y == current_y && current_x == end_x) {
                return [
                    {text: paragraph.text.substring(0, end_offset), keyword: true},
                    {text: paragraph.text.substring(end_offset, paragraph.text.length)},
                ];
            }

        return [paragraph];
    }

    static create_highLight_rows(range: BaseRange, whole_descendents: any[]) {

        if (range == undefined) return null;

        range = SlateUtility.reorder_base_range(range);


        let current_x = range.anchor.path[1];
        let current_y = range.anchor.path[0];

        let start_x = current_x;
        let start_y = current_y;
        let start_offset = range.anchor.offset;

        let end_x = range.focus.path[1];
        let end_y = range.focus.path[0];
        let end_offset = range.focus.offset;

        let new_row : NoteRowType[] = [];
        const keyword_id = uuidv4();

        //Prebuild descendent array
        for (let y = 0; y < whole_descendents.length; y++) {
            let d = whole_descendents[y];
            let temp_row : NoteRowType = {type: "paragraph", children: [] };

            for (let x = 0; x < d.children.length; x++) { 
                let current_paragraph : NoteParagraphType = {...d.children[x]};

                //If not include in selection
                if (y < start_y || y > end_y || 
                    (y == start_y && x < start_x) ||
                    (y == end_y && x > end_x)
                    ) {                
                        temp_row.children.push(current_paragraph);
                        continue;
                    }

                const candidates = SlateUtility.create_paragraph(current_paragraph, x, y, 
                                                                start_x, start_y, start_offset,
                                                                end_x, end_y, end_offset);



                const candidate_lens = candidates.length;
                for (let i = 0; i < candidate_lens; i++) {
                    if (candidates[i].text == "") continue;

                    if (candidates[i]?.keyword == true)
                        candidates[i]._id = keyword_id;

                    temp_row.children.push(candidates[i]);
                }
            }

            new_row.push(temp_row);
        }

        new_row = SlateUtility.prune_paragraph_array(new_row);

        return new_row;
    }


    static get_keyword_tags(note_rows: NoteRowType[]) : Map<string, string> {
        let dict = new Map<string, string>();

        note_rows.forEach(r => {
            if (r.children == undefined) return;

            const p_lens = r.children.length;

            for (let i = 0; i < p_lens; i++) {
                if (r.children[i]._id == undefined ||
                    r.children[i].keyword  == undefined) continue;

                let previous_string = dict.get(r.children[i]._id);
                if (previous_string == undefined) previous_string = "";

                let text = r.children[i].text;
                    text = previous_string + text;

                if (text.length > 0)
                    dict.set(r.children[i]._id, text);
            }
        });

        return dict;
    }

    static paragraph_operation(note_rows: NoteRowType[], ops: (paragraph: NoteParagraphType) => NoteParagraphType ) {
        let rows : NoteRowType[] = [...note_rows];
        let rows_lens = rows.length;
        
        for (let k = 0; k < rows_lens; k++) {
            let r : NoteRowType = {...rows[k], children: [] }

            const p_lens = rows[k].children.length;

            for (let i = 0; i < p_lens; i++) {
                let current_paragraph : NoteParagraphType = {...rows[k].children[i]};

                current_paragraph = ops(current_paragraph);

                r.children.push(current_paragraph);
            }

            rows[k] = r;
        }


        return rows;
    }

    static prune_paragraph_array(note_rows: NoteRowType[]) : NoteRowType[] {
        let rows_lens = note_rows.length;

        for (let k = 0; k < rows_lens; k++) {
            let r : NoteRowType = note_rows[k];

            const p_lens = r.children.length;

            for (let i = p_lens - 1; i >= 0; i--) {
                if (i == 0) break;

                let current_paragraph : NoteParagraphType = r.children[i];
                let previous_paragraph : NoteParagraphType = r.children[i - 1];
                if (current_paragraph?.keyword == true 
                    && previous_paragraph?.keyword == true &&
                    current_paragraph?._id == previous_paragraph?._id) 
                {
                    previous_paragraph.text += current_paragraph.text;
                    r.children.splice(i, 1);

                    continue;
                }

                if ( (current_paragraph?.keyword == undefined || !current_paragraph?.keyword)
                    && (!previous_paragraph?.keyword || previous_paragraph?.keyword == undefined) )
                {
                    previous_paragraph.text += current_paragraph.text;
                    previous_paragraph._id = undefined;
                    r.children.splice(i, 1);
                    continue;
                }
            }

            note_rows[k] = r;
        }


        return note_rows;
    }

    static concat_node_row_string(node_row: any[]) {
        let length = node_row.length;
        let concat = "";
        
        for (let i = 0; i < length; i++) {
            for (let k = 0; k < node_row[i].children.length; k++) {
                concat += node_row[i].children[k].text;
            }
        }

        return concat;
    }

}