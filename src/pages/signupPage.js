import React,{useState} from 'react';
import axios from 'axios';
import './login.css';
import { useForm } from 'react-hook-form';

import {protocol, dev_ver} from './global_const';
// 회원가입용 페이지 구성 코드
function SignupPage({history}){
    const genderselection = ["선택 없음", "남성", "여성"]
    const genderval = [0, 'm', 'f']
    const agenum = ["10대","20대","30대","40대","50대","60대","70대","80대","90대"]
    const ageval = [10,20,30,40,50,60,70,80,90]
    const { handleSubmit, register, watch, errors } = useForm();

    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordcheck, setPasswordcheck] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState(0)
    const [age, setAge] = useState(10)

    const [isIdChecked, setIsIdChecked] = useState('no');

    function joinForm()
    {
        if(username == '')
        {
            alert('아이디를 입력하십시오')
            return false
        }

        if(isIdChecked != 'yes')
        {
            alert('아이디 중복체크를 확인해 주십시오')
            return false
        }

        if(name == '')
        {
            alert('이름을 입력하십시오')
            return false
        }

        if(password == '')
        {
            alert('비밀번호를 입력하십시오')
            return false
        }

        if(password != passwordcheck)
        {
            alert('비밀번호가 일치하지 않습니다')
            return false
        }

        if(email == '')
        {
            alert('이메일을 입력하십시오')
            return false
        }
        if(gender === 0)
        {
            alert('성별을 선택해 주십시오')
            return false
        }

        if(phone == '')
        {
            alert('전화번호를 입력하십시오')
            return false
        }

        axios.post(`${protocol}://${dev_ver}:4000/api/joinForm`,{
            username: username,
            name:name,
            password: password,
            email: email,
            phone:phone,
            gender:gender,
            age:age
        })
        .then((result) =>
        {
            if(result.data.success==false)
            {
                alert("회원가입 실패")
                return false;
            }
            else
            {
                alert("회원가입 성공")
                window.location.replace("/loginPage");
            }
        })
        .catch(() => {
            alert('error')
        })
    }

    function checkId()
    {
        axios.post(`${protocol}://${dev_ver}:4000/api/checkId`,
        {
            username: username
        })
        .then((result) => {
            
            if(result.data.success == true)
            {
                setIsIdChecked('yes');
                alert('사용가능한 아이디입니다');
            }

            else if(result.data.success=='null')
            {
                setIsIdChecked('no');
                alert('아이디를 입력해 주십시오')
            }
            else
            {
                setIsIdChecked('no');
                alert('해당아이디는 사용 불가능합니다')
            }
        })
        .catch(() => {
            alert('Error')
        })
    }

// 회원가입 용 페이지 구성 html
        return(
            <div>
                <div className="signup_box">
                    <img src="/img/logo.png" alt="로고 이미지" />
                    <input maxLength="20" type="text" placeholder="ID" onChange={(e) => {setUsername(e.target.value); setIsIdChecked('no')}} />
                    <div className="signup_check_id" onClick={checkId}><p>중복확인</p></div>

                    <input maxLength="20" type="text" placeholder="name" onChange={(e) => setName(e.target.value)}/>
                    <input maxLength="20" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                    <input maxLength="20" type="password" placeholder="Password check" onChange={(e) => setPasswordcheck(e.target.value)}/>
                    <input type="text" placeholder="E-Mail" maxLength="30" onChange={(e) => setEmail(e.target.value)}/>
                    <select onChange={e=>{setGender(e.target.value)}}>
                        {genderselection.map((item, i)=>(
                            <option value={genderval[i]}>{item}</option>
                        ))}
                    </select>
                    <select onChange={e=>{setAge(e.target.value)}}>
                        {agenum.map((item, i)=>(
                            <option value={ageval[i]}>{item}</option>
                        ))}
                    </select>
                    <input maxLength="15" type="text" placeholder="Phone" onChange={(e) => setPhone(e.target.value)}/>
                    
                    <div className="signup_btn" onClick={joinForm}><p>Sign Up</p></div>
                </div>
            <div className='signup_mobileDiv'></div>
            </div>
        )
}
export default SignupPage;
