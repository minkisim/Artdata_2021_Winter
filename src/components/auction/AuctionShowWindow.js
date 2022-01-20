/*eslint-disable*/
import axios from 'axios';
import react from 'react';
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom'
import './auction.css';
import {protocol,  dev_ver } from '../../pages/global_const';
// 경매  리스트 각 컴포넌트 코드
export default function AuctionShowWindow(props){
    //console.log(props.data.KRWpriceEnd.toLocaleString(undefined, {maximumFractionDigits:2}));

    function isStarted()
    {
        
        axios.post(`${protocol}://${dev_ver}:4000/api/AuctionMain/isStarted`,{
            art_id:props.data.id//art_id
        })
        .then((result)=>{
            if(result.data.isStarted && result.data.isNotEnded)
            {
                
               document.location.href=`/auctiondata?id=${props.data.id}`
            }
            else if(!result.data.isStarted)
            {
                alert('해당 작품은 아직 경매가 시작되지 않았습니다.')
                return false
            }
            else if(!result.data.isNotEnded)
            {
                document.location.href=`/auctionpay?id=${props.data.id}`
            }
            
          
        })
        .catch((err)=>{
            alert(err)
        })
    }
// 경매  리스트 각 컴포넌트 html
    return(
        
                <div className="auction_ShowWindow">
                    <div><img className="auction_ShowWindow_img" src={`/img/${props.data.img}`}  onError={(e)=>{ e.target.onerror = null; e.target.src = '/img/notfound.png'}} width={props.size} alt="그림" /></div>
                    <div className="auction_ShowWindow_artist"> 
                        <p>{props.data.artwork}</p>
                        <p>{props.index+1}</p>
                    </div>
                    <div className="auction_ShowWindow_artwork"><p>{props.data.artist}</p></div>
                    <div><hr className="auction_line1"/></div>
                    <div className="auction_type"><p>{props.data.type}</p></div>
                    <div className="auction_size">
                        <p>{props.data.size}</p>
                    </div>
                    <div><hr className="auction_line2"/></div>
                    <div className="auction_ShowWindow_price">
                        <p>추정가</p>
                        <div className="auction_ShowWindow_KRW">
                            <p>KRW {props.data.KRWpriceStart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                            <p>~ {props.data.KRWpriceEnd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                        </div>
                    </div>
                    <div className="auction_ShowWindow_USD">
                            <p>USD  {props.data.USDpriceStart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                            <p>~  {props.data.USDpriceEnd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                    </div>
                    <div><hr className="auction_line1"/></div>
                    <div className="auction_btn_div" >
                    <div className="auction_ShowWindow_btn" onClick={isStarted}><p>작품응찰신청</p></div>
                        { //props.data.expired==null ? <Link to={`/auctiondata?id=${props.data.id}`} ><div className="auction_ShowWindow_btn"><p>작품응찰신청</p></div></Link> : 
                        //<Link to={`/auctionpay?id=${props.data.id}`}><div className="auction_ShowWindow_btn"><p>작품응찰신청</p></div></Link>
                    }
                    </div>
                </div>
            
    )
}