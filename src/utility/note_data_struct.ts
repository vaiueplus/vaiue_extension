export const GetEmptyNotePage = function() {
    let new_block : NotePageType = {
        _id: "",
        title: "",
        date: "",
        blocks: [GetEmptyNoteBlock()],//Only prepare header block
        is_new_page : true,
    }
    return new_block;
}

export const GetEmptyNoteBlock = function() {
    let new_block : NoteBlockType = {
        _id: "",
        version: 0,
        row: [{type: "paragraph", children: [{text: ""}]}],//Only prepare header block
    }
    return new_block;
}

//First Layer
export type NotePageType = {
    _id: string,
    title: string,
    date: string,

    blocks : NoteBlockType[],
    is_new_page? : boolean,
}

//Second Layer
export type NoteBlockType = {
    _id: string,
    row : NoteRowType[],
    version: number,
    source?: string,
}

export type NoteSource = {
    sources: string[]
}

//Third Layer
export type NoteRowType = {
    type: "image" | "paragraph",
    children: NoteParagraphType[],
    content?: string,
    keyword?: NoteKeywordType[],
}

//Fourth Layer
export type NoteParagraphType = {
    text: string
    color?: string,
    bold?: boolean,
    italic?: boolean,
    keyword?: boolean,
    _id?: string // Use to group keyword together
}

export type NoteKeywordType = {
    _id: string,
    text: string,

    ref_paragraph: string,
    ref_block: string,
}

export const NoteSourceTexStatic = Object.freeze({
    gpt: "",
    bard: "",
    claude: ""
});

