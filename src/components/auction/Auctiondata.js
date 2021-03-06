/*eslint-disable*/
import React, {useState,useEffect,useRef} from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import './auction.css'
import './Auctioncheck.css'
import {protocol,  dev_ver } from '../../pages/global_const'
import queryString from 'query-string'
import Auctiontimer from './Auctiontimer'

// 경매 작품 내용 보여주기용 페이지 코드
export default function Auctiondata({location, match}){
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
    const [bidsearch, setBidsearch] = useState('')
    const [currentprice, setCurrentprice] = useState('0')
    const [userdata, setUserdata] = useState({
        username:'',
        name:'',
        email:''
        })

    const [timeout, setTimeout] = useState(false);
    const gettime = () => {
        setTimeout(true)
    }
    
    const currentbid = useRef(null)

    const [tminus,setTminus] = useState()
    const [enddate, setEnddate] = useState()
    const [enddate2, setEnddate2] = useState()

    const [artistdata,setArtistdata] = useState()
    const [auctionUnit,setAuctionUnit] = useState('1')
    const history = useHistory()

    useEffect(async ()=> {
        let unmounted = false
        let source = axios.CancelToken.source()

        const query = queryString.parse(location.search)

        await axios.get(`${protocol}://${dev_ver}:4000/api/checkAdmin`,{cancelToken:source.token})      
                        .then((result) => {
                                if(result.data.success==false)
                                {
                                        alert('로그인이 필요합니다') 
                                        //window.location.replace(window.location.pathname+window.location.search)
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

        await axios.post(`${protocol}://${dev_ver}:4000/api/auctiondata`,{
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

            axios.post(`${protocol}://${dev_ver}:4000/api/auctiondata/search`,{
                id:query.id,
                artname:result2.data.artname
            },{cancelToken:source.token})
            .then((result)=>{
                //console.log(result.data)
                if(result.data.success)
                {
                    if(!unmounted)
                    setBidsearch(result.data.result)
                    if(result.data.result[0] != undefined )//&& result.data.result[0].userprice != undefined && result.data.result[0].userprice.length>=1)
                    {
                        if(!unmounted)
                        setCurrentprice(result.data.result[0].userprice)
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

            if(!unmounted){
                setEnddate(enddate)
                setEnddate2(week[result.data.day])
                setAuctionUnit(result.data.auction_unit)
            }

            if(result.data.tminus<=0)
            {
                history.replace('/auctionpay?id='+query.id)
            }

            if(!unmounted)
            setTminus(result.data.tminus)//(diffDate2.getTime() - currentDate.getTime())/1000)
        })
        .catch((err)=>{
            alert("date Error:\n"+err)
        })


        })
        .catch((err)=>{
            alert(err)
        })

        return function () {
            unmounted=true
            source.cancel()
        }
    },[])
    

    function click_auction_btn1(){
        const query = queryString.parse(location.search)
        console.log(data)

        console.log('1번 클릭');
        console.log(clickbtn1);
        if(clickbtn1 == false){

            axios.post(`${protocol}://${dev_ver}:4000/api/auctiondata/search`,{
                id:query.id,
                artname:data.artname
            })
            .then((result)=>{
                if(result.data.success)
                {
                    setBidsearch(result.data.result)
                    if(result.data.result[0] != undefined)// && result.data.result[0].userprice !=undefined && result.data.result[0].userprice.length>=1)
                    {
                        setCurrentprice(result.data.result[0].userprice)
                    }
                }
            })
            .catch((err)=>{
                alert(err)
            })

            setclickbtn1(true);
        }
        else{
            setclickbtn1(false);
        }
    }


    function click_auction_btn2(){

        if(timeout==false)
        {
            console.log('2번 클릭');
            console.log(clickbtn2);
            if(clickbtn2 == false){
                setclickbtn2(true);
            }
            else{
                setclickbtn2(false);
            }
        }

        else{
            alert('기한이 만료된 경매입니다.')
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


    function auct_sub()
    {
        const query = queryString.parse(location.search)
        let price = currentbid.current.value

        if(price==undefined || price.length<1 || price=='0')
        {
            alert('응찰할 금액을 입력하십시오')
            return false
        }

        console.log(currentprice)
        
        if(parseInt(price)<=parseInt(currentprice))
        {
            alert('현재 가격보다 높은 가격을 제시하여야 합니다.')
            return false
        }

        if(parseInt(price)<parseInt(data.KRW_lower))
        {
            alert('예상 최소가보다 낮은 값을 입력할 수 없습니다.')
            return false
        }

       /*
        const curr = new Date();
        const utc =  curr.getTime() + (curr.getTimezoneOffset() * 60 * 1000);
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        const kr_curr =  new Date(utc + (KR_TIME_DIFF));
        
        const year = kr_curr.getFullYear()
        const monthdate =( kr_curr.getMonth()+1 )
        const month = (monthdate/10 < 1) ? '0'+monthdate : monthdate
        const day = kr_curr.getDate()/10 < 1 ? '0'+kr_curr.getDate() : kr_curr.getDate()
        const hour = kr_curr.getHours()/10 < 1 ? '0'+kr_curr.getHours() : kr_curr.getHours()
        const min = kr_curr.getMinutes()/10 < 1 ? '0'+kr_curr.getMinutes() : kr_curr.getMinutes()
        const sec = kr_curr.getSeconds()/10 < 1 ? '0'+kr_curr.getSeconds() : kr_curr.getSeconds()
         
        const kr_curr_string = year +"-"+ month + '-' + day// +' '+hour+':'+min+':'+sec
        */
        axios.post(`${protocol}://${dev_ver}:4000/api/auctiondata/submit`,{
            art_id:data.art_id,
            userprice:price
            //updateDate: kr_curr_string
        })
        .then((result)=>{
            if(result.data.login_required)
            {
                alert('로그인이 필요합니다.')
                document.location.replace('/auctiondata?id='+query.id)
            }
            else if(result.data.success)
            {
                alert('입찰 완료. 입찰 작품을 확인해주세요.');
                history.replace("/Myauction");
            }
            else if(result.data.denied)
            {
                alert('현재 다른 사람이 더 높은 가격을 제시하였습니다.')
                history.replace({pathname : '/auctiondata', search : '?id='+query.id})
            }
            else if(result.data.err)
            {
                alert('서버 오류')
                history.replace({pathname : '/auctiondata', search : '?id='+query.id})
            }

            else{
                alert('서버 응답 없음')
                history.replace({pathname : '/auctiondata', search : '?id='+query.id})
            }
            
        })
        .catch((err)=>{
            alert(err)
        })

       
    }

   
// 경매 작품 내용 보여주기용 페이지 html
    function AuctionBid(){
        return(
                <div className="Bid_back_div">
                    <div className="Bid_title">
                        <span>경매응찰하기</span>
                        <span> | </span>
                        <span>{data.artname}</span>
                        <img className="Bid_btn" onClick={click_auction_btn2} src="/img/X_btn.png" alt="X" />
                    </div>
                    <div className="Bid_price">
                        <div className="Bid_price_title">
                            <p className="p1">응찰 금액</p>
                            <p className="p2">KRW</p>
                        </div>

                        <input ref={currentbid}  type="number"  defaultValue={currentprice} step={auctionUnit} maxLength="9" placeholder="응찰 금액 입력"  />
                       


                        {clickcheck ? <div className="Bid_price_btn_on" onClick={auct_sub}><p>즉시 응찰</p></div>
                        :  <div className="Bid_price_btn_off"><p>즉시 응찰</p></div> }
                        <p className="warning_text">※ 응찰 참여 후 취소가 불가능합니다.</p>
                    </div>






                    
                    <div className="Bid_check"> 
                        <div className="Bid_check_flex"> 
                            <input type="checkbox" checked={clickcheck ? true:false} onChange={click_check}/>
                            <p>※ 아래의 내용과 약관을 확인했으며, 동의합니다.</p>
                        </div>
                        <div className="Bid_check_textArea">
                                <p>※ 응찰전 유의사항</p>
                                <p>&nbsp;- 낙찰시 낙찰금의 15%(부가세별도)의 구매수수료가 발생합니다.</p>
                                <p>&nbsp;- 응찰 및 낙찰시에는 취소가 불가능하오니 신중히 응찰하여 주십시요.</p>
                                <p>&nbsp;- 마감시간 30초전 응찰이 있을 경우 자동으로 30초의 경매시간이 연장됩니다.</p> 
                                <p>&nbsp;- 경매종료시간은 아트데이터 서버시간을 기준으로 진행되오니 유의해 주십시요.</p>
                        </div>
                        <div className="Bid_check_btn"><p>경매 약관 바로가기</p></div>
                    </div>
                  
                    <div className="Bid_now">
                        <div className="Bid_now_Unit">
                            <span>응찰단위 : </span>
                            <span>{auctionUnit && auctionUnit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} KRW</span>
                        </div>
                        <div className="Bid_now_price">
                            <span className="span1">현재가 : </span>
                            <span className="span2">{currentprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} KRW</span>
                        </div>   
                    </div>
                 
                </div>
        )
    }
    // 경매 작품 내용 보여주기용 페이지 html
    function Popup(){
        return(
            <div>
            <div className="Popup_gray_div"></div>
            <p className="Popup_title">응찰 현황 리스트</p>
            <img className="Popup_btn" onClick={click_auction_btn1} src="/img/X_btn.png" alt="X" />
            <div className="Popup_black_div"></div>
                <div className="popup_box">
                <div className="Popup_header">
                    <div className="Popup_header_no">
                            <p>No.</p>
                        </div>
                        <div className="Popup_header_ID">
                            <p>아이디</p>
                        </div>
                        <div className="Popup_header_price">
                            <p>응찰금액</p>
                        </div>
                        <div className="Popup_header_time">
                            <p>응찰일시</p>
                        </div>
                    </div>
                    
                    {bidsearch.length>=1 && bidsearch.map((data,index)=>
                        <div className="Popup_content">
                            <div className="Popup_content_no">
                                <p>{index+1}</p>
                            </div>
                            <div className="Popup_content_ID">
                                <p>{data.username}</p>
                            </div>
                            <div className="Popup_content_price">
                                <p>{data.userprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                            </div>
                            <div className="Popup_content_time">
                                <p>{data.updateDate}</p>
                            </div>
                        </div>


                    ) }

                   
                    </div>
                </div>
                    
                
           
        )
    }

    
// 경매 작품 내용 보여주기용 페이지 html
        return(
            <>
            {(tminus!='' && tminus!=undefined)&&
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
                            <span className="enddate_content">{enddate[0]}/{enddate[1]}/{enddate[2]} ({enddate2}) 00:00 AM</span>
                        </div>
                        <div className="Auction_Info_countdown">
                            <span className="countdown_title">남은 시간&nbsp; </span>
                            <span className="countdown_content">{tminus != undefined && tminus!='' && (timeout==false ? <Auctiontimer tminus={parseInt(tminus)}  gettime={gettime} /> : "만료") }</span>
                        </div>
                    </div>
                    <hr className="Auction_Info_hr2"/>
                    <div className="Auction_Info_price">
                        <div className="Auction_Info_nowprice">
                            <span className="nowprice_title">현재가 &nbsp;&nbsp;</span>
                            <span className="nowprice_content">{currentprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                        </div>
                        <div className="Auction_Info_pricedata">
                            <span className="price_title">추정가 &nbsp; &nbsp;</span>
                           {data != undefined && data.KRW_lower != undefined && data.KRW_upper != undefined &&
                               <span className="price_content">{data.KRW_lower.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ~ {data.KRW_upper.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>}
                        </div>
                    </div>
                    <div className="Auction_Info_btn">
                        <div className="Auction_Info_nowbtn" onClick={click_auction_btn1}><p>응찰현황</p></div>
                        <div className="Auction_Info_submit" onClick={click_auction_btn2}><p>응찰하기</p></div>
                    </div>
                </div>
                <hr className="Auction_Info_hr3"/>
                <hr className="Auction_Info_hr4"/>
                <div className="artwork_Info">
                    <div className="artwork_Info_title"><p>작품설명</p></div>
                    <div className="artwork_Info_content">
                    
                    {data && data.arttext.split('\n').map( (line) => {
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
                { clickbtn2 && !timeout && <AuctionBid></AuctionBid>}
                { clickbtn1 && <Popup></Popup>}
                
                
            </div>
            }
            </>
        )



}