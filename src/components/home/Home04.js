/* eslint-disable */

import React, { Component, useState, useEffect } from 'react';
import ShowWindow6 from '../showWindow/ShowWindow6';
import './Home.css'
import {protocol, dev_ver} from '../../pages/global_const';
import  axios from 'axios';
import { Link } from 'react-router-dom'

// New Artwork 코드
function Home4( ){
    const [data, setdata] = useState(
        [
            {
                artist:'',
                artwork:'',
                imgUrl:'',
                moreUrl:'',
                id:''
            }
        ] 
    );
    useEffect(() => {
        let unmounted = false
        let source = axios.CancelToken.source()

        axios.get(`${protocol}://${dev_ver}:4000/api/home4/data`,{cancelToken:source.token}).
        then((res)=>{
            if(!unmounted)
            setdata(res.data);
        })
        .catch(()=>{
        alert('error');
        });

        return function () {
            unmounted=true
            source.cancel()
        }
    },[])   
    // New Artwork html
    return(
        <>
        <div className="new_artwork">
            <p>New artwork</p>
            <div className="new_artwork_box">
                <div className="new_first">
                    {data[0] != null && data[0].artist !='' ? <Link to={`/exhibition3/${data[0].id}`} ><ShowWindow6 data={data[0]} /></Link> : null}
                </div>
                <div className="new_second">
                    {data[1] ? <Link to={`/exhibition3/${data[1].id}`} ><ShowWindow6 data={data[1]} /></Link> : null}
                </div>
                <div className="new_third">
                    {data[2] ? <Link to={`/exhibition3/${data[2].id}`} ><ShowWindow6 data={data[2]} /></Link> : null}
                </div>    
            </div>
            
        </div>
        <div className='home_4_Div'></div>
        </>
    )
}
export default  Home4;