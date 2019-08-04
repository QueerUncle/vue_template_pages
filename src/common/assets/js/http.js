/**
 *  2019/7/22  lize
 */
import Axios from 'axios';

let baseUrl = '';

let headers = {};

const Http = Axios.create({
  
  baseURL: baseUrl,
  
  withCredentials: false,
  
  headers: headers,
  
});

//请求拦截器
Http.interceptors.request.use (
  
  (config) => {
    
    return config;
    
  },
  
  (err) => {
    
    return Promise.reject (err);
    
  }

);

//响应拦截器
Http.interceptors.response.use (
  
  (response) => {
    
    switch (response.data.code){
      
      case 200 :
        
        return response.data;
        
        break;
      
      default:
        
        console.log('服务器错误');
      
    }
    
  }, (err) => {
    
    return Promise.reject (err);
    
  }

);

// export default Http

export default {

  install:function(Vue,option){

    Object.defineProperty(Vue.prototype,`${ option && option.length ? option[0] : '$Http' }`,{value:Http});

  }

}
