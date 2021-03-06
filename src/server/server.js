const express = require('express');
const app = express();
//const db = require('./config/db');
const cors = require("cors");
const fs = require('fs');

//mysql추가사항
var mysql = require('mysql2/promise')
//var mysql_dbConfig = require('./config/db') 
const pool = mysql.createPool({
    host : "localhost",
    user : "vane",
    password : "vane2021@@",
    database : "nodedb",
    port : "3306",
    connectionLimit:50
})

async function openConnection(connection)
{
    try{
    //동기 db연결, 질의 결과를 대기

    
    var connection = await pool.getConnection(async conn => conn)
    /*
    //콜백함수로 db연결
    var connection = await mysql.createConnection({
        host : "localhost",
        user : "vane",
        password : "vane2021@@",
        database : "nodedb",
        port : "3306"
    })
   await connection.connect((err)=>{
        if(err)
        {
            console.log(err)
        }
    
        else{
            console.log('mysql 연결완료')
        }
        
    })
    */
    }catch(err)
    {
        console.log(err)
    }
    return connection
}

async function closeConnection(connection)
{
    try{
    
    await connection.release()
   /*
   await connection.end((err)=>{
    if(err)
    {
        console.log(err)
    }

    else{
        console.log('mysql 연결종료')
    }
   })
   */
    }
    catch(err)
    {
        console.log(err)
    }
}


/*
const pool = mysql.createPool({
    host : "localhost",
    user : "vane",
    password : "vane2021@@",
    database : "nodedb",
    port : "3306"
})

const promisePool = pool.promise()
*/
//mysql추가사항 end

//schedule 추가사항
var asynclock = require('async-lock')
var lock = new asynclock()
var key = 'key'

var cron = require('node-cron')
cron.schedule('*/2 * * * * *', async()=>{
    //현재 1순위인 경매에서 다른 사용자가 새로 입찰했을 때
    //입찰한 경매 종료 시
    
    
    var time = moment().format('HH:mm:ss')
    var date = moment().format('YYYY-MM-DD')
    //console.log('schduler : '+date)

    lock.acquire("key1", async(done)=>{
        //console.log("lock entered")

        var connection = await openConnection()
        var query = "select u.begin_point, u.end_point, u.artist_id, u.art_id, a.art_name from auction u, art a where u.end_point = date_format(?,'%Y-%m-%d') and u.art_id = a.art_id and a.owner_username is null"
        
        try{
            var [result] = await connection.query(query,date)
            if(result!=undefined && result[0]!=undefined)
            {
                
                result.forEach(async(item)=>{
                    query = "select * from user_bid where art_id = ? and user_price in (select max(user_price) from user_bid where art_id = ?)"
                    var [result2] = await connection.query(query, [item.art_id, item.art_id])
                    
                    if(result2 != undefined && result2[0]!=undefined)
                    {
                        query = "select * from user_inform where username = ? and art_id = ? and auction_type = 0 and inform_date = ?"

                        var [result3] = await connection.query(query,[result2[0].username, item.art_id, date])
                        if(result3!=undefined && result3[0]!=undefined)
                        {
                            //console.log("이미 등록된 알림입니다.")
                        }
                        else{
                            query = "insert into user_inform values(?,?,date_format(?,'%Y-%m-%d'),?,?,?, false)"
                        
                            try{
                                await connection.beginTransaction()
                                var [result4] = await connection.query(query, [result2[0].username, item.art_name+" 작품이 낙찰되었습니다.",date, 0, item.art_id, 0])
                                if(result4!=undefined && result4.affectedRows>=1)
                                {
                                    console.log("inform success")
                                }
                                await connection.commit()
                            }catch(err)
                            {
                                await connection.rollback()
                                //console.log(err)
                            }
                        }
                        //console.log(result2)
                    }
                })
            }
        }
        catch(err)
        {
            console.log(err)
        }
        //console.log(result)
        
        closeConnection(connection)
        done()
    },(err,ret)=>{
        //console.log("lock released")
    }, {})



})
//schedule 추가사항 end

//https 추가사항
const PORT = process.env.PORT || 4001;
const HTTPS_PORT = 4000;
const https = require('https')
const https_options = {
    key : fs.readFileSync('./localhost-key.pem'),//프로젝트 폴더가 기준, https 로컬 테스트용
    cert : fs.readFileSync('./localhost.pem')
    /*
    key : fs.readFileSync('/etc/letsencrypt/live/artdata.kr/privkey.pem'),//https 실 서버용
    cert : fs.readFileSync('/etc/letsencrypt/live/artdata.kr/cert.pem'),
    ca : fs.readFileSync('/etc/letsencrypt/live/artdata.kr/chain.pem')
    */
}
https.createServer(https_options, app).listen(HTTPS_PORT,()=>{
    console.log(`Server run: https://localhost:${HTTPS_PORT}`)
})
//https 추가사항 end

//const dev_ver = require("../pages/global_const");
const corsOptions = {
    origin : true,
    credentials : true,
}



const cookieParser = require('cookie-parser');

//비밀번호 암호화 
/*
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRound = 16;
const tokenKey = 'veryveryveryImportantToKeepIt'
*/
const crypto = require('crypto')
const util = require('util')

const randomBytesPromise = util.promisify(crypto.randomBytes)
const pbkdf2Promise = util.promisify(crypto.pbkdf2)

//비밀번호 암호화 end

//이메일 전송
const nodemailer = require('nodemailer')
var transporter = nodemailer.createTransport({
    service:'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure:true,
    auth:{
        user:'vanenoreply@gmail.com',
        pass:'lsybsrjyaosfiroq'
    }
})
//이메일 전송 end

const multer = require('multer');

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");



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
//const { connectionClass } = require('oracledb');
//const { truncate } = require('fs/promises');
//const { off } = require('process');
//const { elemIndices } = require('prelude-ls');
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
        if(file.mimetype=='image/png' || file.mimetype=='image/jpeg' || file.mimetype == 'image/gif')
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

app.post('/api/artist_upload',async (req,res) => {
    var connection = await openConnection()
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
                try{
                    await connection.beginTransaction()
                    var [result] = await connection.query(query)
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
                try{
                    var [result2] = await connection.query(query,[
                        idnum,
                        req.body.artist,
                        req.body.artistInfo,
                        req.body.life_term,
                        req.body.artistyearInfo
                    ])
                        if(result2 != undefined && result2.affectedRows>=1)
                        {
                            await connection.commit()
                            res.json({
                                success:true
                            })
                        }
                }catch(err)
                {
                    //db 에러시
                    await connection.rollback()
                    console.error(err); 
                    res.json({
                       success:false
                   })
                }    

                }catch(err)
                {
                    //db 에러시
                    console.error(err); 
                    res.status(200).json({
                      success:false
                   })
                }
            }
            //수정할 작가 id가 존재할 경우
            //작가 정보 업데이트
            else{
                var query = "update artist set artist_name = ?, artist_info = ?, life_term = ?, artist_career = ? where artist_id = ?"
                try{
                    var [result2] = await connection.query(query,[
                        req.body.artist,
                        req.body.artistInfo,
                        req.body.life_term,
                        req.body.artistyearInfo,
                        req.body.id
                    ])
                        if(result2 != undefined && result2.affectedRows>=1)
                        {
                            await connection.commit()
                            res.json({
                                success:true
                            })
                        }
                }catch(err)
                {
                    //db 에러시
                    await connection.rollback()
                    console.error(err); 
                    res.json({
                       success:false
                   })
                }    
            }
            await closeConnection(connection)
})


app.post('/api/artist_upload/search',async (req,res)=>{
    var connection = await openConnection()
    //작가 정보 작가 id로 찾아와서
    //관리자의 작가 수정하기에서 작가 정보 보여주기용
            var query = "select artist_name, life_term, Artist_info, Artist_career from artist where artist_id = ?"
            try{
                var [result] = await connection.query(query, [req.body.id])
                //query 결과가 있을시 작가 정보 반환
                if(result!=undefined && result[0]!= undefined)
                {
                    res.json({
                        artist: result[0].artist_name,
                        life_term: result[0].life_term,
                        artist_info: result[0].Artist_info,
                        artistyearInfo: result[0].Artist_career
                    })
                }
            }catch(err)
            {
                //db 에러시
                console.error(err); 
                res.status(200).json({
                  success:false
               })
            }
            await closeConnection(connection)
})

app.post('/api/imgupload',async (req,res) => {
    var connection = await openConnection()
    var date = moment().format('YYYY-MM-DD').toString()
    //작품 업로드 혹은 등록

    //업로드할 작품 id가 입력되지 않았을때
    //새로운 작품 등록
    if(req.body.id==undefined || req.body.id.length<1)
    {

            //가장 최근에 쓰인 작품 id찾아서
            //+1한 값을 새로운 작품의 id로 사용하기
            var query = "select art_id from (select t.*, @rownum := @rownum + 1 rownum  from (select art_id from art order by art_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"
            try{    
                await connection.beginTransaction()
                var [result] = await connection.query(query)
                var idnum
                //질의 결과가 존재할 경우
                //+1한 값
                if(result!=undefined && result[0]!=undefined)
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
                try{
                    var [result2] = await connection.query(query,
                        [
                            idnum,
                            req.body.artname,
                            date,
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
                        ])
                            if(result2 != undefined  && result2.affectedRows>=1)
                            {
                                await connection.commit()
                                res.json({success:true})
                            }
                            else
                            {
                                connection.rollback()
                                res.json({notexist:true})
                            }
                }catch(err)
                {
                    //db 에러시
                    await connection.rollback()
                    console.error(err); 
                    res.json({
                       success:false
                   })
                }
            }catch(err)
            {
                //db 에러시
                console.error(err); 
                res.status(200).json({
                  success:false
               })
            }
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
                try{
                    var [result2] = await connection.query(query,
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
                        ])
                            if(result2 != undefined && result2.affectedRows>=1)
                            {
                                await connection.commit()
                                res.json({success:true})
                            }
                            else
                            {
                                await connection.rollback()
                                res.json({notexist:true})
                            }
    
                }catch(err)
                {
                    //db 에러시
                    await connection.rollback()
                    console.error(err); 
                    res.json({
                       success:false
                   })
                }
            }
                //새로운 파일 등록을 하지 않은 경우
                else{
                    //위와 달리 image_url을 업데이트하지 않음
                    var query = "update art set Art_name = ?,  Image_size= ?, Image_type = ?, Art_text = ?, usd_upper = ?, usd_lower = ?, krw_upper = ?, krw_lower = ?, Displaydate = ?,  Artist_id = ?, Exhibition_id = ? where art_id = ?"
                    try{
                        var [result2] = await connection.query(query,
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
                            ])
                                if(result2 != undefined && result2.affectedRows>=1)
                                {
                                    await connection.commit()
                                    res.json({success:true})
                                }
                                else
                                {
                                    await connection.rollback()
                                    res.json({notexist:true})
                                }
                    }catch(err)
                    {
                        //db 에러시
                        await connection.rollback()
                        console.error(err); 
                        res.json({
                           success:false
                       })
                    }
                }
    }
    await closeConnection(connection)
});

