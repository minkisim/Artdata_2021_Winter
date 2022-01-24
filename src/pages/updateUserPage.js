
/*eslint-disable*/
import React,{useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import './login.css';
import { set, useForm } from 'react-hook-form';

import {protocol, dev_ver} from './global_const';
// 회원가입용 페이지 구성 코드
function UpdateUserPage({history}){
    const genderselection = ["선택 없음", "남성", "여성"]
    const genderval = [0, 'm', 'f']
    const agenum = ["10대","20대","30대","40대","50대","60대","70대","80대","90대"]
    const ageval = [10,20,30,40,50,60,70,80,90]
    const { handleSubmit, register, watch, errors } = useForm();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState(0)
    const [age, setAge] = useState(10)

    useEffect(()=>{
        let unmounted = false
        let source = axios.CancelToken.source()

        axios.get(`${protocol}://${dev_ver}:4000/api/getForm`,{cancelToken:source.token})
        .then((res)=>{
            if(res.data.login_required)
            {
                alert('로그인이 필요합니다.')
                window.location.href = '/updatePage'
            }
            else if(res.data.err)
            {
                alert('서버 오류')
            }
            else if(res.data.none)
            {
                alert('등록되지 않은 사용자입니다.')
                window.location.href = '/'
            }
            else if(!unmounted)
            {
                setEmail(res.data.email)
                setName(res.data.name)
                setPhone(res.data.phone)
            }
        })
        .catch((err)=>{
            alert(err)
        })

        return function () {
            unmounted=true
            source.cancel()
        }
    },[])


    function changeForm()
    {

        if(name == '')
        {
            alert('이름을 입력하십시오')
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

        axios.post(`${protocol}://${dev_ver}:4000/api/changeForm`,{
            name:name,
            email: email,
            phone:phone,
            gender:gender,
            age:age
        })
        .then((result) =>
        {
            if(result.data.login_required)
            {
                alert('로그인이 필요합니다.')
                history.push("/updatePage")
            }
            else if(result.data.success==false)
            {
                alert("회원정보 수정 실패")
                return false;
            }
            else{
                alert("회원정보 수정 성공")
                history.push("/myPage");
            }
            
        })
        .catch(() => {
            alert('error')
        })
    }

//회원 정보 수정용 페이지 구성 html
        return(
            <div>
                <div className="signup_box">
                    <img src="/img/logo.png" alt="로고 이미지" />

                    <input maxLength="20" type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)}/>
                    <input type="text" placeholder="E-Mail" maxLength="30" value={email} onChange={(e) => setEmail(e.target.value)}/>
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
                    <input maxLength="15" type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>
                    <div className='update_flex'>
                        <div className="update_btn" onClick={changeForm}><p>수정</p></div>
                        <div className="update_btn"><Link to="/myPage"><p>취소</p></Link></div>
                    </div>
                </div>
            <div className='signup_mobileDiv'></div>
            </div>
        )
}
export default UpdateUserPage;
