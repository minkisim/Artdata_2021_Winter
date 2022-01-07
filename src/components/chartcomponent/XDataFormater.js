import React from "react";
import { useMediaQuery } from 'react-responsive';

// 그래프 X 축 데이터 처리 코드 (이미 완성본이므로 수정,파기 하지 말 것)
function XDataFormater(props){ 
    const {x, y, payload} = props;
    let datatemp = payload.value.toString().split(' ');
    const ismobile =useMediaQuery({ maxWidth: 768 });
    return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={14} textAnchor="middle" fill="#505050" fontSize={ismobile ? 9 : 12}>{datatemp[0]}</text>
                <text x={0} y={0} dy={27} textAnchor="middle" fill="#505050" fontSize={ismobile ? 9 : 12}>{datatemp[1]}</text>
            </g>
     )
    
}


export default XDataFormater;