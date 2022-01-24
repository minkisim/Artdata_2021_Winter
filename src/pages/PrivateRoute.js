
/*eslint-disable*/
/* global history */
/* global location */
/* global window */

/* eslint no-restricted-globals: ["off"] */
import React,{useEffect} from 'react';
import {Redirect, Route, useLocation} from 'react-router-dom';
import doTokenExist from './doTokenExist';

function PrivateRoute({component : Component,isLogin,path, ...rest})
{
  const location = useLocation()
  useEffect(()=>{
  },[])

  if(location.search===undefined)
  {
    return (
      <Route {...rest} render={props => (isLogin=='true') ? 
      (<Component {...props}  /> ): (<Redirect to={{pathname:"/loginPage", state:{from:path}}}/>)}/>

     );
  }
  else
   {
    return (
      <Route {...rest} render={props => (isLogin=='true') ? 
      (<Component {...props}  /> ): (<Redirect to={{pathname:"/loginPage", state:{from:path+location.search}}}/>)}/>

     );
   }
    

    
}

    export default PrivateRoute;