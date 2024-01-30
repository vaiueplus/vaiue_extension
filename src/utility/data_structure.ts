export interface UICategoryInterface {
    [subject: string]: UISubjectInterface;
}

export interface UISubjectInterface extends UITopicInterface{
    topics: UITopicInterface[],
}

export interface UITopicInterface {
    id: string,
    path: string,
    title: string,
    description: string,
    thumbnail?: string,
}

export interface LearningResourceDictInterface {
    [subject: string]: LearningResourceInterface[];
}

export interface LearningResourceInterface {
    id: string,
    language: "en" | "cn" | "kr" | "",
    path: string,
    title: string,
    description: string,
    thumbnail: string,
    learning_tags: string[]
}

export enum FloatActionBarState {Image, AI_Source, Move_Up, Move_Down, Delete}
export enum HighlightActionBarState {Keyword, DoubleCheck, Translation}

//#region User Account
export interface UserSSO_Struct {
    sub : string,
    name: string,
    given_name: string,
    family_name: string,
    picture: string,
    email: string,
}
//#endregion

//#region Extension event
export interface ExtensionMessageStruct {
    id: number,
    sender: number,
    action? : number,
    body?: any,
    
    source?: string,
    host?: string,
}
//#endregion