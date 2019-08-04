/**
 *  2019/4/28  lize
 */
const express  = require('express');

const app = express();

const opn = require('opn');

const ejs = require('ejs');

const bodyParser = require('body-parser');

const path = require('path');

const Config  = require('./config/config');

const route = require('./routers/index');

console.log(process.argv,'process.argv');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use('/api',route);

if(global.NODE_EVN === "development"){
  
  app.set('views', path.join(__dirname, 'views')); //不打包配置
  
  app.use(express.static('utils/node/views/css')); //不打包配置
  
  app.use(express.static('utils/node/views/js')); //不打包配置
  
  app.use(express.static('utils/node/views/img')); //不打包配置
  
}else{
  
  app.set('views', path.join(process.cwd(), 'views')); //打包配置
  
  app.use(express.static('views/css')); //打包配置
  
  app.use(express.static( 'views/js')); //打包配置
  
  app.use(express.static( 'views/img')); //打包配置
  
}

app.engine('.html',ejs. __express);

app.set('view engine', 'html');

app.use('/',(req, res, next) =>{
  
  res.render('index.html');
  
});

Config.node.startAPP(Config.node.port).then((port) =>{
    
    console.log(`web server on port ${port}`);
  
    app.listen(port);
    
    console.log('启动成功……');
  
    Config.node.open ? opn(`http://${Config.node.host}:${port}`) : "" ;
  
  });



