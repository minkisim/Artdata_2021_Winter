const express = require('express');
const app = express();
//const db = require('./config/db');
const cors = require("cors");

//mysql추가사항
var mysql = require('mysql2')
//var mysql_dbConfig = require('./config/db') 
const connection = mysql.createConnection({
    host : "localhost",
    user : "vane",
    password : "vane2021@@",
    database : "nodedb",
    port : "3306"
})

connection.connect((err)=>{
    if(err)
    {
        console.log(err)
    }

    else{
        console.log('mysql 연결완료')
    }
    
})

const pool = mysql.createPool({
    host : "localhost",
    user : "vane",
    password : "vane2021@@",
    database : "nodedb",
    port : "3306"
})

const promisePool = pool.promise()

//mysql추가사항 end


//const dev_ver = require("../pages/global_const");
const corsOptions = {
    origin : true,
    credentials : true,
}

const fs = require('fs');

const cookieParser = require('cookie-parser');
//비밀번호 암호화에 사용될 모듈
/*
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRound = 16;
const tokenKey = 'veryveryveryImportantToKeepIt';
*/
const multer = require('multer');

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send({test:'Server Response Sucess'});
});


/*로그인 추가사항 */
//const http = require('http')
var serveStatic = require('serve-static'); 
var path = require('path');
var session = require('express-session');
var bodyParser_post = require('body-parser');       //post 방식 파서
const { off } = require('process');
const { elemIndices } = require('prelude-ls');
//const nodedb = require('./models/nodedb');
//const { connect } = require('http2');
//const FileStore = require('session-file-store') (session)

//join은 __dirname : 현재 .js 파일의 path 와 public 을 합친다
//이렇게 경로를 세팅하면 public 폴더 안에 있는것을 곧바로 쓸 수 있게된다
app.use(serveStatic(path.join(__dirname, 'public')));
 
 
//post 방식 일경우 begin
//post 의 방식은 url 에 추가하는 방식이 아니고 body 라는 곳에 추가하여 전송하는 방식
app.use(bodyParser_post.urlencoded({ extended: false }));            // post 방식 세팅
app.use(bodyParser_post.json());                                     // json 사용 하는 경우의 세팅
//post 방식 일경우 end

//쿠키와 세션을 미들웨어로 등록한다
//app.use(cookieParser());
app.use(cookieParser('session-secret-key'));
//세션 환경 세팅
//세션은 서버쪽에 저장하는 것을 말하는데,
//파일로 저장 할 수도 있고 레디스라고 하는 메모리DB등 다양한 저장소에 저장 할 수가 있는데


//세션 설정
app.use(session({
    secret: 'my key',           //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐
                                //아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
    resave: false,
    //store: new FileStore(),   //파일에 세션 저장
    saveUninitialized:false,
    cookie:{
    //    expires: 60*60*24*1000
    //domain:'artdata',path:'/'
    }
}));
/*
app.use(function(req, res) {

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header("Access-Control-Allow-Origin", process.env.ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-   Type, Accept, Authorization");
    });
*/
app.set('trust proxy',1)


//줄바꿈 처리
//var nl2br  = require('nl2br')


app.use('/file', express.static('../public')); 
app.use('/text', express.static('../public/text')); 
app.use('/img', express.static('../public/img')); 
app.use('/pdf', express.static('../public/pdf')); 


app.use(cookieParser());

var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(file.mimetype=='image/png' || file.mimetype=='image/jpeg')
            cb(null, 'public/img/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정

        else if(file.mimetype=='application/pdf')
            cb(null, 'public/pdf/')
        else
            cb(null,'public/text/')
    },

    filename: function (req, file, cb) {
      cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
  });

//const upload2 = multer({dest: 'upload/'})
const upload = multer({ storage: _storage });//이렇게하지않으면 filename이 undefined가 나오게됨.

app.post('/api/fileupload', upload.single('file'), function(req, res){
   
    console.log(req.file); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.
   // if(req.file.mimetype=='image/png' || req.file.mimetype=='image/jpeg')
    //{
        
    //}
    res.json({
        success:true
    })
  });

app.post('/api/artist_upload',(req,res) => {
    //작가 업로드

    let jsondata = {}

    //json데이터에 사용자가 입력한 정보 담기
    if(req.body.artist != undefined && req.body.artist.length>=1)
        {
            jsondata.artist = req.body.artist
        }

    if(req.body.life_term != undefined && req.body.life_term.length>=1)
        {
            jsondata.life_term = req.body.life_term
        }

    if(req.body.filename != undefined && req.body.filename.length>=1)
    {
        jsondata.filename = req.body.filename
    }

    if(req.body.artistInfo != undefined && req.body.artistInfo.length>=1)
    {
        jsondata.artist_info = (req.body.artistInfo)
    }

    if(req.body.artistyearInfo != undefined && req.body.artistyearInfo.length>=1)
    {
        jsondata.artistyearInfo = (req.body.artistyearInfo)
    }

            //수정할 작가 id가 
            //존재하지 않을 경우 새로운 작가 등록하기
            if(req.body.id==undefined || req.body.id.length<1)
            {
               //가장 최근에 쓰인 작가id 찾아서
               //거기에 +1한걸 새로운 작가 id로 사용하기
                var query = "select artist_id from (select t.*, @rownum := @rownum + 1 rownum  from (select artist_id from artist order by artist_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1;"
                connection.query(query,(err,result)=>{
                    var idnum
                //질의 결과가 있으면 +1 한 것 쓰기
                if(result!=undefined && result[0]!=undefined)
                {
                    idnum = result[0].artist_id+1
                    console.log("추가 : "+idnum)
                }
                //질의 결과가 없다는건 아무 튜플도 입력되지 않은 상태
                //1을 작가 id로 사용
                else{
                    idnum = 1
                    console.log('추가 : 1')
                }

                //작가 튜플 생성
                query = "insert into artist values (?, ?, ?, ?, ?)"
                connection.query(query,[
                    idnum,
                    req.body.artist,
                    req.body.artistInfo,
                    req.body.life_term,
                    req.body.artistyearInfo
                ],(err,result2)=>{
                    if(result2.affectedRows>=1)
                    {
                        connection.commit()
                        res.json({
                            success:true
                        })
                    }
                    else{
                        res.json({
                            success:err
                        })
                    }
                })

                })
            }
            //수정할 작가 id가 존재할 경우
            //작가 정보 업데이트
            else{
                var query = "update artist set artist_name = ?, artist_info = ?, life_term = ?, artist_career = ? where artist_id = ?"
                connection.query(query,[
                    req.body.artist,
                    req.body.artistInfo,
                    req.body.life_term,
                    req.body.artistyearInfo,
                    req.body.id
                ],(err,result2)=>{
                    if(result2.affectedRows>=1)
                    {
                        connection.commit()
                        res.json({
                            success:true
                        })
                    }
                    else{
                        res.json({
                            success:err
                        })
                    }
                })
            }

})


app.post('/api/artist_upload/search',(req,res)=>{
    //작가 정보 작가 id로 찾아와서
    //관리자의 작가 수정하기에서 작가 정보 보여주기용

            var query = "select artist_name, life_term, Artist_info, Artist_career from artist where artist_id = ?"

            connection.query(query, [req.body.id],(err,result)=>{
                if(err)
                {
                    console.log(err)
                }
                else if(result!=undefined && result[0]!= undefined)
                {
                    res.json({
                        artist: result[0].artist_name,
                        life_term: result[0].life_term,
                        artist_info: result[0].Artist_info,
                        artistyearInfo: result[0].Artist_career
                    })
                }
            })
})

