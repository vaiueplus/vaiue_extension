import { NoteRowType } from "@root/src/utility/note_data_struct";

export function create_note_row_from_selection(text:string, images: string[]) : NoteRowType[] {
    let rows : NoteRowType[] = [];

    if (text != null && text != "") {
        rows.push({
            type: "paragraph",
            children: [{'text':text }]
        });
    }

    images.forEach(image_url => {
        rows.push({
            type: 'image',
            children: [{'text':image_url }]
        });
    });

    return rows;
}