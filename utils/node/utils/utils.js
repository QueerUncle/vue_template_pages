/**
 *  2018/10/17  lize
 */
const glob = require("glob");

const fs = require("fs");

const path = require("path");

module.exports = {
  
  getPages: () => {
    
    const splitArray = (list) => {
      
      let newAry = [];
      
      if (list.length > 0) {
        
        for (let entry of list) {
          
          entry = entry.substring(0, entry.lastIndexOf("/"));
          
          newAry.push(entry);
          
        }
        
      }
      
      return newAry;
      
    };
    
    const splitEnv = (list) => {
      
      let newAry = [];
      
      if (list.length > 0) {
        
        for (let entry of list) {
          
          let str = entry.split('/')[1];
          
          if(str.includes('.env.')){
            
            let t = str.substring(str.lastIndexOf(".")+1);
            
            if( t!== 'development'){
              
              newAry.push(str.substring(str.lastIndexOf(".")+1));
              
            }
            
          }
          
        }
        
      }
      
      if(!newAry.includes('production')){
        
        newAry.unshift('production');
        
      }
      
      return newAry;
      
    };
    
    const fileExist = (filePath)=>{
      
      return fs.existsSync(filePath,(exist) =>{
        
        return exist;
        
      })
      
    };
  
    let globPathHtml = ["./src/**/index.html"]; // 入口模板正则 //不打包配置
  
    let globPathJs = ["./src/**/main.js"]; // 入口脚本正则 //不打包配置
  
    let globPathEvn = ["./.**"];  //入口环境变量正则 //不打包配置
  
    let AllPagesPath = "./utils/AllPages.json";
    
    if(global.NODE_EVN === "production"){
      
      let variate = "";
      
      if(process.cwd().includes('node')){
  
        variate = "../";
        
      }
  
      AllPagesPath = path.resolve(process.cwd(),`${variate}../utils/AllPages.json`);
      
      globPathHtml = [path.resolve(process.cwd(),`${variate}../src/**/index.html`)]; // 入口模板正则  //打包配置
  
      globPathJs = [path.resolve(process.cwd(),`${variate}../src/**/main.js`)]; // 入口脚本正则 //打包配置
  
      globPathEvn = [path.resolve(process.cwd(),`${variate}../.**`)];  //入口环境变量正则 //打包配置
      
    }
    
    let iSError = false;
    
    let PageDetal = "";
    
    let PageNameList = [];
    
    let allPages = [];
    
    let fileEvnList = splitEnv(glob.sync(...globPathEvn));
    
    if(fileExist(AllPagesPath)){
      
      allPages =JSON.parse(fs.readFileSync(AllPagesPath, "utf-8")).data;
      
    }else{
      
      let fileHtmlList = splitArray(glob.sync(...globPathHtml));
      
      let fileJsList = splitArray(glob.sync(...globPathJs));
      
      for (let entry of fileHtmlList) {
        
        if (fileJsList.indexOf(entry) >= 0) {
          
          if (!entry.includes("demo")) {
            
            let data = {
              
              "title": entry.split("/")[entry.split("/").length - 1],
              
              "filename": entry.split("/")[entry.split("/").length - 1],
              
              "description": entry.split("/")[entry.split("/").length - 1],
              
              "package": true,
              
              "chunks":[entry.split("/")[entry.split("/").length - 1]],
              
            };
            
            if (!PageNameList.includes(data.filename)) {
              
              PageNameList.push(data.filename);
              
              let obj = {
                
                fileName: data.filename,
                
                template: `${entry}/index.html`,
                
                title: data.title,
                
                entry: `${entry}/main.js`,
                
                chunks:data.chunks
                
              };
              
              allPages.push(obj);
              
              PageDetal += "#### " + entry.split("/")[entry.split("/").length - 1] + "：" + data.title + "\n>`\n文件名：" + data.filename + "\n`\n\n>`\n文件描述：" + data.description + "\n`\n";
              
            } else {
              
              iSError = true;
              
              break;
              
            }
            
          }
          
        }
        
      }
      
    }
    
    if (iSError) {
      
      throw new Error("The page name is not unique");
      
    } else {
      
      return JSON.stringify({code:200,message:'',success:true,data:{pages:allPages,fileEvnList:fileEvnList}});
      
    }
    
  }
  
};