app.post('/api/imgupload/search',async (req,res) => {
    var connection = await openConnection()
//작품 id로 작품 정보 찾아서
//관리자 작품 수정하기에서 작품 정보 보여주기용

        //입력된 작품 id로 작품정보 찾기
        var query = "select artist_id, art_name, exhibition_id, Displaydate, Image_size, Image_type, KRW_lower, KRW_upper, USD_lower,USD_upper, Art_text from art where art_id = ?"
        try{
            var [result] = await connection.query(query,[req.body.id])
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
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
              err:true
           })
        }
        await closeConnection(connection)
})

app.post('/api/auction_upload',async (req,res) =>{
    var connection = await openConnection()
//경매 등록하기

    //세션을 확인
    //경매의 매니저는 현재 로그인한 관리자의 정보를 가져올 것이므로
    //세션의 정보를 통해 관리자 정보 알아냄
    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
                    //경매로 등록할 작품이 실제로 db에 존재하는지 알기 위해
                    //해당 작품 id로 튜플검색
        var  query = "select a.art_id from art a where a.art_id = ?"
        try{
            await connection.beginTransaction()
            var [result] = await connection.query(query, [req.body.art_id])
            //해당 작품이 db에 존재할 때
            if(result!=undefined && result[0] != undefined)
            {
                //가장 최근에 등록된 경매 id에 +1한 값을
                //새로운 경매의 id로 등록
                query = "select auction_id from (select t.*, @rownum := @rownum + 1 rownum  from (select auction_id from auction order by auction_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"
                var [result2] = await connection.query(query)
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
                   var [result3] = await connection.query(query, [req.body.art_id])
                       if(result3!=undefined && result3[0] != undefined)
                       {
                           //작품을 경매에 등록
                           query = "insert into auction values (?, ?, DATE_FORMAT(?,'%Y-%m-%d'), DATE_FORMAT(?,'%Y-%m-%d'), ?, ?, ?, ?, ?)"
  
                           try{
                               var [result4] = await connection.query(query,[
                                   idnum,
                                   req.body.unit,
                                   req.body.begintime,
                                   req.body.endtime,
                                   result3[0].krw_lower,
                                   null,
                                   req.session.user.username,
                                   result3[0].artist_id,
                                   result3[0].art_id
                                   
                               ])
                                   if(result4 != undefined && result4.affectedRows>=1)
                                   {
                                       await connection.commit()
                                       res.json({
                                           success:true
                                       })
                                   }
                                   else{
                                       await connection.rollback()
                                       res.json({
                                           success:false
                                       })
                                   }
                           }catch(err)
                           {
                               await connection.rollback()
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
        }
        //해당 작품이 존재하지 않을 때
        else{
            res.json({
                nosuchart:true
            })
        }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
              err:err
           })
        }
    }
    //세션이 없다면 로그인 하지 않은 경우임
    else
    {
        res.json({
            notlogin:true
        })
    }
    await closeConnection(connection)
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

app.post('/api/searchArtwork/search',async (req,res) => {
    var connection = await openConnection()
    //관리자 페이지에서 작품명으로 작품 찾기

        //like 작품명%로 작품 찾기
        var query = "select a.art_id, a.art_name, r.artist_name  from art a, artist r where a.art_name like ? and a.artist_id = r.artist_id order by a.art_name"
        try{
            var [result] = await connection.query(query, [req.body.input+"%"])
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
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
              err:err
           })
        }
        await closeConnection(connection)
})

app.post('/api/searchArtwork/delete',async (req,res) => {
    var connection = await openConnection()
//관리자 페이지에서 
//선택한 작품 삭제하기
        var query = "delete from art where art_id = ?;"
        var check = true
        var filename = []
        try{
            await connection.beginTransaction()
            //checkBoxId는 삭제하려는 작품의 id들의 배열
            for(let i=0; i< req.body.checkBoxId.length; i++)
            {   
                var [result_filename] = await connection.query("select image_url from art where art_id = ?",req.body.checkBoxId[i])
                if(result_filename!=undefined && result_filename[0]!=undefined)
                {
                    filename.push(result_filename[0].image_url)
                }

                var [result] = await connection.query(query,req.body.checkBoxId[i])
                if(result!=undefined && result.affectedRows>=1)
                {
                }
                else{
                    check = false
                }
            }
           if(check)
           {
            await connection.commit()
            res.json({
                success:true
            })
           }
           else{
            await connection.rollback()
            res.json({
                success:false
            })
           }
        }catch(err)
        {
            //db 에러시
            await connection.rollback()
            console.error(err); 
            res.json({
               success:false
           })
        }    
        await closeConnection(connection)

        try{
            filename.map(async (item)=>{
                fs.unlink("./public/img/"+item, (err)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        console.log("./public/img/"+item+"  삭제")
                    }
                })
            })
        }catch(err)
        {
            console.log(err)
        }
})

app.post('/api/searchArtist/search', async (req,res) => {
    var connection = await openConnection()
    //관리자 페이지에서 작가명으로 작가 찾기
        //like 작가명% 로 작가찾기 
        var query = "select r.artist_id, r.artist_name, r.life_term  from artist r where r.artist_name like ? order by r.artist_name"
        try{
            var [result] = await connection.query(query, [req.body.input+"%"])
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
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
              err:err
           })
        }
        await closeConnection(connection)
})

app.post('/api/searchArtist/delete',async (req,res) => {
    var connection = await openConnection()
//관리자 페이지 작가 삭제
        var check = true

        //작가id를 통해 작가 삭제
        var query = "delete from artist where artist_id = ?;"
        try{
        //트랜잭션 생성
        await connection.beginTransaction()
        //checkBoxId는 삭제할 작가의 id가 담긴 배열
        for(let i=0; i< req.body.checkBoxId.length; i++)
        {
            //복수의 질의문 실행
            var [result] = await connection.query(query,req.body.checkBoxId[i])
            //성공적으로 반영시 commit
            if(result!=undefined && result.affectedRows>=1)
            {
            }
            else{
                check = false
            }
        }
        if(check)
        {
            await connection.commit()
            console.log(result)
            res.json({
                success:true
            })
        }
        else
        {
            await connection.rollback()
            res.json({
                success:false
            })
        }
        }catch(err)
        {
            //db 에러시
            await connection.rollback()
            console.error(err); 
            res.json({
               success:false
           })
        }
        await closeConnection(connection)
})


app.post('/api/joinForm', async (req,res)=>
{
    //salt 생성 및 비밀번호 암호화
    const buf = await randomBytesPromise(64)
    var salt = buf.toString("base64")
    var key = await pbkdf2Promise(req.body.password, salt, 113276,64,"sha512")
    var hased_passwd = key.toString("base64")

    //var encrypt_passwd = crypto.createHash("sha512").update(req.body.password).digest('base64')
    var connection = await openConnection()
        //회원 정보 등록
        let query = "insert into artuser values (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        try{
            var [result] = await connection.query(query, [
                req.body.username,
                req.body.name,
                hased_passwd,
                req.body.email,
                req.body.phone,
                "ROLE_USER",
                req.body.gender,
                req.body.age,
                salt
            ])
                //회원 정보 등록
                if(result != undefined && result.affectedRows>=1)
                {
                    console.log("COMMIT 회원가입 성공")
                    await connection.commit()
                    res.status(200).json({
                        success:true
                    })
                }
                //반영이 안된 경우
                else{
                    await connection.rollback()
                    res.status(200).json({
                        success:false
                    })
                }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
              success:false
           })
        }

        await closeConnection(connection)
})


app.get('/api/getForm', async (req,res)=>{
    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
        var connection = await openConnection()
        var query = "select name, email, phone, gender, age from artuser where username = ?"

        try{
            var [result] = await connection.query(query, req.session.user.username)
            if(result!=undefined && result[0]!=undefined)
            {
                res.json({
                    email:result[0].email,
                    name:result[0].name,
                    phone:result[0].phone,
                    gender:result[0].gender,
                    age:result[0].age
                })
            }
            else{
                res.json({none:true})
            }
        }catch(err)
        {
            res.json({err:true})
            console.log(err)
        }

        await closeConnection(connection)
    }
    else
    {
        res.json({login_required:true})
    }
})

app.post('/api/changeForm', async (req,res)=>
{
    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
        var connection = await openConnection()
        //회원 정보 수정
        let query = "update artuser set name = ?, email = ?, phone = ?, gender = ?, age = ? where username = ?;"
        
        try{
            await connection.beginTransaction()
            var [result] = await connection.query(query, [
                req.body.name,
                req.body.email,
                req.body.phone,
                req.body.gender,
                req.body.age,
                req.session.user.username
            ])
                //회원 정보 등록
                if(result != undefined && result.affectedRows>=1)
                {
                    query =" update user_preference set gender = ?, age = ? where username = ?;"
                    var [result2] = await connection.query(query,[
                        req.body.gender,
                        req.body.age,
                        req.session.user.username
                    ])
                    if(result2!=undefined && result2.affectedRows>=1)
                    {
                        console.log("COMMIT 회원변경 성공")
                        await connection.commit()
                        res.status(200).json({
                            success:true
                        })
                    }
                    //반영이 안된 경우
                    else{
                        await connection.rollback()
                        res.status(200).json({
                            success:false
                        })
                    }
                }
                //반영이 안된 경우
                else{
                    await connection.rollback()
                    res.status(200).json({
                        success:false
                    })
                }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
              success:false
           })
        }

        await closeConnection(connection)
    }
    //로그인 안되어 있을 경우
    else{
        res.json({login_required:true})
    }
})

