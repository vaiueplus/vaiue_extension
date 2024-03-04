import { useState } from "react";

export class LoadingScreenView {

    _setVisibility: React.Dispatch<React.SetStateAction<boolean>>;

    public set_visibility(visibility: boolean) {
        if (this._setVisibility != null)
            this._setVisibility(visibility)
    }

    public render() {
        const [visibility, setVisibility] = useState(true)
        this._setVisibility = setVisibility;

        return (
            <div>
                Loading {(() => (visibility) ? "TRUE" : "fALSE")()}
            </div>
        )
    }
}

export const render_loading_screen = function(text: string,  visibility: boolean) {
    let visibility_class = (visibility) ? "loading_screen is-active" : "loading_screen";

    return (
        <div className={visibility_class}>
            <p>
                {text}
            </p>
        </div>
    )
}