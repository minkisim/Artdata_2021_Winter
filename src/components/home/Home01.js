/* eslint-disable */

import React, { Component, useState ,useEffect} from 'react';
import ShowWindow2 from '../showWindow/ShowWindow2';
import Chart01 from '../chartcomponent/chart01';
import  './Home.css';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import {protocol, dev_ver} from '../../pages/global_const';
import  axios from 'axios';
import Home1Slider from './Home1Silder';
// MainPage 코드
export default function Home( ){
    
    
    const ismobile =useMediaQuery({ maxWidth: 768 });
    const [inputData,setInputData] = useState([{
        artist: '',
        artname: '',
        exhibition: '',
        imageurl:''
    }]);

    const [graph,setgraph] = useState([
        {
            name : ``,
            '전시 관람 체류 시간' : 0,
            '전시 관람객': 0
        }
    ]);
    
    //[]는 empty dependency
    useEffect(()=>{
        let unmounted = false
        let source = axios.CancelToken.source()

        axios.get(`${protocol}://${dev_ver}:4000/api/home1/about`,{cancelToken:source.token}).
        then((res)=>{
       // console.log(res.data)
       if(!unmounted)
         setInputData(res.data)

         
            axios.get(`${protocol}://${dev_ver}:4000/api/home1/about2`,{cancelToken:source.token}).
            then((result)=>{
             //console.log(result.data)
             if(!unmounted)
             setgraph(result.data)
            })
            .catch(()=>{
            alert('error');
            });


        })
        .catch(()=>{
        alert('error');
        });

        return function () {
            unmounted=true
            source.cancel('Cancelling in cleanup')
        }

        
    },[])
// MainPage html
    return(
        <div>
            <div className="Weekly">Weekly exhibition</div>
            <div className="home_window_flexbox2">
           
            {!(ismobile) && inputData[0] ? <Link to={`/exhibition3/${inputData[0].art_id}`}><ShowWindow2 data={inputData[0]}  /></Link>   :null}
            {!(ismobile) && inputData[1] ? <Link to={`/exhibition3/${inputData[1].art_id}`}><ShowWindow2 data={inputData[1]}  /></Link>   :null}
            {!(ismobile) && inputData[2] ? <Link to={`/exhibition3/${inputData[2].art_id}`}><ShowWindow2 data={inputData[2]}  /></Link>   :null}
            <div className="home_1_Slider">
            {inputData!=undefined && inputData[0] != undefined && <Home1Slider dataset={inputData}></Home1Slider>}
            </div>
            </div>   
           
            {graph[0] ? <Chart01 data={graph}/>:null}
            <div className='home_1_Div'></div>
        </div>
    )
}
