/* eslint-disable */
import React, { PureComponent } from 'react';
import './chart.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import { BarChart, Bar, Cell, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import YDataFormater from './YDataFormater';

//주간 전시별 관람 정보 비교 코드 (home01 .js 관련)
function Chart01(props){
    //console.log('data');
    //console.log(props.data);
    
//주간 전시별 관람 정보 비교 html (home01 .js 관련)
    return(
        <div>
            <div className="graph_1_title">주간 전시별 관람 정보 비교</div>
            <div className="graph1">
            <ResponsiveContainer width='90%' aspect={4.0/2.5}>
                <BarChart layout="vertical"
                data={props.data}
                margin={{
                    top: 50,
                    right: 10,
                    left: 10,
                    bottom: 5,
                }}
                barSize={30}
                barGap={10}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis width={130} type="category" dataKey="name" tick={<YDataFormater/>}/>
                <XAxis type="number"/>
                <Tooltip cursor={{fill: 'transparent'}}/>
                <Legend align="right" verticalAlign="bottom"/>
                <Bar name='전시 관람 체류 시간' dataKey='전시 관람 체류 시간' radius={[0, 15, 15, 0]} fill="#191F1D" >
                <LabelList dataKey='전시 관람 체류 시간' position="right"/>
                </Bar>
                <Bar name='전시 관람객'dataKey='전시 관람객' radius={[0, 15, 15, 0]}  fill="#D0D0D0" >
                <LabelList dataKey='전시 관람객' position="right"/>
                </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )

}
export default Chart01;