app.post('/api/imgupload',(req,res) => {
    //작품 업로드 혹은 등록

    //업로드할 작품 id가 입력되지 않았을때
    //새로운 작품 등록
    if(req.body.id==undefined || req.body.id.length<1)
    {

            //가장 최근에 쓰인 작품 id찾아서
            //+1한 값을 새로운 작품의 id로 사용하기
            var query = "select art_id from (select t.*, @rownum := @rownum + 1 rownum  from (select art_id from art order by art_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"
            connection.query(query,(err,result)=>{
                var idnum
                //질의 결과가 존재할 경우
                //+1한 값
                if(result.rows!=undefined)
                {
                    idnum = result[0].art_id+1
                    console.log("추가 : "+idnum)
                }
                //질의 결과가 없을 경우
                //아무 튜플도 없다는 의미이므로 1을 사용
                else{
                    idnum = 1
                }
                console.log(req.body)
                console.log("idnum : "+idnum)

                var query = "insert into art values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        
                connection.query(query,
                    [
                        idnum,
                        req.body.artname,
                        null,
                        req.body.imagesize,
                        req.body.imageurl,
                        req.body.imagetype,
                        req.body.arttext,
                        req.body.USD_upper,
                        req.body.USD_lower,
                        req.body.KRW_upper,
                        req.body.KRW_lower,
                        req.body.artrelease_date,
                        100,
                        100,
                        req.body.artist,
                        req.body.exhibition,
                        null,
                        null
                    ],(err, result2)=>{
                        if(err)
                        {
                            console.log(err)
                            res.json({success:false})
                        }
                        else if(result2 != undefined  && result2.affectedRows>=1)
                        {
                            res.json({success:true})
                        }
                        else
                        {
                            res.json({notexist:true})
                        }
                    })
            })
    }
    //입력된 작품 id가 존재할 경우
    //해당 작품 업데이트
    else
    {
        console.log("수정할 id : "+req.body.id)
            //새로 등록할 파일이 있는 경우
            if(req.body.imageurl !=undefined)
            {
                var query = "update art set Art_name = ?,  Image_size= ?, Image_url = ?, Image_type = ?, Art_text = ?, usd_upper = ?, usd_lower = ?, krw_upper = ?, krw_lower = ?, Displaydate = ?,  Artist_id = ?, Exhibition_id = ? where art_id = ?"
                var exhibition = req.body.exhibition == null ? null : req.body.exhibition
                connection.query(query,
                    [
                        req.body.artname,
                        req.body.imagesize,
                        req.body.imageurl,
                        req.body.imagetype,
                        req.body.arttext,
                        req.body.USD_upper,
                        req.body.USD_lower,
                        req.body.KRW_upper,
                        req.body.KRW_lower,
                        req.body.artrelease_date,
                        req.body.artist,
                        exhibition,
                        req.body.id
                    ],(err, result2)=>{
                        if(err)
                        {
                            console.log(err)
                            res.json({success:false})
                        }
                        else if(result2 != undefined && result2.affectedRows>=1)
                        {
                            res.json({success:true})
                        }
                        else
                        {
                            res.json({notexist:true})
                        }
                    })

                }
                //새로운 파일 등록을 하지 않은 경우
                else{
                    //위와 달리 image_url을 업데이트하지 않음
                    var query = "update art set Art_name = ?,  Image_size= ?, Image_type = ?, Art_text = ?, usd_upper = ?, usd_lower = ?, krw_upper = ?, krw_lower = ?, Displaydate = ?,  Artist_id = ?, Exhibition_id = ? where art_id = ?"
                    connection.query(query,
                        [
                            req.body.artname,
                            req.body.imagesize,
                            req.body.imagetype,
                            req.body.arttext,
                            req.body.USD_upper,
                            req.body.USD_lower,
                            req.body.KRW_upper,
                            req.body.KRW_lower,
                            req.body.artrelease_date,
                            req.body.artist,
                            req.body.exhibition,
                            req.body.id
                        ],(err, result2)=>{
                            if(err)
                            {
                                console.log(err)
                                res.json({success:false})
                            }
                            else if(result2 != undefined && result2.affectedRows>=1)
                            {
                                res.json({success:true})
                            }
                            else
                            {
                                res.json({notexist:true})
                            }
                        })
                }
            
    }

});

app.post('/api/imgupload/search',(req,res) => {
//작품 id로 작품 정보 찾아서
//관리자 작품 수정하기에서 작품 정보 보여주기용

        //입력된 작품 id로 작품정보 찾기
        var query = "select artist_id, art_name, exhibition_id, Displaydate, Image_size, Image_type, KRW_lower, KRW_upper, USD_lower,USD_upper, Art_text from art where art_id = ?"
        connection.query(query,[req.body.id],(err,result)=>{
            if(err)
            {
                res.json({err:err})
            }
            if(result!=undefined && result[0]!=undefined)
            {
                
                res.json({
                    artist : result[0].artist_id,
                    artname : result[0].art_name,
                    exhibition : result[0].exhibition_id,
                    artrelease_date : result[0].Displaydate,
                    imagesize : result[0].Image_size,
                    imagetype : result[0].Image_type,
                    KRW_lower : result[0].KRW_lower,
                    KRW_upper : result[0].KRW_upper,
                    USD_lower : result[0].USD_lower,
                    USD_upper : result[0].USD_upper,
                    arttext : result[0].Art_text
    
                })
            }
            else{
                res.json(null)
            }
        })
})

app.post('/api/auction_upload',(req,res) =>{
//경매 등록하기

    //세션을 확인
    //경매의 매니저는 현재 로그인한 관리자의 정보를 가져올 것이므로
    //세션의 정보를 통해 관리자 정보 알아냄
    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
                    //경매로 등록할 작품이 실제로 db에 존재하는지 알기 위해
                    //해당 작품 id로 튜플검색
        var  query = "select a.art_id from art a where a.art_id = ?"
        connection.query(query, [req.body.art_id],(err,result)=>{
                 //해당 작품이 db에 존재할 때
                 if(result!=undefined && result[0] != undefined)
                 {
                     //가장 최근에 등록된 경매 id에 +1한 값을
                     //새로운 경매의 id로 등록
                     query = "select auction_id from (select t.*, @rownum := @rownum + 1 rownum  from (select auction_id from auction order by auction_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"
                     connection.query(query,(err,result2)=>{
                        var idnum

                        if(result2 != undefined && result2[0] != undefined)
                        {
                            idnum = result2[0].auction_id+1
                            console.log("추가 : "+idnum)   
                        }
                        //질의 결과가 없다는 것은
                        //튜플이 없다는 의미이므로 1로 설정
                        else{
                            idnum = 1
                            console.log("추가 : " + 1)
                        }
   
   
                        //경매에 등록하려는 작품의 id, 해당 작품의 작가 id, 하한가 알아내기
                        //단 이미 경매에 등록되지 않은 작품이어야 함
                        query = "select a.art_id, a.artist_id, a.krw_lower from art a where a.art_id = ? and not exists (select t.art_id from auction t where t.art_id = a.art_id)"
                        connection.query(query, [req.body.art_id],(err,result3)=>{
                            console.log(result3)
                            if(result3!=undefined && result3[0] != undefined)
                            {
                                //작품을 경매에 등록
                                query = "insert into auction values (?, ?, DATE_FORMAT(?,'%Y-%m-%d'), DATE_FORMAT(?,'%Y-%m-%d'), ?, ?, ?, ?, ?)"
       
                                try{
                                    connection.query(query,[
                                        idnum,
                                        req.body.unit,
                                        req.body.begintime,
                                        req.body.endtime,
                                        result3[0].krw_lower,
                                        null,
                                        req.session.user.username,
                                        result3[0].artist_id,
                                        result3[0].art_id
                                        
                                    ],(err, result4)=>{

                                        if(result4 != undefined && result4.affectedRows>=1)
                                        {
                                            connection.commit()
                                            res.json({
                                                success:true
                                            })
                                        }
                                        else{
                                            connection.rollback()
                                            res.json({
                                                success:false
                                            })
                                        }
                                    })
                                }catch(err)
                                {
                                    connection.rollback()
                                    res.json({
                                        err:err
                                    })
                                }
                                
                            }
                            //이미 작품이 경매에 등록되어 있는 경우
                            else{
                                res.json({
                                    auctionexist:true
                                })
                            }
                        })
                        
                     })
             }
             //해당 작품이 존재하지 않을 때
             else{
                 res.json({
                     nosuchart:true
                 })
             }                                    
        })

                   
    }
    //세션이 없다면 로그인 하지 않은 경우임
    else
    {
        res.json({
            notlogin:true
        })
    }


})

app.get('/img',(req,res)=>{

    console.log(__dirname+' 안됨? '+req.query.var1)
    //res.sendFile(__dirname+`/../upload/img/sign (2).png`);
    
    
    fs.readFile(__dirname+`/../../public/img/`+req.query.var1,(err,data)=>{
        if(err){
            res.writeHead(500, {'Content-Type':'text/html'});
            res.end('500 Internal Server '+err);
            console.log('성공');
          }else{
            // 6. Content-Type 에 4번에서 추출한 mime type 을 입력
            res.writeHead(200, {'Content-Type':'image/png'});
            res.end(data);
            console.log('실패');
          }

        //res.writeHead(200, {'Content-Type': 'text/html'});
       // res.write('<h1>파일 업로드 성공</h1>');
        //res.end(data);
    })

})

app.post('/api/searchArtwork/search',(req,res) => {
    //관리자 페이지에서 작품명으로 작품 찾기

        //like 작품명%로 작품 찾기
        var query = "select a.art_id, a.art_name, r.artist_name  from art a, artist r where a.art_name like ? and a.artist_id = r.artist_id order by a.art_name"
        connection.query(query, [req.body.input+"%"],(err,result)=>{
            if(err)
            {
                res.json({err:err})
            }
            var jsondata = []
            if(result!=undefined && result[0]!=undefined)
            {
                result.forEach((item)=>{
                    var data = {
                        id : item.art_id,
                        artname : item.art_name,
                        artist : item.artist_name
                    }
                    jsondata.push(data)
                })
            }
            res.json(jsondata)
        })
})

app.post('/api/searchArtwork/delete',async (req,res) => {
//관리자 페이지에서 
//선택한 작품 삭제하기
        var input = []
        //checkBoxId는 삭제하려는 작품의 id들의 배열
        for(let i=0; i< req.body.checkBoxId.length; i++)
        {
            input.push([
                req.body.checkBoxId[i]
            ])

        }
        //한번의 dbms요청으로 배열에 담긴 작품 id들을 삭제
        var query = "delete from art where art_id = ?;"
        var sql = ""

        connection.beginTransaction((err)=>{
            for(let i=0; i<input.length; i++)
            {
                sql += query
            }
            connection.query(sql,input,(err,result)=>{
                if(err)
                {
                    connection.rollback()
                    console.log(err)
                    res.json({
                        success:false
                    })
                }
                else
                {
                    connection.commit()
                    console.log(result)
                    res.json({
                        success:true
                    })
                }
            })
    
        })

})

