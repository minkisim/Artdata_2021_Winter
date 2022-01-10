import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { SidebarData } from './SidebarData';
import { SidebarData2 } from './SidebarData2';
import SubMenu from './SubMenu';
import { IconContext } from 'react-icons/lib';
import { useMediaQuery } from 'react-responsive';



const Nav = styled.div`
  background: #15171c;
  position: fixed;
  top:150px;
  width: 50px;
  height: 50px;
  border-radius: 0px 10px 10px 0px;
  display: flex;
  justify-content: flex-start;
  align-items: left top;
`;

const Nav2 = styled.div`
  background: #ffffff;
  position: absolute;
  top:20px;
  left: 10px;
  width: 50px;
  height: 50px;
  border-radius: 0px 10px 10px 0px;
  display: flex;
  justify-content: flex-start;
  align-items: left top;
`;

const NavIcon = styled(Link)`
  margin-left: 0.2rem;
  padding-top:0.1rem;
  padding-left:0.2rem;
  font-size: 2rem;
  height:45px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const SidebarNav = styled.nav`
  background: #15171c;
  position : fixed;
  top:150px;
  width: 220px;
  border-radius: 0px 30px 0px 0px;
  height: 900px;
  display: flex;
  justify-content: center;
  left: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
  transition: 350ms;
  z-index: 10;
`;

const SidebarNav2 = styled.nav`
  background: #15171c;
  position : fixed;
  top:30px;
  width: 50vw;
  border-radius: 0px 30px 0px 0px;
  height: 900px;
  display: flex;
  justify-content: center;
  left: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
  transition: 350ms;
  z-index: 10;
`;

const SidebarWrap = styled.div`
  width: 100%;
`;

const Sidebar =  () => {
  const [sidebar, setSidebar] = useState(false);
  const ismobile =useMediaQuery({ maxWidth: 768 });
  const showSidebar = () => setSidebar(!sidebar);
  return (
    <>
      <IconContext.Provider value={{ color: '#888888' }}>
      { ismobile ?  <Nav2>
          <NavIcon to='#'>
            <FaIcons.FaBars style={{zIndex: 1}} onClick={showSidebar} />
          </NavIcon>
        </Nav2> :  <Nav>
          <NavIcon to='#'>
            <FaIcons.FaBars style={{zIndex: 1}} onClick={showSidebar} />
          </NavIcon>
        </Nav> }
        { ismobile ? <SidebarNav2 sidebar={sidebar}>
          <SidebarWrap>
            <NavIcon to='#'>
              <AiIcons.AiOutlineClose onClick={showSidebar} />
             </NavIcon>
            { ismobile ? SidebarData2.map((item, index) => {
              return <SubMenu item={item} key={index} />;
            }) : 
            SidebarData.map((item, index) => {
              return <SubMenu item={item} key={index} />;
            })
            }
          </SidebarWrap>
        </SidebarNav2> : <SidebarNav sidebar={sidebar}>
          <SidebarWrap>
            <NavIcon to='#'>
              <AiIcons.AiOutlineClose onClick={showSidebar} />
             </NavIcon>
            { ismobile ? SidebarData2.map((item, index) => {
              return <SubMenu item={item} key={index} />;
            }) : 
            SidebarData.map((item, index) => {
              return <SubMenu item={item} key={index} />;
            })
            }
          </SidebarWrap>
        </SidebarNav> }
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;