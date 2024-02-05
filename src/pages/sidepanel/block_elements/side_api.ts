import { API } from "@root/src/utility/static_data"

export const translate = async function(source: string, source_lang: string, target_lang: string): Promise<string> {
    let lang_pair = `${source_lang}|${target_lang}`;
    
    let url : string = API.Translation_Memory;
        url = url.replace('{source}', source);
        url = url.replace('{lang}', lang_pair);

    let json_result = await fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE
        },
    ).then(r => {
        return r.json()
    })

    let response_status = json_result['responseStatus']
    
    if (response_status != 200) return "";

    return json_result['responseData']['translatedText'];
}

export const json_post_request = function(url: string, method: string, context: string) {
    return fetch(url, {
        method: method, // *GET, POST, PUT, DELETE
        body: context,
        headers: {
            "content-type": "application/json",
          }
        },
    ).then(r => {
        return r.json()
    })
}