app.post('/api/searchArtist/search',(req,res) => {
    //관리자 페이지에서 작가명으로 작가 찾기
        //like 작가명% 로 작가찾기 
        var query = "select r.artist_id, r.artist_name, r.life_term  from artist r where r.artist_name like ? order by r.artist_name"
        connection.query(query, [req.body.input+"%"],(err,result)=>{
            if(err)
            {
                res.json({err:err})
            }
            var jsondata = []
            if(result!=undefined && result[0]!=undefined)
            {
                result.forEach((item)=>{
                    var data = {
                        id : item.artist_id,
                        artist : item.artist_name,
                        life_term : item.life_term
                    }
                    jsondata.push(data)
                })
            }
            res.json(jsondata)
        })
})

app.post('/api/searchArtist/delete',(req,res) => {
//관리자 페이지 작가 삭제
    console.log(req.body.checkBoxId)

        var input =[]
        //checkBoxId는 삭제할 작가의 id가 담긴 배열
        for(let i=0; i< req.body.checkBoxId.length; i++)
        {
            input.push([
               req.body.checkBoxId[i]
            ])
        }
        console.log(input)

        //작가id를 통해 작가 삭제
        var query = "delete from artist where artist_id = ?;"
        var sql = ""

        connection.beginTransaction((err)=>{
            for(let i=0; i<input.length; i++)
            {
                sql += query
            }
            connection.query(sql,input,(err,result)=>{
                if(err)
                {
                    connection.rollback()
                    console.log(err)
                    res.json({
                        success:false
                    })
                }
                else
                {
                    connection.commit()
                    console.log(result)
                    res.json({
                        success:true
                    })
                }
            })
    
        })


})


app.post('/api/joinForm',(req,res)=>
{
        //회원 정보 등록
        let query = "INSERT INTO ARTUSER VALUES (?, ?, ?, ?, ?, ?)"
        connection.query(query, [
            req.body.username,
            req.body.name,
            req.body.password,
            req.body.email,
            req.body.phone,
            "ROLE_USER"],
             async (err,result) =>
        {
            if(err)
            {
                console.error(err.message);

                return res.status(200).json({
                    success:false
                })
            }


            if(result != undefined && result.affectedRows>=1)
            {
                console.log("COMMIT 회원가입 성공")
                connection.commit()
                return res.status(200).json({
                    success:true
                })
            }
            else{
                connection.rollback()
                return res.status(200).json({
                    success:false
                })
            }


        })

})

app.post('/api/loginForm',(req,res)=>
{
    console.log('로그인');

        var uname = req.body.username
        
        //사용자명으로 비밀번호, 사용자 권한 알아내기
        let sql = "select username, name, password, email,  role from artuser where username = ?";
        console.log(uname.trim());
        //uname.trim()으로 공백 지운
        //사용자의 아이디 입력값으로
        //db에 등록된 사용자 찾기
        connection.query(sql, [uname.trim()], function(err,result,fields)
        {
            if(err)
            {
                console.error(err.message);
                return;
            }

            //결과가 없거나, 결과 튜플의 비밀번호가 사용자가 입력한 비밀번호와 일치하지 않을때, 로그인 실패
            if(result==undefined || result[0] == undefined || result[0].password != req.body.password)
            {
                console.log("비밀번호 불일치 : "+err);
                return res.json({
                    success:false
                })
            }
            //로그인 성공
            else
            {
                var roles = null
                //사용자 세션 생성, 세션으로 이후 로그인 없이 사용자 정보 얻어올 수 있음
                req.session.user =
                {
                    id: result[0].username,
                    username: result[0].username,
                    email: result[0].email,
                    name : result[0].name,
                    role: roles = result[0].role.toUpperCase(),
                    success:true,
                    authorized: true
                };

                req.session.save((err)=>{console.log(err)})

                console.log("세션 등록성공 : "+req.session)
                // 세션 ID
                const sessionID = req.sessionID;
                console.log('session id :', sessionID);
                    

                return res.json({
                        success: true,
                        session: req.session
                })
                //.render('/api/checkAdmin',{
                //    session : req.session
                //})
 
            }

        })
})

app.get('/api/logout',(req,res)=>{
    //세션 제거함으로 로그아웃
    req.session.destroy()
    res.json({
        success:true
    })
})


//여기서 부터 blog내용 적용
app.get('/api/home1/about', (req, res) =>
{
        //Home1 화면에 출력할 최근 등록한 작품 3개 정보 얻기
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name, a.art_name, e.exhibition_name, a.Image_url , a.Art_id  from art a, artist r, exhibition e where a.artist_id = r.artist_id and a.exhibition_id = e.exhibition_id  order by a.art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 3"
        connection.query(query,
            
            async (err,result) =>
        {
            if(err)
            {
                console.error(err.message);
                
                return res.status(200).json({
                    success:false
                })
            }
            var jsondata = []

            if(result != undefined && result[0] != undefined)
            {
                result.forEach((rows) => {

                    var data = {
                        artist: rows.artist_name,
                        artname: rows.art_name,
                        exhibition: rows.exhibition_name,
                        imageurl:rows.Image_url,
                        art_id:rows.Art_id
                    }
                    jsondata.push(data)
                })
            }

            return res.json(jsondata)
        })
})

app.get('/api/home1/about2', (req, res) =>
{
    //HOME1 최근 등록된 작품3개의
    //하단 그래프용 정보 얻어오기

        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select a.art_name, a.Remaintime, a.Audience_number  from  art a order by Remaintime, Audience_number desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 3"
        connection.query(query,
            
            async (err,result,fields) =>
        {
            if(err)
            {
                console.error(err.message);
                
                return res.status(200).json({
                    success:false
                })
            }

            var jsondata = []

            if(result != undefined)
            {
                result.forEach((rows) => {
                    var data = {
                        name : rows.art_name,
                        '전시 관람 체류 시간' : rows.Remaintime,
                        '전시 관람객': rows.Audience_number
                    
                    }
                    jsondata.push(data)
                })
            }

            return res.json(jsondata)
        })


})


app.get('/api/home2',(req,res) => {

    //HOME2에서 보여줄 가장 최근에 등록된 작품의 정보 가져오기
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select  a.image_url, a.art_name, a.displaydate, r.artist_name, a.Art_text,  a.art_id  from  artist r, art a, exhibition e where r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id order by art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"

        connection.query(query,
            
            async (err,result) =>
        {
            if(err)
            {
                console.error(err.message);
                
                return res.status(200).json({
                    success:false
                })
            }

           if(result!=undefined)
           {
            var data = {
                    imageurl :result[0].image_url,
                    artname : result[0].art_name,
                    displaydate: result[0].displaydate,
                    artist: result[0].artist_name,
                    arttext: result[0].Art_text,
                    id:result[0].art_id
                }
            }
            return res.json(data)
        })
})


app.get('/api/home3/slider', function (req, res) {
    //HOME3 슬라이드에 사용되는 가장 최근에 등록된 작품 15개 보여주기
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name, a.art_name, e.exhibition_name, a.Image_url , a.Art_id  from art a, artist r, exhibition e where a.artist_id = r.artist_id and a.exhibition_id = e.exhibition_id  order by a.art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 15"
        connection.query(query,
            
            async (err,result) =>
        {
            if(err)
            {
                console.error(err.message);
                
                return res.status(200).json({
                    success:false
                })
            }

            var jsondata = []

            if(result != undefined)
                result.forEach((rows, index) => {
                    var data = {
                        artist: rows.artist_name,
                        artwork: rows.art_name,
                        musium: rows.exhibition_name,
                        imgUrl: rows.Image_url,
                        id: rows.Art_id
                    }

                    jsondata.push(data)

                })

            return res.json(jsondata)

        })   
});

