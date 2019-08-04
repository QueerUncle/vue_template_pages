/**
 *  2018/11/23  lize
 */
const  Regular = {

  //判断字符长度
  gblen(value){

    let v = value;

    let len = 0;

    for (var i=0; i<v.length; i++) {

      if (v.charCodeAt(i)>127 || v.charCodeAt(i)==94) {

        len += 2;

      } else {

        len ++;

      }

    }

    return len;

  },
  //验证是否是汉字、数字、字母
    isChineseAndNumAndLetter(value){
    
      let obj = {
        
        errorInfo:'',
        
        flag:true,
        
      };
      
      let reg = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/
      
      if(!reg.test(value)){
      
        obj.flag = false;
  
        obj.errorInfo = '只能输入汉字、数字、字母'
      
      }
      
      return obj;
    
    },
  //是否重复
  isRepetition(value,Ary){
    
    let obj = {
  
      flag:true,
  
      errorInfo:''
  
    };
    
    if(Ary.filter(i =>i === value).length>1){
      
      obj.flag = false;
      
      obj.errorInfo = "数据重复"
      
    }
    
    return obj
  
  },
  
  //长度小于40
  len40(value){
    
    let obj = {
    
      errorInfo:'',
    
      flag:true
    
    };
  
    if(value.length>40){
    
      obj.flag = false;
    
      obj.errorInfo = '长度不能超过40'
    
    }
  
    return obj;
  
  },
  //长度小于50
  len50(value){
  
    let obj = {
    
      errorInfo:'',
    
      flag:true
    
    };
  
    if(value.length>50){
    
      obj.flag = false;
    
      obj.errorInfo = '长度不能超过50'
    
    }
  
    return obj;
  
  },
  //长度小于10
  len10(value){

    let l = this.gblen(value);
    
    let obj = {
      
      errorInfo:'',
      
      flag:true
      
    };
    
    if(l>10){
  
      obj.flag = false;
  
      obj.errorInfo = '长度不能超过10'
      
    }
    
    return obj;

  },
  //不为为空
  notNull(value){
  
    let obj = {
    
      errorInfo:'',
    
      flag:true
    
    };

    let t = value.length;

    if(t == '' || t == null){
      
      obj.flag = false;
      
      obj.errorInfo = "此处不能为空";
      
    }
    
    return obj

  },
  //是否是邮箱
  isEmail(value){

    let t = value;
  
    let obj = {
    
      errorInfo:'',
    
      flag:true
    
    };

    let reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
    
    if(!reg.test(t)){
      
      obj.flag = false;
      
      obj.errorInfo = "请输入正常的邮箱！";
      
    }

    return obj;

  },

  //是否是移动电话
  isPhone(value){

    let t = value;
  
    let obj = {
    
      errorInfo:'',
    
      flag:true
    
    };
  
    let reg = new RegExp(/^1[34578]\d{9}$/);
  
    if(!reg.test(t)){
  
      obj.flag = false;
  
      obj.errorInfo = "请输入正常的手机号！";
      
    }
    
    return obj;

  },

  //是否是固定电话
  isMob(value){

    let t = value;
  
    let obj = {
    
      errorInfo:'',
    
      flag:true
    
    };

    let reg = new RegExp(/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/);
    
    if(!reg.test(t)){
  
      obj.flag = false;
  
      obj.errorInfo = "请输入正常的固定电话！";
      
    }

    return obj;

  },
  //判断里面是全英文
  isChinese(value){

    let t = value;

    let reg = new RegExp("^[a-zA-Z]+$");

    return reg.test(t);

  },

};

export default Regular
