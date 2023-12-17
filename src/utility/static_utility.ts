import { UserSSO_Struct } from "./data_structure";
import { Domain } from "./static_data";

  export function Combine_Path(path: string) {
    return "/" + path;
  }

  export function Combine_API(path: string) {
    return Domain.Dev + path;
  }

  export function Is_Email(email : string) {
    let regex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;
    let result = regex.test(email);

    return result;
  }

  export function GetRelativeURL(url : string) {
    return (url.replace(/^(?:\/\/|[^/#]+)*\//, ''));
  }

  export function DoDelayAction(time : number, callback: () => void = null) : Promise<void> {
    return new Promise(function (resolve, reject) {
        let flag = false;
        (
            function waitForFoo(){
                if (flag) {

                  if (callback != null) callback();
                  return resolve();
                }

                flag = true;
                setTimeout(waitForFoo, time);
        })();
    });
}

export function FormatString(string: string, params: any[]) {
  return string.replace(/{(\d+)}/g, (match, index) => {
    return typeof params[index] !== 'undefined' ? params[index] : match;
  });
}

export function decodeJwtResponseFromGoogleAPI(token: string) : UserSSO_Struct {
  let base64Url = token.split('.')[1]
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload)
}

export function Lerp(x : number, y : number, t : number) {
  return (1 - t) * x + (t * y);
}

export function PointBoxSection(x: number, y : number, left: number, right: number, top: number, down: number) {
  return (
    x > left && x < right &&
    y < down && y > top
  );
}