/*eslint-disable*/
/* global history */
/* global location */
/* global window */

/* eslint no-restricted-globals: ["off"] */
import './exhibition.css'
import react, {useState, useEffect} from 'react';
import SimpleSlider from '../slider/Home2Slider';
import Chart04 from '../chartcomponent/chart04';
import Chart05 from '../chartcomponent/chart05';
import Zoomimage from '../showWindow/Zoomimage';
import {protocol, dev_ver} from '../../pages/global_const';
import axios from 'axios';
import queryString from 'query-string'
import {Link} from 'react-router-dom'

// 사이드바 Artdata>Artwork 뷰 대응 코드(작품 소개 페이지)
function Exhibition3({match}){
    const [query,setQuery] = useState()
    const [artId,setArtId] = useState()

    useEffect(async()=>{
        let unmounted = false
        let source = axios.CancelToken.source()

        var art_id
        let jsondata = {}
         
         if(match.params.id!=null && match.params.id != undefined && match.params.id.length>=1)
         {
             jsondata.id=match.params.id
         }
          /*
         let jsondata = {}
         
         if(query!=null && query.id != undefined && query.id.length>=1)
         {
             jsondata.id=query.id
         }
         */
        await axios.post(`${protocol}://${dev_ver}:4000/api/exhibition3/exhibition`, jsondata,{cancelToken:source.token}).
          then((res)=>{
            if(!unmounted)
                 setexhibition(res.data)
            art_id = res.data[0].art_id

            if(!unmounted)
                 setArtId(res.data[0].art_id)
          })
          .catch(()=>{
          alert('error');
          });

          
        axios.post(`${protocol}://${dev_ver}:4000/api/exhibition3/chart04`,{art_id : art_id},{cancelToken:source.token}).
          then((res)=>{
         if(res.data==null)
         {
            if(!unmounted)
            setchart04data([{name: '10-20대', value: 0}])
         }
         else{
            if(!unmounted)
            setchart04data(res.data)
         }
        
          })
          .catch(()=>{
          alert('error');
          });

          axios.post(`${protocol}://${dev_ver}:4000/api/exhibition3/chart05`,{
            date:'day',
            art_id:art_id
        },{cancelToken:source.token}).
        then((res)=>{
            if(!unmounted)
            setchart05data(res.data)
        })
        .catch(()=>{
        alert('error');
        });

        return function () {
            unmounted=true
            source.cancel()
        }
    },[match.params.id])
        

    const [sliderdata,setsliderdata] = useState([
        {
                artist:'',
                type:'',
                size:'',
                musium:'',
                imgUrl:''
        }
    ])
    const [exhibition,setexhibition] = useState([
        {
            artist:'',
            arttype:'',
            artsize:'',
            musium:'',
            people_number: 0 ,
            total_people_number: 0,
            time : '',
            totaltime: ''
        }
    ])

    const [chart04data,setchart04data] = useState(
        []
    )

    const [chart05data,setchart05data] = useState(
    )


    useEffect(()=>{
        let unmounted = false
        let source = axios.CancelToken.source()


        if(!unmounted)
        setQuery(queryString.parse(location.search))

        axios.get(`${protocol}://${dev_ver}:4000/api/home3/slider`,{cancelToken:source.token}).
          then((res)=>{
        if(!unmounted)
         setsliderdata(res.data)

          })
          .catch(()=>{
          alert('error');
          });



        let jsondata = {}
         
         if(match.params.id!=null && match.params.id != undefined && match.params.id.length>=1)
         {
             jsondata.id=match.params.id
         }

         return function () {
            unmounted=true
            source.cancel()
        }
    },[])


    function chart05day()
    {
        
        axios.post(`${protocol}://${dev_ver}:4000/api/exhibition3/chart05`,{
            date:'day',
            art_id : artId
        }).
          then((res)=>{
         // console.log(res.data)
         setchart05data(res.data)
          })
          .catch(()=>{
          alert('error');
          });
    }
    function chart05week()
    {
        
        axios.post(`${protocol}://${dev_ver}:4000/api/exhibition3/chart05`,{
            date:'week',
            art_id : artId
        }).
          then((res)=>{
         // console.log(res.data)
         setchart05data(res.data)
          })
          .catch(()=>{
          alert('error');
          });
    }
    function chart05month()
    {
        
        axios.post(`${protocol}://${dev_ver}:4000/api/exhibition3/chart05`,{
            date:'month',
            art_id : artId
        }).
          then((res)=>{
         // console.log(res.data)
         setchart05data(res.data)
          })
          .catch(()=>{
          alert('error');
          });
    }
    function chart05year()
    {
        
        axios.post(`${protocol}://${dev_ver}:4000/api/exhibition3/chart05`,{
            date:'year',
            art_id : artId
        }).
          then((res)=>{
         // console.log(res.data)
         setchart05data(res.data)
          })
          .catch(()=>{
          alert('error');
          });
    }


// 사이드바 Artdata>Artwork 뷰 대응 html(작품 소개 페이지)        
return(

    <div className="exhibition3_page">
        <div className="exhibition3_simpleSlider">
            <SimpleSlider dataset={sliderdata}></SimpleSlider>
        </div>

        { exhibition[0]!=undefined &&
        <>
        <div className="exhibition3_artwork">
            <p className="exhibition3_artwork_title">Art work</p>
            <div className="exhibition3_artwork_box">
                
                
                <div className="exhibition3_artwork_box_img"><Zoomimage image={exhibition[0].imgUrl} size='586'></Zoomimage></div>
                <Link to={`/artist01/${exhibition[0].artist_id}`}><p className="artwork_box_artist">{exhibition[0].artist} : {exhibition[0].artname}</p></Link> 
                <p className="artwork_box_arttype">{exhibition[0].arttype}</p>
                <p className="artwork_box_artsize">{exhibition[0].artsize}</p>
                <Link to={`/exhibition2/${exhibition[0].exhibition_id}`}><p className="artwork_box_musium">{exhibition[0].musium}</p></Link>
                <div className="exhibition3_people"> 
                    <p className="exhibition3_people_title">금일 전시 관람객</p>
                    <p className="exhibition3_people_number">{exhibition[0].people_number}</p>
                </div>
                <div className="exhibition3_total_people">
                    <p className="exhibition3_total_people_title">총 전시 관람객</p>
                    <p className="exhibition3_total_people_number">{exhibition[0].total_people_number}</p>
                </div>
                <p className="exhibition3_time_line">{exhibition[0].time}</p>
                
            </div>
        </div>
        <div className="art_cumulative_time">
            <p className="art_cumulative_time_title">작품 관람 누적 체류 시간</p>
            <div className="cum_time_graph_div">
            <div className="title_flex">
            <div className="title_flex_left">
                <p>총 누적 체류 시간</p>
                <p className="time">{exhibition[0].totaltime}</p>
            </div>
            <div className="title_flex_right">
               <div onClick={chart05day} ><p>Day</p></div>
               <div onClick={chart05week} ><p>Week</p></div>
               <div onClick={chart05month} ><p>Month</p></div>
               <div onClick={chart05year} ><p>Year</p></div>
            </div>
            </div>
            <div className="art_cumulative_time_graph">
                { chart05data!=undefined && chart05data[0]!=undefined ? <Chart05 data={chart05data}/> : <p className='art_cumulative_null'>해당 기간 내용이 없습니다.</p>}
            </div>
            </div>
        </div>
        </>
                }

        <div className="exhibition3_old">
        <p className="exhibition3_old_graph_title">전시 연령별 선호도</p> 
        <div className="exhibition3_old_div">
            <div className="exhibition3_old_graph">
                <Chart04 data={chart04data}/>
            </div>
        </div>
        </div>
        <div className='exhibition3_moblieDiv'>
        </div>        





    </div>
    )

}

export default Exhibition3;