app.post('/api/loginForm', async (req,res)=>
{
    var connection = await openConnection()
    console.log('로그인')
        var uname = req.body.username
        
        //사용자명으로 비밀번호, 사용자 권한 알아내기
        let sql = "select username, name, password, email,  role, gender, age, salt from artuser where username = ?"
        console.log(uname.trim())
        //uname.trim()으로 공백 지운
        //사용자의 아이디 입력값으로
        //db에 등록된 사용자 찾기
        try{
            var [result] = await connection.query(sql, [uname.trim()])
            var hased_passwd 
            if(result!=undefined && result[0] != undefined )
            {
                var key = await pbkdf2Promise(req.body.password, result[0].salt, 113276,64,"sha512")
                hased_passwd = key.toString("base64")
            }
            


            //결과가 없거나, 결과 튜플의 비밀번호가 사용자가 입력한 비밀번호와 일치하지 않을때, 로그인 실패
            if(result==undefined || result[0] == undefined || result[0].password != hased_passwd)
            {
                console.log("비밀번호 불일치 : ")
                res.json({
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
                    gender: result[0].gender,
                    age: result[0].age,
                    success:true,
                    authorized: true
                }

                //세션 저장
                req.session.save((err)=>{console.log(err)})

                console.log("세션 등록성공 : "+req.session)
                // 세션 ID 확인
                const sessionID = req.sessionID
                console.log('session id :', sessionID)
                res.json({
                        success: true,
                        session: req.session
                })
                //.render('/api/checkAdmin',{
                //    session : req.session
                //})
            }
        }catch(err)
        {
            //db 에러시
            console.error(err)
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})

app.get('/api/logout',(req,res)=>{
    //세션 제거함으로 로그아웃
    req.session.destroy()
    res.json({
        success:true
    })
})


//여기서 부터 blog내용 적용
app.get('/api/home1/about', async (req, res) =>
{
        var connection = await openConnection()
        //Home1 화면에 출력할 최근 등록한 작품 3개 정보 얻기
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name, a.art_name, e.exhibition_name, a.Image_url , a.Art_id  from art a, artist r, exhibition e where a.artist_id = r.artist_id and a.exhibition_id = e.exhibition_id  order by a.art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 3"
        try{

            var [result] = await connection.query(query)

            var jsondata = []
            //질의 결과가 있을 때
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
            res.json(jsondata)
        }catch(err)
        {
            //db 에러시
            console.error(err)

                res.status(200).json({
                    success:false
                })
        }
        
        await closeConnection(connection)
})

app.get('/api/home1/about2', async (req, res) =>
{
    var connection = await openConnection()
    //HOME1 최근 등록된 작품3개의
    //하단 그래프용 정보 얻어오기

        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select a.art_name, a.Remaintime, a.art_id  from  art a order by a.art_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 3"
        try{
            let [result] = await connection.query(query)
            var jsondata = []
            //질의 결과가 있을 때
            if(result != undefined && result[0]!=undefined)
            {
               await result.forEach(async (rows, index) => {
                    var value =  await show_user_preference(connection, rows.art_id)
                    
                    var data = {
                        name : rows.art_name,
                        '전시 관람 체류 시간' : rows.Remaintime,
                        '전시 관람객': value.totalnum
                    }
                   jsondata.push(data)

                   if(index == 2)
                   {
                    res.json(jsondata)
                   }
                })
            }
            else{
                res.json(null)
            }

        }catch(err)
        {
            //db 에러시
            console.error(err)
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})


app.get('/api/home2', async(req,res) => {
    var connection = await openConnection()
    //HOME2에서 보여줄 가장 최근에 등록된 작품의 정보 가져오기
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select  a.image_url, a.art_name, a.displaydate, r.artist_name, a.Art_text,  a.art_id  from  artist r, art a, exhibition e where r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id order by art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"

        try{
            var [result] = await connection.query(query)
            //질의 결과가 있을 때
           if(result!=undefined && result[0]!=undefined)
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
            res.json(data)
        }catch(err)
        {
            //db 에러시
            console.error(err)
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})


app.get('/api/home3/slider', async function (req, res) {
    var connection = await openConnection()
    //HOME3 슬라이드에 사용되는 가장 최근에 등록된 작품 8개 보여주기
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name, a.art_name, e.exhibition_name, a.Image_url , a.Art_id  from art a, artist r, exhibition e where a.artist_id = r.artist_id and a.exhibition_id = e.exhibition_id  order by a.art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 8"
        try{
            var [result] = await connection.query(query)
            var jsondata = []
            //질의 결과가 있을 때
            if(result != undefined && result[0]!=undefined)
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
           res.json(jsondata)
        }catch(err)
        {
            //db 에러시
            console.error(err)
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})

app.get('/api/home3/graph', async function (req, res) {
    var connection = await openConnection()
 //HOME3의 그래프에 사용될
 //가장 최근에 등록한 작품 5개의 정보 가져오기
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from ( select art_name, Remaintime ,Audience_number, art_id  from art a order by art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 5"
        try{
            var [result] = await connection.query(query)
            var jsondata = []
           //질의 결과가 있을 때
            if(result != undefined && result[0]!=undefined)
            {
                
                await result.forEach(async(array,index)=>{
                    var value = await show_user_preference(connection, array.art_id)
                   
                    var data = {name : array.art_name,
                        '전시 관람 체류 시간' : array.Remaintime,
                        '전시 관람객': value.totalnum !== null ? value.totalnum : Number(0)}
                    jsondata.push(data)
                    if(index==4)
                    {
                        res.json(jsondata)
                    }
                   
                })
            }
            else{
                res.json(null)
            }
        }catch(err)
        {
            //db 에러시
            console.error(err)
            res.status(200).json({
               success:false
           })
        }
    
        await closeConnection(connection)
})

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
    )
})


app.get('/api/home4/data', async function (req, res) {
    var connection = await openConnection()
//HOME4
        let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name , a.art_name, a.image_url, a.art_id  from  artist r, art a, exhibition e where r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id order by art_id desc ) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 3"
        try{
            var [result] = await connection.query(query)
            var jsondata = []
            //질의 결과가 있을 때
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
            res.json(jsondata)
        }catch(err)
        {
            //db 에러시
            console.error(err)
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})

    
app.get('/api/exhibition1/data', async function (req, res) {
    var connection = await openConnection()
        //현재 작품들 정보 가져오기
        let query = "select tmp.* from ( select r.artist_id, r.artist_name , a.art_id, a.art_name, a.image_url, e.exhibition_id, e.exhibition_name  from  artist r, art a, exhibition e where r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id order by art_id desc ) tmp"
        try{
            var [result] = await connection.query(query)
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
            res.json(jsondata)
        }catch(err)
        {
            //db 에러시
            console.error(err)
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
    })

    app.post('/api/exhibition2/exhibition', async function (req, res) {
        var connection = await openConnection()
        //접속한 url에 전시관 id가 존재할 때
        if(req.body.exhibition != undefined && req.body.exhibition.length>=1)
        {
            
                //전시관 id를 통해 전시관에 있는 작품들 찾기
                let query = "select r.artist_name, e.exhibition_name, a.image_url, a.art_name, a.Art_id, e.Exhibition_data  from art a, artist r, exhibition e where e.exhibition_id = ? AND a.artist_id = r.artist_id and a.exhibition_id = e.exhibition_id  order by a.art_id desc"
                try{
                    var [result] = await connection.query(query,
                        [req.body.exhibition])
                    var jsondata = []
                    var value = [Number(0), Number(0), Number(0), Number(0)]
                        //전시관에 작품이 존재할 때
                        if(result != undefined && result[0] != undefined )
                        {
                            result.forEach((rows,i) => {
                                if(i==0)
                                {
                                    var data = {
                                        artist:rows.artist_name,
                                        day:'apr 10 - may 11, 2021',
                                        musium: rows.exhibition_name,
                                        img:rows.image_url,
                                        artworkUrl: '/exhibition3/'+rows.Art_id,
                                        textTitle: rows.Art_id,
                                        textArea: rows.Exhibition_data,
                                        datenumber:Number(0),
                                        totalnumber:'194:36:41',
                                        time:'2020. 02. 08 PM 14:00 기준'
                                    
                                    }
                                    jsondata.push(data)
                                }
                            })

                            query = "select p.age, sum(p.hits) hits from user_preference p, art a where a.exhibition_id = ? and a.art_id = p.art_id group by p.age order by p.age"
                            var [result2] = await connection.query(query, [req.body.exhibition])
                            var sum = Number(0)
                            if(result2!=undefined && result2[0] != undefined){
                                value = chart04_user_preference(result2)
                                value.forEach((it)=>{
                                    sum+=it
                                })
                                jsondata[0].datenumber = sum
                                
                                jsondata.push([
                                    { name: '10-20대', value: value[0] },
                                    { name: '30-40대', value: value[1] },
                                    { name: '50-60대', value: value[2] },
                                    { name: '70대 이상',  value: value[3] }
                                ])
                            }
                        }
                        //전시관에 작품이 없는 경우 전시관에 대한 정보만 반환
                        else
                        {
                            let q = "select e.exhibition_name, e.exhibition_data from exhibition e where e.exhibition_id = ?"
                            var [result2] = await connection.query(q,[req.body.exhibition])
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
                                            datenumber:Number(0),
                                            totalnumber:'194:36:41',
                                            time:'2020. 02. 08 PM 14:00 기준'
                                        
                                        }
                                        jsondata.push(data)
                                        jsondata.push([
                                            { name: '10-20대', value: Number(0) },
                                            { name: '30-40대', value: Number(0) },
                                            { name: '50-60대', value: Number(0) },
                                            { name: '70대 이상',  value: Number(0) }
                                        ])
                                    }
                                    else{
                                        
                                        jsondata.push({notuple:true})
                                    }
                        }
                        res.json(jsondata)
                }catch(err)
                {
                    //db 에러시
                    console.error(err)
                    res.status(200).json({
                       success:false
                   })
                }

        }

        //접속한 url에 전시관 id가 존재하지 않을 때
        else{
                //작품수가 가장 많이 전시된 전시관의 작품 정보 가져오기
                let query = "select r.artist_name, e.exhibition_name, a.image_url, a.art_name, a.Art_id, e.Exhibition_data, e.exhibition_id from (select * from (select t.*, @rownum := @rownum + 1 rownum  from (select x.exhibition_id, x.Exhibition_name, x.Exhibition_data, count(*) artnum from exhibition x, art aa where x.Exhibition_id = aa.Exhibition_id group by x.Exhibition_id order by artnum desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1) e, art a, artist r where e.exhibition_id = a.exhibition_id and a.Artist_id = r.Artist_id"
                try{
                    var [result] = await connection.query(query)
                    var jsondata = []
                    var exhibition_id
                    //전시관에 작품이 있을 때
                    if(result != undefined && result[0] != undefined )
                    {
                        exhibition_id = result[0].exhibition_id
                        result.forEach((rows,i) => {
                            if(i==0)
                            {
                                var data = {
                                    artist:rows.artist_name,
                                    day:'apr 10 - may 11, 2021',
                                    musium: rows.exhibition_name,
                                    img:rows.image_url,
                                    artworkUrl: '/exhibition3/'+rows.Art_id,
                                    textTitle: rows.Art_id,
                                    textArea: rows.Exhibition_data,
                                    datenumber:Number(0),
                                    totalnumber:'194:36:41',
                                    time:'2020. 02. 08 PM 14:00 기준',
                                    exhibition_id:rows.exhibition_id
                                }
                                jsondata.push(data)
                            }
                        })
                        
                        query = "select p.age, sum(p.hits) hits from user_preference p, art a where a.exhibition_id = ? and a.art_id = p.art_id group by p.age order by p.age"
                        var [result2] = await connection.query(query, [exhibition_id])
                        var sum = Number(0)
                        if(result2!=undefined && result2[0] != undefined){
                            value = chart04_user_preference(result2)
                            value.forEach((it)=>{
                                sum+=it
                            })
                            jsondata[0].datenumber = sum
                            jsondata.push([
                                { name: '10-20대', value: value[0] },
                                { name: '30-40대', value: value[1] },
                                { name: '50-60대', value: value[2] },
                                { name: '70대 이상',  value: value[3] }
                            ])
                        }
                    }
                    //작품수가 가장 많이 전시된 전시관에 작품이 없는 경우
                    else
                    {
                        //가장 최근 등록된 전시관 정보 가져오기
                        //작품이 가장 많이 전시된 전시관의 작품수가 0이므로
                        //모든 전시관의 작품수가 0이란 의미 
                        let q = "select e.exhibition_name, e.exhibition_data, e.exhibition_id from exhibition e where e.exhibition_id in (select exhibition_id from (select t.*, @rownum := @rownum + 1 rownum  from (select x.exhibition_id from exhibition x order by x.exhibition_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1)"
                        var result2 = await connection.query(q,[req.body.exhibition])
                                if(result2 != undefined && result2[0] != undefined)
                                {
                                    exhibition_id = result2[0].exhibition_id
                                    var data = {
                                        artist:'작품 없음',
                                        day:'apr 10 - may 11, 2021',
                                        musium: result2[0].exhibition_name,
                                        img:'notfoung.png',
                                        artworkUrl:'#',
                                        textTitle: '해당 전시관에 진행중인 내용이 없습니다',
                                        textArea: result2[0].exhibition_data,
                                        datenumber:Number(0),
                                        totalnumber:'194:36:41',
                                        time:'2020. 02. 08 PM 14:00 기준',
                                        exhibition_id:exhibition_id
                                    }
            
                                    jsondata.push(data)
                                    jsondata.push([
                                        { name: '10-20대', value: Number(0) },
                                        { name: '30-40대', value: Number(0) },
                                        { name: '50-60대', value: Number(0) },
                                        { name: '70대 이상',  value: Number(0) }
                                    ])
                                }
                                else{
                                    jsondata.push({notuple:true})
                                }
                    }
                    res.json(jsondata)
                }catch(err)
                {
                    //db 에러시
                    console.error(err)
                    res.status(200).json({
                       success:false
                   })
                }
        }
        await closeConnection(connection)
        })

        app.post('/api/exhibition2/rank', async function (req, res) {
            var connection = await openConnection()
            //url에 전시관 id가 있는 경우
            if(req.body.exhibition != undefined && req.body.exhibition.length>=1)
            {
                    //해당 전시관에 전시된 작품 최대 6개 정보 반환
                    let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name, a.art_name, a.Art_id  from art a, artist r, exhibition e where e.exhibition_id = ? AND a.artist_id = r.artist_id and a.exhibition_id = e.exhibition_id  order by a.art_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 6"
                    try{
                        var [result] = await connection.query(query,
                            [req.body.exhibition])
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
                            res.json(jsondata)
                    }catch(err)
                    {
                        //db 에러시
                        console.error(err)
                        res.status(200).json({
                           success:false
                       })
                    }
            }
            //url에 전시관 id가 없을 때 작품 수가 가장 많은 전시관의 작품 최대 6개 정보
            else{
                    let query = "select artist_name, art_name, Art_id from (select t2.*, @rownum2 := @rownum2 + 1 rownum2  from (select r.artist_name, a.art_name, a.Art_id from (select * from (select t.*, @rownum := @rownum + 1 rownum2  from (select x.exhibition_id, x.Exhibition_name, x.Exhibition_data, count(*) artnum from exhibition x, art aa where x.Exhibition_id = aa.Exhibition_id group by x.Exhibition_id order by artnum desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum2 <= 1) e, art a, artist r where e.exhibition_id = a.exhibition_id and a.Artist_id = r.Artist_id) t2, (select @rownum2 := 0) tmp4) tmp5 where tmp5.rownum2 <= 6"
                    try{
                        var [result] = await connection.query(query)
                        var jsondata = []
            
                        if(result != undefined && result[0]!=undefined)
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
                        res.json(jsondata)
                    }catch(err)
                    {
                        //db 에러시
                        console.error(err); 
                        res.status(200).json({
                           success:false
                       })
                    }

            }
                await closeConnection(connection)
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
        
                                            //유저, 작품, 날짜 조회수 갱신 및 등록
                                            async function update_user_preference(connection, req, art_id)
                                            {
                                                var date = moment().format('YYYY-MM-DD').toString()
                                                var sql = ""
                                                /*로그인 확인*/
                                                if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
                                                {
                                                    sql = "select * from user_preference where username = ? and art_id = ? and access_time = DATE_FORMAT(?, '%Y-%m-%d')"
                                                    try{
                                                        await connection.beginTransaction()
                                                        var [result] = await connection.query(sql, [req.session.user.username, art_id, date])
                                                        if(result!=undefined && result[0]!=undefined)
                                                        {
                                                            sql = "update user_preference set hits = hits + 1 where username = ? and art_id = ? and access_time = DATE_FORMAT(?, '%Y-%m-%d')"
                                                        }
                                                        else{
                                                            sql = "insert into user_preference values (?, ?, DATE_FORMAT(?, '%Y-%m-%d'), 1, ?, ?)"
                                                        }
                                                        var [result2] = await connection.query(sql, [req.session.user.username, art_id, date, req.session.user.gender, req.session.user.age])
                                                        if(result2 !=undefined && result2.affectedRows>=1)
                                                        {
                                                            connection.commit()
                                                        }
                                                    }catch(err)
                                                    {
                                                        //db 에러시
                                                        connection.rollback()
                                                        console.error(err);
                                                    }
                                                }
                                            };
                                            //금일 조회, 총 조회 질의
                                            async function show_user_preference(connection, art_id)
                                            {
                                                var date = moment().format('YYYY-MM-DD')
                                                var sql = "select sum(hits) hits from user_preference where art_id = ? and access_time = ?"
                                                var returnvalue = {dailynum : Number(0), totalnum : Number(0)}
                                                try{
                                                    var [result] = await connection.query(sql, [art_id, date])
                                                    if(result!=undefined && result[0]!=undefined)
                                                    {
                                                        returnvalue.dailynum = Number(result[0].hits)
                                                    }

                                                    sql = "select sum(hits) hits from user_preference where art_id = ?"                                                
                                                    var [result2] = await connection.query(sql, [art_id])
                                                    if(result2!=undefined && result2[0]!=undefined)
                                                    {
                                                        returnvalue.totalnum = Number(result2[0].hits)
                                                    }
                                                }catch(err)
                                                {
                                                    //db 에러시
                                                    console.error(err); 
                                                }
                                                returnvalue.dailynum !== null ? returnvalue.dailynum : Number(0)
                                                returnvalue.totalnum !== null ? returnvalue.totalnum : Number(0)
                                                return returnvalue
                                            };
                                            //chart04용 데이터 반환, 나이별 조회 목록
                                            function chart04_user_preference(result)
                                            {
                                                var value = [Number(0), Number(0), Number(0), Number(0)]
                                                result.forEach((it)=>{
                                                    switch(true)
                                                    {
                                                        case(it.age<30):
                                                        value[0] = Number(value[0]) + Number(it.hits)
                                                        break
                                                        
                                                        case(it.age<50):
                                                        value[1] = Number(value[1]) +  Number(it.hits)
                                                        break
                
                                                        case(it.age<70):
                                                        value[2] = Number(value[2]) +  Number(it.hits)
                                                        break
                
                                                        default:
                                                        value[3] = Number(value[3]) +  Number(it.hits)
                                                        break
                                                    }
                                                })

                                                return value
                                            }

                    app.post('/api/exhibition3/exhibition', async function (req, res) {
                        var connection = await openConnection()
                        var date = moment().format('YYYY-MM-DD HH:mm:ss')
                        //작품 id가 url에 있는 경우
                        if(req.body.id !=undefined && req.body.id.length>=1)
                        {
                                //해당 작품의 정보 반환
                                let query = "select r.artist_name , a.art_name, a.image_type, DATE_FORMAT(a.release_date,'%Y-%m-%d') getdate, a.image_size, a.image_url, e.exhibition_name, e.exhibition_id, r.artist_id, a.art_id  from  artist r, art a, exhibition e where a.art_id = ? AND r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id"
                                try{
                                    var [result] = await connection.query(query, [req.body.id])
                                        var jsondata = []
                            
                                        if(result != undefined && result[0] !=undefined)
                                        {
                                            await update_user_preference(connection, req, req.body.id)
                                            var value = await show_user_preference(connection, req.body.id)
                                            result.forEach((array) => {
                                                var data = {
                                                    artist: array.artist_name,
                                                    artname: array.art_name,
                                                    arttype: array.image_type,
                                                    artsize: array.getdate+", " +array.image_size,
                                                    imgUrl: array.image_url,
                                                    musium: array.exhibition_name,
                                                    people_number: Number(value.dailynum),
                                                    total_people_number: Number(value.totalnum),
                                                    time : date +'기준',
                                                    totaltime: '283:36:41',
                                                    exhibition_id : array.exhibition_id,
                                                    artist_id : array.artist_id,
                                                    art_id : array.art_id
                                                }
                                                jsondata.push(data)
                                            })
                            
                                        }
                            
                                        res.json(jsondata)
                                }catch(err)
                                {
                                    //db 에러시
                                    console.error(err); 
                                    res.status(200).json({
                                       success:false
                                   })
                                }
                        }
                        //작품 id가 url에 없는 경우
                        else
                        {
                                //가장 최근에 등록된 작품 보여주기
                                let query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.artist_name , a.art_name, a.image_type, DATE_FORMAT(a.release_date,'%Y-%m-%d') getdate, a.image_size, a.image_url, e.exhibition_name, e.exhibition_id, r.artist_id, a.art_id  from  artist r, art a, exhibition e where r.artist_id = a.artist_id AND a.exhibition_id = e.exhibition_id order by a.art_id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1"
                                try{
                                    var [result] = await connection.query(query)
                                   
                                    var jsondata = []
                                    
                                    if(result != undefined && result[0]!=undefined)
                                    {
                                        await update_user_preference(connection, req, result[0].art_id)
                                        var value = await show_user_preference(connection, result[0].art_id)
                                        result.forEach((array) => {
                                            var data = {
                                                artist: array.artist_name,
                                                artname: array.art_name,
                                                arttype: array.image_type,
                                                artsize: array.getdate+", " +array.image_size,
                                                imgUrl: array.image_url,
                                                musium: array.exhibition_name,
                                                people_number: Number(value.dailynum),
                                                total_people_number: Number(value.totalnum),
                                                time : date +'기준',
                                                totaltime: '283:36:41',
                                                exhibition_id : array.exhibition_id,
                                                artist_id : array.artist_id,
                                                art_id : array.art_id
                                            }
                                            jsondata.push(data)
                                        })
                                    }
                        
                                    res.json(jsondata)
                                }catch(err)
                                {
                                    //db 에러시
                                    console.error(err); 
                                    res.status(200).json({
                                       success:false
                                   })
                                }
                        }
                        await closeConnection(connection)
                    });

                    app.post('/api/exhibition3/chart04', async function (req, res){
                        var connection = await openConnection()

                        var query = "select age, sum(hits) hits from user_preference where art_id = ? group by age order by age"

                        try{
                            var [result] = await connection.query(query,req.body.art_id)
                            var value = [Number(0),Number(0),Number(0),Number(0)]
                            if(result!=undefined && result[0]!=undefined)
                            {
                                value = chart04_user_preference(result)

                            }
                            res.json(
                                [
                                    { name: '10-20대', value: value[0] },
                                    { name: '30-40대', value: value[1] },
                                    { name: '50-60대', value: value[2] },
                                    { name: '70대 이상',  value: value[3] }
                                ])
                        }catch(err)
                        {
                            //db 에러시
                            console.error(err); 
                            res.status(200).json({
                              success:false
                           })
                        }
                        await closeConnection(connection)
                    })

                        app.post('/api/exhibition3/chart05', async function (req, res) {
                            var connection = await openConnection()
                            var date = moment().format('YYYY-MM-DD')
                            var query =""
                            var resvalue = []
                            
                            //15일 전
                            //8주 전
                            //5달 전
                            //3년 전

                            switch(req.body.date)
                            {
                                case 'day':
                                    var daynum = 10
                                    query ="SELECT DATE(access_time) AS date, sum(hits) hits from user_preference where art_id = ? and access_time > date_format(DATE_SUB(?, INTERVAL (?) day),'%Y-%m-%d')  group by date order by date"
                                    try{
                                        var [result] = await connection.query(query, [req.body.art_id, date, daynum])
                                        if(result!=undefined && result[0]!=undefined)
                                        {
                                            result.forEach((item, index)=>{
                                                var date2 = moment(item.date,'MM-DD')
                                                resvalue.push({name: date2.format('MM-DD') ,'Hits':item.hits})
                                            })
                                        }
                                    }catch(err)
                                    {
                                        console.log(err)
                                    }
                                    res.json(resvalue)
                                    break;

                                case 'week':
                                    query = "select DATE_FORMAT(access_time, '%Y-%U') AS date, sum(hits) hits from user_preference where art_id = ? and access_time > date_format(DATE_SUB(?, INTERVAL (15) week),'%Y-%m-%d')"
                                    query += "group by date order by date"
                                    try{
                                        var [result] = await connection.query(query, [req.body.art_id, date])
                                        if(result!=undefined && result[0]!=undefined)
                                        {
                                            result.forEach((item)=>{
                                                resvalue.push({name: item.date,'Hits':item.hits})
                                            })
                                        }
                                    }catch(err)
                                    {
                                        console.log(err)
                                    }
                                    res.json(resvalue)
                                    break;

                                case 'month':
                                    var monthnum = 12
                                    query ="SELECT DATE_FORMAT(access_time, '%Y-%m') AS date, sum(hits) hits from user_preference where art_id = ? and access_time > date_format(DATE_SUB(?, INTERVAL (?) month),'%Y-%m-%d')  group by date order by date"
                                    try{
                                        var [result] = await connection.query(query, [req.body.art_id, date, monthnum])
                                        if(result!=undefined && result[0]!=undefined)
                                        {
                                            result.forEach((item, index)=>{
                                                var date2 = moment(item.date,'YYYY-MM')
                                                resvalue.push({name: date2.format('YYYY-MM') ,'Hits':item.hits})
                                            })
                                        }
                                    }catch(err)
                                    {
                                        console.log(err)
                                    }
                                    res.json(resvalue)
                                        break;

                                case 'year':
                                    query ="SELECT year(access_time) AS date, sum(hits) hits from user_preference where art_id = ? and access_time > date_format(DATE_SUB(?, INTERVAL (10) year),'%Y-%m-%d')  group by date order by date"
                                    try{
                                        var [result] = await connection.query(query, [req.body.art_id, date])
                                        if(result!=undefined && result[0]!=undefined)
                                        {
                                            result.forEach((item)=>{
                                                resvalue.push({name: item.date ,'Hits':item.hits})
                                            })
                                        }
                                    }catch(err)
                                    {
                                        console.log(err)
                                    }
                                   
                                    res.json(resvalue)
                            }
                            await closeConnection(connection)
                        });

                        

                                app.post('/api/artist01/slider', async function (req, res) {
                                    var connection = await openConnection()
                                            //작가 id가 url에 있을 경우
                                            if(req.body.id !=undefined && req.body.id.length>=1)
                                            {
                                                //해당 작가의 정보 가져오기
                                                var query = "select r.artist_name, a.image_type, a.image_size, e.exhibition_name, a.image_url, a.art_name, a.art_id from artist r, art a, exhibition e where e.exhibition_id = a.exhibition_id and a.artist_id = r.artist_id and r.artist_id = ?"
                                                try{
                                                    var [result] = await connection.query(query, [req.body.id])
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
                                                }catch(err)
                                                {
                                                    //db 에러시
                                                    console.error(err); 
                                                    res.status(200).json({
                                                       success:false
                                                   })
                                                }
                                            }
                                            //작가 id가 url에 없는 경우 작품수가 가장 많이 등록된 작가 보여주기
                                            else
                                            {
                                                var query = "select r.artist_name, a.image_type, a.image_size, e.exhibition_name, a.image_url, a.art_name, a.art_id from artist r, art a, exhibition e where e.exhibition_id = a.exhibition_id and a.artist_id = r.artist_id and r.artist_id IN (select artist_id from (select t.*, @rownum := @rownum + 1 rownum  from (select k.artist_id, COUNT(y.art_id) artnum from artist k, art y where y.artist_id = k.artist_id group by k.artist_id order by artnum desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1) "
                                                try{
                                                    var [result] = await connection.query(query)
                                                    var jsondata = []

                                                    if(result !=undefined && result[0]!=undefined)
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
                                                }catch(err)
                                                {
                                                    //db 에러시
                                                    console.error(err); 
                                                    res.status(200).json({
                                                       success:false
                                                   })
                                                }

                                            }
                                            await closeConnection(connection)
                                    });


                                   
                                    app.post('/api/artist01/artist', async function (req, res) {
                                        var connection = await openConnection()
                                        var date = moment().format('YYYY-MM-DD HH:mm:ss')
                                                    if(req.body.id !=undefined && req.body.id.length>=1)
                                                    {
                                                        var query = "select artist_name, Artist_info from artist where artist_id = ?"
                                                        try{
                                                            var [result] = await connection.query(query,[req.body.id])
                                                            var jsondata = []
                                                            if(result !=undefined && result[0]!=undefined)
                                                            {
                                                                result.forEach((rows)=>{
                                                                    jsondata.push({
                                                                        name: rows.artist_name,
                                                                        btnUrl: '#',
                                                                        textArea: rows.Artist_info,
                                                                        people_num: Number(0),
                                                                        totaltime: '1894:36:41',
                                                                        timeline: date+' 기준',
                                                                        like: '60'
                                                                    })
                                                                })
                                                            }

                                                            query = "select a.artist_id, p.age, sum(p.hits) hits from user_preference p, art a where a.art_id = p.art_id and a.artist_id = ? group by a.artist_id, p.age order by p.age"
                                                            var [result2] = await connection.query(query, [req.body.id])
                                                            var people_num = Number(0)
                                                            if(result2!=undefined && result2[0]!=undefined)
                                                            {
                                                                var value = chart04_user_preference(result2)
                                                                
                                                                value.forEach((it)=>{
                                                                    people_num+=it
                                                                })

                                                                jsondata.push(
                                                                    [
                                                                        { name: '10-20대', value: value[0] },
                                                                        { name: '30-40대', value: value[1] },
                                                                        { name: '50-60대', value: value[2] },
                                                                        { name: '70대 이상',  value: value[3] }
                                                                    ])
                                        
                                                            }
                                                            jsondata[0].people_num = people_num

                                                            res.json(jsondata)
                                                        }catch(err)
                                                        {
                                                            //db 에러시
                                                            console.error(err); 
                                                            res.status(200).json({
                                                               success:false
                                                           })
                                                        }
                                                    }
                                                    
                                                    else
                                                    {
                                                        var query = "select t.artist_name, t.Artist_info, t.artist_id from artist t where t.artist_id IN (select artist_id from (select t.*, @rownum := @rownum + 1 rownum  from (select k.artist_id, COUNT(y.art_id) artnum from artist k, art y where y.artist_id = k.artist_id group by k.artist_id order by artnum desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1)"
                                                        try{
                                                            var [result] = await connection.query(query)
                                                            var jsondata = []
                                                            if(result !=undefined && result[0] != undefined)
                                                                {
                                                                    result.forEach((rows)=>{
                                                                        jsondata.push({
                                                                            name: rows.artist_name,
                                                                            btnUrl: '#',
                                                                            textArea: rows.Artist_info,
                                                                            people_num: Number(0),
                                                                            totaltime: '1894:36:41',
                                                                            timeline: date+' 기준',
                                                                            like: '60'
                                                                        })
                                                                    })

                                                                    query = "select a.artist_id, p.age, sum(p.hits) hits from user_preference p, art a where a.art_id = p.art_id and a.artist_id = ? group by a.artist_id, p.age order by p.age"
                                                                    var [result2] = await connection.query(query, [result[0].artist_id])
                                                                    var people_num = Number(0)
                                                                    if(result2!=undefined && result2[0]!=undefined)
                                                                    {
                                                                        var value = chart04_user_preference(result2)
                                                                        
                                                                        value.forEach((it)=>{
                                                                            people_num+=it
                                                                        })
                                                                        
                                                                        jsondata.push(
                                                                            [
                                                                                { name: '10-20대', value: value[0] },
                                                                                { name: '30-40대', value: value[1] },
                                                                                { name: '50-60대', value: value[2] },
                                                                                { name: '70대 이상',  value: value[3] }
                                                                            ])
                                                
                                                                    }
                                                                }
                                                                jsondata[0].people_num = people_num
                                                                res.json(jsondata)
                                                        }catch(err)
                                                        {
                                                            //db 에러시
                                                            console.error(err); 
                                                            res.status(200).json({
                                                               success:false
                                                           })
                                                        }
                                                    }
                                                    await closeConnection(connection)
                                    })

    app.post('/api/checkId', async (req,res) => {
        var connection = await openConnection()
        //사용가능한 아이디인지 확인
        //입력이 없을 경우 그냥 반환
        //프론트에서도 확인하긴 함
        if(req.body.username=='')
        {
            
            res.json({
                success:'null'
            })
        }
            //해당 사용자가 있는지 확인
            let query = "select username from artuser where username = ?";
            try{
                var [result] = await connection.query(query, [req.body.username])
                //질의 결과 같은 사용자가 있는 경우
                if(result !=undefined && result[0] != undefined && result[0].username === req.body.username)
                {
                    console.log("이미 존재하는 아이디");
                    res.json({
                        success:false
                    })
                }
                
                //없는 경우 사용가능
                else
                {
                    console.log("사용가능한 아이디")

                    res.status(200).json({
                          success:true
                     })
                }
            }catch(err)
            {
                //db 에러시
                console.error(err); 
                res.status(200).json({
                   success:false
               })
            }

            await closeConnection(connection)
    })

    //checkAdmin인데 그냥 세션 정보 프론트로 보내는 거임
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


app.post('/api/myPagefindUser', async (req,res) => {
    var connection = await openConnection()
    //사용자 아이디 입력이 없을 경우
    if(req.body.username == '' || req.body.username == undefined || req.body.username==null)
    {
        res.json({
           name: false
        })
    }
    else
    {
        //사용자 아이디로 사용자 정보 얻기
        var query = "select username, name, email from artuser where username = ?"
        var str = req.body.username.trim()
        try{
            var [result] = await connection.query(query,[str])
            if(result !=undefined && result[0] != undefined){
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
                        res.json(data)
                    })
                }
                else{
                    res.json({
                        name: false
                    })
                }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
               success:false
           })
        }
    }
    await closeConnection(connection)
})

