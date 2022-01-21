
/*eslint-disable*/
/* global history */
/* global location */
/* global window */

/* eslint no-restricted-globals: ["off"] */
import React,{useLayoutEffect} from 'react';
import {Redirect, Route} from 'react-router-dom';
import doTokenExist from './doTokenExist';

function PrivateRoute({component : Component,isLogin,path,search, ...rest})
{

  if(search===undefined)
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
      (<Component {...props}  /> ): (<Redirect to={{pathname:"/loginPage", state:{from:path+search}}}/>)}/>

     );
   }
    

    
}

    export default PrivateRoute;