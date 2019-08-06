/**
 *  2019/5/5  lize
 */
var app = new Vue({
  
  el: '#app',
  
  data(){
    
    return {
  
      height:"100%",  //height
  
      value2:'',  //搜索，输入的关键字
  
      columns4: [
        
        {
          
          type: 'selection',
          
          width: 60,
          
          align: 'center'
          
        },
        
        {
          
          title: 'FileName',
          
          key: 'fileName',
          
          slot:'fileName',
          
          align: 'center'
          
        },
        
        {
          
          title: 'Title',
          
          key: 'title',
          
          slot:'title',
          
          align: 'center'
          
        },
        
        {
    
          title: 'Description',
    
          key: 'description',
    
          slot:'description',
    
          align: 'center'
    
        },
        
        {
          
          title: 'Entry',
          
          key: 'entry',
          
          slot:"entry",
          
          align: 'center'
          
        },
        
        {
          
          title: 'Template',
          
          key: 'template',
          
          slot:"template",
          
          align: 'center'
          
        },
  
        {
    
          title: 'Chunks',
    
          key: 'Chunks',
    
          align: 'center',
          
          slot:'Chunks'
    
        }
        
      ],  //table表头渲染数据
      
      data1: [], // table表格渲染数据
      
      servePageList:[],  //保存单页的list
      
      packageList:[], //所有单页集合
      
      packageIdList:[],  //选中单页id集合
  
      spinShow:false, //loading开关
  
      fileEvnList:[],  //所有环境集合
  
      modal1:false, //弹窗开关
      
      setChunksList:[//设置chuans默认数组
        
        {
          
          value:'',
          
          type:'add',
          
        }
        
      ],
  
    }
    
  },
  watch:{
    
    value2(n){
      
      this.onSearch(n);
      
    }
    
  },
  mounted(){
    
    this.initialize();
    
  },
  methods: {
    
    //initialize
    initialize(){
      
      this.$Message.config({
        
        top: 75,
        
        duration: 3
        
      });
      
      window.onresize = () => {
        
        this.height = document.body.clientHeight
        
      };
      
      this.GetAllPage();
      
    },
    //获取所有文件列表
    GetAllPage(){
      
      let url = "/api/GetAllPage";
      
      axios.get(url)
      
        .then((e) =>{
        
          console.log(e);
          
          if(e.data.success){

            this.servePageList = e.data.data.pages;
            
            this.fileEvnList = e.data.data.fileEvnList;

            let CopyservePageList = JSON.parse(JSON.stringify(this.servePageList));

            this.data1 = CopyservePageList;
            
            for(let i = 0; i<this.data1.length;i++){
              
              if(this.data1[i]._checked){
                
                if(!this.packageIdList.includes(this.data1[i].entry)){
  
                  this.packageIdList.push(this.data1[i].entry);
  
                  this.packageList.push(this.data1[i]);
                  
                }
                
              }
              
            }
            
          }
        
        })
      
        .catch((er) =>{
          
          console.log(er);
          
        })
    
    },
    //搜索
    onSearch(str){
  
      this.data1 = [];
  
      let T = JSON.parse(JSON.stringify(this.servePageList));
      
      if(str){
      
        for(let i = 0; i < T.length; i++){
          
          if(T[i].fileName.indexOf(str)>-1 || T[i].title.indexOf(str)>-1){
  
            this.data1.push(T[i])

          }
          
        }
      
      }else{
        
        this.data1 = T;
        
      }
      
      this.data1.forEach((i,v) =>{
        
        if(this.packageIdList.includes(i.entry)){
          
          this.$set(i,'_checked',true);
          
        }
        
      })
    
    },
    //全选
    onSelectAll(selection){
      
      selection.forEach((i,v) =>{
        
        if(!this.packageIdList.includes(i.entry)){
  
          this.packageIdList.push(i.entry);
          
          this.$set(i,'_checked',true);
  
          this.packageList.push(i);
  
          this.data1.forEach((j,v) =>{
    
            if(this.packageIdList.includes(j.entry)){
      
              this.$set(j,'_checked',true);
      
            }
    
          })
          
        }
        
      });
      
    },
    //触发选中
    onSelect(selection,row){
      
      selection.forEach((i,v) =>{
    
        if(!this.packageIdList.includes(i.entry)){
      
          this.packageIdList.push(i.entry);
  
          this.$set(i,'_checked',true);
      
          this.packageList.push(i);
  
          this.data1.forEach((j,v) =>{
    
            if(this.packageIdList.includes(j.entry)){
      
              this.$set(j,'_checked',true);
      
            }
    
          })
      
        }
    
      })
      
    },
    //取消选中一个
    onSelectCancel(selection,row){
      
      let n = null;
      
      if(this.packageIdList.includes(row.entry)){
  
        n = this.packageIdList.indexOf(row.entry);
  
        this.packageIdList.splice(n,1);
        
        this.packageList.splice(n,1);
      
      }
  
      this.data1.forEach((j,v) =>{
    
        if(j.entry === row.entry){
      
          delete j._checked;
      
        }
    
      });
      
    },
    //取消全选
    onSelectAllCancel(selection){
      
      let T = JSON.parse(JSON.stringify(this.servePageList));
      
      if(this.data1.length == T.length){
  
        this.packageIdList = [];
  
        this.packageList = [];
  
        this.data1.forEach((j,v) =>{
          
            delete j._checked;
    
        });
      
      }else{
        
        this.data1.forEach((i,v) =>{
          
          let n = null;
          
          if(this.packageIdList.includes(i.entry)){
  
            n = this.packageIdList.indexOf(i.entry);
  
            this.packageIdList.splice(n,1);
  
            this.packageList.splice(n,1);
            
          }
  
          delete i._checked;
          
        })
        
      }
      
    },
    //保存配置
    saveDeploy(){
      
      let obj = {
        
        success:true,
        
        code:200,
        
        data:this.data1,
        
        message:''
        
      };
      
      let url = "/api/saveDeploy";
  
      this.spinShow = true;
  
      iview.LoadingBar.start();
  
      axios.post(url,obj)
      
        .then((e) =>{
        
          console.log(e);
  
          this.spinShow = false;
  
          iview.LoadingBar.finish();
        
        })
      
        .catch((er) =>{
        
          console.log(er);
  
          this.spinShow = false;
  
          iview.LoadingBar.error();
        
        })
      
    },
    //打包
    package(type){
      
      if(this.packageList.length>0){
  
        let pages = {};
  
        this.packageList.forEach((i,v) =>{
    
          pages[i.fileName] = {
      
            entry: i.entry,
      
            template: i.template,
  
            description:i.description,
      
            filename: `${i.fileName}.html`,
      
            title: i.title,
      
            chunks:i.chunks
      
          }
    
        });
        
        let obj = {
    
          type:type,
    
          pages:pages
    
        };
  
        this.packageAjax(obj);
        
      }else{
        
        iview.Message.destroy();
  
        iview.Message.success('请选择需要打包的单页！')
        
      }
      
    },
    //调取打包接口
    packageAjax(obj){
      
      let url = "/api/package";
      
      this.spinShow = true;
  
      iview.LoadingBar.start();

      axios.post(url,obj)

        .then((e) =>{

            console.log(e);

            this.spinShow = false;
  
            iview.LoadingBar.finish();

        })

        .catch((er) =>{

          this.spinShow = false;
  
          iview.LoadingBar.error();

          console.log(er);

        })
      
    },
    //设置Chunks
    setChunks(){
    
      this.modal1 = true;
    
    },
    //弹窗保存
    modalSave(){
      
      for(let i = 0; i<this.setChunksList.length;i++){
       
       if(this.setChunksList[i].value){
         
         for(let j = 0; j<this.data1.length;j++){
           
           if(!this.data1[j].chunks.includes(this.setChunksList[i].value)){
  
             this.data1[j].chunks.push(this.setChunksList[i].value);
             
           }
           
         }
         
         for(let j = 0; j< this.packageList.length;j++){
           
           if(!this.packageList[j].chunks.includes(this.setChunksList[i].value)){
  
             this.packageList[j].chunks.push(this.setChunksList[i].value);
             
           }
           
         }
         
       }else{
  
         this.setChunksList.splice(i,1);
         
         i--;
         
       }
       
      }
      
    },
    //弹窗关闭
    modalCancel(){
  
      this.modal1 = false;
  
      for(let i =0; i<this.setChunksList.length;i++){
    
        if(this.setChunksList[i].type == "add"){
      
          this.setChunksList.splice(i,1);
      
          i--;
      
        }
    
      }
      
      if(!this.setChunksList.length){
  
        this.setChunksList.push({value:'',type:'add'});
        
      }
    
    },
    //取消编译
    cancelPackage(){
      
      let url = "/api/cancelPackage";
      
      axios.get(url)
      
        .then((e) =>{
        
          console.log(e)
  
          // this.spinShow = false;
  
          // iview.LoadingBar.finish();
  
        })
      
        .catch((er) =>{
  
          // this.spinShow = false;
  
          // iview.LoadingBar.error();
        
          console.log(er);
        
        })
      
    },
    //添加Chunks
    addChunks(index){
    
      this.setChunksList.splice(index+1,0,{value:'',type:"add"});
    
    },
    //删除Chunks
    delChunks(index){
  
      this.setChunksList.splice(index,1);
    
    },
    //失去焦点时
    onBlur(event,row,column,index){

      this.data1[index][column.key] = event.target.innerText; //设置页面选人数据

      this.servePageList[index][column.key] = event.target.innerText;  //设置原始数据
      
      if(column.slot == "fileName"){
  
        let dataTargetIndex = this.data1[index].chunks.indexOf(row[column.key]); //获取下表
  
        this.data1[index].chunks.splice(dataTargetIndex,1,event.target.innerText);  //设置页面选人数据
  
        this.servePageList[index].chunks[dataTargetIndex] = event.target.innerText;
        
      }
      
      for(let i = 0 ;i< this.data1.length;i++){
        
        if(this.packageIdList.includes(this.data1[i].entry)){
          
          this.$set(this.data1[i],'_checked',true);
          
        }
        
      }
  
      for(let i = 0; i< this.packageList.length ; i++){

        if(this.packageList[i][column.key] == row[column.key]){

          this.packageList[i][column.key] = event.target.innerText;

          if(this.packageList[i].chunks){

            let packageTargetIndex = this.packageList[i].chunks.indexOf(row[column.key]);  //设置修改前就已经选中的数据

            if(column.slot == "fileName"){

              this.packageList[i].chunks.splice(packageTargetIndex,1,event.target.innerText);

            }

          }

        }
        
      }
      
    }
    
  }
  
});