app.get('/api/Transfer/artdata', async (req,res) => {
    var connection = await openConnection()
    //세션 정보확인
    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    {
            console.log('로그인 확인')

                //세션에 담긴 아이디(req.session.user.username)로 사용자가 소유한 작품 검색
                let query = "SELECT R.Artist_name, A.Art_name,  DATE_FORMAT(A.Expired,'%Y-%m-%d') resdate, A.Art_id FROM  art A, artist R, auction U WHERE A.owner_username = ?  AND A.Artist_id = R.Artist_id AND U.art_id = A.art_id"
                try{
                    var [result] = await connection.query(query, [req.session.user.username])
                    var jsondata = []
                    //질의 결과가 있을 경우
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
                    res.json(jsondata)
                }catch(err)
                {
                    //db 에러시
                    console.error(err); 
                    res.status(200).json({
                       success:false
                   })
                }
        }
        //로그인 하지 않은 경우
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
        await closeConnection(connection)
})

app.post('/api/Transfer/sendEmail', async (req,res) => {
  //이메일 인증

  var artnameval = ""

  req.body.artnameval.map((item)=>{artnameval += '<div>'+item+'</div>'})
  var mail_option = {
      to:'droneprobe@naver.com',
      subject:'artdata_test_mail',
      html:artnameval+"<div>위 작품을 "+req.body.username+"님에게 보내시겠습니까?</div>"
  }
 transporter.sendMail(mail_option, async(err,info)=>{
      if(err)
      {
          console.log(err)
          res.json({err:true})
      }
      else
      {
          console.log(info)
          res.json({success:true})
      }
  })
})

