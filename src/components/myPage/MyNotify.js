import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';

import {dev_ver} from '../../pages/global_const';
import  axios from 'axios';

function MyNotify(){

    const [data, setData] = useState()
    useEffect(()=>{

        axios.get(`http://${dev_ver}:4000/api/inform/myinform`)
        .then((res)=>{
            if(res.data.login_required)
            {
                alert('로그인이 필요합니다.')
                window.location.href = '/loginPage'
            }
            else if(res.data.err)
            {
                alert()
            }
            else{
                console.log(res.data)
                setData(res.data)
            }
        })
        .catch((err)=>{

        })
    },[])

    function delete_inform(index)
    {
        console.log(data[index])
        var jsondata = data[index]
        
        axios.post(`http://${dev_ver}:4000/api/inform/delete`,jsondata)
        .then((res)=>{

        })
        .catch((err)=>{
            alert(err)
        })
    }

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

                {
                    data!=undefined &&
                    data.map( (item, index) => (
                        <div className="Notify_Data">
                            {
                                item.confirm == 0 
                                ?
                                <>
                                 <div className="data_textarea"><p>{item.inform_text}</p></div>
                                <div className="data_from">{item.auction_type==1 ? <p>경매 진행 관련</p> : <p>경매 마감 관련</p>}</div>
                                
                                </>
                                :
                                <>
                                 <div className="data_textarea off"><p>{item.inform_text}</p></div>
                                <div className="data_from off">{item.auction_type==1 ? <p>경매 진행 관련</p> : <p>경매 마감 관련</p>}</div>
                                </>
                            }
                            <div className="data_Xbtn" onClick={()=>{delete_inform(index)}}  ><p>X</p></div> 
                        </div>
                    ))
                }
               
            </div>
        </div>
    )

}

export default MyNotify;