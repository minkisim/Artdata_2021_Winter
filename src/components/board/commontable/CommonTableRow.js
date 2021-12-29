import React from 'react';
// 게시판 용 모듈 되도록 손대지 않는 걸 추천. css 만 변경할 것.
const CommonTableRow = ({ children }) => {
  return (
    <tr className="common-table-row">
      {
        children
      }
    </tr>
  )
}
 
export default CommonTableRow;