app.post('/api/Transfer/sendArt', async (req,res) => {
    var connection = await openConnection()
    //소유한 작품 타인에게 양도
    var date = moment().format('YYYY-MM-DD');
    var query = "update art set owner_username = ?, expired = DATE_FORMAT(?, '%Y-%m-%d') where art_id = ?;"
    try{
            //트랜잭션 설정
            await connection.beginTransaction()
            var check = true
            //선택한 작품 리스트(req.body.checkBoxValue)만큼 
            //업데이트 질의 시행
            for(let i=0; i< req.body.checkBoxValue.length ; i++)
            {
                 //업데이트
                var [result] = await connection.query(query,[req.body.username,date,req.body.checkBoxValue[i]])
                if(result!=undefined && result.affectedRows>=1)
                        {
                        }
                else{
                    check = false
                }
            }
            if(check)
            {
                await connection.commit()
                res.json({
                    success: true
                })
            }else{
                await connection.rollback()
                res.status(200).json({
                    success:false
                })
            }
           
    }catch(err)
    {
        //db 에러시
        await connection.rollback()
        console.error(err); 
        res.status(200).json({
           success:false
       })
    }    
    await closeConnection(connection)
})

app.post('/api/AuctionMain/isStarted',async (req,res)=>{
    var date = moment()
    var connection = await openConnection()
        //경매 시작일, 종료일 확인
        var query = "select DATE_FORMAT(u.begin_point,'%Y-%m-%d') begin_point, DATE_FORMAT(u.end_point,'%Y-%m-%d') end_point from art a, auction u where a.art_id = ? and a.art_id = u.art_id"
        try{
            var [result] = await connection.query(query,[req.body.art_id])
            if(result != undefined && result[0] != undefined)
            {
                result.forEach((rows)=>{
                    var data= {
                        begin_point : rows.begin_point,
                        end_point : rows.end_point,
                        isStarted : false,
                        isNotEnded : false
                    }
                    var begin = moment(rows.begin_point,'YYYY-MM-DD')
                    var end = moment(rows.end_point,'YYYY-MM-DD')

                    if(begin.diff(date)<=0)
                    {
                        data.isStarted = true
                    }
                    
                    if(end.diff(date)>0)
                    {
                        data.isNotEnded = true
                    }

                    res.json(data)
                })
            }
            else
            {
                res.json(null)
            }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})

app.get('/api/AuctionMain/picturedata', async function (req, res) {
        var connection = await openConnection()
        //경매 정보 반환
        var query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null order by u.end_point desc"
        try{
            var [result] = await connection.query(query)
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
                res.json(jsondata)
            }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
               success:false
           })
        }

    await closeConnection(connection)
});


