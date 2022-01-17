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

import { dev_ver } from '../../pages/global_const'
import axios from "axios";
import { result } from "lodash";
import { max } from "moment";
axios.defaults.withCredentials = true;
// 고객 센터 리스트 코드
function CustomerService({isLogin, isAdmin}){
       
        const [data, setData] = useState([])
        const [maxPage, setMaxPage] = useState(0)
        const [currpage, setCurrPage] = useState(1)
        const [pagenum, setPagenum] = useState([])
        const [startnum, setStartnum] = useState(1)
        const [lastnum, setLastnum] = useState()
        
    useEffect(()=>{
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


        axios.get(`http://${dev_ver}:4000/api/board/pagenum`)
        .then((res)=>{
            if(res.data.err)
            {
                alert('서버와 연결이 되지 않았습니다.')
            }
            else if(res.data.boardnum!=undefined)
            {

                if(Math.ceil(res.data.boardnum/5.0)!=0 && Math.ceil(res.data.boardnum/5.0) < page)
                {
                    alert("잘못된 접근입니다.")
                    window.location.href='/customerService'
                }
                setMaxPage(Math.ceil(res.data.boardnum/5.0))

                if(Math.ceil(res.data.boardnum/5.0) >= (Math.floor((page-1)/5))*5+1+4)
                {
                    last = (Math.floor((page-1)/5))*5+1+4
                    setLastnum((Math.floor((page-1)/5))*5+1+4)
                }
                else
                {
                    last = Math.ceil(res.data.boardnum/5.0)
                    setLastnum(Math.ceil(res.data.boardnum/5.0))
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


        axios.post(`http://${dev_ver}:4000/api/board/showpage`,{page : page})
        .then((res)=>{
            if(res.data.none)
            {}
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
// 고객 센터 리스트 html
    return(
    <>  
    <div className="NoticeTable_title">
        <p>고객센터</p>
    </div>
    <div className="Notice">
        <div className="NoticeTable">
        <CommonTable  headersName={['글번호','종류', '제목', '등록일', '답변', '답변일']}>
        
            {data!=undefined &&
                data.map((item)=>(
                    <>
                    <CommonTableRow>

                        <CommonTableColumn><Link to={"/csArticle?username="+item.username+"&indices="+item.indices}>{item.rownum}</Link></CommonTableColumn>
                        <CommonTableColumn><Link to={"/csArticle?username="+item.username+"&indices="+item.indices}>{item.boardtype}</Link></CommonTableColumn>
                        <CommonTableColumn><Link to={"/csArticle?username="+item.username+"&indices="+item.indices}>{item.title}</Link></CommonTableColumn> 
                        <CommonTableColumn><Link to={"/csArticle?username="+item.username+"&indices="+item.indices}>{item.uploaddate}</Link></CommonTableColumn>
                        <CommonTableColumn><Link to={"/csArticle?username="+item.username+"&indices="+item.indices}>{item.manager != undefined ? "답변 완료" : "접수 대기"}</Link></CommonTableColumn>
                        <CommonTableColumn><Link to={"/csArticle?username="+item.username+"&indices="+item.indices}>{item.answerdate}</Link></CommonTableColumn>
                    </CommonTableRow>
                    </>
                ))
            }
        </CommonTable>
        </div>
        <div className="NoticeNumber">
            {startnum > 1 && <span className="NoticeSpan" onClick={priorpage}>이전</span>}
            { pagenum !=undefined &&  pagenum.map((item,index)=>(
                <a href={"/customerService?page="+item}><span className="NoticeSpan" >{item}</span></a>
            ))}
            {lastnum < maxPage && <span className="NoticeSpan" onClick={nextpage}>다음</span>}
        </div>
        <Link to="/cseditor"><div className="NoticeBtn">
            <p>글쓰기</p>
        </div></Link>    
        
    </div>

    </>  
    )
}

export default  CustomerService;