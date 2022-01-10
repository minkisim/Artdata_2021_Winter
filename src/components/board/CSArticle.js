/* global history */
/* global location */
/* global window */

/* eslint no-restricted-globals: ["off"] */
import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';
import "./board.css";
import CommonTable from "./commontable/CommonTable";
import CommonTableRow from "./commontable/CommonTableRow";
import CommonTableColumn from "./commontable/CommonTableCloumn";

import queryString from 'query-string'
import axios from "axios";
import { dev_ver } from '../../pages/global_const'
axios.defaults.withCredentials = true;
// 고객 센터 게시물 보기용 코드
function CSArticle({isLogin, isAdmin}){
    const [results, setResults] = useState()
    const [role, setRole] = useState()
    useEffect(()=>{
        var username
        var indices 
        const query = queryString.parse(location.search)
        if(query != undefined && query.username != undefined && query.indices != undefined)
        {
            username = query.username
            indices = query.indices
        }
        else{
            alert("잘못된 접근입니다.")
            window.location.href = "/customerService"
        }
        axios.post(`http://${dev_ver}:4000/api/board/showarticle`,{username : username, indices : indices})
        .then((res)=>{
            setResults(res.data)
            console.log(res.data)
        })
        .catch((err)=>{
            alert(err)
        })

        axios.get(`http://${dev_ver}:4000/api/checkAdmin`)
        .then((res)=>{
            setRole(res.data.userrole)
            console.log(res.data)
        })
        .catch((err)=>{
            alert(err)
        })
    },[])
// 고객 센터 게시물 보기용 html
    return(
    <>  
    <div className="NoticeArticle_title">
        <p>고객센터</p>
    </div>
    <div className="NoticeArticle">
        <div className="NoticeArticle_userTitle">
        <p>제목 : {results !=undefined && results.title}</p>
        </div>
        {results!=undefined && <div align="left" className="CSArticle_userbody" dangerouslySetInnerHTML={ {__html:results.bodytext} }>
        </div>
        }
        {results!=undefined && results.answer != null &&
        <>
        <div className="CSArticle_AdminTitle">
        <p>관리자 답변</p>
        </div>
         <div align="left" className="CSArticle_Adminbody" dangerouslySetInnerHTML={ {__html:results.answer} }>
        </div>
        </>
        }
        <Link to="/customerService"><div className="CSArticleBtn">
            <p>게시글 목록</p>
        </div></Link>    
        { role!=undefined && role === "ROLE_ADMIN" && <Link to={"/csanswer?username="+queryString.parse(location.search).username+"&indices="+queryString.parse(location.search).indices}>
            <div className="CSAnswerBtn">
            <p>게시글 답변</p>
        </div></Link>}    

    </div>
    <div className="CSArticle_mobileDiv"></div>

    </>  
    )
}

export default  CSArticle;