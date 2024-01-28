import { API } from "@root/src/utility/static_data"

export const translate = function(source: string, source_lang: string, target_lang: string): Promise<string> {

    let context = {
		"q": source,
		"source": source_lang,
		"target": target_lang,
		"format": "text",
		"api_key": ""
	}

    return json_post_request(API.Translation, "POST", JSON.stringify(context));
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