app.get('/api/home3/graph', function (req, res) {
 //HOME3의 그래프에 사용될
 //가장 최근에 등록한 작품 5개의 정보 가져오기
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from ( select art_name, Remaintime ,Audience_number  from art a order by art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 5"
        connection.query(query,
            
            async (err,result) =>
        {
            if(err)
            {
                console.error(err.message);
                
                return res.status(200).json({
                    success:false
                })
            }

            var jsondata = []
           
            if(result != undefined)
            {
                result.forEach((array)=>{
                    var data = {name : array.art_name,
                        '전시 관람 체류 시간' : array.Remaintime,
                        '전시 관람객': array.Audience_number}
    
                    //console.log('\n')
    
    
                    jsondata.push(data)
                })
            }

            return res.json(jsondata)


        })

});

app.get('/api/home3/date', function (req, res) {
    //HOME3 일정 정보
    res.json(
        [
            {
                data: "a 일정 12~13"
            }
              ,
            {
                data: "b 일정 13~14"
            }
            ,
            {
                data: "c 일정 13~14"
            },
            {
                data: "d 일정 14~15"
            }
            ,
            {
             
                data: "e 일정 16~17"
            }
            ,
            {
                data: "f 일정 14~15"
            }
            ,
            {
                data: "g 일정 16~17"
            }
        ]
    );
});


app.get('/api/home4/data', function (req, res) {
//HOME4
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name , a.art_name, a.image_url, a.art_id  from  artist r, art a, exhibition e where r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id order by art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 3"
        connection.query(query,
            
            async (err,result) =>
        {
            if(err)
            {
                console.error(err.message);
                
                return res.status(200).json({
                    success:false
                })
            }

            var jsondata = []

            if(result != undefined && result[0] != undefined)
            {
                result.forEach((array) => {
                    var data = {
                        artist: array.artist_name,
                        artwork: array.art_name,
                        imgUrl: array.image_url,
                        moreUrl:'#',
                        id : array.art_id
                    
                    }

                    jsondata.push(data)
                })

            }

            return res.json(jsondata)

        })

});

    
app.get('/api/exhibition1/data', function (req, res) {
        //현재 작품들 정보 가져오기
        let query = "select tmp.* from ( select r.artist_id, r.artist_name , a.art_id, a.art_name, a.image_url, e.exhibition_id, e.exhibition_name  from  artist r, art a, exhibition e where r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id order by art_id desc ) tmp"
        connection.query(query,
            
            async (err,result) =>
        {
            if(err)
            {
                console.error(err.message);
                
                return res.status(200).json({
                    success:false
                })
            }
            var jsondata = []

            //질의 결과가 존재할 때
            if(result != undefined)
            {
                //각 질의의 정보들 json에 담기
                result.forEach((array)=>{

                    var data = {
                        artist_id : array.artist_id,
                        artist: array.artist_name,
                        art_id:array.art_id,
                        artname: array.art_name,
                        imgUrl: array.image_url,
                        moreUrl:'#',
                        exhibition_id : array.exhibition_id,
                        musium : array.exhibition_name
                        
                    }

                    jsondata.push(data)
                })
            }

            return res.json(jsondata)
        })    
    });


    app.post('/api/exhibition2/exhibition', function (req, res) {

        //전시관 id가 존재할 때
        if(req.body.exhibition != undefined && req.body.exhibition.length>=1)
        {
            
                //전시관 id를 통해 전시관에 있는 작품들 찾기
                let query = "select r.artist_name, e.exhibition_name, a.image_url, a.art_name, a.Art_id, e.Exhibition_data  from art a, artist r, exhibition e where e.exhibition_id = ? AND a.artist_id = r.artist_id and a.exhibition_id = e.exhibition_id  order by a.art_id desc"
                connection.query(query,
                    [req.body.exhibition],
                    async (err,result) =>
                {
                    if(err)
                    {
                        console.error(err.message);
                        
                        return res.status(200).json({
                            success:false
                        })
                    }
                    var jsondata = []
        
                    //전시관에 작품이 존재할 때
                    if(result != undefined && result[0] != undefined )
                    {
                        result.forEach((rows,i) => {
                            var data = {
                                artist:rows.artist_name,
                                day:'apr 10 - may 11, 2021',
                                musium: rows.exhibition_name,
                                img:rows.image_url,
                                artworkUrl: '/exhibition3/'+rows.art_name,
                                textTitle: rows.Art_id,
                                textArea: rows.Exhibition_data,
                                datenumber:351,
                                totalnumber:'194:36:41',
                                time:'2020. 02. 08 PM 14:00 기준'
                            
                            }
                            jsondata.push(data)
                        })

                         return res.json(jsondata)
                    }
                    //전시관에 작품이 없을 때
                    else
                    {
                        
                        let q = "select e.exhibition_name, e.exhibition_data from exhibition e where e.exhibition_id = ?"
                        connection.query(q,[req.body.exhibition], (err, result2) => {
                            if(err)
                            {
                                console.error(err.message);
                                
                                return res.status(200).json({
                                    success:false
                                })
                            }
                            else{
                                if(result2 != undefined && result2[0] != undefined)
                                {
                                    var data = {
                                        artist:'작품 없음',
                                        day:'apr 10 - may 11, 2021',
                                        musium: result2[0].exhibition_name,
                                        img:'notfoung.png',
                                        artworkUrl:'#',
                                        textTitle: '해당 전시관에 진행중인 내용이 없습니다',
                                        textArea: result2[0].exhibition_data,
                                        datenumber:351,
                                        totalnumber:'194:36:41',
                                        time:'2020. 02. 08 PM 14:00 기준'
                                    
                                    }
            
                                    jsondata.push(data)
                                }
                                else{
                                    
                                    jsondata.push({notuple:true})
                                }
                              }
                              console.log(jsondata)
                             return res.json(jsondata)
                            })

                    }
                })

        }
        else{

                let query = "select r.artist_name, e.exhibition_name, a.image_url, a.art_name, a.Art_id, e.Exhibition_data from (select * from (select t.*, @rownum := @rownum + 1 rownum  from (select x.exhibition_id, x.Exhibition_name, x.Exhibition_data, count(*) artnum from exhibition x, art aa where x.Exhibition_id = aa.Exhibition_id group by x.Exhibition_id order by artnum desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1) e, art a, artist r where e.exhibition_id = a.exhibition_id and a.Artist_id = r.Artist_id"
                  connection.query(query,
                    async (err,result) =>
                {
                    if(err)
                    {
                        console.error(err);
                        
                        return res.status(200).json({
                            success:false
                        })
                    }
                    var jsondata = []
        
                    
                    if(result != undefined && result[0] != undefined )
                    {
                        result.forEach((rows,i) => {
                            var data = {
                                artist:rows.artist_name,
                                day:'apr 10 - may 11, 2021',
                                musium: rows.exhibition_name,
                                img:rows.image_url,
                                artworkUrl: '/exhibition3/'+rows.art_name,
                                textTitle: rows.Art_id,
                                textArea: rows.Exhibition_data,
                                datenumber:351,
                                totalnumber:'194:36:41',
                                time:'2020. 02. 08 PM 14:00 기준'
                            
                            }

                            jsondata.push(data)
                        })
                        return res.json(jsondata)
                    }
                    else
                    {
                        let q = "select e.exhibition_name, e.exhibition_data from exhibition e where e.exhibition_id in (select exhibition_id from (select t.*, @rownum := @rownum + 1 rownum  from (select x.exhibition_id from exhibition x order by x.exhibition_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1)"
                        connection.query(q,[req.body.exhibition], (err, result2) => {
                            if(err)
                            {
                                console.error(err.message);
                                
                                return res.status(200).json({
                                    success:false
                                })
                            }
                            else{
                                if(result2 != undefined && result2[0] != undefined)
                                {
                                    var data = {
                                        artist:'작품 없음',
                                        day:'apr 10 - may 11, 2021',
                                        musium: result2[0].exhibition_name,
                                        img:'notfoung.png',
                                        artworkUrl:'#',
                                        textTitle: '해당 전시관에 진행중인 내용이 없습니다',
                                        textArea: result2[0].exhibition_data,
                                        datenumber:351,
                                        totalnumber:'194:36:41',
                                        time:'2020. 02. 08 PM 14:00 기준'
                                    
                                    }
            
                                    jsondata.push(data)
                                }
                                else{
                                    
                                    jsondata.push({notuple:true})
                                }
                              }
                              console.log(jsondata)
                             return res.json(jsondata)
                            })
                    
                        
                    }
        
                })

        }

        });

        app.post('/api/exhibition2/rank', function (req, res) {
            
            if(req.body.exhibition != undefined && req.body.exhibition.length>=1)
            {
                    let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name, a.art_name, a.Art_id  from art a, artist r, exhibition e where e.exhibition_id = ? AND a.artist_id = r.artist_id and a.exhibition_id = e.exhibition_id  order by a.art_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 6"
                    connection.query(query,
                        [req.body.exhibition],
                        async (err,result) =>
                    {
                        if(err)
                        {
                            console.error(err.message);
                            
                            return res.status(200).json({
                                success:false
                            })
                        }
                        var jsondata = []
            
                        if(result != undefined)
                        {
                            result.forEach((rows,i) => {
                                var data = {
                                    rank:i+1,
                                    art: rows.artist_name+" : "+rows.art_name,
                                    looktime:'194:36:41',
                                    id:rows.Art_id
                                }
                                jsondata.push(data)
                            })
                        }
            
                        return res.json(jsondata)
            
            
                    })
            

            }
            else{
                    let query = "select artist_name, art_name, Art_id from (select t2.*, @rownum2 := @rownum2 + 1 rownum2  from (select r.artist_name, a.art_name, a.Art_id from (select * from (select t.*, @rownum := @rownum + 1 rownum2  from (select x.exhibition_id, x.Exhibition_name, x.Exhibition_data, count(*) artnum from exhibition x, art aa where x.Exhibition_id = aa.Exhibition_id group by x.Exhibition_id order by artnum desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum2 <= 1) e, art a, artist r where e.exhibition_id = a.exhibition_id and a.Artist_id = r.Artist_id) t2, (select @rownum2 := 0) tmp4) tmp5 where tmp5.rownum2 <= 6"
                    connection.query(query,
                      
                        async (err,result) =>
                    {
                        if(err)
                        {
                            console.error(err.message);
                            
                            return res.status(200).json({
                                success:false
                            })
                        }
                        var jsondata = []
            
                        if(result != undefined)
                        {
                            result.forEach((rows,i) => {
                                var data = {
                                    rank:i+1,
                                    art: rows.artist_name+" : "+rows.art_name,
                                    looktime:'194:36:41',
                                    id:rows.Art_id
                                
                                }
            
                                jsondata.push(data)
                            })
                        }
            
                        return res.json(jsondata)
            
            
                    })
            

            }

            });

            app.get('/api/exhibition2/chart03/day', function (req, res) {
                res.json(
                    [
                        {
                            name: '10:00',
                            '관람객': 1000,
                          },
                          {
                            name: '11:00',
                            '관람객': 2000,
                          },
                          {
                            name: '12:00',
                            '관람객': 1500,
                          },
                          {
                            name: '13:00',
                            '관람객': 2000,
                          },
                          {
                            name: '14:00',
                            '관람객': 1700,
                          },
                          {
                            name: '15:00',
                            '관람객': 900,
                          },
                          {
                            name: '16:00',
                            '관람객': 800,
                          },
                          {
                            name: '17:00',
                            '관람객': 1200,
                          },
                          {
                            name: '18:00',
                            '관람객': 2500,
                          },
                          {
                            name: '19:00',
                            '관람객': 700,
                          }
                    ])
                });

                app.get('/api/exhibition2/chart04', function (req, res) {
                    res.json(
                        [
                            { name: '10-20대', value: 600 },
                            { name: '30-40대', value: 230 },
                            { name: '50-60대', value: 150 },
                            { name: '70대 이상',  value: 70 }
                        ])
                    });
        
                    app.post('/api/exhibition3/exhibition', function (req, res) {

                        var date = moment().format('YYYY-MM-DD HH:mm:ss');

                        if(req.body.id !=undefined && req.body.id.length>=1)
                        {

                            console.log("찾는 작품 번호 : "+Number(req.body.id))

                                let query = "select r.artist_name , a.art_name, a.image_type, DATE_FORMAT(a.release_date,'%Y-%m-%d') getdate, a.image_size, a.image_url, e.exhibition_name, e.exhibition_id, r.artist_id  from  artist r, art a, exhibition e where a.art_id = ? AND r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id"
                                connection.query(query,
                                    [req.body.id],
                                    async (err,result) =>
                                {
                                    if(err)
                                    {
                                        console.error(err.message);
                                        
                                        return res.status(200).json({
                                            success:false
                                        })
                                    }
                                    var jsondata = []
                        
                                    if(result != undefined)
                                    {
                                        result.forEach((array) => {
                                            
                                            var data = {
                                                artist: array.artist_name,
                                                artname: array.art_name,
                                                arttype: array.image_type,
                                                artsize: array.getdate+", " +array.image_size,
                                                imgUrl: array.image_url,
                                                musium: array.exhibition_name,
                                                people_number: 351,
                                                total_people_number: 9510,
                                                time : date +'기준',
                                                totaltime: '283:36:41',
                                                exhibition_id : array.exhibition_id,
                                                artist_id : array.artist_id
                                            }
                                            jsondata.push(data)
                                        })
                        
                                    }
                        
                                    return res.json(jsondata)
                                })
                        }

                        else
                        {

                                let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name , a.art_name, a.image_type, DATE_FORMAT(a.release_date,'%Y-%m-%d') getdate, a.image_size, a.image_url, e.exhibition_name, e.exhibition_id, r.artist_id  from  artist r, art a, exhibition e where r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id order by a.art_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"
                                connection.query(query,
                                    async (err,result) =>
                                {
                                    if(err)
                                    {
                                        console.error(err.message);
                                        
                                        return res.status(200).json({
                                            success:false
                                        })
                                    }
                                   
                                    var jsondata = []
                        
                                    if(result != undefined)
                                    {
                                        result.forEach((array) => {
                                            
                                            var data = {
                                                artist: array.artist_name,
                                                artname: array.art_name,
                                                arttype: array.image_type,
                                                artsize: array.getdate+", " +array.image_size,
                                                imgUrl: array.image_url,
                                                musium: array.exhibition_name,
                                                people_number: 351,
                                                total_people_number: 9510,
                                                time : date +'기준',
                                                totaltime: '283:36:41',
                                                exhibition_id : array.exhibition_id,
                                                artist_id : array.artist_id
                                            }
                                            jsondata.push(data)
                                        })
                        
                                    }
                        
                                    return res.json(jsondata)
                                })
                        
                        }
                    });

                        app.post('/api/exhibition3/chart05', function (req, res) {
                            console.log(req.body.date)
                            switch(req.body.date)
                            {
                                case 'day':
                                    res.json(
                                        [
                                            {
                                                name: '10',
                                                'Day': 10,
                                              },
                                              {
                                                name: '11',
                                                'Day': 11,
                                              },
                                              {
                                                name: '12',
                                                'Day': 15,
                                              },
                                              {
                                                name: '13',
                                                'Day': 20,
                                              },
                                              {
                                                name: '14',
                                                'Day': 17,
                                              },
                                              {
                                                name: '15',
                                                'Day': 9,
                                              },
                                              {
                                                name: '16',
                                                'Day': 8,
                                              },
                                              {
                                                name: '17',
                                                'Day': 12,
                                              },
                                              {
                                                name: '18',
                                                'Day': 19,
                                              },
                                              {
                                                name: '19',
                                                'Day': 7,
                                              },
                                              {
                                                name: '20',
                                                'Day': 10,
                                              },
                                              {
                                                name: '21',
                                                'Day': 11,
                                              },
                                              {
                                                name: '22',
                                                'Day': 15,
                                              },
                                              {
                                                name: '23',
                                                'Day': 20,
                                              },
                                              {
                                                name: '24',
                                                'Day': 17,
                                              },
                                              {
                                                name: '25',
                                                'Day': 9,
                                              }
                                        ])
                                        break;

                                case 'week':
                                    res.json(
                                        [
                                            {
                                                name: '10',
                                                'Day': 10,
                                              },
                                              {
                                                name: '11',
                                                'Day': 11,
                                              },
                                              {
                                                name: '12',
                                                'Day': 15,
                                              },
                                              {
                                                name: '13',
                                                'Day': 20,
                                              },
                                              {
                                                name: '14',
                                                'Day': 17,
                                              },
                                              {
                                                name: '15',
                                                'Day': 9,
                                              },
                                              {
                                                name: '16',
                                                'Day': 8,
                                              },
                                              {
                                                name: '17',
                                                'Day': 12,
                                              },
                                              {
                                                name: '18',
                                                'Day': 19,
                                              },
                                              {
                                                name: '19',
                                                'Day': 7,
                                              }
                                        ])
                                        break;

                                case 'month':
                                    res.json(
                                        [
                                            {
                                                name: '7',
                                                'Day': 30,
                                              },
                                              {
                                                name: '8',
                                                'Day': 21,
                                              },
                                              {
                                                name: '9',
                                                'Day': 15,
                                              },
                                              {
                                                name: '10',
                                                'Day': 20,
                                              },
                                              {
                                                name: '11',
                                                'Day': 17,
                                              },
                                              
                                        ])
                                        break;

                                case 'year':
                                    res.json(
                                        [
                                            {
                                                name: '2019',
                                                'Day': 100,
                                              },
                                              {
                                                name: '2020',
                                                'Day': 121,
                                              },
                                              {
                                                name: '2021',
                                                'Day': 115,
                                              }
                                        ])
                            }
                        });

                                app.post('/api/artist01/slider', function (req, res) {
                                    
                                            if(req.body.id !=undefined && req.body.id.length>=1)
                                            {
                                                var query = "select r.artist_name, a.image_type, a.image_size, e.exhibition_name, a.image_url, a.art_name, a.art_id from artist r, art a, exhibition e where e.exhibition_id = a.exhibition_id and a.artist_id = r.artist_id and r.artist_id = ?"

                                                connection.query(query, [req.body.id],(err,result)=>{
                                                    if(err)
                                                    {

                                                    }
                                                    
                                                    var jsondata = []

                                                    if(result !=undefined)
                                                    {
                                                        result.forEach((rows)=>{
                                                            jsondata.push({
                                                                artist: rows.artist_name,
                                                                type: rows.image_type,
                                                                size:  rows.image_size,
                                                                musium:  rows.exhibition_name,
                                                                imgUrl :  rows.image_url,
                                                                artname:  rows.art_name,
                                                                art_id:  rows.art_id
                                                            })
                                                        })
                                                    }
                                                    res.json(jsondata)
                                                })
                                            }
                                            
                                            else
                                            {
                                                var query = "select r.artist_name, a.image_type, a.image_size, e.exhibition_name, a.image_url, a.art_name, a.art_id from artist r, art a, exhibition e where e.exhibition_id = a.exhibition_id and a.artist_id = r.artist_id and r.artist_id IN (select artist_id from (select t.*, @rownum := @rownum + 1 rownum  from (select k.artist_id, COUNT(y.art_id) artnum from artist k, art y where y.artist_id = k.artist_id group by k.artist_id order by artnum desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1) "

                                                connection.query(query,(err,result)=>{
                                                    if(err)
                                                    {
                                                        
                                                    }

                                                    var jsondata = []

                                                    if(result !=undefined)
                                                    {
                                                        result.forEach((rows)=>{
                                                            jsondata.push({
                                                                artist: rows.artist_name,
                                                                type: rows.image_type,
                                                                size:  rows.image_size,
                                                                musium:  rows.exhibition_name,
                                                                imgUrl :  rows.image_url,
                                                                artname:  rows.art_name,
                                                                art_id:  rows.art_id
                                                            })
                                                        })
                                                    }
                                                    res.json(jsondata)
                                                } )

                                            }
                                           
                                    });
                                   
                                    app.post('/api/artist01/artist', function (req, res) {
                                        var date = moment().format('YYYY-MM-DD HH:mm:ss')
                                                    if(req.body.id !=undefined && req.body.id.length>=1)
                                                    {
                                                        var query = "select artist_name, Artist_info from artist where artist_id = ?"

                                                        connection.query(query,[req.body.id],(err,result)=>{
                                                            if(err)
                                                            {

                                                            }

                                                            var jsondata = []
    
                                                            if(result !=undefined)
                                                            {
                                                                result.forEach((rows)=>{
                                                                    jsondata.push({
                                                                        name: rows.artist_name,
                                                                        btnUrl: '#',
                                                                        textArea: rows.Artist_info,
                                                                        people_num: '35121',
                                                                        totaltime: '1894:36:41',
                                                                        timeline: date+' 기준',
                                                                        like: '60'
                                                                    })
                                                                })
                                                            }
                                                            res.json(jsondata)
                                                        })
                                                    }
                                                    
                                                    else
                                                    {
                                                        var query = "select t.artist_name, t.Artist_info from artist t where t.artist_id IN (select artist_id from (select t.*, @rownum := @rownum + 1 rownum  from (select k.artist_id, COUNT(y.art_id) artnum from artist k, art y where y.artist_id = k.artist_id group by k.artist_id order by artnum desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1)"

                                                       connection.query(query, (err,result)=>{
                                                        if(err)
                                                        {
                                                            
                                                        }
                                                        var jsondata = []
                                                        if(result !=undefined)
                                                            {
                                                                result.forEach((rows)=>{
                                                                    jsondata.push({
                                                                        name: rows.artist_name,
                                                                        btnUrl: '#',
                                                                        textArea: rows.Artist_info,
                                                                        people_num: '35121',
                                                                        totaltime: '1894:36:41',
                                                                        timeline: date+' 기준',
                                                                        like: '60'
                                                                    })
                                                                })
                                                            }
                                                            res.json(jsondata)
                                                       })
    
                                                    }

                                    })

    app.post('/api/checkId', (req,res) => {

        if(req.body.username=='')
        {
            
            res.json({
                success:'null'
            })
        }

            let query = "select username from artuser where username = ?";
            console.log("oracle질의 : "+query);
            connection.query(query, [req.body.username], function(err,result)
            {
                if(err)
                {
                    console.error(err.message)
                    return;
                }

    
                if(result !=undefined && result[0] != undefined && result[0].username === req.body.username)
                {
                    console.log("이미 존재하는 아이디");
                    return res.json({
                        success:false
                    })
                }
                
         
                else
                {

                    console.log("사용가능한 아이디")

                    return res.status(200).json({
                          success:true
                     })
                }
    
                
            })

    })

    app.get('/api/checkAdmin', (req,res) => {
        
        /*세션 로그인 파트*/
        if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
        //오라클 작업시 id부분은 필요없어서 조건문에서 생략 // && req.session.user.id != undefined
        {
            const sessionID = req.sessionID;
            console.log('session id :', sessionID);
            console.log('이미 세션으로 로그인 확인')
            res.json({
                username:req.session.user.username,
                name: req.session.user.name,
                email: req.session.user.email,
                userrole: req.session.user.role,
                id:req.session.user.id,
                success:true
            })
        }
        else
        {
            // 세션 ID
            const sessionID = req.sessionID;
            console.log('session id :', sessionID);
            console.log(req.session.user)
            if( req.session.user!=undefined && req.session.user.username != undefined)
            {
                console.log('username :', req.session.user.username);
                console.log('username length :', req.session.user.username.length);
            }
            
            console.log('로그인 안됨')
    
            res.json({
                success:false
            })
        }
    })



app.post('/api/myPage', (req,res) => {

    console.log(req.session)
    console.log("현재 세션 : "+req.session.user.username)
    
    /*세션 로그인 파트*/
    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    {
        const sessionID = req.sessionID;
        console.log('session id :', sessionID);
        console.log('이미 세션으로 로그인 확인')
        res.json({
            username:req.session.user.username,
            name: req.session.user.name,
            email: req.session.user.email,
            userrole: req.session.user.role,
            success:true
        })
    }
    else
    {
        // 세션 ID
        const sessionID = req.sessionID;
        console.log('session id :', sessionID);
        console.log(req.session.user)
        console.log('로그인 안됨')
        res.json({
            success:false
        })
    }

})


app.post('/api/myPagefindUser', (req,res) => {
    if(req.body.username == '' || req.body.username == undefined || req.body.username==null)
    {
        return res.json({
           name: false
        })
    }


        var query = "select username, name, email from artuser where username = ?"
        var str = req.body.username.trim()
        connection.query(query,[str],(err, result)=>
             {
                if(err)
                {
                    console.log(err)
                    return res.json({
                        name: false
                     })
                }

                
                else if(result !=undefined && result[0] != undefined){
                    var jsondata = []
                    result.forEach((rows)=>{
                        var data ={
                            username: rows.username,
                            id : rows.username,
                            name : rows.name,
                            idCode : '1001',
                            email : rows.email
                        }
                        //console.log(data)
                        return res.json(data)
                    })
                }

                else{
                    return res.json({
                        name: false
                    })
                }
             })


})

app.get('/api/Transfer/artdata',(req,res) => {
    //console.log("세션 : "+req.session.user)
    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    //&& req.session.user.id != undefined는 오라클에서 안쓰므로 username으로 바꿈
    {
            console.log('로그인 확인')

                //var binds = [[req.body.username]]
                let query = "SELECT R.Artist_name, A.Art_name,  DATE_FORMAT(A.Expired,'%Y-%m-%d') resdate, A.Art_id FROM  ART A, ARTIST R, AUCTION U WHERE A.owner_username = ?  AND A.Artist_id = R.Artist_id AND U.art_id = A.art_id"
                connection.query(query, [req.session.user.username],async (err,result) =>
                {
                    if(err)
                    {
                        console.error(err.message)
                        return res.status(200).json({
                            success:false
                        })
                    }
                    var jsondata = []
        
                    if(result !=undefined && result[0]!=undefined)
                    {
                        result.forEach((array) => {
                            var data = {
                                artist: array.Artist_name,
                                artname: array.Art_name,
                                expired: array.resdate,
                                id : array.Art_id//art_id
                            }
        
                            jsondata.push(data)
                        })
                    }
                    return res.json(jsondata)
        
                })
        
        
        }
        else
        {
            // 세션 ID
            const sessionID = req.sessionID;
            console.log('session id :', sessionID);
            console.log(req.session.user)
            console.log('로그인 안됨')
            
            
            
            res.json({
                success:false
            })
        }
    
})

app.post('/api/Transfer/sendArt',(req,res) => {
    
    console.log(req.body.checkBoxValue + "\n" +req.body.username )
    var date = moment().format('YYYY-MM-DD');
    var input = []
    var query = "update art set owner_username = ?, expired = DATE_FORMAT(?, '%Y-%m-%d') where art_id = ?;"
    var sql = ""
    for(let i=0; i< req.body.checkBoxValue.length ; i++)
    {
        sql += query
        input.push(req.body.username)
        input.push(date)
        input.push(req.body.checkBoxValue[i])
    }
        connection.beginTransaction((err)=>{
            if(err)
            {
                console.log(err)
            }
            else{

                connection.query(sql,input,(err, result)=>{
                    if(err)
                    {
                        connection.rollback()
                        console.error(err);
                        return res.json({
                            success: false
                        })
                    }
                    else
                    {
                        connection.commit()
                        console.log(result)
                        return res.json({
                            success: true
                        })
                    }
                })
            }
        })

            
})

app.post('/api/AuctionMain/isStarted',(req,res)=>{

        var query = "select DATE_FORMAT(u.begin_point,'%Y-%m-%d') begin_point, DATE_FORMAT(u.end_point,'%Y-%m-%d') end_point from art a, auction u where a.art_id = ? and a.art_id = u.art_id"
        connection.query(query,[req.body.art_id],
             (err, result) => {
                if(err)
                {
                    console.error(err);
                    return res.json({
                        err:err,
                        //success:false
                    })
                }

                var jsondata = []
                if(result != undefined && result[0] != undefined)
                {
                    result.forEach((rows)=>{
                        var data= {
                            begin_point : rows.begin_point,
                            end_point : rows.end_point
                        }
                        res.json(data)
                    })
                }

                else
                {
                    res.json(null)
                }

             })
        
})

app.get('/api/AuctionMain/picturedata', function (req, res) {

        var query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null order by u.end_point desc"

                connection.query(query, (err,result)=>{
                    if(result !=undefined)
                    {
                        var jsondata = []

                        result.forEach((rows)=>{
                            jsondata.push({
                                img: rows.Image_url,
                                artist: rows.artist_name,
                                artwork: rows.art_name,
                                size: rows.image_size,
                                year:"1973",
                                type: rows.image_type,
                                KRWpriceStart: rows.krw_lower,
                                KRWpriceEnd: rows.krw_upper,
                                USDpriceStart: rows.usd_lower,
                                USDpriceEnd: rows.usd_upper,
                                id: rows.art_id,
                                isauctioned:null
        
                            })

                        })

                        //console.log(jsondata)
                        return res.json(jsondata)
                    }
                })

});


app.post('/api/search_auction',(req,res)=>{

        function putresult(result)
        {
            if(result !=undefined)
                    {
                        var jsondata = []

                        result.forEach((rows)=>{
                            jsondata.push({
                                img: rows.Image_url,
                                artist: rows.artist_name,
                                artwork: rows.art_name,
                                size: rows.image_size,
                                year:"1973",
                                type: rows.image_type,
                                KRWpriceStart: rows.krw_lower,
                                KRWpriceEnd: rows.krw_upper,
                                USDpriceStart: rows.usd_lower,
                                USDpriceEnd: rows.usd_upper,
                                id: rows.art_id,
                                isauctioned:null
        
                            })

                        })

                        //console.log(jsondata)
                        return res.json(jsondata)
                    }
        }

        let jsondata = {}

        jsondata.isauctioned='yes'

            if(req.body.num.length>=1)
            {
                var query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.art_id = ? and a.owner_username is null"

                connection.query(query,[req.body.num], (err,result)=>{
                    putresult(result)
                })
            }
            else{
                var query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and a.krw_lower >= :lower and a.krw_upper <= :upper"
                if(req.body.artist != undefined && req.body.artist.length>=1 && req.body.artname != undefined && req.body.artname.length>=1)
                {
                    query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and a.art_name like ? AND r.artist_name like ? AND a.krw_lower >= ? and a.krw_upper <= ?"
                    connection.query(query,[req.body.artname+"%",req.body.artist+"%",req.body.value,req.body.value2],(err,result)=>{
                        putresult(result)
                    })
                    

                }

                else if(req.body.artist != undefined && req.body.artist.length>=1 && req.body.artname.length<1)
                {
                    query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and r.artist_name like ? AND a.krw_lower >= ? and a.krw_upper <= ?"
                    connection.query(query,[req.body.artist+"%", req.body.value, req.body.value2],(err,result)=>{
                        putresult(result)
                    })
                    
                }
                else if( req.body.artname != undefined && req.body.artname.length>=1 && req.body.artist.length<1)
                {
                    query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and a.art_name like ? AND a.krw_lower >= ? and a.krw_upper <= ?"
                    connection.query(query,[req.body.artname+"%", req.body.value,req.body.value2],(err,result)=>{
                        putresult(result)
                    })
                   
                }
                else if(req.body.artname.length<1 && req.body.artist.length<1)
                {
                    query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and a.krw_lower >= ? and a.krw_upper <= ?"
                    connection.query(query,[req.body.value, req.body.value2],(err,result)=>{
                        putresult(result)
                    })
                }
            }

})


app.post('/api/auctiondata',(req,res)=>{

        var query = "select r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.Art_text, r.Artist_info, r.life_term, a.art_id, DATE_FORMAT(a.Release_date, '%Y-%m-%d') release_date, r.artist_id, a.image_url from artist r, art a, auction u where a.art_id = ? and a.artist_id = r.artist_id and a.art_id = u.art_id and a.owner_username is null"

        connection.query(query,[req.body.id],
            (err, result)=>
            {
                if(err)
                {
                    console.log(err)
                    return res.json(err)
                }

                else if(result!= undefined && result[0]!=undefined)
                {
                    data = {
                        artist: result[0].artist_name,
                        artistyear: '',
                        artname: result[0].art_name,
                        size: result[0].image_size,
                        year:"",
                        imagesize: 100,
                        type: result[0].image_type,
                        KRW_lower: result[0].krw_lower,
                        KRW_upper: result[0].krw_upper,
                        nowprice: result[0].usd_lower,
                        enddate: result[0].usd_upper,
                        arttext: result[0].Art_text,
                        artist_info: result[0].Artist_info,
                        artistyearInfo: result[0].life_term,
                        art_id : result[0].art_id,
                        artrelease_date : result[0].release_date,
                        artist_id : result[0].artist_id,
                        imageurl : result[0].image_url
                    }
                   // console.log(data)
                    return res.json(data)
                }
                else{
                    return res.json(null)
                }

            })


})

app.post('/api/auctiondata/search',(req,res)=>{

        var query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.username, u.user_price, u.bid_date, r.email from artuser r, user_bid u where r.username = u.username and u.art_id = ? order by u.user_price desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 5"

        connection.query(query,[req.body.id],(err, result)=>
        {

            if(err)
            {
                console.log(err)
            }

            if(result != undefined && result[0] != undefined)
            {
                var jsondata = []
                result.forEach((rows)=>{
                    jsondata.push({
                        username : rows.username,
                        userprice : rows.user_price,
                        updateDate : rows.bid_date

                    })
                })

                res.json({
                    success: true,
                    email : result[0].email,
                    result : jsondata
                })
            }
            else{
                res.json({
                    success: false
                })
            }

        })

})

app.post('/api/auctiondata/submit',(req,res)=>{

        var query = "select user_price from user_bid where art_id = ? order by user_price desc"
        connection.query(query,[req.body.art_id], (err,result)=>{
            if(result != undefined && result[0]!=undefined && result[0].user_price >= req.body.userprice)
            {
                
                res.json({err : true})
            }
            else{
                query = "select * from user_bid where username = ? and art_id = ?"
    
                connection.query(query,[req.body.username, req.body.art_id], (err,result1)=>{
                if(result1 != undefined && result1[0] != undefined)
                {
                    query = "update user_bid set user_price = ?, bid_date = DATE_FORMAT(?,'%Y-%m-%d')  where username = ? and art_id = ?"
                   
                    try{
                        
                         connection.query(query,[req.body.userprice, req.body.updateDate, req.body.username, req.body.art_id],(err,result2)=>{
                            
                            if(result2.affectedRows>=1)
                            {
                                connection.commit()
                                res.json({success : true})
                            }
                            else{
                                connection.rollback()
                                res.json({err : true})
                            }
                         })

                        }catch(err)
                        {
                            connection.rollback()
                            console.log(err)
                            res.json({err : true})
                        }

                }
                else{
                   
                    query = "insert into user_bid values (?, ?, DATE_FORMAT(?, '%Y-%m-%d'), ?)"
                    connection.query(query,[req.body.username, req.body.userprice, req.body.updateDate, req.body.art_id],
                        (err,result2)=>{
                            
                            if(err)
                            {
                                connection.rollback()
                                console.log(err)
                                res.json({err : true})
                            }
                            
                            else if(result2.affectedRows>=1)
                            {
                                connection.commit()
                                res.json({success : true})
                            }
                            else{
                                connection.rollback()
                                res.json({err : true})
                            }
                        })
                  }
    
                })
    
                
            }
        })

})

app.post('/api/auctiondata/isStarted',(req,res)=>{
    console.log("찾는 auction id : "+req.body.artname)


        var query = "select DATE_FORMAT(u.begin_point,'%Y-%m-%d') begin_point, DATE_FORMAT(u.end_point,'%Y-%m-%d') end_point, Auction_unit  from auction u where art_id = ?"

        connection.query(query,[req.body.artname], (err, result)=>{
            if(err)
            {
                console.log(err)
            }
            else if(result!=undefined && result[0]!=undefined)
            {
                res.json({
                    begin_point : result[0].begin_point,
                    end_point : result[0].end_point,
                    auction_unit : result[0].Auction_unit
                })
            }
        })

})

app.post('/api/myauction', (req,res)=>{

    var jsondata = []


        //var binds = [[req.body.username]]
        let query = "SELECT A.art_id, A.Art_name, R.Artist_name, DATE_FORMAT(U.End_point,'%Y-%m-%d') end_point, A.Owner_username FROM USER_BID S, ART A, ARTIST R, AUCTION U WHERE S.username = ? AND S.art_id = A.art_id AND A.Artist_id = R.Artist_id AND U.art_id = A.art_id AND A.owner_username IS null"
        connection.query(query, [req.body.username],(err,result)=>{
        if(err)
        {
            console.log('존재하지 않습니다.')
            res.json({
                //auction:user_auctiondata
            })
        }
        else if(result!=undefined && result[0]!=undefined)
            {
                result.forEach((array) => {
                    var data = {
                        artwork_id: array.art_id,
                        artname: array.Art_name,
                        artist: array.Artist_name,
                        end_point: array.end_point,
                        owner_id:array.Owner_username,
                        isfirst:null
                    }
                    jsondata.push(data)
                })
            
                var jsize = jsondata.length-1
                var jsondata2 = []

                jsondata.forEach(async(item, index) =>{
                    
                    query = "SELECT U.Username FROM USER_BID U WHERE U.Art_id = ? AND U.User_price IN( SELECT DISTINCT MAX(S.User_price) FROM USER_BID S WHERE S.Art_id = U.Art_id)";
                    connection.query(query, [item.artwork_id],(err,result2)=>{
                    if(result2 != undefined && result2[0]!=undefined)
                    {
                        result2.forEach((rows)=>{

                            
                            if(rows.Username === req.body.username)
                            {
                                //console.log("일치")
                                item.isfirst = 'yes'
                            } 
                        })
                    }
                    var data2 = {
                        artwork_id: item.artwork_id,
                        artname: item.artname,
                        artist: item.artist,
                        end_point: item.end_point,
                        owner_id: item.owner_id,
                        isfirst: item.isfirst
                    }
                    //console.log(jsize+", "+index+", "+data2)
                    jsondata2.push(data2)
                    

                    if(index == jsize)
                    {
                    // console.log("jsondata2 : "+jsondata2)
                        res.json({
                            dib:jsondata2,
                            //auction:user_auctiondata
                        })
                    }
                    })
                })
            }
            else{
                res.json({
                   
                })
            }
        })
})

app.post('/api/auction_submit',(req,res)=>{

            var query = "update art set owner_username = ?, expired = ? where art_id = ?"
            connection.query(query,[
                req.body.username,
                req.body.date,
                req.body.art_id
            ],(err,result)=>{
                if(err)
                {
                    console.log(err)
                }
                else if(result != undefined && result.affectedRows>=1)
                {
                    connection.commit()
                    res.json({
                        success:true
                    })
                }
            })
})

app.post('/api/deleteuser',(req,res)=>{

    req.session.destroy()
            var query = "delete from user_bid where username = ?"
            connection.query(query, [req.body.username],(err,result)=>{
                if(result.affectedRows<0)
                {
                    connection.rollback()
                    res.json({success: false})
                }
    
                else
                {
                    query = "update art set owner_username = null, expired = null where owner_username = ?"
                    result = connection.query(query, [req.body.username],(err, result2)=>{
                        if(result2.affectedRows<0)
                        {
                            connection.rollback()
                            res.json({success: false})
                        }
            
                        else
                        {
                            query = "delete from artuser where username = ?"
                            result = connection.query(query, [req.body.username],(err,result3)=>{
                                if(result3.affectedRows<0)
                                {
                                    connection.rollback()
                                    res.json({success: false})
                                }
                    
                                else
                                {
                                    connection.commit()
                                    res.json({success: true})
                                }
                            })
                        }
                    })
                }
            })
})

app.post('/api/mainsearch',(req,res)=>{

    console.log(req.body.check)
            var query
            if(req.body.check==1)
            {
                query = "select art_id id from art where art_name like ?"
            }
            
            else if(req.body.check==2)
            {
                query = "select artist_id id from artist where artist_name like ?"
            }

            else if(req.body.check==3)
            {
                query = "select exhibition_id id from exhibition where exhibition_name like ?"
            }
            console.log(query)
            
            connection.query(query, [req.body.name+"%"],(err,result)=>{
                if(result != undefined && result[0]!=undefined)
                {
                    res.json({
                        id:result[0].id
                    })
                }
                else{
                    res.json({
                        err:true
                    })
                }
            })
})

//게시판 페이지 개수
app.get('/api/board/pagenum',(req,res)=>{
    var query = "select count(*) boardnum from (select t.*, @rownum := @rownum + 1 rownum  from (select * from board) t, (select @rownum := 0) tmp) tmp2"
    connection.query(query,(err,result)=>{
        if(err)
        {
            res.json({err:err})
        }
        else if(result != undefined && result[0]!=undefined)
        {
            res.json({boardnum : result[0].boardnum})
        }
    })
})

//게시판 페이징
app.post('/api/board/showpage',(req,res)=>{
    var query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select username, indices, title, DATE_FORMAT(uploaddate,'%Y-%m-%d') uploaddate, manager, DATE_FORMAT(answerdate,'%Y-%m-%d') answerdate from board order by uploaddate desc) t, (select @rownum := 0) tmp) tmp2  limit ?,5"
    connection.query(query,(req.body.page-1)*5,(err,result)=>{
        if(err)
        {
            console.log(err)
            res.json({err:true})
        }
        else if(result != undefined && result[0] != undefined)
        {
            //console.log(result)
            res.json(result)
        }
    })

})


