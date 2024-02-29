import { Props } from "@root/src/utility/ui/react_data_type"

export const SideBlockTitleBar = function(
    {
        children,
        on_title_change,
    } : 
    {   
        children: React.ReactNode,
        on_title_change: (new_title: string) => void
    }
) {

    return (
        <h2 onClick={(e) => {
            let title_dom : any = e.target;
            const innerDOM_value : string = "" + title_dom.innerHTML;
            title_dom.innerHTML = (`<input type='text' value='${innerDOM_value}'></input>`);
            
            const h_dom_input : HTMLInputElement = title_dom.querySelector("input");

            if (h_dom_input != null) {
                h_dom_input.focus();
                h_dom_input.setSelectionRange(0, innerDOM_value.length);

                //Resume
                h_dom_input.onblur = () => {
                    if (h_dom_input.value == "") {
                        h_dom_input.value = innerDOM_value;
                    }
                    
                    title_dom.innerHTML = h_dom_input.value;
                    on_title_change(""+title_dom.innerHTML);
                }
            }
        }
    }>{children}</h2>)
}