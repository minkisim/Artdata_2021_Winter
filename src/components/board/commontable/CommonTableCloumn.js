import React from 'react';
// 게시판 용 모듈 되도록 손대지 않는 걸 추천. css 만 변경할 것.
const CommonTableColumn = ({ children }) => {
  return (
    <td className="common-table-column">
      {
        children
      }
    </td>
  )
}
 
export default CommonTableColumn;