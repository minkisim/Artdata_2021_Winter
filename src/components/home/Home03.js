/* eslint-disable */

import React, { Component, useState, useEffect } from 'react';
import SimpleSlider from '../slider/Home2Slider';
import Chart02 from '../chartcomponent/chart02';
import DateBox from '../box/DateBox';
import './Home.css'

import  axios from 'axios';

import {protocol, dev_ver} from '../../pages/global_const';
// Weekly Exhibition 코드
function Home3(){
    const [sliderdata, setsliderdata] = useState(
        [
            {
                artist:'',
                type:'',
                size:'',
                musium:'',
                imgUrl:''
            }
        ] 
    );
    const[ graph, setgraph] = useState(
        [
            {
                name : ``,
                '전시 관람 체류 시간' : 0,
                '전시 관람객': 0
            }
        ]
    );
    const [date, setdate] = useState(
        [
            {
                data : ''
            }
        ]
    );

    useEffect(()=>{
        let unmounted = false
        let source = axios.CancelToken.source()

        axios.get(`${protocol}://${dev_ver}:4000/api/home3/slider`,{cancelToken:source.token}).
          then((res)=>{
            if(!unmounted)
             setsliderdata(res.data)

          })
          .catch((err)=>{
          alert(err);
          });


          axios.get(`${protocol}://${dev_ver}:4000/api/home3/graph`,{cancelToken:source.token}).
          then((res)=>{
            if(!unmounted)
             setgraph(res.data)
          })
          .catch((err)=>{
          alert(err);
          });


          axios.get(`${protocol}://${dev_ver}:4000/api/home3/date`,{cancelToken:source.token}).
          then((res)=>{
            if(!unmounted)
             setdate(res.data)
          })
          .catch((err)=>{
          alert(err);
          });

          return function () {
            unmounted=true
            source.cancel()
        }
      },[])
      
    return(
        <div>
            <div className="home_3_Current">
                <p>Current</p>
                <div className="home_3_Slider">
                    {sliderdata[0] != undefined && <SimpleSlider dataset={sliderdata}></SimpleSlider>}
                </div>
            </div>
            <Chart02 data={graph}></Chart02> 
            <DateBox data={date}></DateBox>
            <div className='home_3_Div'></div>
        </div>
    )
}

export default Home3;