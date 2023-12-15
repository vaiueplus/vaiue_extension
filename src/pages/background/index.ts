import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import Browser from 'webextension-polyfill';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

Browser.runtime.onInstalled.addListener(() => {
    console.log("installed");
});

Browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        console.log(sender);

    }
);