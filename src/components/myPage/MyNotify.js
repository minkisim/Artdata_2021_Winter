/* eslint-disable */
import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';

import {dev_ver} from '../../pages/global_const';
import  axios from 'axios';
import MyNotifyData from "./MyNotifyData";

function MyNotify(props){
    
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
                alert('서버 오류')
            }
            else{
                setData(res.data)
            }
        })
        .catch((err)=>{

        })
    },[])

    async function find_inform()
    {
        await axios.get(`http://${dev_ver}:4000/api/inform/myinform`)
        .then((res)=>{
            if(res.data.login_required)
            {
                alert('로그인이 필요합니다.')
                window.location.href = '/loginPage'
            }
            else if(res.data.err)
            {
                alert('서버 오류')
            }
            else{
                setData(res.data)
            }
        })
        .catch((err)=>{

        })
    }


    async function delete_inform(index)
    {
        var jsondata = data[index]
        await axios.post(`http://${dev_ver}:4000/api/inform/delete`,jsondata)
        .then((res)=>{
            if(res.data.err)
            {
                alert('다시 시도해 주십시오.')
            }


        })
        .catch((err)=>{
            alert(err)
        })
       find_inform()
    }

    async function delete_all()
    {
        await axios.get(`http://${dev_ver}:4000/api/inform/deleteall`)
        .then((res)=>{
            if(res.data.err)
            {
                alert('서버 오류')
            }
            else if(res.data.none)
            {
                alert('삭제할 알림이 없습니다.')
            }

        })
        .catch((err)=>{
            alert(err)
        })
        find_inform()
    }
    async function delete_all_confirmed()
    {
        await axios.get(`http://${dev_ver}:4000/api/inform/deleteallconfirmed`)
        .then((res)=>{
            if(res.data.err)
            {
                alert('서버 오류')
            }
            else if(res.data.none)
            {
                alert('삭제할 알림이 없습니다.')
            }

        })
        .catch((err)=>{
            alert(err)
        })
        find_inform()
    }

    async function send_to_auction(item)
    {
        await axios.post(`http://${dev_ver}:4000/api/inform/confirmed`,item)
        .then((res)=>{

        })
        .catch((err)=>{
            alert(err)
        })

        if(item.auction_type==1)
        {
            window.location.href = '/auctiondata?id='+item.art_id
        }
        else{
            window.location.href = '/auctionpay?id='+item.art_id
        }
        
    }

    return(
        <div className="Notify_Page">
            <div className="Notify_Header">
                <div className="Notify_Title"><p>전체 알림</p></div>
                <div className="Notify_Header_right">
                    <div className="Notify_Header_btn" onClick={()=>{delete_all_confirmed()}}><p>읽은 알림 삭제</p></div>
                    <div className="Notify_Header_btn" onClick={()=>{delete_all()}}><p>모두 삭제</p></div>
                </div>
            </div>
            <div className="Notify_Body">

                {data!=undefined && <MyNotifyData data={data} send_to_auction = {send_to_auction} delete_inform={delete_inform}/>}
               
            </div>
        </div>
    )

}

export default MyNotify;