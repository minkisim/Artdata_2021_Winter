import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';
import "./board.css";
import CommonTable from "./commontable/CommonTable";
import CommonTableRow from "./commontable/CommonTableRow";
import CommonTableColumn from "./commontable/CommonTableCloumn";


import axios from "axios";
axios.defaults.withCredentials = true;

function CustomerService({isLogin, isAdmin}){

    return(
    <>  
    <div className="NoticeTable_title">
        <p>고객센터</p>
    </div>
    <div className="Notice">
        <div className="NoticeTable">
        <CommonTable  headersName={['글번호', '제목', '등록일', '답변', '답변일']}>
            <CommonTableRow>
            <CommonTableColumn>1</CommonTableColumn>
            <CommonTableColumn>첫번째 게시글입니다.</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            <CommonTableColumn>답변 완료</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            </CommonTableRow>
            <CommonTableRow>
            <CommonTableColumn>2</CommonTableColumn>
            <CommonTableColumn>두번째 게시글입니다.</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            <CommonTableColumn>답변 완료</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            </CommonTableRow>
            <CommonTableRow>
            <CommonTableColumn>3</CommonTableColumn>
            <CommonTableColumn>세번째 게시글입니다.</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            <CommonTableColumn>답변 완료</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            </CommonTableRow>
            <CommonTableRow>
            <CommonTableColumn>4</CommonTableColumn>
            <CommonTableColumn>네번째 게시글입니다.</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            <CommonTableColumn>접수 완료</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            </CommonTableRow>
            <CommonTableRow>
            <CommonTableColumn>5</CommonTableColumn>
            <CommonTableColumn>다섯번째 게시글입니다.</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            <CommonTableColumn>접수 대기</CommonTableColumn>
            <CommonTableColumn>2020-10-25</CommonTableColumn>
            </CommonTableRow>
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