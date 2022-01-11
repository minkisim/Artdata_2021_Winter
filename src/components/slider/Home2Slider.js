import ShowWindow4 from "../showWindow/ShowWindow4";
import React, { Component } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
// 이미지 슬라이더를 위한 코드. 완성본.
export default class SimpleSlider extends Component {


  render() {
    var settings = {
      dots: true,
      infinite: true,
      speed: 700,
      slidesToShow: 5,
      slidesToScroll: 5,
      initialSlide: 0,
      autoplay: true,
      autoplaySpeed: 3000,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 5,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            initialSlide: 0,
            dots: true
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true
          }
        }
      ]
    };
   // console.log('내부 데이터');
   // console.log(this.props.dataset);
    return (
      <div>
      
        <Slider {...settings} dotsClass="dotsCSS">
          {this.props.dataset && this.props.dataset.map( data => <Link to={`/exhibition3/${data.id}`}><div><ShowWindow4 data={data}></ShowWindow4></div></Link>
          )}
        </Slider>
      </div>
    );
  }
}