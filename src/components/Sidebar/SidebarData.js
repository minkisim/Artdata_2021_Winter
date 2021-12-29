import React from 'react';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import * as RiIcons from 'react-icons/ri';
import * as BsIcons from "react-icons/bs"
// 실제 보여지는 사이드바의 데이터를 구성한 코드. 규칙만 지키면 깨지지 않습니다.
export const SidebarData = [
  
   
  {
    title: 'ArtData',
    path: '/exhibition',
    icon: <BsIcons.BsCircleFill />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: 'Exhibition',
        path: '/exhibition2',
        icon: <BsIcons.BsCircleFill />,
        cName: 'sub-nav'
      },
      {
        title: 'Artwork',
        path: '/exhibition3',
        icon: <BsIcons.BsCircleFill/>
      },
      {
        title: 'Aritist',
        path: '/artist01',
        icon: <BsIcons.BsCircleFill/>,
        cName: 'sub-nav'
      }     
    ]
  },
  {
    title: 'Auction',
    icon: <BsIcons.BsCircleFill />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: 'AuctionList',
        path: '/auctionmain',
        icon: <BsIcons.BsCircleFill/>,
        cName: 'sub-nav'
      },
      {
        title: 'MyAuction',
        path: '/myauction',
        icon: <BsIcons.BsCircleFill />,
        cName: 'sub-nav'
      }    
    ]
  },
  {
    title: 'Board',
    icon: <BsIcons.BsCircleFill />,
    iconClosed: <RiIcons.RiArrowDownSFill />,
    iconOpened: <RiIcons.RiArrowUpSFill />,

    subNav: [
      {
        title: 'Notice',
        path: '/notice',
        icon: <BsIcons.BsCircleFill/>,
        cName: 'sub-nav'
      },
      {
        title: 'CustomerService',
        path: '/customerService',
        icon: <BsIcons.BsCircleFill />,
        cName: 'sub-nav'
      }    
    ]
  }
  
];