app.post('/api/search_auction',async (req,res)=>{
    var connection = await openConnection()
        //경매 정보 질의 결과 반환하는 함수
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
                        res.json(jsondata)
                    }
        }

        let jsondata = {}

        jsondata.isauctioned='yes'
        try{
                        //작품 아이디로 작품을 찾을 경우
                        if(req.body.num.length>=1)
                        {
                            var query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.art_id = ? and a.owner_username is null"
            
                            var [result] = await connection.query(query,[req.body.num])
                            putresult(result)
                        }
                        //작품 아이디 외 다른 조건으로 찾을 경우
                        else{
                            var query = ""
                            //작가명, 작품명, 가격대로 검색시
                            if(req.body.artist != undefined && req.body.artist.length>=1 && req.body.artname != undefined && req.body.artname.length>=1)
                            {
                                query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and a.art_name like ? AND r.artist_name like ? AND a.krw_lower >= ? and a.krw_upper <= ?"
                                var [result] = await connection.query(query,[req.body.artname+"%",req.body.artist+"%",req.body.value,req.body.value2])
                                putresult(result)
                            }
                            //작가명, 가격대로 검색시
                            else if(req.body.artist != undefined && req.body.artist.length>=1 && req.body.artname.length<1)
                            {
                                query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and r.artist_name like ? AND a.krw_lower >= ? and a.krw_upper <= ?"
                                var [result] = await connection.query(query,[req.body.artist+"%", req.body.value, req.body.value2])
                                putresult(result)
                            }
                            //작품명, 가격대로 검색시
                            else if( req.body.artname != undefined && req.body.artname.length>=1 && req.body.artist.length<1)
                            {
                                query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and a.art_name like ? AND a.krw_lower >= ? and a.krw_upper <= ?"
                                var [result] = await connection.query(query,[req.body.artname+"%", req.body.value,req.body.value2])
                                putresult(result)
                            }
                            //가격대로만 검색시
                            else if(req.body.artname.length<1 && req.body.artist.length<1)
                            {
                                query = "select a.Image_url, r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.art_id from (art a join artist r on a.artist_id = r.artist_id) join auction u on a.art_id = u.art_id where a.owner_username is null and a.krw_lower >= ? and a.krw_upper <= ?"
                                var [result] = await connection.query(query,[req.body.value, req.body.value2])
                                    putresult(result)
                            }
                        }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
               success:false
           })
        }

    await closeConnection(connection)
})


app.post('/api/auctiondata',async (req,res)=>{
    var connection = await openConnection()
        //선택한 경매의 상세 정보(작가, 작품 설명) 리턴
        var query = "select r.artist_name, a.art_name, a.image_size, a.image_type, a.krw_lower, a.krw_upper, a.usd_lower, a.usd_upper, a.Art_text, r.Artist_info, r.life_term, a.art_id, DATE_FORMAT(a.Release_date, '%Y-%m-%d') release_date, r.artist_id, a.image_url from artist r, art a, auction u where a.art_id = ? and a.artist_id = r.artist_id and a.art_id = u.art_id and a.owner_username is null"
        try{
            var [result] = await connection.query(query,[req.body.id])
            //정상적인 질의 결과 반환 시
            if(result!= undefined && result[0]!=undefined)
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
                res.json(data)
            }
            else{
                res.json(null)
            }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
               success:false
           })
        }
    await closeConnection(connection)
})

