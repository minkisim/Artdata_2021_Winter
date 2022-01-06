import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';

// 원형 그래프 코드
const COLORS = ['#D0D0D0', '#888888', '#484848', '#1A1311'];
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 3} y={ey} textAnchor={textAnchor} fill="#333">{`인원 ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 3} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default class Chart04 extends PureComponent {
  static demoUrl = 'https://codesandbox.io/s/pie-chart-with-customized-active-shape-y93si';

  state = {
    activeIndex: 0,
  };

  onPieEnter = (_, index) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    return (
      <ResponsiveContainer width="100%" height="110%">
        <PieChart width={"90%"} height={"50%"} 
        padding={{
          top: 0,
          right: 20,
          left: 20,
          bottom:0
        }}>
          <Pie
            activeIndex={this.state.activeIndex}
            activeShape={renderActiveShape}
            data={this.props.data}
            cx="50%"
            cy="50%"
            innerRadius={"30%"}
            outerRadius={"50%"}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={this.onPieEnter}
          >
            {this.props.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }
}