import { RenderSideActionBar, RenderSourcePanel } from "@root/src/utility/ui/floating_panel";
import { useNoteFocusStore } from "./note_zustand";
import { MouseHelper } from "@root/src/utility/ui/mouse_helper";

export class SideBlockHelper {
    floatSourcePanel: RenderSourcePanel;
    floatActionbar: RenderSideActionBar;
    mouse_helper: MouseHelper;

    constructor() {
        this.floatActionbar = new RenderSideActionBar();
        this.floatSourcePanel = new RenderSourcePanel();
        this.mouse_helper = new MouseHelper();
    }



}