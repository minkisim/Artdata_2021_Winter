/*eslint-disable*/
import React,{useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import axios from 'axios';
import './login.css';

import {protocol, dev_ver} from './global_const';
// 로그인 페이지 구성용 코드
function LoginPage({history,props}){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const location = useLocation()
    function loginForm()
    {
        axios.post(`${protocol}://${dev_ver}:4000/api/loginForm`,{
            username: username,
            password: password,
        }, { withCredentials: true })
        .then((res) =>
        {
            //console.log(res.data.accessToken)
            //
            if(res.data.success==true)
            {
                if(!location.state?.from)
                {
                    document.location.replace('/')
                    //history.push('/')
                }
                else{
                    document.location.replace(location.state.from)
                    //history.push(location.state.from)
                }
            }

            //
            else{
                alert('아이디 혹은 비밀번호가 일치하지 않습니다.')
            }
        })
        .catch((err) => {
            alert(err)
        })
    }
    
    const onKeyPress = (e) => {
        if(e.key == 'Enter'){
            loginForm();
        }
    }
// 로그인 페이지 구성용 html
        return(
            <>
            <div className="login_page_div">
                <p className="login_Slogan1">IoT기술과 예술이 만나다</p>
                <p className="login_Slogan2">작품의 가치를 좀 더 선명하게 확인 해 보세요.</p>
                <div className="login_box">
                    <img src="/img/logo.png" alt="로고 이미지" />
                    <input maxLength="20" type="text" placeholder="ID" onChange={(e) => setUsername(e.target.value)}/>
                    <input maxLength="20" type="password" placeholder="Password" onKeyPress={onKeyPress} onChange={(e) => setPassword(e.target.value)} />

                    <div className="login_box_in">
                        <div className="login_box_btn"><a onClick={loginForm}><p>Log in</p></a></div>
                        <div className="login_box_btn"><Link to="/signupPage"><p>sign up</p></Link></div>
                    </div>
                </div>
            </div>
            <div className='login_mobileDiv'></div>
            </>
        )
}
export default LoginPage;
