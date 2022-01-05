import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './chart.css'
// 관람객 누적 체류 시간 바 그래프(exhibition3.js 관련)
export default function Chart05(props){
  
   
      return (
        
        <div className='Chart05'>
          <ResponsiveContainer width='100%' height={'100%'}>
          <BarChart data={props.data}
            margin={{
              top: 30,
              right: 10,
              left: 0,
              bottom: 10,
            }}
            barSize={10}
            
          >
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis dataKey="name" type="category" />
            <YAxis type="number" />
            <Tooltip cursor={{fill: 'transparent'}}/>
            
            <Bar dataKey="Day" stroke="#191F1D" fill="#191F1D" radius={[15, 15, 0, 0]} />
         
         </BarChart>
         </ResponsiveContainer>
        </div>
      )
    
}
