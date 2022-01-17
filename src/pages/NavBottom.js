/* eslint-disable */
import React,{useState} from 'react';
import '../App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import { Link } from 'react-router-dom';


// 모바일 하단 Nav 바 용 코드
function NavBottom({message, getMessage}){
    return(
       <>
       <div className='nav_bottom'>
            <div className='icon_block'>
            <Link to="/MyPage"><img src='/icon_mypage.png' alt='마이 페이지'/></Link> 
            <p>Mypage</p>
            </div>
            <div className='icon_block'>
            <Link to="/"><img src='/icon_home.png' alt='홈'/></Link> 
            <p>Home</p>
            </div>
            <div className='icon_block'>
            <img src='/icon_message.png' alt='푸시 알림' onClick={getMessage}/>
            <p>Message</p>
            </div>
       </div>
       </>
    )
}

export default NavBottom;