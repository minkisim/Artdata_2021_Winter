/*eslint-disable*/
/* global history */
/* global location */
/* global window */

/* eslint no-restricted-globals: ["off"] */
import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';
import "./board.css";

import queryString from 'query-string'
import CommonTable from "./commontable/CommonTable";
import CommonTableRow from "./commontable/CommonTableRow";
import CommonTableColumn from "./commontable/CommonTableCloumn";


import axios from "axios";
import {protocol, dev_ver} from '../../pages/global_const';
axios.defaults.withCredentials = true;
// 공지사항 리스트 코드
function NoticeBoard({isLogin, isAdmin}){

    const [adminCheck, setAdminCheck] = useState()
    const [data, setData] = useState()
    const [maxPage, setMaxPage] = useState(0)
    const [currpage, setCurrPage] = useState(1)
    const [pagenum, setPagenum] = useState()
    const [startnum, setStartnum] = useState(1)
    const [lastnum, setLastnum] = useState()

    useEffect(()=>{
        axios.get(`${protocol}://${dev_ver}:4000/api/checkAdmin`)
        .then((result)=>{
            if(result.data.userrole == 'ROLE_ADMIN')
            {
                setAdminCheck('ROLE_ADMIN')
            }
        })
        .catch((err)=>{
            alert(err)
        })
        
        var page = 1
        var start = 1
        var last = 1
        const query = queryString.parse(location.search)
        if(query != undefined && query.page != undefined)
        {
            console.log("page : " + query.page)
            page = query.page
            setCurrPage(page)
            setStartnum( (Math.floor((page-1)/5))*5+1)
            start = (Math.floor((page-1)/5))*5+1
        }
        else
        {
            console.log("no page : 1")
        }


        axios.get(`${protocol}://${dev_ver}:4000/api/notice/pagenum`)
        .then((res)=>{
            if(res.data.err)
            {
                alert('서버와 연결이 되지 않았습니다.')
            }
            else if(res.data.noticenum!=undefined)
            {

                if(Math.ceil(res.data.noticenum/5.0)!=0 && Math.ceil(res.data.noticenum/5.0) < page)
                {
                    alert("잘못된 접근입니다.")
                    window.location.href='/notice'
                }
                setMaxPage(Math.ceil(res.data.noticenum/5.0))

                if(Math.ceil(res.data.noticenum/5.0) >= (Math.floor((page-1)/5))*5+1+4)
                {
                    last = (Math.floor((page-1)/5))*5+1+4
                    setLastnum((Math.floor((page-1)/5))*5+1+4)
                }
                else
                {
                    last = Math.ceil(res.data.noticenum/5.0)
                    setLastnum(Math.ceil(res.data.noticenum/5.0))
                }

                var arr = []

                for(let i=start; i<=last; i++)
                {
                    arr.push(i)
                }

                //console.log(arr)
                setPagenum(arr)
            }
        })
        .catch((err)=>{
            alert(err)
        })


        axios.post(`${protocol}://${dev_ver}:4000/api/notice/showpage`,{page : page})
        .then((res)=>{
            if(res.data.none)
            {
            }
            else if(res.data !=undefined)
            {
                setData(res.data)
                //console.log(res.data)
            }
        })
        .catch((err)=>{
             alert(err)
            
        })
    },[])

    const priorpage = () =>{
        var arr = []
        var start 
        var last

        if(startnum-5<1)
        {
            setStartnum(1)
            start = 1
        }
        else{
            setStartnum(startnum-5)
            start = startnum - 5
        }

        setLastnum(startnum-5+4)
        last = start+4

        for(let i = start; i<=last; i++)
        {
            arr.push(i)
        }
        
        setPagenum(arr)

    }

    const nextpage = () =>
    {
        var arr = []
        var start
        var last
        
        setStartnum(startnum+5)
        start = startnum+5

        if(lastnum+5 >= maxPage)
        {
            last = maxPage
            setLastnum(maxPage)
        }
        else{
            last=startnum+4
            setLastnum(startnum+4)
        }

        
        for(let i = start; i<=last; i++)
        {
            arr.push(i)
        }


        setPagenum(arr)

        //console.log("start : "+startnum+"\nlast : "+lastnum+"\nmaxpage : "+maxPage)
        //console.log(pagenum)
    }
// 공지사항 리스트 html
    return(
    <>  
    <div className="NoticeTable_title">
        <p>공지사항</p>
    </div>
    <div className="Notice">
        <div className="NoticeTable">
        <CommonTable  headersName={['글번호', '제목', '등록일', '조회수']}>
            {
                data!=undefined &&
                data.map((item)=>(
                    <CommonTableRow>
                    <CommonTableColumn><Link to={"/noticeArticle?id="+item.id}>{item.rownum}</Link></CommonTableColumn>
                    <CommonTableColumn><Link to={"/noticeArticle?id="+item.id}>{item.title}</Link></CommonTableColumn>
                    <CommonTableColumn><Link to={"/noticeArticle?id="+item.id}>{item.uploaddate}</Link></CommonTableColumn>
                    <CommonTableColumn><Link to={"/noticeArticle?id="+item.id}>{item.hits}</Link></CommonTableColumn>
                    </CommonTableRow>
                ))
            }
        </CommonTable>
        </div>
        <div className="NoticeNumber">
        {startnum > 1 && <span className="NoticeSpan" onClick={priorpage}>이전</span>}
            {
                pagenum != undefined &&
                pagenum.map((item)=>(
                    <a href={"/notice?page="+item}><span className="NoticeSpan" >{item}</span></a>
                ))
            }
        {lastnum < maxPage && <span className="NoticeSpan" onClick={nextpage}>다음</span>}
        </div>
        {adminCheck != undefined && adminCheck == 'ROLE_ADMIN' && <Link to="/noticeeditor"><div className="NoticeBtn">
            <p>글쓰기</p>
        </div></Link>    
        }
    </div>

    </>  
    )
}

export default  NoticeBoard;