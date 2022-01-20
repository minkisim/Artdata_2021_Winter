/*eslint-disable*/
import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';

function MyNotifyData (props) {

    return (
        <>
        {
            props.data!=undefined &&
            props.data.map( (item, index) => (
                <div className="Notify_Data" >
                    {
                        item.confirm == 0 
                        ?
                        <>
                         <div className="data_textarea" onClick={()=>{props.send_to_auction(item)}}><p>{item.inform_text}</p></div>
                        <div className="data_from">{item.auction_type==1 ? <p>경매 진행 관련</p> : <p>경매 마감 관련</p>}</div>
                        
                        </>
                        :
                        <>
                         <div className="data_textarea off" onClick={()=>{props.send_to_auction(item)}}><p>{item.inform_text}</p></div>
                        <div className="data_from off">{item.auction_type==1 ? <p>경매 진행 관련</p> : <p>경매 마감 관련</p>}</div>
                        </>
                    }
                    <div className="data_Xbtn" onClick={()=>{props.delete_inform(index)}}  ><p>X</p></div> 
                </div>
            ))
        }
        </>
    )
}

export default MyNotifyData