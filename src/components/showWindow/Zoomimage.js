/*eslint-disable*/
import React from 'react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'


// 이미지 줌 지원용 api
const Zoomimage = (props) => (
  <Zoom>
    <img
      alt="image"
      src={`/img/${props.image}` }
      onError={(e)=>{ e.target.onerror = null
        e.target.src = '/img/notfound.png'}}
      width={props.size}
    />
  </Zoom>
)

export default Zoomimage;