import { DoDelayAction } from "@root/src/utility/static_utility";
import Browser from "webextension-polyfill";

export class RuntimePort {

    private _target_name: string;
    private _connected: boolean = false;

    constructor(target_name: string) {
        this._target_name = target_name;
    }

    async check_connection() {
        if (this._connected) return true;

        let self = this;

        var port = Browser.runtime.connect({name: this._target_name});
        self._connected = true;

        port.onDisconnect.addListener(function(port) {
            console.log("Disconnect");
            self._connected = false;
        });

        await DoDelayAction(100);

        console.log(self._connected);
        
        return this._connected;
    }
}