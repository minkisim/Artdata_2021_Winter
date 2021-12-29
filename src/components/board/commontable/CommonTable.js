import React from 'react';
import './CommonTable.css';
// 게시판 용 모듈 되도록 손대지 않는 걸 추천. css 만 변경할 것.
const CommonTable = props => {
  const { headersName, children } = props;
 
  return (
    <table className="common-table">
      <thead>
        <tr>
          {
            headersName.map((item, index) => {
              return (
                <td className="common-table-header-column" key={index}>{ item }</td>
              )
            })
          }
        </tr>
      </thead>
      <tbody>
        {
          children
        }
      </tbody>
    </table>
  )
}
 
export default CommonTable;