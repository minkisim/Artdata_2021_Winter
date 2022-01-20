/*eslint-disable*/
import axios from 'axios'
import React, { createRef, useState, useEffect} from 'react'
import './MyPage.css';
import {protocol, dev_ver} from '../../pages/global_const';
axios.defaults.withCredentials = true;
import ClipLoader from "react-spinners/ClipLoader"
// 보유작품 양도 관련 코드
function Transfer({props, history}){
    const [isLoading, setIsloadng]= useState(false)

     const [myPicture,setmyPicture] = useState(
        [
            {
                artist: '',
                artwork: '',
                ownerindex: '',
                imgUrl: '',
                isauctioned:''                
            }
        ]
    )

    const [people, setpeople] = useState(
        {
            username:'',
            id : '',
            name : '',
            idCode : '',
            email : ''
        }
    )

    const [finduser, setFinduser] = useState('');



    const [checkBoxValue, setCheckBoxValue] = useState([]);


        function findUserByUsername()
        {
                axios.post(`${protocol}://${dev_ver}:4000/api/myPagefindUser`,{
                        username: finduser
                })
                .then((result) => {
                    if(result.data.name==false)
                    {
                        alert("존재하지 않는 사용자입니다!")
                    }
                    else if(result.data.id != 0)
                    {
                        
                        setpeople(result.data)
                        console.log(result.data)
                    }
                       
                })
                .catch()
        }


    const search = ( name ) => { 
        console.log("이름 : "+name);
        axios.get(`${protocol}://${dev_ver}:4000/api/Transfer/people`,{params : {name : {name}}}).then((res) => {
            if(res.data.id != 0){
               
            }
            else{
                alert("존재하지 않는 사용자입니다!")
            }
        })
        .catch( ( ) => {
            alert('error');
        });
    }


//로그인 검사
    useEffect(() => {
       
                        //get으로 바꿈
                        axios.get(`${protocol}://${dev_ver}:4000/api/Transfer/artdata`)      
                        .then((result) => {
                                if(result.data.success==false)
                                {
                                        alert('로그인이 필요합니다')
                                       
                                        window.location.replace("/loginPage")
                                }

                                else{
                                    //데이터 받아오기
                                       setmyPicture(result.data)
                                }
                        })
                        .catch()
     
       }, [])

    const setCheckBoxArr = (e,index) =>
    {
        
        if(e.currentTarget.checked)
        {
            setCheckBoxValue([...checkBoxValue,index])
        }

        else{
            setCheckBoxValue(checkBoxValue.filter((el) => el !== index))
        }

        console.log(checkBoxValue)
        
    }
    
    function logout(){
        {
            document.cookie = 'user' + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
            console.log("현재 쿠키 : "+document.cookie);
            alert('로그아웃 되었습니다.');
            history.push('/loginPage')}
    }

    async function sendArt()
    {
       
        if(checkBoxValue == undefined || checkBoxValue.length<1)
        {
            alert('하나 이상의 작품을 선택해 주십시오')
            return false
        }

        console.log(people.username.length)
        if(people.username==undefined || people.username.length<1)
        {
            alert('보낼 사람을 지정해 주십시오')
            return false
        }
        

        setIsloadng(true)
        await axios.post(`${protocol}://${dev_ver}:4000/api/Transfer/sendEmail`,{
            checkBoxValue: checkBoxValue,
            username: people.username
        })
        .then((result) => {
            
            if(result.data.success)
            {
                alert('성공적으로 전송하였습니다.')
               
            }
            else{
                alert('전송에 실패하였습니다.')
            }
         
            

        })
        .catch((err)=>{
            alert(err)
        })
        window.location.href = '/mypage'
    }
  
// 보유작품 양도 관련 html    
if(isLoading)
    return (<div class="show_cliploader"><ClipLoader /></div>)
else
    return(
        <div className="Transfer_Page">
            <p className="Transfer_Page_Title">작품 소유권 양도</p>
            <div className="Owner_Item">
                <p className="Owner_Item_Title">보유 작품</p>
                <div className="Owner_table">
                    <div className="Owner_table_header">
                        <div><p className="Owner_header_num">번호</p></div>
                        <div><p className="Owner_header_artwork">작품명</p></div>
                        <div><p className="Owner_header_artist">작가명</p></div>
                        <div><p className="Owner_header_transfer">양도</p></div>
                    </div>
                    <div className="Owner_table_content_div">
                    {myPicture.map( (data, index) => <div className='Owner_table_contents'>
                        
                        <div><p className="Owner_content_num">{index+1}</p></div>
                        <div><p className="Owner_content_artwork">{data.artname}</p></div>
                        <div><p className="Owner_content_artist">{data.artist}</p></div>
                        <div className="Owner_content_btn"><input className={`input_${index}`} type="checkbox" name={`picture${index}`} value={`${index}`} onChange={(e) => {setCheckBoxArr(e,data.id)}}/>
                        </div>
                     
                    </div>)} 
                    </div>
                </div>
            </div>
            <div className="transfer_people_name">
                <p className="transfer_people_title">보낼 사람</p>
            
                <div className="people_search_bar">
                    <input  onChange={(e) => {setFinduser(e.target.value)}} type="text"/>
                    <img src="/img/search_btn.png" alt="검색버튼" onClick={findUserByUsername}/>
                </div>
                <div className="people_table">
                    <div className="people_table_header">
                        <div><p className="people_header_name">이름</p></div>
                        <div><p className="people_header_email">이메일</p></div>
                        <div><p className="people_header_idCode">아이디</p></div>
                    </div>
                    <div className="people_table_content">
                        <div><p className="people_table_name">{people ? people.name : null}</p></div>
                        <div><p className="people_table_email">{people ? people.email : null}</p></div>
                        <div><p className="people_table_idCode">{people ? people.id : null}</p></div>
                    </div>
                </div>    
            </div>
            <div className="phone">
                <a disabled="" onClick={(e)=>{e.preventDefault();e.currentTarget.disabled = true;sendArt()}}><div><p>휴대폰 인증</p></div></a>
            </div>


        </div>

    )
}
export default Transfer;