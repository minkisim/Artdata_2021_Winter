/* eslint-disable */
import React,{useState} from 'react';
import '../../App.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import Zoomimage from './Zoomimage';
// MainPage 구성용 컴포넌트 윈도우(검정 이미지 박스)
function ShowWindow2(props){
    console.log(props.dataset)
    return(
    <div className="show_window2">
        <div className="show_window2_picture" ><Zoomimage image={props.data.imageurl} size='125'></Zoomimage></div>
        <div className="total_name2">
            <p className="name2">{props.data.artist}</p>
            <p className="name2">{props.data.artname}</p>
            <p className="musium_name2">{props.data.exhibition}</p>
        </div>
        <img className="plus_btn2" src="/img/plus_btn.png" alt="+" />
    </div> 
    )
}

export default ShowWindow2;