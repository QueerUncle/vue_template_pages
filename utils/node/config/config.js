/**
 *  2019/4/28  lize
 */

const address   = require('address');

const fs = require("fs");

const net = require('net');

//检测路径是否存在
const fileExist = (filePath)=>{
  
  return fs.existsSync(filePath,(exist) =>{
    
    return exist;
    
  })
  
};

//递归查询可用的端口号；
const portIsOccupied = (port) =>{
  
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

//同步调用端口查询方法
const startAPP = async(port) =>{
  
    let ports = "";

    try{
      
      ports = await portIsOccupied(port);
      
    }
    
    catch(err){
      
      console.log(err);
      
    }
    
    return ports
  
};

let currentPath = "./config.json";  // production环境

global.NODE_EVN = "production";

if(!fileExist(currentPath)){
  
  currentPath = `utils/node/config.json`;   // development环境
  
  if(fileExist(currentPath)){
  
    global.NODE_EVN = "development";
  
  }else{
  
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
