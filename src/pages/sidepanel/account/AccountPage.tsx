import { Link } from "react-router-dom";
import { google_sso_login, google_sso_logout } from "../block_elements/side_api";
import StorageModel from "../storge_model"
import { useUserInfoStore } from "../user_zustand"
import '@pages/sidepanel/account/Account.scss';
import google_icon from '@assets/img/google_icon.png';

export const AccountPage = function({storage} : {storage: StorageModel}) {
    let user_info = useUserInfoStore(s => s.user_info);
    let is_user_valid = useUserInfoStore(s => s.is_login);

    let username = is_user_valid() ? user_info.name : "";
    
    async function login_action()  {
        let userInfo = await google_sso_login()
        storage.set_user_info(userInfo);
        console.log(userInfo)
      }
    
    async function logout_action()  {
        await google_sso_logout()
        storage.set_user_info(null);
    }

    const render_interactive_button = function() {
        const button_name = is_user_valid() ? "Logout" : "Google Login";
        const button_action = is_user_valid() ? logout_action : login_action;

        return (
            <div className="account_page_buttons">
                <button className="button" onClick={button_action}><img src={google_icon}></img><span>{button_name}</span></button>
                <Link to='/'>Back</Link>
            </div>
        )
    }

    return (
        <div className="account_page">
            <h2 className="title">Hello {username}!</h2>
            <h3 className="subtitle">Welcome to VAIUE</h3>
            { render_interactive_button() }
        </div>
    )
}