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
import {dev_ver} from '../../pages/global_const';
axios.defaults.withCredentials = true;
// 공지사항 게시글 보기용 코드
function NoticeArticle({isLogin, isAdmin}){
    const [results, setResults] = useState()
    const [adminCheck, setAdminCheck] = useState()
    const [id, setId] = useState()
    useEffect(()=>{

        axios.get(`http://${dev_ver}:4000/api/checkAdmin`)
        .then((result)=>{
            if(result.data.userrole == 'ROLE_ADMIN')
            {
                setAdminCheck('ROLE_ADMIN')
            }
        })
        .catch((err)=>{
            alert(err)
        })

        var id
        const query = queryString.parse(location.search)
        if(query != undefined && query.id != undefined)
        {
            id=query.id
            setId(query.id)
        }       
        else{
            alert("잘못된 접근입니다.")
            window.location.href = "/notice"
        } 


        axios.post(`http://${dev_ver}:4000/api/notice/showarticle`,{id:id})
        .then((res)=>{
            if(res.data.err)
            {

            }
            else
            {
                setResults(res.data)
            }
        })
        .catch((err)=>{
            alert(err)
        })
    },[])

    async function deleteArticle()
    {
        var qid
        const query = queryString.parse(location.search)
        if(query != undefined && query.id != undefined)
        {
            qid=query.id
            
        }       
        await axios.post(`http://${dev_ver}:4000/api/notice/deletearticle`,{id:qid})
        .then((res)=>{
            if(res.data.success)
            {
                alert('삭제하였습니다.')
            }
            else{
                alert('서버 오류')
            }
        })
        
       
    }

// 공지사항 게시글 보기용 html
    return(
    <>  
    <div className="NoticeArticle_title">
        <p>공지사항 게시글</p>
    </div>
    <div className="NoticeArticle">
        <div className="NoticeArticle_userTitle">
        <p>제목 : {results != undefined && results.title}</p>
        </div>
        {
            results !=undefined &&
        <div align="left" className="NoticeArticle_body" dangerouslySetInnerHTML={ {__html:results.bodytext} }>
        </div>
         }
         {adminCheck==='ROLE_ADMIN' &&
             <Link to="/notice"><div className="NoticeArticleDeleteBtn" onClick={deleteArticle}>
                 <p>게시글 삭제</p>
             </div></Link>}
        {adminCheck==='ROLE_ADMIN' &&<Link to={`/noticeeditor?id=${id}`}><div className="NoticeArticleUpdateBtn">
            <p>게시글 수정</p>
        </div></Link>}
        <Link to="/notice"><div className="NoticeArticleBtn">
            <p>게시글 목록</p>
        </div></Link>    
    </div>
    <div className="NoticeArticle_mobileDiv"></div>

    </>  
    )
}

export default  NoticeArticle;