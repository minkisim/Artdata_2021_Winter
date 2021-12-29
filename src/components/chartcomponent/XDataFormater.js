import React from "react";

// 그래프 X 축 데이터 처리 코드 (이미 완성본이므로 수정,파기 하지 말 것)
class XDataFormater extends React.Component {
    
    render () {
        const {x, y, payload} = this.props;
        let datatemp = payload.value.toString().split(':');
        datatemp[0] = datatemp[0] + " :";
        
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={14} textAnchor="middle" fill="#505050" fontSize={12}>{datatemp[0]}</text>
                <text x={0} y={0} dy={27} textAnchor="middle" fill="#505050" fontSize={12}>{datatemp[1]}</text>
            </g>
        )
    }
}


export default XDataFormater;