app.post('/api/auctiondata/search',async (req,res)=>{
    var connection = await openConnection()
        //선택한 경매에 입찰 시도한 사용자 입찰 가격순으로 최대 5명 뽑기
        var query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select r.username, u.user_price, date_format(u.bid_date,'%Y-%m-%d') bid_date, r.email from artuser r, user_bid u where r.username = u.username and u.art_id = ? order by u.user_price desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 5"
        try{
            var [result] = await connection.query(query,[req.body.id])
            //정상 결과 반환 시
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
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})

app.post('/api/auctiondata/submit',async (req,res)=>{

    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    {
        var date = moment().format("YYYY-MM-DD")
        var connection = await openConnection()
            //해당 경매 입찰 시도 시
            //현재 해당 작품에 가장 높은 가격 제시한 사람 확인
            var query = "select user_price, username from user_bid where art_id = ? order by user_price desc FOR UPDATE"
            try{
                await connection.query("start transaction")
                var [result] = await connection.query(query,[req.body.art_id])
                    //현재 사용자가 해당 작품의 최대가 보다 작게 제시한 경우
                    console.log( result[0].username +" : "+  result[0].user_price )
                    if(result != undefined && result[0]!=undefined && result[0].user_price >= req.body.userprice)
                    {
                        res.json({denied : true})
                    }
                    else{
                        //사용자가 이전에 해당 작품의 입찰에 참여한 적 있는지 확인
                        query = "select * from user_bid where username = ? and art_id = ? FOR UPDATE"
            
                        var [result1] = await connection.query(query,[req.session.user.username, req.body.art_id])
                         //이전에 해당 작품 경매에 참여한 적이 있을 경우   
                        if(result1 != undefined && result1[0] != undefined)
                        {
                            //해당 입찰 정보의 가격과 입찰 날짜를 업데이트
                            query = "update user_bid set user_price = ?, bid_date = DATE_FORMAT(?,'%Y-%m-%d')  where username = ? and art_id = ?"                
                                 var [result2] = await connection.query(query,[req.body.userprice, date, req.session.user.username, req.body.art_id])
                                    if(result2 !=undefined && result2.affectedRows>=1)
                                    {
                                        query = "insert into user_inform select u.username, concat(a.art_name,' 작품에서 타인 상회 입찰이 발생하였습니다.') inform_text, date_format(now(),'%Y-%m-%d') inform_date, date_format(now(),'%H:%i:%s') inform_time, u.art_id, 1 auction_type, false comfirm from art a, user_bid u where a.art_id = u.art_id and u.art_id = ? and user_price in (select MAX(user_price) from user_bid where art_id = ? and username <> ?)"
                                        var [result3] = await connection.query(query,[req.body.art_id,req.body.art_id,req.session.user.username])
    
                                        if(result3!=undefined )
                                        {
                                            await connection.commit()
                                            res.json({success : true})
                                        }
                                        else
                                        {
                                            await connection.rollback()
                                            res.json({err : true})
                                        }
    
                                        
                                    }
                                    else{
                                        await connection.rollback()
                                        res.json({err : true})
                                    }
        
                        }
                        //해당 작품에 입찰한 적이 없을 경우
                        else{
                           //새로운 입찰 튜플 생성
                            query = "insert into user_bid values (?, ?, DATE_FORMAT(?, '%Y-%m-%d'), ?)"
                            var [result2] = await connection.query(query,[req.session.user.username, req.body.userprice, date, req.body.art_id])
                                    if(result2.affectedRows>=1)
                                    {
                                        query = "insert into user_inform select u.username, concat(a.art_name,' 작품에서 타인 상회 입찰이 발생하였습니다.') inform_text, date_format(now(),'%Y-%m-%d') inform_date, date_format(now(),'%H:%i:%s') inform_time, u.art_id, 1 auction_type, false comfirm from art a, user_bid u where a.art_id = u.art_id and u.art_id = ? and user_price in (select MAX(user_price) from user_bid where art_id = ? and username <> ?)"
                                        var [result3] = await connection.query(query,[req.body.art_id,req.body.art_id,req.session.user.username])
    
                                        if(result3!=undefined )
                                        {
                                            await connection.commit()
                                            res.json({success : true})
                                        }
                                        else
                                        {
                                            await connection.rollback()
                                            res.json({err : true})
                                        }
                                    }
                                    else{
                                        await connection.rollback()
                                        res.json({err : true})
                                    }
                          }
                    }
            }catch(err)
            {
                //db 에러시
                await connection.rollback()
                console.error(err); 
                res.status(200).json({
                   success:false
               })
            }
            await closeConnection(connection)
    }
    else
    {
        res.json({login_required:true})
    }



})

app.post('/api/auctiondata/isStarted',async (req,res)=>{
    var date = moment()
    var connection = await openConnection()
        //작품id로 특정 경매의 시작일, 종료일, 입찰 단위 검색
        var query = "select DATE_FORMAT(u.begin_point,'%Y-%m-%d') begin_point, DATE_FORMAT(u.end_point,'%Y-%m-%d') end_point, Auction_unit  from auction u where art_id = ?"
        try{
            var [result] = await connection.query(query,[req.body.artname])
            
            var data 
            if(result!=undefined && result[0]!=undefined)
                {
                   data = {
                        begin_point : result[0].begin_point,
                        end_point : result[0].end_point,
                        auction_unit : result[0].Auction_unit,
                        tminus : Number(0),
                        day : Number(-1)
                    }
                    var end = moment(result[0].end_point,'YYYY-MM-DD')

                    data.tminus = moment.duration(end.diff(date)).asSeconds()
                    data.day = end.day()
                    
                }
                res.json(data)
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})

app.post('/api/myauction', async (req,res)=>{
   
    var connection = await openConnection()
    var jsondata = []
        //사용자가 참여한 입찰 정보 찾기
        let query = "SELECT A.art_id, A.Art_name, R.Artist_name, DATE_FORMAT(U.End_point,'%Y-%m-%d') end_point, A.Owner_username FROM user_bid S, art A, artist R, auction U WHERE S.username = ? AND S.art_id = A.art_id AND A.Artist_id = R.Artist_id AND U.art_id = A.art_id AND A.owner_username IS null"
        try{
            var [result] = await connection.query(query, [req.body.username])
            if(result!=undefined && result[0]!=undefined)
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
    
                    //사용자가 참여한 각 입찰 정보를 확인
                    jsondata.forEach(async(item, index) =>{
                        //사용자의 입찰이 가장 높은 가격을 제시했는지 유무 확인 
                        query = "SELECT U.Username FROM user_bid U WHERE U.Art_id = ? AND U.User_price IN( SELECT DISTINCT MAX(S.User_price) FROM user_bid S WHERE S.Art_id = U.Art_id)";
                        var [result2] = await connection.query(query,[item.artwork_id])
                        if(result2 != undefined && result2[0]!=undefined)
                        {
                            result2.forEach((rows)=>{
    
                                //각 작품에서 가장 높은 가격을 제시한 사람이
                                //현재 사용자일 경우
                                if(rows.Username === req.body.username)
                                {
                                    //console.log("일치")
                                    item.isfirst = 'yes'
                                } 
                            })
                        }
                        //data2에 반환할 정보 담기
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
                        
                        //입찰 갯수만큼 실행했다면 바로 반환
                        if(index == jsize)
                        {
                            res.json({
                                dib:jsondata2,
                                //auction:user_auctiondata
                            })
                        }
                        })
                }
                //사용자가 입찰에 참여하지 않았을 경우 null반환
                else{
                    res.json({
                       
                    })
                }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.status(200).json({
               success:false
           })
        }
        await closeConnection(connection)
})

app.post('/api/auction_submit', async (req,res)=>{
    var date = moment().format('YYYY-MM-DD')
    var connection = await openConnection()
            //경매 구매절차
            //사용자가 해당 작품 소유
            var query = "update art set owner_username = ?, expired = ? where art_id = ?"
            try{
                var [result] = await connection.query(query,[
                    req.body.username,
                    date,
                    req.body.art_id
                ])
                    if(result != undefined && result.affectedRows>=1)
                    {
                        await connection.commit()
                        res.json({
                            success:true
                        })
                    }
                    else
                    {
                        res.json({success:false})
                    }
            }catch(err)
            {
                //db 에러시
                await connection.rollback()
                console.error(err); 
                res.status(200).json({
                   success:false
               })
            }
            await closeConnection(connection)
})

app.post('/api/deleteuser',async (req,res)=>{
    var connection = await openConnection()
    //세션 제거로 로그아웃
    req.session.destroy()
    //사용자 입찰 정보 삭제
            var query = "delete from user_bid where username = ?"
            try{
                await connection.beginTransaction()
                var [result] = await connection.query(query, [req.body.username])
                if(result.affectedRows<0)
                {
                    connection.rollback()
                    res.json({success: false})
                }
                else
                {
                    query = "delete from user_preference where username = ?"
                    var [result2] = await connection.query(query, [req.body.username])
                    if(result2.affectedRows<0)
                    {
                        connection.rollback()
                        res.json({success: false})
                    }

                    //사용자가 소유한 작품의 소유자를 없앰
                    query = "update art set owner_username = null, expired = null where owner_username = ?"
                    var [result2] = await connection.query(query, [req.body.username])
                        if(result2.affectedRows<0)
                        {
                            connection.rollback()
                            res.json({success: false})
                        }
                        else
                        {
                            //사용자 정보 삭제
                            query = "delete from artuser where username = ?"
                            var [result3] = await connection.query(query, [req.body.username])
                                if(result3.affectedRows<0)
                                {
                                    connection.rollback()
                                    res.json({success: false})
                                }
                    
                                else
                                {
                                    await connection.commit()
                                    res.json({success: true})
                                }
                        }
                }
            }catch(err)
            {
                //db 에러시
                await connection.rollback()
                console.error(err); 
                res.status(200).json({
                   success:false
               })
            }
            await closeConnection(connection)
})

app.post('/api/mainsearch',async (req,res)=>{
    var connection = await openConnection()
    //메인 화면의 검색 기능
            var query
            //작품명 검색
            if(req.body.check==1)
            {
                query = "select art_id id from art where art_name like ?"
            }
            //작가명 검색
            else if(req.body.check==2)
            {
                query = "select artist_id id from artist where artist_name like ?"
            }
            //전시관명 검색
            else if(req.body.check==3)
            {
                query = "select exhibition_id id from exhibition where exhibition_name like ?"
            }
            try{
                var [result] = await connection.query(query, [req.body.name+"%"])
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
            }catch(err)
            {
                //db 에러시
                console.error(err); 
                res.status(200).json({
                   success:false
               })
            }
            await closeConnection(connection)
})

//게시판 페이지 개수
app.get('/api/board/pagenum',async (req,res)=>{
    var connection = await openConnection()
    //현재 게시글의 갯수 리턴
    var query = "select count(*) boardnum from (select t.*, @rownum := @rownum + 1 rownum  from (select * from board) t, (select @rownum := 0) tmp) tmp2"
    try{
        var [result] = await connection.query(query)
        if(result != undefined && result[0]!=undefined)
        {
            res.json({boardnum : result[0].boardnum})
        }
        else
        {
            res.json({none:true})
        }
    }catch(err)
    {
        //db 에러시
        console.error(err); 
        res.status(200).json({
           err:true
       })
    }
    await closeConnection(connection)
})

//게시판 페이징
app.post('/api/board/showpage',async (req,res)=>{
    var connection = await openConnection()
    //현재 페이지의 게시글 5개 정보 리턴
    var query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select username, indices, boardtype, title, DATE_FORMAT(uploaddate,'%Y-%m-%d') uploaddate, manager, DATE_FORMAT(answerdate,'%Y-%m-%d') answerdate from board order by uploaddate desc) t, (select @rownum := 0) tmp) tmp2  limit ?,5"
    try{
        var [result] = await connection.query(query,(req.body.page-1)*5)
        if(result != undefined && result[0] != undefined)
       {
           //console.log(result)
           res.json(result)
       }
       else
       {
           res.json({none:true})
       }
    }catch(err)
    {
        //db 에러시
        console.error(err); 
        res.status(200).json({
           err:true
       })
    }
    await closeConnection(connection)
})


//게시판 데이터
app.post('/api/board/showarticle',async (req,res)=>{
    var connection = await openConnection()
    //선택한 게시글의 상세 정보 리턴
    var query = "select username, indices, title, DATE_FORMAT(uploaddate,'%Y-%m-%d') uploaddate, manager, DATE_FORMAT(answerdate,'%Y-%m-%d') answerdate,bodytext, answer from board where username = ? and indices = ?"
    try{
        var [result] = await connection.query(query,[req.body.username, req.body.indices])
        if(result != undefined && result[0] != undefined)
        {
            //console.log(result)
            res.json(result[0])
        }
        else
        {
            res.json({none:true})
        }
    }catch(err)
    {
        //db 에러시
        console.error(err); 
        res.status(200).json({
           err:true
       })
    }
    await closeConnection(connection)
})

//게시판 삭제
app.post('/api/board/deletearticle',async (req,res)=>{
    var connection = await openConnection()
    //선택한 게시글의 상세 정보 리턴
    var query = "delete from board where username = ? and indices = ?"
    try{
        await connection.beginTransaction()
        var [result] = await connection.query(query,[req.body.username, req.body.indices])
        if(result != undefined && result.affectedRows>=1)
        {
            await connection.commit()
            res.json({success:true})
        }
        else
        {
            await connection.rollback()
            res.json({success:false})
        }
    }catch(err)
    {
        //db 에러시
        await connection.rollback()
        console.error(err); 
        res.status(200).json({
           err:true
       })
    }
    await closeConnection(connection)
})

//게시판 등록
app.post('/api/board/upload',async (req,res)=>{
    var connection = await openConnection()
    var date = moment().format('YYYY-MM-DD');
    //사용자 세션 확인, 세션으로 부터 사용자명 가져오기
    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    {
        //사용자마다 indices존재
        //사용자의 가장 큰 indices 반환하여 +1한 값을
        //현재 게시글의 indices로 설정
        var query = "select tmp2.indices from (select t.*, @rownum := @rownum + 1 rownum  from (select indices from board where username = ? order by indices desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1 FOR UPDATE"
        try{
            await connection.beginTransaction()
            var [result] = await connection.query(query, req.session.user.username)
                var indices
                if(result!=undefined && result[0]!=undefined)
                {
                    indices = result[0].indices + 1
                }
                else{
                    indices = 1
                }
                //게시글 생성
                query = "insert into board values(?, ?, null, ?, ?, ?, DATE_FORMAT(?,'%Y-%m-%d'), null, null)"
                var input = []
                input.push(req.session.user.username)
                input.push(indices)
                input.push(req.body.boardtype)
                input.push(req.body.title)
                input.push(req.body.bodytext)
                input.push(date)
                console.log(input)
                try{
                    var [result2] = await connection.query(query,input)
                    if(result2 != undefined && result2.affectedRows >= 1){
                        await connection.commit()
                        res.json({result:true})
                    }
                    else{
                        await connection.rollback()
                        res.json({none:true})
                    }
                }catch(err)
                {
                    //db 에러시
                    await connection.rollback()
                    console.error(err); 
                    res.json({db_error:true})
                }   
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.json({db_error:true})
        }


    }
    //로그인이 안되어 있을 때
    else
    {
        res.json({login_required:true})
    }
    await closeConnection(connection)
})

