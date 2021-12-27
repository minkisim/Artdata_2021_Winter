import React, { PureComponent,useState, useEffect,useLayoutEffect }  from "react";
import {BrowserRouter, Router, Switch, Route, Link} from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import "./board.css";

function Editor({isLogin, isAdmin}){
    return(
        <>
        <div className="NoticeEditor_block">
                <div className="NoticeEditor_title">
                    <p>공지사항 작성</p>
                </div>
                <input className="title_input" type='text' placeholder='제목을 입력해주세요.' />
                <div className="NoticeEditor">
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
                <div className="EditorFlex">
                            <button className="submitButton">등록</button>
                            <button className="submitButton">취소</button>
                </div>
        </div>
        </>
    )
}

export default Editor;
