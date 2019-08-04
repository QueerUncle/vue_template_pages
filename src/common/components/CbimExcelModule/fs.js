/**
 *  2018/11/23  lize
 */
import Regular from './Regular_Tmplate'

const fs = {
  //多个sheet验证及改变数据结构
  pluralSheerAssemblyData(dataAry,regulationAry,succColor,errColor){
    
    let Sheet_tag = dataAry;

    let RERURNARY = [];
    
    for(let sheet = 0; sheet<Sheet_tag.length;sheet++){

      let list = Sheet_tag[sheet];

      let newAry = [];
  
      let lineDatas = {};
  
      let newhead = list.splice(0,1);

      let hObj = {};

      //处理头部
      for(let i in newhead[0]){

        if(newhead[0][i].indexOf("（") >-1){

          let bef = newhead[0][i].substring(0,newhead[0][i].indexOf("（"));

          let aft = newhead[0][i].substring(newhead[0][i].indexOf("（"),newhead[0][i].length);

          newhead[0][i] = "<font color = 'red'>"+bef + "</font><br/>"+aft;

        }else if(newhead[0][i].indexOf("(") >-1){

          let bef = newhead[0][i].substring(0,newhead[0][i].indexOf("("));

          let aft = newhead[0][i].substring(newhead[0][i].indexOf("("),newhead[0][i].length);

          newhead[0][i] = "<font color = 'red'>"+bef + "</font><br/>"+aft;

        }

        if(!Regular.isChinese(i)){

          console.log(i);

          return "000000"

        }

        hObj[i] = i;

      }

      newhead.unshift(hObj);

      let head = newhead[0];

      let H = [];

      for( let i in head){

        H.push(i);
  
        lineDatas[i] = [];
        
        for(let j = 0; j<list.length;j++){
  
          lineDatas[i].push(list[j][i]!=undefined && list[j][i]!=null ? list[j][i] : "" );
          
        }
        
      }
      
      for( let i = 0; i<list.length; i++){

        let index = i;

        let Ary = [];

        let c = 0;

        //处理表格中的空值；
        for( let j = 0; j<H.length; j++){

          if(list[i][H[j]] == undefined){

            let t = JSON.stringify(list[i]).slice(1);

            let g = t.substring(0,t.length-1)

            let hj = g.split(',')

            let r = '"'+H[j]+'":'+ null;

            hj.splice(j,0,r);

            hj[0] = "{" + hj[0];

            hj[hj.length-1] = hj[hj.length-1] + "}"

            list[i] = JSON.parse(hj.join(","));

          }

        }
        //  变成二维数组并添加属性
        for(let km in list[i]){

          let obj = {

            name:list[i][km] ? list[i][km] : "",

            key: km,

            row:index,

            col:c,
            
            errorFrom:'',

            sheet:Number(sheet)+1,

            color:succColor,

            flag:true,
  
            errorInfo:'',

            innerText:list[i][km] ? list[i][km] : "",
            
            isVerify:true,
            
            lineDatas:lineDatas[km]

          };
          
          let regObj = {

            name:list[i][km] ? list[i][km] : "",

            col:obj.col,

            sheet:Number(sheet)+1,

            row:obj.row,
  
            lineDatas:lineDatas[km]

          };

          if(list[i][km]!=null){

            if(typeof list[i][km] == "number"){

              obj.name = Number(String(list[i][km]).replace(/\s+/g,""));

              obj.innerText = Number(String(list[i][km]).replace(/\s+/g,""));

              regObj.name = Number(String(list[i][km]).replace(/\s+/g,""));

            }else{

              obj.name = list[i][km].replace(/\s+/g,"");

              obj.innerText = list[i][km].replace(/\s+/g,"");

              regObj.name = list[i][km].replace(/\s+/g,"");

            }

          }
  
          let verifierInfo = fs.verifier(regulationAry,regObj);
          
          if(!verifierInfo.flag){
  
            obj.color = errColor;
  
            obj.flag = false;
            
            obj.errorInfo = verifierInfo.errorInfo,
            
            obj.errorFrom = 'client'
            
          }

          Ary.push(obj);

          c++;

        }

        newAry.push(Ary);

      }

      let obj = {

        tHead:newhead,

        tBody:newAry

      };

      RERURNARY.push(obj);

    }

    return RERURNARY;

  },
  //验证函数
  verifier(regulationAry,regobj){

    let name = regobj.name;

    let col = regobj.col;

    let row = regobj.row;

    let sheet = 'sheet'+regobj.sheet;

    let reg = [];
    
    let lineDatas = regobj.lineDatas;
    
    let obj = {
      
      flag:true,
  
      errorInfo:''
      
    };

    // let flag = true;

    if(regulationAry!=undefined && regulationAry!=null){

      for(let i = 0; i< regulationAry.length; i++ ){

        if(sheet == regulationAry[i].sheet){

          for(let j = 0; j < regulationAry[i].info.length; j++){

            if(regulationAry[i].info[j].index == col){

              reg = regulationAry[i].info[j].reg;

              if(name!=null || name!=undefined){
                
                for( let k = 0; k<reg.length; k++){

                  obj= Regular[reg[k].name](name,lineDatas);
                  
                  if(!obj.flag){
                    
                    return obj;
                    
                  }

                }

              }else{
                
                obj.flag = false;
                
              }

            }

          }

        }

      }

    }

    return obj;

  },
  //判断文件编码是否是UTF-8
  isUTF8(bytes) {
    
    let i = 0;
    
    while (i < bytes.length) {
      
      // ASCII
      if (( bytes[i] == 0x09 || bytes[i] == 0x0A || bytes[i] == 0x0D || (0x20 <= bytes[i] && bytes[i] <= 0x7E))) {
        
          i += 1;
          
          continue;
        
      }
      // non-overlong 2-byte
      if (((0xC2 <= bytes[i] && bytes[i] <= 0xDF) && (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF))) {
        
          i += 2;
          
          continue;
        
      }
      if ((// excluding overlongs
          
          bytes[i] == 0xE0 &&
          
          (0xA0 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
          
          (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
          
        ) ||
        
        (// straight 3-byte
          
          ((0xE1 <= bytes[i] && bytes[i] <= 0xEC) ||
          
          bytes[i] == 0xEE ||
          
          bytes[i] == 0xEF) &&
          
          (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
          
          (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
          
        ) ||
        
        (// excluding surrogates
          
          bytes[i] == 0xED &&
          
          (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x9F) &&
          
          (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF)
          
        )
        
      ) {
        
        i += 3;
        
        continue;
        
      }
      if ((// planes 1-3
          
          bytes[i] == 0xF0 &&
          
          (0x90 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
          
          (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
          
          (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
          
        ) ||
        
        (// planes 4-15
          
          (0xF1 <= bytes[i] && bytes[i] <= 0xF3) &&
          
          (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0xBF) &&
          
          (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
          
          (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
          
        ) ||
        
        (// plane 16
          
          bytes[i] == 0xF4 &&
          
          (0x80 <= bytes[i + 1] && bytes[i + 1] <= 0x8F) &&
          
          (0x80 <= bytes[i + 2] && bytes[i + 2] <= 0xBF) &&
          
          (0x80 <= bytes[i + 3] && bytes[i + 3] <= 0xBF)
          
        )
        
      ) {
        
        i += 4;
        
        continue;
        
      }
      
      return false;
      
    }
    
    return true;
    
  },
  //单个sheet 验证及改变数据结构
  assemblyData(dataAry,regulationAry,succColor,errColor){

    let list = dataAry;

    let newAry = [];

    let newhead = list.splice(0,1);

    let hObj = {};

    //处理头部
    for(let i in newhead[0]){

      if(newhead[0][i].indexOf("（") >-1){

        let bef = newhead[0][i].substring(0,newhead[0][i].indexOf("（"));

        let aft = newhead[0][i].substring(newhead[0][i].indexOf("（"),newhead[0][i].length);

        newhead[0][i] = "<font color = 'red'>"+bef + "</font><br/>"+aft;

      }else if(newhead[0][i].indexOf("(") >-1){

        let bef = newhead[0][i].substring(0,newhead[0][i].indexOf("("));

        let aft = newhead[0][i].substring(newhead[0][i].indexOf("("),newhead[0][i].length);

        newhead[0][i] = "<font color = 'red'>"+bef + "</font><br/>"+aft;

      }

      if(!Regular.isChinese(i)){

        console.log(i);

        return "000000"

      }

      hObj[i] = i;

    }

    newhead.unshift(hObj)

    let head = newhead[0];

    let H = [];

    for( let i in head){

      H.push(i);

    }

    for( let i = 0; i<list.length; i++){

      let index = i;

      let Ary = [];

      let c = 0;

      //处理表格中的空值；
      for( let j = 0; j<H.length; j++){

        if(list[i][H[j]] == undefined){

          let t = JSON.stringify(list[i]).slice(1);

          let g = t.substring(0,t.length-1)

          let hj = g.split(',')

          let r = '"'+H[j]+'":'+ null;

          hj.splice(j,0,r);

          hj[0] = "{" + hj[0];

          hj[hj.length-1] = hj[hj.length-1] + "}"

          list[i] = JSON.parse(hj.join(","));

        }

      }

      //  变成二维数组并添加属性
      for(let km in list[i]){

        let obj = {

          name:list[i][km],

          key: km,

          row:index,

          col:c,
  
          errorInfo:'',

          color:succColor,

          flag:true,

          innerText:list[i][km],

        };

        let regObj = {

          name:list[i][km],

          col:obj.col,

          row:obj.row,

        };

        if(list[i][km]!=null){

          if(typeof list[i][km] == "number"){

            obj.name = Number(String(list[i][km]).replace(/\s+/g,""));

            obj.innerText = Number(String(list[i][km]).replace(/\s+/g,""));

            regObj.name = Number(String(list[i][km]).replace(/\s+/g,""));

          }else{

            obj.name = list[i][km].replace(/\s+/g,"");

            obj.innerText = list[i][km].replace(/\s+/g,"");

            regObj.name = list[i][km].replace(/\s+/g,"");

          }

        }
  
        let verifierInfo = fs.verifier(regulationAry,regObj);
  
        if(!verifierInfo.flag){
    
          obj.color = errColor;
    
          obj.flag = false;
          
          obj.errorInfo = verifierInfo.errorInfo
    
        }

        Ary.push(obj);

        c++;

      }

      newAry.push(Ary);

    }

    let obj = {

      tHead:newhead,

      tBody:newAry

    }

    return obj;

  },
  //多个sheet（简版）验证及改变数据结构
  pluralSheerAssemblyDataSimple(dataAry,regulationAry,succColor,errColor){
    
    let Sheet_tag = dataAry;
    
    let RERURNARY = [];
    
    for(let sheet = 0; sheet<Sheet_tag.length;sheet++){
      
      let list = Sheet_tag[sheet];
      
      let newAry = [];
      
      let newhead = list.splice(0,1);
      
      let hObj = {};
      
      //处理头部
      for(let i in newhead[0]){
        
        if(newhead[0][i].indexOf("（") >-1){
          
          let bef = newhead[0][i].substring(0,newhead[0][i].indexOf("（"));
          
          let aft = newhead[0][i].substring(newhead[0][i].indexOf("（"),newhead[0][i].length);
          
          newhead[0][i] = "<font color = 'red'>"+bef + "</font><br/>"+aft;
          
        }else if(newhead[0][i].indexOf("(") >-1){
          
          let bef = newhead[0][i].substring(0,newhead[0][i].indexOf("("));
          
          let aft = newhead[0][i].substring(newhead[0][i].indexOf("("),newhead[0][i].length);
          
          newhead[0][i] = "<font color = 'red'>"+bef + "</font><br/>"+aft;
          
        }
        
        if(i.indexOf('__EMPTY') > -1){
          
          delete newhead[0][i];
          
        }else{
          
          if(!Regular.isChinese(i)){
            
            console.log(i);
            
            return "000000"
            
          }
          
        }
        
        hObj[i] = i;
        
      }
      
      newhead.unshift(hObj)
      
      let head = newhead[0];
      
      let H = [];
      
      for( let i in head){
        
        H.push(i);
        
      }
      
      for( let i = 0; i<list.length; i++){
        
        let index = i;
        
        let Ary = [];
        
        let c = 0;
        
        //处理表格中的空值；
        for( let j = 0; j<H.length; j++){
          
          if(list[i][H[j]] == undefined){
            
            let t = JSON.stringify(list[i]).slice(1);
            
            let g = t.substring(0,t.length-1)
            
            let hj = g.split(',')
            
            let r = '"'+H[j]+'":'+ null;
            
            hj.splice(j,0,r);
            
            hj[0] = "{" + hj[0];
            
            hj[hj.length-1] = hj[hj.length-1] + "}"
            
            list[i] = JSON.parse(hj.join(","));
            
          }
          
        }
        
        //  变成二维数组并添加属性
        for(let km in list[i]){
          
          let obj = {
            
            name:list[i][km] ? list[i][km] : "",
            
            key: km,
            
            row:index,
            
            col:c,
            
            sheet:Number(sheet)+1,
            
            color:succColor,
            
            flag:true,
            
            errorInfo:'',
            
            innerText:list[i][km] ? list[i][km] : "",
            
            isVerify:true
            
          };
          
          let regObj = {
            
            name:list[i][km] ? list[i][km] : "",
            
            col:obj.col,
            
            sheet:Number(sheet)+1,
            
            row:obj.row,
            
          };
          
          if(list[i][km]!=null){
            
            if(typeof list[i][km] == "number"){
              
              obj.name = Number(String(list[i][km]).replace(/\s+/g,""));
              
              obj.innerText = Number(String(list[i][km]).replace(/\s+/g,""));
              
              regObj.name = Number(String(list[i][km]).replace(/\s+/g,""));
              
            }else{
              
              obj.name = list[i][km].replace(/\s+/g,"");
              
              obj.innerText = list[i][km].replace(/\s+/g,"");
              
              regObj.name = list[i][km].replace(/\s+/g,"");
              
            }
            
          }
          
          // let flag = fs.verifier(regulationAry,regObj)
          //
          // if(!flag){
          //
          //   obj.color = errColor;
          //
          //   obj.flag = false;
          //
          // }
          
          let verifierInfo = fs.verifier(regulationAry,regObj);
          
          if(!verifierInfo.flag){
            
            obj.color = errColor;
            
            obj.flag = false;
            
            obj.errorInfo = verifierInfo.errorInfo
            
          }
          
          Ary.push(obj);
          
          c++;
          
        }
        
        newAry.push(Ary);
        
      }
      
      let obj = {
        
        tHead:newhead,
        
        tBody:newAry
        
      }
      
      RERURNARY.push(obj);
      
    }
    
    return RERURNARY;
    
  },
  
};
export default fs;
