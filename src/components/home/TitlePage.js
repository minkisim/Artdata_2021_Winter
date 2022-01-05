import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
// 대문 Page 코드
export default function TitlePage(){

// 대문 Page html
    return(
        <>
        <img src="/img/title_page.jpg" className="Title_Page_back" />
        <div className="Title_Page_div"></div>
        <p className="Title_Page_p1">새로운 미술시장의 체험</p>
        <p className="Title_Page_p2">지금 바로 아트 데이터에서 경험 해보세요</p>
        <Link to="/exhibition2"><div className="Title_Page_btn"><p>보러가기</p></div></Link>    
        </>
    )
}