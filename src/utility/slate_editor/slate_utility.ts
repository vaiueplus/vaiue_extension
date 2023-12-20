import { BaseRange, Descendant } from "slate";
import { NoteParagraphType, NoteRowType } from "../note_data_struct";

export class SlateUtility {

    static reorder_base_range(range: BaseRange) {
        let new_order : BaseRange = { ...range };

        let reverse_plz = false;
        
        if (range.anchor.path[1] > range.focus.path[1])
            reverse_plz = true;

        if (!reverse_plz && range.anchor.path[0] > range.focus.path[0])
            reverse_plz = true;

        if (!reverse_plz && range.anchor.offset > range.focus.offset)
            reverse_plz = true;

        if (reverse_plz) {
            let temp_focus =   { ...new_order.focus };
            let temp_anchor =   { ...new_order.anchor };

            console.log("Reverse");

            new_order.anchor = temp_focus;
            new_order.focus = temp_anchor;
        }
        return new_order;
    }

    static create_paragraph( paragraph: NoteParagraphType, 
        current_x: number, current_y: number, 
        start_x: number, start_y: number, start_offset: number,
        end_x: number, end_y: number, end_offset: number) : NoteParagraphType[] {

            if (start_y < current_y == end_y > current_y ||
                (start_y == current_y && current_x > start_x) ||
                (start_y == end_y && current_x < end_x)
                ) {
                paragraph.keyword = true;
                return [paragraph];
            }   

            if (start_y == current_y && current_x == start_x
                && end_y == current_y && current_x == end_x) {
                    return [
                        {text: paragraph.text.substring(0, start_offset)},
                        {text: paragraph.text.substring(start_offset, end_offset), keyword: true},
                        {text: paragraph.text.substring(end_offset, paragraph.text.length - 1)},
                    ];
                }

            //First Part
            if (start_y == current_y && current_x == start_x) {
                return [
                    {text: paragraph.text.substring(0, start_offset)},
                    {text: paragraph.text.substring(start_offset, paragraph.text.length - 1), keyword: true},
                ];
            }

            //End part
            if (end_y == current_y && current_x == end_x) {
                return [
                    {text: paragraph.text.substring(0, end_offset), keyword: true},
                    {text: paragraph.text.substring(end_offset, paragraph.text.length - 1)},
                ];
            }

        return [paragraph];
    }

    static create_highLight_rows(
        note_rows: NoteRowType[], range: BaseRange, selected_descendents: any[], whole_descendents: any[]) {

        range = SlateUtility.reorder_base_range(range);
        console.log(range);

        let current_x = range.anchor.path[1];
        let current_y = range.anchor.path[0];

        let start_x = current_x;
        let start_y = current_y;
        let start_offset = range.anchor.offset;

        let end_x = range.focus.path[1];
        let end_y = range.focus.path[0];
        let end_offset = range.focus.offset;

        console.log("create_highLight_rows Start");
        console.log("current_x " + current_x);
        console.log("current_y " + current_y);
        console.log("end_y " + end_y);
        console.log("end_x " + end_x );

        let new_row : NoteRowType[] = [];
            for (let i = 0; i < whole_descendents.length; i++)
                new_row.push( {type: "paragraph", children: [] });

        while(current_y <= end_y) {
            let current_row : NoteRowType = {...whole_descendents[current_y]};
            let current_paragraph : NoteParagraphType = {...current_row.children[current_x]};

            const candidates = SlateUtility.create_paragraph(current_paragraph, current_x, current_y, 
                                                                start_x, start_y, start_offset,
                                                                end_x, end_y, end_offset);
            console.log(candidates);
            console.log(candidates);

            const candidate_lens = candidates.length;
            for (let i = 0; i < candidate_lens; i++) {
                if (candidates[i].text == "") continue;
                new_row[current_y].children.push(candidates[i]);
            }

            if (end_y == current_y && end_x == end_y) {
                break;
            }

            current_x++;
            if (current_x >= current_row.children.length) {
                current_x = 0;
                current_y ++; 
            }
        }

        console.log("create_highLight_rows Done" );

        console.log(new_row);
        
        return new_row;
    }



}