//게시판 데이터
app.post('/api/board/showarticle',(req,res)=>{

    var query = "select username, indices, title, DATE_FORMAT(uploaddate,'%Y-%m-%d') uploaddate, manager, DATE_FORMAT(answerdate,'%Y-%m-%d') answerdate,bodytext, answer from board where username = ? and indices = ?"
    connection.query(query,[req.body.username, req.body.indices],(err,result)=>{
        if(err)
        {
            console.log(err)
            res.json({err:true})
        }
        else if(result != undefined && result[0] != undefined)
        {
            //console.log(result)
            res.json(result[0])
        }
    })
})

//게시판 등록
app.post('/api/board/upload',(req,res)=>{
    var date = moment().format('YYYY-MM-DD');
    //사용자 세션 확인
    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    {
        var query = "select tmp2.indices from (select t.*, @rownum := @rownum + 1 rownum  from (select indices from board where username = ? order by indices desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"
        
        connection.query(query, req.session.user.username,(err,result)=>{
            if(err)
            {
                console.log(err)
                res.json({db_error:true})
            }
            else
            {
                var indices
                if(result!=undefined && result[0]!=undefined)
                {
                    indices = result[0].indices + 1
                }
                else{
                    indices = 1
                }

                query = "insert into board values(?, ?, null, ?, ?, ?, DATE_FORMAT(?,'%Y-%m-%d'), null, null)"
                var input = []
                input.push(req.session.user.username)
                input.push(indices)
                input.push(req.body.boardtype)
                input.push(req.body.title)
                input.push(req.body.bodytext)
                input.push(date)
                console.log(input)

                connection.query(query,input,(err,result)=>{
                    if(err)
                    {
                        connection.rollback()
                        res.json({db_error:true})
                    }
                    else if(result != undefined && result.affectedRows >= 1){
                        connection.commit()
                        res.json({result:true})
                    }
                })
            }
        })
        
    }
    //로그인이 안되어 있을 때
    else
    {
        res.json({login_required:true})
    }
})


