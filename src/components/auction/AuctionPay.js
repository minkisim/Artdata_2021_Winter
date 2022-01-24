/*eslint-disable*/

/* eslint no-restricted-globals: ["off"] */
import React, {useState,useEffect} from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import './auction.css'
import './Auctioncheck.css'

import {protocol,  dev_ver } from '../../pages/global_const'
import queryString from 'query-string'
// 경매 결제 페이지용 코드
export default function AuctionPay(){
    const [clickbtn1,setclickbtn1] = useState(false);
    const [clickbtn2,setclickbtn2] = useState(false);
    const [clickcheck,setclickcheck] = useState(false);
    const [data,setdata] = useState(
        {
            artist:'',
            artistyear:'',
            artwork:'',
            size:'',
            year:"",
            type:'',
            KRWpriceStart:'',
            KRWpriceEnd:'',
            nowprice:'',
            enddate:'',
            artworkInfo:'',
            artistInfo:"",
            artistyearInfo:''
        }
    );
    const [userdata, setUserdata] = useState({
        username:'',
        name:'',
        email:''
})

    const [isowner, setIsowner] = useState(false)
    const [bidsearch, setBidsearch] = useState('')
    const [current, setCurrent] = useState('0')
    const [email,setEmail] = useState('')
    const [enddate, setEnddate] = useState()
    const [enddate2, setEnddate2] = useState()
    const [artistdata,setArtistdata] = useState()

    const history = useHistory()

    useEffect(()=>{
        let unmounted = false
        let source = axios.CancelToken.source()

        const query = queryString.parse(location.search)

        axios.post(`${protocol}://${dev_ver}:4000/api/auctiondata`,{
            id:query.id
        },{cancelToken:source.token})
        .then((result2)=>{
            
            if(result2.data==null)
            {
                alert('접근할 수 없는 작품입니다.')
                document.location.replace('/auctionmain')
            }

            if(!unmounted)
            setdata(result2.data)

                     axios.get(`${protocol}://${dev_ver}:4000/api/checkAdmin`,{cancelToken:source.token})      
                        .then((result) => {
                                if(result.data.success==false)
                                {
                                        alert('로그인이 필요합니다')
                                        document.location.replace('/auctiondata?id='+query.id)
                                }

                                else{
                                    if(!unmounted)
                                        setUserdata(result.data)
                                }
                        })
                        .catch((err)=>{
                                alert(err)
                        })
                        


            axios.post(`${protocol}://${dev_ver}:4000/api/auctiondata/search`,{
                id:query.id,
                artname:result2.data.artname
            },{cancelToken:source.token})
            .then((result)=>{
                
                if(result.data.success)
                {
                    if(!unmounted)
                    setBidsearch(result.data.result)
                    if(result.data.result[0] != undefined)// && result.data.result[0].userprice != undefined && result.data.result[0].userprice.length>=1)
                    {
                        if(!unmounted)
                        {
                            setCurrent(result.data.result[0])
                            setEmail(result.data.email)
                        }
                    }
                }
            })
            .catch((err)=>{
                alert("search error:\n"+err)
            })

            axios.post(`${protocol}://${dev_ver}:4000/api/auctiondata/isStarted`,{
                artname: result2.data.art_id
            },{cancelToken:source.token})
            .then((result)=>{
                var enddate = result.data.end_point.split('-')
    
                var week=['일','월','화','수','목','금','토']
                
                if(!unmounted)
                {
                    setEnddate(enddate)
                    setEnddate2(week[result.data.day])
                }

                if(result.data.tminus>0)
                {
                    document.location.replace('/auctiondata?id='+query.id)
                }
            })
            .catch((err)=>{
                alert("date Error:\n"+err)
            })

            })
            .catch((err)=>{
                alert(err)
            })

        .catch((err)=>{
            alert(err)
        })

        return function () {
            unmounted=true
            source.cancel()
        }

    },[])

    function click_auction_btn2(){
        console.log('2번 클릭');
        console.log(clickbtn2);
        if(clickbtn2 == false){
            setclickbtn2(true);
        }
        else{
            setclickbtn2(false);
        }
    }

    function click_check(){
        if(clickcheck){
            
            setclickcheck(false);
        }
        else{
            
            setclickcheck(true);
        }
    }

    function on_submit()
    {
        /*
        const curr = new Date();
        const utc =  curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        const kr_curr =  new Date(utc + (KR_TIME_DIFF));
        
        const year = kr_curr.getFullYear().toString().substring(2)
        const monthdate =( kr_curr.getMonth()+1 )
        const month = (monthdate/10 < 1) ? '0'+monthdate : monthdate
        const date = kr_curr.getDate()/10 < 1 ? '0'+kr_curr.getDate() : kr_curr.getDate()
        */
        //alert(year + "."+month+'.'+date)
        axios.post(`${protocol}://${dev_ver}:4000/api/auction_submit`,{
                id:userdata.id,
                username:userdata.username,
                art_id : data.art_id
                //date: year + "-"+month+'-'+date
        })
        .then((result)=>{
            if(result.data.success)
            {
                alert('결제 완료. 보유 작품을 확인해주세요.');
                history.replace("/myPage");
            }
            else{
                alert('서버 오류')
            }
        })
        .catch((err)=>{
            alert(err)
        })
        
    }
// 경매 결제 페이지용 html
    function AuctionBid(){
        return(
                <div className="Bid_back_div2">
                    <div className="Bid_title">
                        <span>낙찰품 결제</span>
                        <span> | </span>
                        <span>{data.artname}</span>
                        <img className="Bid_btn" onClick={click_auction_btn2} src="/img/X_btn.png" alt="X" />
                    </div>
                    <div className="Bid_price">
                        <div className="Bid_price_title2">
                            <p className="p1">낙찰 금액</p>
                            <p className="p2">KRW</p>
                        </div>
                        <div className="Bid_price_block"><p>{current.userprice && current.userprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 원 정</p></div>
                        {clickcheck ? <div className="Bid_price_btn_on" onClick={on_submit}><p>결제</p></div>
                        :  <div className="Bid_price_btn_off"><p>결제</p></div> }
                        {clickcheck ? <p className="warning_text2">※ 취소가 불가능 하므로, 가격 확인 후 결제 해주세요.</p>
                        : <p className="warning_text2">※ 약관에 체크를 하신 후 결제를 진행 해주세요.</p>}
                    </div>
                    <div className="Bid_check2"> 
                        <div className="Bid_check_flex2"> 
                            <input type="checkbox" checked={clickcheck ? true:false} onChange={click_check}/>
                            <p>※ 아래의 내용과 약관을 확인했으며, 동의합니다.</p>
                        </div>
                        <div className="Bid_check_textArea2">
                                <p>※ 응찰전 유의사항</p>
                                <p>&nbsp;- 낙찰시 낙찰금의 15%(부가세별도)의 구매수수료가 발생합니다.</p>
                                <p>&nbsp;- 응찰 및 낙찰시에는 취소가 불가능하오니 신중히 응찰하여 주십시요.</p>
                                <p>&nbsp;- 마감시간 30초전 응찰이 있을 경우 자동으로 30초의 경매시간이 연장됩니다.</p> 
                                <p>&nbsp;- 경매종료시간은 아트데이터 서버시간을 기준으로 진행되오니 유의해 주십시요.</p>
                        </div>
                        <div className="Bid_check_btn"><p>경매 약관 바로가기</p></div>
                    </div>
                  
                    
                 
                </div>
        )
    }
    // 경매 결제 페이지용 html
            return(
            <div className="Auctiondata_Page">
                <div className="picture">
                    <img className="Main_Image" src={`/img/${data.imageurl}`} alt="그림" />
                  
                </div>
                <div className="Auction_Info">
                    <div className="Artwork_Artist">
                        <span className="Auction_Info_Artist">{data.artist}</span>
                        <span className="Auction_Info_Artwork">{data.artname}</span>
                    </div>
                    <div className="Auction_Info_artistyear"><p>{artistdata && artistdata.life_term}</p></div>
                    <div className="Auction_Info_subdata">
                        <p className="Auction_Info_size">{data.imagesize}cm</p>
                        <p className="Auction_Info_type">{data.imagetype} </p>
                        <p className="Auction_Info_year">{data.artrelease_date}</p>
                    </div>
                    <hr className="Auction_Info_hr1"/>
                    <div className="Auction_Info_enddate_flex">
                        <div className="Auction_Info_enddate">
                            <span className="enddate_title">마감&nbsp; </span>
                            <span className="enddate_content">{enddate && enddate[0]}/{enddate && enddate[1]}/{enddate && enddate[2]} ({enddate2}) 00:00 AM</span>
                        </div>
                        <div className="Auction_Info_countdown">
                            <span className="countdown_title">남은 시간&nbsp; </span>
                            <span className="countdown_content">만료</span>
                        </div>
                    </div>
                    <hr className="Auction_Info_hr2"/>
                    <div className="Auction_Info_price">
                        <div className="Auction_Info_nowprice">
                            <span className="nowprice_title">낙찰가 &nbsp;&nbsp;</span>
                            <span className="nowprice_content">{current.userprice ? current.userprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}</span>
                        </div>
                        <div className="Auction_Info_pricedata">
                            <span className="price_title">낙찰자 &nbsp; &nbsp;</span>
                            <span className="price_content">{email ? email : '없음'}</span>
                        </div>
                    </div>
                    <div className="Auction_Info_btn2">
                    { current.username == userdata.username ? <div className="Auction_Info_submit" onClick={click_auction_btn2}><p>결제하기</p></div> : null}
                    </div>
                </div>
                <hr className="Auction_Info_hr3"/>
                <hr className="Auction_Info_hr4"/>
                <div className="artwork_Info">
                    <div className="artwork_Info_title"><p>작품설명</p></div>
                    <div className="artwork_Info_content">
                    {artistdata && artistdata.artistyearInfo.split('\n').map( (line) => {
                        return ( <p>{line}</p>)
                    } )} 
                </div>
                </div>
                <div className="artist_Info">
                    <div className="artist_Info_title"><p>작가설명</p></div>
                    <div className="artist_Info_content">{data!=undefined && data.artist_info!=undefined && data.artist_info.split('\n').map( (line) => {
                        return ( <p>{line}</p>)
                    } )} </div>
                    <div className="artist_Info_yearInfo">{data!=undefined && data.artistyearInfo!=undefined && data.artistyearInfo.split('\n').map( (line) => {
                        return ( <p>{line}</p>)
                    } )} </div>
                </div>
                 {clickbtn2 && <AuctionBid></AuctionBid>}
                
            </div>
        )



}