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
axios.defaults.withCredentials = true;

function CustomerService({isLogin, isAdmin}){
        const [data, setData] = useState([])
    useEffect(()=>{
        var page = 1
        const query = queryString.parse(location.search)
        if(query != undefined && query.page != undefined)
        {
            console.log("page : " + query.page)
            page = query.page
        }
        else
        {
            console.log("no page : 1")
        }
        axios.post(`http://${dev_ver}:4000/api/board/showpage`,{page : page})
        .then((res)=>{
            if(res.data !=undefined)
            {
                setData(res.data)
                console.log(res.data)
            }
        })
        .catch((err)=>{
            if(err)
            {

            }
        })
    },[])

    function toboard()
    {
        //history.forward('/cseditor')
        Router.push('/cseditor')
    }

    return(
    <>  
    <div className="NoticeTable_title">
        <p>고객센터</p>
    </div>
    <div className="Notice">
        <div className="NoticeTable">
        <CommonTable  headersName={['글번호', '제목', '등록일', '답변', '답변일']}>
        
            {data!=undefined &&
                data.map((item)=>(
                    <>
                    <CommonTableRow>
                        <CommonTableColumn>{item.rownum}</CommonTableColumn>
                        <CommonTableColumn>{item.title}</CommonTableColumn> 
                        <CommonTableColumn>{item.uploaddate}</CommonTableColumn>
                        <CommonTableColumn>{item.manager != undefined ? "답변 완료" : "접수 대기"}</CommonTableColumn>
                        <CommonTableColumn>{item.answerdate}</CommonTableColumn>
                    </CommonTableRow>
                    </>
                ))
            }
        </CommonTable>
        </div>
        <div className="NoticeNumber">
            <span className="NoticeSpan">1</span>
            <span className="NoticeSpan">2</span>
            <span className="NoticeSpan">3</span>
            <span className="NoticeSpan">4</span>
            <span className="NoticeSpan">5</span>
        </div>
        <Link to="/cseditor"><div className="NoticeBtn">
            <p>글쓰기</p>
        </div></Link>    
        
    </div>

    </>  
    )
}

export default  CustomerService;