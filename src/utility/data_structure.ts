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

export enum FloatActionBarState {Image, AI_Source}

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