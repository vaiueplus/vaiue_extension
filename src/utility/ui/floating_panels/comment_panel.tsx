import { ChangeEvent } from "react";
import { AbstractMovable } from "../movable_view";
import { useEffect } from "react";
import { useState } from "react";
import { useCommentStore } from "./comment_zustand";
import { NoteCommentsType, NoteKeywordType, NotePageType } from "../../note_data_struct";
import {v4 as uuidv4} from 'uuid';
import { NoteUIEventID } from "../../static_data";
import dot_svg from '@assets/img/dots-setting.svg';
import { DoDelayAction } from "../../static_utility";
import { Fragment } from "react";
import { ReactNode } from "react";

export const RenderInputComponent = function({index, default_text, cancel_callback, confirm_callback} :
     {index: number, default_text: string, cancel_callback: () => void, confirm_callback: (index: number, v: string) => void}) {

    let input_change_callback = function(element: HTMLTextAreaElement) {
        element.style.height = "30px";
        element.style.height = (element.scrollHeight) + "px";
    }
    
    useEffect(() => {
        let textarea : HTMLTextAreaElement = document.querySelector(".bottom_inputs textarea");
        input_change_callback(textarea);
    }, []);

    return (
        <div className="bottom_inputs">
            <textarea
            onClick={() => {
                useCommentStore.setState(()=> ({option_idex: -1}))
            }}
            onChange={(e) => input_change_callback(e.target)}>{ default_text }</textarea>
            <div className="bottom_actions">
                <button className="bottom_actions_canel button" onClick={cancel_callback}>Cancel</button>
                <button className="bottom_actions_reply button"
                onClick={() => {
                    let textarea: HTMLTextAreaElement = document.querySelector('.bottom_inputs textarea');
                    confirm_callback(index, textarea.value);
                }}
                >Reply</button>
            </div>
        </div>
    )
}

const RenderCommentOption = function({target_id, self_id, edit_callback, delete_callback}:
                                     {target_id: number, self_id: number, edit_callback : (index: number) => void, delete_callback : (index: number) => void}) {
    if (target_id != self_id) return <Fragment></Fragment>;

    return (
        <div className="comment_options">
            <button className="button" onClick={(e) => {e.stopPropagation(); edit_callback(self_id) }}>Edit</button>
            <button className="button" onClick={(e) => {e.stopPropagation(); delete_callback(self_id)}}>Delete</button>
        </div>
    );
}

export class RenderCommentBar extends AbstractMovable {
    private _keyword: NoteKeywordType;
    private _cooldown: boolean = false;
    private _empty_input_id: string;
    constructor() {
        super();
        this.id = "float_comment_bar";
    }

    set_variable(keyword: NoteKeywordType) {
        this._keyword = {...keyword};
    }

    show(is_show: boolean) {
        super.show(is_show);
        this._empty_input_id = uuidv4();
        useCommentStore.setState(()=> ({comment_index: -1, comment_flag: true, option_idex: -1}))
    }

    render(on_ui_event: (id: string, data?: any) => void) {
        const comment_action = useCommentStore();
        let self = this;
        let store_comments = [...comment_action.comments];
        let empty_input_id = uuidv4();

        let on_input_component_cancel = function() {
            comment_action.set_option_index(-1);
            
            comment_action.set_comment_flag(false);
            if (store_comments.length <= 0) on_ui_event(NoteUIEventID.CommentClose);
        }
    
        let on_input_component_confirm = function(index: number, v: string) {
            comment_action.set_option_index(-1);

            if (v == "") return;
            
            if (index >= 0) {
                store_comments[index] = {...store_comments[index], text: v}
                console.log(store_comments[index])
            } else {
                store_comments.push( {text: v, _id: uuidv4()})
            }
            comment_action.set_comment_flag(false);
            comment_action.set_comments(store_comments);
            on_ui_event(NoteUIEventID.CommentConfirm, {keyword: self._keyword, comments: store_comments });
        }

        let on_option_edit = function(index:number) {
            comment_action.set_option_index(-1);
            console.log(index)
            comment_action.set_comment_index(index);
            comment_action.set_comment_flag(true);
        }

        let on_option_delete = function(index: number) {
            comment_action.set_option_index(-1);
            store_comments.splice(index, 1);
            comment_action.set_comment_flag(false);

            comment_action.set_comments(store_comments);
            on_ui_event(NoteUIEventID.CommentConfirm, {keyword: self._keyword, comments: store_comments });
        }

        let render_comments = (comments: NoteCommentsType[]) => {
            let comment_lens = comments.length;
            let c = []
    
            for (let i = 0; i < comment_lens; i++) {
                c.push(
                    <div className="comment_line" key={comments[i]._id + "text"}>
                        <p onClick={() => {
                            comment_action.set_option_index(-1);
                            if (!comment_action.comment_flag) {
                                comment_action.set_comment_index(-1);
                                comment_action.set_comment_flag(true);    
                            }
                            
                            //Click and scroll to bottom of div
                            DoDelayAction(25, () => {
                                const buffer = document.querySelector(`#float_comment_bar section`);
                                if (buffer != undefined) buffer.scrollTo(0, buffer.scrollHeight);        
                            });            
                        }}>{ comments[i].text }
                            <img src={dot_svg} onClick={(e) => {
                                    e.stopPropagation(); 
                                 comment_action.set_option_index(i);  }}></img>

                            <RenderCommentOption 
                                target_id={comment_action.option_idex} 
                                self_id={i}
                                edit_callback={on_option_edit}
                                delete_callback={on_option_delete}></RenderCommentOption>
                        </p>
                    </div>
                )
    
                if (comment_action.comment_index == i && comment_action.comment_flag) {
                    c.push(
                        <RenderInputComponent 
                            key={comments[i]._id + "input"}
                            index={i}
                            default_text={comments[i].text} 
                            cancel_callback={on_input_component_cancel} 
                            confirm_callback={on_input_component_confirm}></RenderInputComponent>
                    )
                }
            }

            if (comment_action.comment_index < 0 && comment_action.comment_flag) {
                console.log("comment_action.comment_index " + comment_action.comment_index )

                c.push(
                    <RenderInputComponent key={self._empty_input_id} index={-1} default_text={""} cancel_callback={on_input_component_cancel} confirm_callback={on_input_component_confirm}></RenderInputComponent>
                )
            }

            if (comment_action.option_idex >= 0 && !comment_action.comment_flag) {
                c.push(<div><br></br></div>  )
            }
    
            return c;
        }
    
        return(
            <div id={this.id}>
                <h3>Comment</h3>
                <section>
                    {render_comments(store_comments)}
                </section>
            </div>
        )
    }

}
