/*eslint-disable*/
import './exhibition.css'
import react , {useState, useEffect} from 'react';
import ShowWindow1 from '../showWindow/ShowWindow1';
import {protocol, dev_ver} from '../../pages/global_const';
import axios from 'axios';
import ClipLoader from "react-spinners/ClipLoader"
//  사이드바 Artdata 버튼 대응 뷰 구성 코드(웹페이지 눌러보면 확인 가능)
function Exhibition(){
    const [data, setdata] = useState([
        {
            artist:'',
            artname:'',
            musium:'',
            imgUrl:''
        }
    ]
    )
    const [isLoading, setIsloading] = useState(false)
    useEffect(async () => {

        setIsloading(true)

        await axios.get(`${protocol}://${dev_ver}:4000/api/exhibition1/data`).
        then((res)=>{
            
            setdata(res.data);
            //console.log(res.data)
        })
        .catch(()=>{
        alert('error');
        });

        setIsloading(false)
    },[])   


    //  사이드바 Artdata 버튼 대응 뷰 구성 html(웹페이지 눌러보면 확인 가능)
    if(isLoading)
    {
        return (<div class="show_cliploader"><ClipLoader /></div>)
    }
    else
    return(
        <>
        <div class="show_window_flexbox2">
            { data[0] != null && data[0].artist != '' && data.map( part => <div><ShowWindow1 data={part}/></div>)}
        </div>
        <div className='exhibition1_mobileDiv'></div>
        </>
    )
}

export default Exhibition;