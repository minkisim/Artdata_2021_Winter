/* eslint-disable */
import React, { PureComponent } from 'react';
import './chart.css';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from 'recharts';
import { RiStoreLine } from 'react-icons/ri';
import XDataFormater from './XDataFormater';
import { useMediaQuery } from 'react-responsive';

// 진행 중인 전시별 관람 정보 코드 (home03.js 관련)
function Chart02(props){
    const ismobile =useMediaQuery({ maxWidth: 768 });
    // 진행 중인 전시별 관람 정보 html (home03.js 관련)
    return(
        <div>
            <div className="graph_2_title">진행 중인 전시별 관람 정보</div>
            <div className="graph2">
            <ResponsiveContainer width='100%' height={'100%'}>
                <BarChart 
                data={props.data}
                margin={{
                    top: 30,
                    right: 10,
                    left: 10,
                    bottom: 30,
                }}
                barSize={ismobile ? 15 : 20}
                barGap={ismobile ? 5 : 7}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis interval={0} dataKey="name" type="category" tick={<XDataFormater/>}/>
                <YAxis style={{ fontFamily: 'Lato' }} type="number"/>
                <Tooltip cursor={{fill: 'transparent'}}/>
                <Legend align="right" verticalAlign="top"/>
                <Bar name=' 전시 관람 체류 시간' dataKey='전시 관람 체류 시간' radius={[15, 15, 0, 0]} fill="#191F1D">
                  <LabelList dataKey='전시 관람 체류 시간' position="top"/>
                </Bar>
                <Bar name=' 전시 관람객'dataKey='전시 관람객' radius={[15, 15, 0, 0]}  fill="#D0D0D0" >
                    <LabelList dataKey='전시 관람객' position="top"/>
                </Bar>

                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )

}
export default Chart02;