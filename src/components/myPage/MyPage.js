/*eslint-disable*/
import React, { Component, useEffect, useState } from 'react';
import  './MyPage.css';
import islogin from '../../pages/doTokenExist';
import {Link} from 'react-router-dom';

import {protocol, dev_ver} from '../../pages/global_const';
import axios from 'axios';
axios.defaults.withCredentials = true;
// 내 정보 관련 코드 (MyPage 버튼 대응)
function MyPage({history}){
       // console.log(islogin);
        const [userdata, setUserdata] = useState({
                username:'',
                name:'',
                email:''
        })

        const [myPicture,setmyPicture] = useState(
                [
                    {
                        artist: '',
                        artname: '',
                        ownerindex: '',
                        imgUrl: '',
                        isauctioned:''                
                    }
                ]
            )


       


       useEffect(async () => {
        let unmounted = false
        let source = axios.CancelToken.source()
                        //console.log("로그인 유무 검사")
                        await axios.get(`${protocol}://${dev_ver}:4000/api/checkAdmin`,{cancelToken:source.token})      
                        .then((result) => {
                                if(result.data.success==false)
                                {
                                        alert('로그인이 필요합니다')
                                        //console.log(result.data.success)
                                        
                                        window.location.href = "/myPage"
                                }

                                else{
                                        if(!unmounted)
                                        setUserdata(result.data)
                                }
                        })
                        .catch((err)=>{
                                alert(err)
                        })
       
                         //get으로 바꿈
                         await axios.get(`${protocol}://${dev_ver}:4000/api/Transfer/artdata`,{cancelToken:source.token})      
                         .then((result) => {
                                 if(result.data.success==false)
                                 {
                                         alert('로그인이 필요합니다')
                                        
                                         window.location.replace("/myPage")
                                 }
 
                                 else{
                                     //데이터 받아오기
                                     if(!unmounted)
                                        setmyPicture(result.data)
                                 }
                         })
                         .catch()

                         return function () {
                                unmounted=true
                                source.cancel()
                            }
       }, [])
        
       function quit()
       {
        if(window.confirm('탈퇴하시겠습니까?'))
        {
                var jsondata = {username : userdata.username}
                axios.post(`${protocol}://${dev_ver}:4000/api/deleteuser`,jsondata)
                .then((result)=>{
                        if(result.data.success)
                        {
                                alert('탈퇴하였습니다.')
                                window.location.replace("/")
                        }
                })
                .catch()
                
        }

       }
// 내 정보 관련 html (MyPage 버튼 대응)
    return(
            <div className="myPage_Page">
                {/*개인 정보*/}
                <p className="personal_data_title">내 정보</p>
                <div className="MyQuit_button" onClick={quit}><p>회원 탈퇴</p></div>
                <Link to="/updatePage"><div className="MyUpdate_button"><p>정보 수정</p></div></Link>    
                <div className="personal_data_div">
                        <p>이름 : {userdata ? userdata.name : null}</p>
                        <p>이메일 : {userdata ? userdata.email : null}</p>
                </div>
                <Link to="/Myauction"><div className="MyAuction_button"><p>내 경매</p></div></Link>
                <Link to={`/transfer`}><div className="Transfer_button"><p>보유 작품 양도</p></div> </Link>
                
                {/*보유 중인  작품 목록*/}
                <p className="name">보유 작품</p>
                <div className="collection">
                        <div className="collection_header_flex">
                                <div><p className="collect_num">번호</p></div>
                                <div><p className="collect_art">작품명</p></div>
                                <div><p className="collect_artist">작가명</p></div>
                                <div><p className="collect_day">구매 날짜</p></div>
                        </div>


                        {/*이 데이터의 반복 */}
                        
                        {myPicture[0] !=undefined && myPicture.map((data,index)=>
                                <div className="collection_data_flex">
                                        <div><p className="data_num">{index+1}</p></div>
                                        <div><p className="data_picture1">{data.artname}</p></div>
                                        <div><p className="data_artist1">{data.artist}</p></div>
                                        <div><p>{data.expired}</p></div>
                                 </div>

                        ) }
                </div>

            </div>


    )

}
export default MyPage;