//게시판 페이지 개수
app.get('/api/notice/pagenum',(req,res)=>{
    var query = "select count(*) noticenum from (select t.*, @rownum := @rownum + 1 rownum  from (select * from notification) t, (select @rownum := 0) tmp) tmp2"
    connection.query(query,(err,result)=>{
        if(err)
        {
            res.json({err:err})
        }
        else if(result != undefined && result[0]!=undefined)
        {
            res.json({noticenum : result[0].noticenum})
        }
    })
})

//공지 페이징
app.post('/api/notice/showpage',(req,res)=>{
    var query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select id, title, DATE_FORMAT(uploaddate,'%Y-%m-%d') uploaddate, hits from notification order by uploaddate desc) t, (select @rownum := 0) tmp) tmp2  limit ?,5"
   
   
    connection.query(query,(req.body.page-1)*5,(err,result)=>{
        if(err)
        {
            console.log(err)
            res.json({err:true})
        }
        else if(result != undefined && result[0] != undefined)
        {
            //console.log(result)
            res.json(result)
        }
    })

})

//공지 데이터
app.post('/api/notice/showarticle',(req,res)=>{

    var query = "select id , title, DATE_FORMAT(uploaddate,'%Y-%m-%d') uploaddate, bodytext from notification where id = ?"
    connection.query(query,req.body.id,(err,result)=>{
        if(err)
        {
            console.log(err)
            res.json({err:true})
        }
        else if(result != undefined && result[0] != undefined)
        {
            //console.log(result)
            query = "update notification set hits = hits+1 where id = ?"
            connection.query(query, req.body.id, (err,result2)=>{
                if(err)
                {
                    connection.rollback()
                    res.json({err:true})
                }
                else if(result2!=undefined && result2.affectedRows>=1){
                    connection.commit()
                    res.json(result[0])
                }
            })
           
        }
    })
})

