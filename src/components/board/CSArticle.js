import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';
import "./board.css";
import CommonTable from "./commontable/CommonTable";
import CommonTableRow from "./commontable/CommonTableRow";
import CommonTableColumn from "./commontable/CommonTableCloumn";


import axios from "axios";
axios.defaults.withCredentials = true;

function CSArticle({isLogin, isAdmin}){

    return(
    <>  
    <div className="NoticeArticle_title">
        <p>고객센터</p>
    </div>
    <div className="NoticeArticle">
        <div className="NoticeArticle_userTitle">
        <p>제목 : 게시글 제목입니다.</p>
        </div>
        <div align="left" className="CSArticle_userbody">
            <p>테스트1</p>
            <p>테스트2</p>
            <p>테스트3</p>
            <p>테스트4</p>
            <p>테스트5</p>
            <p>테스트1</p>
            <p>테스트2</p>
            <p>테스트3</p>
            <p>테스트4</p>
            <p>테스트5</p>
            <p>테스트1</p>
            <p>테스트2</p>
            <p>테스트3</p>
            <p>테스트4</p>
            <p>테스트5</p>
            <p>테스트1</p>
            <p>테스트1</p>
            <p>테스트1</p>
        </div>
        <div className="CSArticle_AdminTitle">
        <p>관리자 답변</p>
        </div>
        <div align="left" className="CSArticle_Adminbody">
            <p>테스트1</p>
            <p>테스트2</p>
            <p>테스트3</p>
            <p>테스트4</p>
            <p>테스트5</p>
            <p>테스트1</p>
            <p>테스트2</p>
            <p>테스트3</p>
            <p>테스트4</p>
            <p>테스트5</p>
            <p>테스트1</p>
            <p>테스트2</p>
            <p>테스트3</p>
            <p>테스트4</p>
            <p>테스트5</p>
            <p>테스트1</p>
            <p>테스트1</p>
            <p>테스트1</p>
        </div>
        <Link to="/notice"><div className="CSArticleBtn">
            <p>게시글 목록</p>
        </div></Link>    
    </div>

    </>  
    )
}

export default  CSArticle;