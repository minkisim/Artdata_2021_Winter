import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';


function MyNotify(){

    return(
        <div className="Notify_Page">
            <div className="Notify_Header">
                <div className="Notify_Title"><p>전체 알림</p></div>
                <div className="Notify_Header_right">
                    <div className="Notify_Header_btn"><p>읽은 알림 삭제</p></div>
                    <div className="Notify_Header_btn"><p>모두 삭제</p></div>
                </div>
            </div>
            <div className="Notify_Body">
                <div className="Notify_Data">
                    <div className="data_textarea"><p>00 작품에서 타인 상회 입찰이 발생하였습니다.</p></div>
                    <div className="data_from"><p>경매 진행 관련</p></div>
                    <div className="data_Xbtn"><p>X</p></div>
                </div>
                <div className="Notify_Data">
                    <div className="data_textarea off"><p>00 작품이 경매 마감 되었습니다.</p></div>
                    <div className="data_from off"><p>경매 마감 관련</p></div>
                    <div className="data_Xbtn"><p>X</p></div>
                </div>
                <div className="Notify_Data">
                    <div className="data_textarea on"><p>00 작품이 낙찰되었습니다. 결제를 진행하여 주시길 바랍니다.</p></div>
                    <div className="data_from on"><p>경매 마감 관련</p></div>
                    <div className="data_Xbtn"><p>X</p></div>
                </div>
            </div>
        </div>
    )

}

export default MyNotify;