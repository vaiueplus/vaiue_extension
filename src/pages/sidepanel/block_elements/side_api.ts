import { API, Keys } from "@root/src/utility/static_data"
import { UserInfo } from "@root/src/utility/static_data_type";

export const google_sso_logout = function() {
    try {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({interactive: true}, function(token) {
                chrome.identity.removeCachedAuthToken({ token: token }, () => {})

                resolve(fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`));
            });
          });
    } catch {
        return null;
    }
}

export const google_sso_login = function() : Promise<UserInfo> { 

    try {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({interactive: true}, function(token) {
                let init = {
                  method: 'GET',
                  async: true,
                  headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                  },
                  'contentType': 'json'
                };
        
                fetch(`https://content-people.googleapis.com/v1/people/me?personFields=emailAddresses,names&key=${Keys.GooglePeopleAPIKey}`,init)
                    .then((response) => response.json())
                    .then(function(data) {
                        
                        // Get name
                        let name = data["names"][0]['displayName'];
    
                        // Get Email
                        let email = data["emailAddresses"][0]['value'];
    
                        // Get ID
                        let id = data["emailAddresses"][0]['metadata']['source']['id'];
                        
                        resolve({
                            name: name,
                            email: email,
                            id: id
                        })
                        
                    });
            });

          });
    } catch {
        return null;
    }
}


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

export const upload_texture = async function(texture_blob: Blob): Promise<string | null> {
    let base64 = await blob_to_base64(texture_blob) as string;
        base64 = base64.substring(base64.indexOf(',')+1) 

    const formData  = new FormData();
        formData.append('image', base64);

    const url = "https://api.imgbb.com/1/upload?key=6c02340a0965edd308b94dc05669f294"

    let json_result = await fetch(url, {
        method: "POST",
        body: formData
        },
    ).then(r => {
        return r.json()
    })

    if (json_result['success'] == true) {
        return json_result['data']['display_url']
    }

    return null;
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

const blob_to_base64 = (blob: Blob): Promise<string | ArrayBuffer> => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
  };