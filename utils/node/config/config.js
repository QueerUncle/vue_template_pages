/**
 *  2019/4/28  lize
 */

const address   = require('address');

const fs = require("fs");

const net = require('net');

const path = require("path");

//检测路径是否存在
const fileExist = (filePath)=>{  //判断路径是否存在
  
  return fs.existsSync(filePath,(exist) =>{
    
    return exist;
    
  })
  
};


let PROJECT_ROOT_DIRECTORY = "";

const getProjectRootPath = async(paths) =>{  //获取项目根目录方法
  
  if(fileExist(path.join(paths,'vue.config.js'))){
  
    PROJECT_ROOT_DIRECTORY = paths;
    
  }else{
  
    getProjectRootPath(path.resolve(paths,'..'));
    
  }
  
};

getProjectRootPath(process.cwd());

global.PROJECT_ROOT_DIRECTORY = PROJECT_ROOT_DIRECTORY;

console.log(PROJECT_ROOT_DIRECTORY,'我是PROJECT_ROOT_DIRECTORY');

const portIsOccupied = (port) =>{ //递归查询可用的端口号；
  
  const server=net.createServer().listen(port);
  
  return new Promise((resolve,reject)=>{
    
    server.on('listening',()=>{
      
      server.close();
      
      resolve(port);
      
    });
    
    server.on('error',(err)=>{
      
      if(err.code==='EADDRINUSE'){
        
        resolve(portIsOccupied(port+1));//注意这句，如占用端口号+1
        
      }else{
        
        reject(err)
        
      }
      
    })
    
  })

};

const startAPP = async(port) =>{  //同步调用端口查询方法
  
    let ports = "";

    try{
      
      ports = await portIsOccupied(port);
      
    }
    
    catch(err){
      
      console.log(err);
      
    }
    
    return ports
  
};

global.NODE_EVN = process.argv.length>2 && process.argv.includes("development") ? 'development' : "production" ; //设置环境变量  是本地运行还是打包后运行

let currentPath = "./config.json";  // production环境

if(!fileExist(currentPath)){
  
  currentPath = `utils/node/config.json`;   // development环境

  if(!fileExist(currentPath)){
  
    currentPath = "";
    
  }
  
}

let data = currentPath ? JSON.parse(fs.readFileSync(currentPath)) : {} ;

let port = data.Port ? data.Port : 3011;

module.exports  ={
  
  node:{
    
    port:port,
    
    open:data.open!==undefined && data.open!=="" && data.open!==null ? data.open : true ,
    
    host:address.ip(),
  
    startAPP:startAPP
    
  }
  
};
