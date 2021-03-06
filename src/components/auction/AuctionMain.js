/*eslint-disable*/
import React, {useState,useEffect} from 'react'
import axios from 'axios'
import './auction.css'
import SearchSlider from './SearchSlider'
import AuctionShowWindow from './AuctionShowWindow'

import {protocol, dev_ver} from '../../pages/global_const';
import ClipLoader from "react-spinners/ClipLoader"
// 경매 메인 페이지용 코드
export default function AuctionMain(){

    const [artname,setArtname] = useState('')
    const [artist,setArtist] = useState('')
    const [value,setValue] = useState([0,100000])
    const [num,setNum] = useState('')
    const [isLoading, setIsloading] = useState(false)

    const [picturedata, setpicturedata] = useState(
        [
            {
                artist:'',
                artwork:'',
                size:'',
                year:"",
                type:'',
                KRWpriceStart:'',
                KRWpriceEnd:'',
                USDpriceStart:'',
                USDpriceEnd:'',
                id:'',
                isauctioned:''
            }
        ]
    ) 

    
    useEffect( async() => {
        let unmounted = false
        let source = axios.CancelToken.source()
        
        if(!unmounted)
        setIsloading(true)
        await axios.get(`${protocol}://${dev_ver}:4000/api/AuctionMain/picturedata`,{cancelToken:source.token})
        .then((res) => {
            if(!unmounted)
                setpicturedata(res.data);
            })
        .catch( (err)=>{
            alert(err);
            });

        if(!unmounted)
        setIsloading(false)


        return function () {
            unmounted=true
            source.cancel()
        }
    },[]);


    function submit()
    {
        console.log(num)

        let jsondata = {}
        let splitvalue = []
        if(artist!=null)
        {
            jsondata.artist = artist
        }
        if(artname!=null)
        {
            jsondata.artname = artname
        }

        splitvalue = value.toString().split(',')
        console.log("검사 범위 : "+splitvalue[0]+"   "+splitvalue[1])
        jsondata.value = parseInt(splitvalue[0])
        jsondata.value2 = parseInt(splitvalue[1])
        
        if(num!=null)
        {
            jsondata.num = num
        }

        console.log("보낼 artist정보 : "+jsondata.artist)

        axios.post(`${protocol}://${dev_ver}:4000/api/search_auction`,jsondata)
        .then((result)=>{
            setpicturedata(result.data);
        })
        .catch((err) =>{
            alert(err)
        })
    }

    const getValue = (newValue) => {
        setValue(newValue);
    }

    function reset()
    {
        axios.get(`${protocol}://${dev_ver}:4000/api/AuctionMain/picturedata`)
        .then((res) => {
                setpicturedata(res.data);
                //console.log(picturedata)
            })
        .catch( (err)=>{
            alert(err);
            });
    }
// 경매 메인 페이지용 html
if(isLoading)
    return (<div class="show_cliploader"><ClipLoader /></div>)
else
    return(
        <div className="auction_Main_Page">
            <div className="auction_search_bar">
                <div className="search_bar_artwork">
                    <p>작품명</p>
                    <div className="search_input1"><input onChange={(e)=>{setArtname(e.target.value)}}  type="text" maxLength='20'  placeholder="작품명" /></div> 
                </div>
                <div className="search_artist">
                    <p>작가명</p>
                    <div className="search_input2"><input onChange={(e)=>{setArtist(e.target.value)}} type="text" maxLength='20'  placeholder="작가명" /></div>
                </div> 
                <div className="search_price">
                    <p>추정가</p>
                    <div className="price_btn"><SearchSlider getValue={getValue}></SearchSlider></div>
                </div>             
                <div className="search_num">
                    <p>작품번호</p>
                    <div className="num_input"><input onChange={(e)=>{setNum(e.target.value)}} type="text" maxLength='3' /></div>
                </div>
                <div className="search_btn" onClick={submit}><p>검색</p></div>
                <div className="reset_btn" onClick={reset}><p>검색 초기화</p></div>

            </div>
            <div className="auction_list">
               {picturedata.map( (part, index) => <AuctionShowWindow index={index} data={part}/>)}
            </div>
            </div>
    )


}