app.post('/api/board/answer',async (req,res)=>{
    var connection = await openConnection()
    var date = moment().format('YYYY-MM-DD');
    //로그인 확인
    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    {
        //현재 로그인된 세션의 사용자(req.session.user.username)가
        //답변하는 관리자이므로
        //답변 내용과 함께 업데이트
        //req.body.username는 게시글을 쓴 사람의 아이디
        var query = "update board set manager = ?, answer = ?, answerdate = DATE_FORMAT(?,'%Y-%m-%d') where username = ? and indices = ?"
        try{
            var [result] = await connection.query(query,
                [req.session.user.username, req.body.bodytext, date, req.body.username, req.body.indices])
                    if(result!=undefined && result.affectedRows>=1)
                    {
                        res.json({result:true})
                    }
                    else
                    {
                        res.json(null)
                    }
        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.json({db_error:true})
        }
    }
    //로그인 하지 않았을 때
    else
    {
        res.json({login_required:true})
    }
    await closeConnection(connection)
})


//공지 페이지 개수
app.get('/api/notice/pagenum',async (req,res)=>{
    var connection = await openConnection()
    //공지글의 갯수 리턴
    var query = "select count(*) noticenum from (select t.*, @rownum := @rownum + 1 rownum  from (select * from notification) t, (select @rownum := 0) tmp) tmp2"
    try{
        var [result] = await connection.query(query)
        if(result != undefined && result[0]!=undefined)
        {
            res.json({noticenum : result[0].noticenum})
        }
        else{
            res.json({none:true})
        }
    }catch(err)
    {
        //db 에러시
        console.error(err); 
        res.status(200).json({
           err:true
       })
    }

    await closeConnection(connection)
})

//공지 페이징
app.post('/api/notice/showpage',async (req,res)=>{
    var connection = await openConnection()
    //현재 페이지의 공지 5개 리턴
    var query = "select * from (select t.*, @rownum := @rownum + 1 rownum  from (select id, title, DATE_FORMAT(uploaddate,'%Y-%m-%d') uploaddate, hits from notification order by uploaddate desc) t, (select @rownum := 0) tmp) tmp2  limit ?,5"
    try{
        var [result] = await connection.query(query,(req.body.page-1)*5)
        if(result != undefined && result[0] != undefined)
        {
            //console.log(result)
            res.json(result)
        }
        else
        {
            res.json({none:true})
        }
    }catch(err)
    {
        //db 에러시
        console.error(err); 
        res.status(200).json({
           err:true
       })
    }
    await closeConnection(connection)
})

//공지 데이터
app.post('/api/notice/showarticle',async (req,res)=>{
    var connection = await openConnection()
    //현재 선택한 공지 상세 정보 리턴
    var query = "select id , title, DATE_FORMAT(uploaddate,'%Y-%m-%d') uploaddate, bodytext from notification where id = ? FOR UPDATE"
    try{
        await connection.beginTransaction()
        var [result] = await connection.query(query,req.body.id)
        if(result != undefined && result[0] != undefined)
        {
            //상세 정보 볼때마다
            //조회수 증가
            try{
                query = "update notification set hits = hits+1 where id = ?"
                var [result2] = await connection.query(query, req.body.id)
                    if(result2!=undefined && result2.affectedRows>=1){
                        await connection.commit()
                        res.json(result[0])
                    }
                    else
                    {
                        await connection.rollback()
                        res.json({none:true})
                    }
            }catch(err)
            {
                //db 에러시
                await connection.rollback()
                console.error(err); 
                res.status(200).json({
                   err:true
               })
            }    
        }
        else
        {
            res.json({none:true})
        }
    }catch(err)
    {
        //db 에러시
        console.error(err); 
        res.status(200).json({
           err:true
       })
    }

    await closeConnection(connection)
})

//공지 삭제
app.post('/api/notice/deletearticle',async (req,res)=>{
    var connection = await openConnection()
    //현재 선택한 공지 상세 정보 리턴
    var query = "delete from notification where id = ?"
    try{
        await connection.beginTransaction()
        var [result] = await connection.query(query,req.body.id)
        if(result != undefined && result.affectedRows>=1)
        {
            await connection.commit()
            res.json({success:true})
        }
        else{
            await connection.rollback()
            res.json({success:false})
        }
    }catch(err)
    {
        //db 에러시
        console.error(err); 
        res.status(200).json({
           err:true
       })
    }

    await closeConnection(connection)
})

//공지 등록
app.post('/api/notice/upload',async (req,res)=>{
    var connection = await openConnection()
    var date = moment().format('YYYY-MM-DD');
    //사용자 세션 확인
    if(req.session.user!=undefined && req.session.user.username != undefined && req.session.user.username.length>=1)
    {
        //공지 수정
        if(req.body.id!=undefined)
        {
            var query = "update notification set title = ?, bodytext = ?, uploaddate = DATE_FORMAT(?,'%Y-%m-%d') where id = ?"
            try{
                await connection.beginTransaction()

                var [result] = await connection.query(query,[req.body.title,req.body.bodytext,date,req.body.id])
                if(result!=undefined && result.affectedRows>=1)
                {
                    await connection.commit()
                    res.json({updatet:true})
                }
                else
                {
                    await connection.rollback()
                    res.json({none:true})
                }
            }catch(err)
            {
                await connection.rollback()
                res.json({err:true})
                console.log(err)
            }
        }
        //새 공지 등록
        else
        {
            //공지글 중에서 가장 큰 id를 선택하여
        //+1한 값을 현재 공지의 id로 설정
        var query = "select tmp2.id from (select t.*, @rownum := @rownum + 1 rownum  from (select id from notification order by id desc) t, (select @rownum := 0) tmp) tmp2 where tmp2.rownum <= 1 FOR UPDATE"
        try{
            await connection.beginTransaction()
            var [result] = await connection.query(query)
                var id
                //질의 결과 id를 구해왔을 경우
                if(result!=undefined && result[0]!=undefined)
                {
                    id = result[0].id + 1
                }
                //공지가 이전에 생성한 적 없었을 경우
                //1로 설정
                else{
                    id = 1
                }
                //공지 생성
                query = "insert into notification values(?, ?, ?, DATE_FORMAT(?,'%Y-%m-%d'), 0)"
                var input = []
                input.push(id)
                input.push(req.body.title)
                input.push(req.body.bodytext)
                input.push(date)
                try{
                    var [result2] = await connection.query(query,input)
                    if(result2 != undefined && result2.affectedRows >= 1){
                        await connection.commit()
                        res.json({result:true})
                    }
                    else
                    {
                        await connection.rollback()
                        res.json({none:true})
                    }
                }catch(err)
                {
                    //db 에러시
                    await connection.rollback()
                    console.error(err); 
                    res.json({db_error:true})
                }    

        }catch(err)
        {
            //db 에러시
            console.error(err); 
            res.json({db_error:true})
        }
        }
        

    }
    //로그인이 안되어 있을 때
    else
    {
        res.json({login_required:true})
    }
    await closeConnection(connection)
})


//알림
app.get('/api/inform/myinform',async (req,res)=>{
    //현재 1순위인 경매에서 다른 사용자가 새로 입찰했을 때
    //입찰한 경매 종료 시
    var connection = await openConnection()

    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
        var query = "select username, inform_text, date_format(inform_date,'%Y-%m-%d') inform_date, inform_time, art_id, auction_type, confirm from user_inform where username = ? order by inform_date desc, inform_time desc"
        try{
            var [result] = await connection.query(query,[req.session.user.username])
            res.json(result)
        }catch(err)
        {
            console.log(err)
            res.json({err:true})
        }
    }
    else
    {
        res.json({login_required:true})
    }
    
    await closeConnection(connection)
})

app.post('/api/inform/delete', async (req, res)=>{
    var connection = await openConnection()

    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
        var query = "delete from user_inform where username = ? and inform_date = date_format(?,'%Y-%m-%d') and inform_time = ? and art_id = ? and auction_type = ?"

        try{
            await connection.beginTransaction()
            var [result] = await connection.query(query,[req.body.username, req.body.inform_date, req.body.inform_time, req.body.art_id, req.body.auction_type]) 
            if(result!=undefined && result.affectedRows>=1)
            {
                await connection.commit()
                res.json({success:true})
            }
            else
            {
                await connection.rollback()
                res.json({none:true})
            }
        }catch(err)
        {
            await connection.rollback()
            res.json({err:true})
            console.log(err)
        }
    }
    else
    {
        console.log("로그인 안됨")
        res.json({login_required:true})
    }
    
    await closeConnection(connection)
})

app.get('/api/inform/deleteall', async (req, res)=>{
    var connection = await openConnection()

    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
        var query = "delete from user_inform where username = ?"

        try{
            await connection.beginTransaction()
            var [result] = await connection.query(query,[req.session.user.username]) 
            if(result!=undefined && result.affectedRows>=1)
            {
                await connection.commit()
                res.json({success:true})
            }
            else
            {
                await connection.rollback()
                res.json({none:true})
            }
        }catch(err)
        {
            await connection.rollback()
            res.json({err:true})
            console.log(err)
        }
    }
    else
    {
        console.log("로그인 안됨")
        res.json({login_required:true})
    }
    
    await closeConnection(connection)
})

app.get('/api/inform/deleteallconfirmed', async (req, res)=>{
    var connection = await openConnection()

    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
        var query = "delete from user_inform where username = ? and confirm = 1"

        try{
            await connection.beginTransaction()
            var [result] = await connection.query(query,[req.session.user.username]) 
            if(result!=undefined && result.affectedRows>=1)
            {
                await connection.commit()
                res.json({success:true})
            }
            else
            {
                await connection.rollback()
                res.json({none:true})
            }
        }catch(err)
        {
            await connection.rollback()
            res.json({err:true})
            console.log(err)
        }
    }
    else
    {
        console.log("로그인 안됨")
        res.json({login_required:true})
    }
    
    await closeConnection(connection)
})

app.post('/api/inform/confirmed', async (req, res)=>{
    var connection = await openConnection()

    if(req.session.user!=undefined && req.session.user.username != undefined  && req.session.user.username.length>=1)
    {
        var query = "update user_inform set confirm = 1 where username = ? and inform_date = date_format(?,'%Y-%m-%d') and inform_time = ? and art_id = ? and auction_type = ?"

        try{
            await connection.beginTransaction()
            var [result] = await connection.query(query,[req.body.username, req.body.inform_date, req.body.inform_time, req.body.art_id, req.body.auction_type]) 
            if(result!=undefined && result.affectedRows>=1)
            {
                await connection.commit()
                res.json({success:true})
            }
            else
            {
                await connection.rollback()
                res.json({none:true})
            }
        }catch(err)
        {
            await connection.rollback()
            res.json({err:true})
            console.log(err)
        }
    }
    else
    {
        console.log("로그인 안됨")
        res.json({login_required:true})
    }
    
    await closeConnection(connection)
})


app.listen(PORT, () => {
    console.log(`Server run: http://localhost:${PORT}/`)
})