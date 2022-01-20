/*eslint-disable*/
/* global history */
/* global location */
/* global window */

/* eslint no-restricted-globals: ["off"] */
import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import "./board.css";
import { func } from "prop-types";

import queryString from 'query-string'
import {protocol,  dev_ver } from '../../pages/global_const'
import axios from "axios";
// 고객 센터 답변용 코드
function CSAnswer({isLogin, isAdmin}){
  
    const [bodytext, setBodytext] = useState("")

    useEffect(()=>{

    },[])

    function upload()
    {
        var jsondata = {
            boardtype:null,
            title : null,
            bodytext : null,
            username : null,
            indices : null
        }

        const query = queryString.parse(location.search)
        if(query != undefined && query.username != undefined && query.indices != undefined)
        {
           jsondata.username = query.username
            jsondata.indices = query.indices
        }
        else
        {
            alert("잘못된 접근입니다.")
            window.location.href = "/customerService"
        }

        if(bodytext!=undefined && bodytext.length>=1)
        {
            jsondata.bodytext = bodytext
        }

        else
        {
            alert("내용을 입력하십시오.")
            return false
        }

        axios.post(`${protocol}://${dev_ver}:4000/api/board/answer`,jsondata)
        .then((res)=>{
            if(res.data.login_required)
            {
                alert("로그인이 필요합니다.")
                window.location.href = '/loginPage'
            }
            else if(res.data.db_error){
                alert("등록에 실패하였습니다.")
            }
            else if(res.data.result)
            {
                alert("등록 되었습니다.")
                window.location.href = '/customerService'
            }
            
            
        })
        .catch((err)=>{
           
            alert(err)
        })
        
    }

    function cancel()
    {
        history.back()
    }
// 고객 센터 답변용 html ( 글쓰기 에디터 모듈 포함)
    return(
        <>
        <div className="CSEditor_block">
                <div className="CSEditor_title">
                    <p>고객센터 답장</p>
                </div>
                 <div className="CSEditor_mode">
                   
                </div>
                <div className="CS_Editor">
                        <div className="form-wrapper">
                            <CKEditor
                            config={{placeholder:"내용을 입력해주세요"}}
                            editor={ClassicEditor}
                            data=""
                            onReady={editor => {
                                // You can store the "editor" and use when it is needed.
                                console.log('Editor is ready to use!', editor);
                            }}
                            onChange={(event, editor) => {
                                const data = editor.getData();
                                console.log({ event, editor, data });
                                setBodytext(editor.getData())
                            }}
                            onBlur={(event, editor) => {
                                console.log('Blur.', editor);
                            }}
                            onFocus={(event, editor) => {
                                console.log('Focus.', editor);
                            }}
                            />
                        </div>   
                </div>
                <div className="CSEditorFlex">
                            <button onClick={upload} className="submitButton">등록</button>
                            <button onClick={cancel} className="submitButton">취소</button>
                </div>
        </div>
        </>
    )
}

export default CSAnswer;