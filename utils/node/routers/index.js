/**
 *  2019/4/28  lize
 */
const express = require('express');

const router = express.Router();

const utils= require('../utils/utils.js');

const shells= require('../shell/index.js');

const path = require('path');

const fs = require ("fs");

const WriteFileFn = (src,path,writeContent,callBack) =>{
  
  fs.exists (src, (publicxists) => {
    
    if(publicxists){
      
      fs.writeFile (path,writeContent, 'utf8', (error) => {
        
        if (error) { callBack(false); return console.log (error);}
        
        callBack(true)
        
      })
      
    }else{
      
      fs.mkdir (src, (err) => {
        
        if (err) {callBack(false);return console.error (err);}
        
        fs.writeFile (path,writeContent, 'utf8', (error) => {
          
          if (error) return console.log (error);
          
          callBack(true)
          
        })
        
      });
      
    }
    
  })
  
};

const successObj = {
  
  code:200,
  
  message:'',
  
  data:true,
  
  success:true
  
};

const errorObj = {
  
  code:200,
  
  message:'服务器错误',
  
  data:'',
  
  success:false
  
};

let witePath = "./utils"; //不打包配置

if(global.NODE_EVN === "production"){
  
  let variate = "";
  
  if(process.cwd().includes('node')){
  
    variate = "../"
  
  }
  
  witePath = path.resolve(process.cwd(),`${variate}../utils`);  //打包配置
  
}

//解决跨域请求
router.all('*', function(req, res, next){
  
  res.header("Access-Control-Allow-Origin", "*");
  
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  
  res.header("X-Powered-By",' 3.2.1');
  
  res.header("Content-Type", "application/json;charset=utf-8");
  
  next();
  
});

router.use(function(req, res, next) {
  
  // 輸出記錄訊息至終端機
  console.log(req.method, req.url,'+++++++++++++++++++++++++++++++++');
  
  next()
  
});

//获取全部单页信息
router.get('/GetAllPage',(req,res) =>{
  
  utils.getPages() ? res.send(utils.getPages())  :res.send('');

});

//打包
router.post('/package',(req, res) =>{
  
  let Obj = {

    code:200,

    message:'',

    data:req.body.pages,

    success:true

  };
  
  WriteFileFn(witePath,`${witePath}/Page.json`,JSON.stringify(Obj),(e) =>{
    
    if(e){
      
      shells.sheelJs(req.body.type,true)
  
        .then((e) =>{
          
          if(e.success){
  
            res.send(successObj )
  
          }else{
  
            res.send(errorObj)
  
          }
    
        })
  
        .catch(er =>{
          
          res.send(errorObj);
          
        })
      
    }else{
      
      res.send(errorObj);
  
    }
    
  });
  
});

//保存配置
router.post('/saveDeploy',(req,res) =>{
  
  WriteFileFn(witePath,`${witePath}/AllPages.json`,JSON.stringify(req.body),(e) =>{
    
    e ? res.send(successObj) : res.send(errorObj)

  })
  
});

//取消编译
router.get('/cancelPackage',(req, res) =>{
  
  let successObj = {
    
    code:200,
    
    message:'',
    
    data:true,
    
    success:true
    
  };
  
  let errorObj = {
    
    code:200,
    
    message:'服务器错误',
    
    data:'',
    
    success:false
    
  };
  
  if(shells.StopSheelJs()){
  
    res.send(successObj )
    
  }
  
});


module.exports = router;
