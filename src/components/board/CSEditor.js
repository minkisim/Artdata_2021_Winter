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

function CSEditor({isLogin, isAdmin}){
    const selectList = ["서비스 종류", "전시관 관련", "작가 관련", "경매 진행 관련", "경매 결제 관련", "사이트 관련"]

    const [title,setTitle] = useState()
    const [boardtype, setBoardtype] = useState("서비스 종류")
    const [bodytext, setBodytext] = useState("")


    function upload()
    {

        alert("등록 되었습니다.")
        alert(boardtype)
    }

    function cancel()
    {
        history.back()
    }

    return(
        <>
        <div className="CSEditor_block">
                <div className="CSEditor_title">
                    <p>고객센터 문의</p>
                </div>
                <input className="CS_title_input" type='text' placeholder='제목을 입력해주세요.' />
                <div className="CSEditor_mode">
                    <select className="CSEditor_select" onChange={(e)=>{setBoardtype(e.target.value)}} value={boardtype}>
                       {
                           selectList.map((item)=>(
                               <option value = {item} key={item}>{item}</option>
                           ))
                       }
                    </select>
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

export default CSEditor;
