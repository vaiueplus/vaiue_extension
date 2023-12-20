import { BaseRange, Descendant } from "slate";
import { NoteRowType } from "../note_data_struct";

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

            new_order.anchor = temp_focus;
            new_order.focus = temp_anchor;
        }
        return new_order;
    }

    static create_highLight_rows(
        note_rows: NoteRowType[], range: BaseRange, selected_descendents: Descendant[], whole_descendents: Descendant[]) {

        range = SlateUtility.reorder_base_range(range);
        

    }

}