//공지 등록
app.post('/api/notice/upload',(req,res)=>{
    var date = moment().format('YYYY-MM-DD');
    //사용자 세션 확인
    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    {
        var query = "select tmp2.id from (select t.*, @rownum := @rownum + 1 rownum  from (select id from notification order by id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"
        
        connection.query(query,(err,result)=>{
            if(err)
            {
                console.log(err)
                res.json({db_error:true})
            }
            else
            {
                var id
                if(result!=undefined && result[0]!=undefined)
                {
                    id = result[0].id + 1
                }
                else{
                    id = 1
                }

                query = "insert into notification values(?, ?, ?, DATE_FORMAT(?,'%Y-%m-%d'), 0)"
                var input = []
                input.push(id)
                input.push(req.body.title)
                input.push(req.body.bodytext)
                input.push(date)
                connection.query(query,input,(err,result)=>{
                    if(err)
                    {
                        connection.rollback()
                        res.json({db_error:true})
                    }
                    else if(result != undefined && result.affectedRows >= 1){
                        connection.commit()
                        res.json({result:true})
                    }
                })
            }
        })
        
    }
    //로그인이 안되어 있을 때
    else
    {
        res.json({login_required:true})
    }
})



app.listen(PORT, () => {
    console.log(`Server run: http://localhost:${PORT}/`)
})