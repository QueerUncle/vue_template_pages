<!--

 -  2019/7/15  lize

 -->

<!-- *!

 * @name : 导入导出Excel插件封装组件

 * @module @/common/components/CbimExcelPlugins/CbimExcelPlugins.vue

 * @Depend  xlsx、cptable、iview

 * @desc 1、支持导入 csv、xls、xlsx等格式的表格文件。

         2、支持每列数据验证（一列可支持多个验证，但错误信息只会显示一条，不会拼接）。

         3、支持删除每行等操作

         4、支持错误验证回调、反显。

         5、支持下载 csv、xls、xlsx等格式的表格文件。

 * @Author: lize

 * @date : 2019/7/15

 * @param Array columnsProp //表格的表头

 * @param Array excelRegDataAry //验证规则数组

 * @param Object callBackData //验证的回调函数

 * @param String indexNoDataText //空表格显示的内容

 * @incident Function @on_detection_excelInfo //检测表格内容是否正确

 * @incident Function on_detection_isexceldatas //检测是否有tableBody值。

 * @incident Function downloadExcel （文件后准，要下载数据，文件名称）

    1、如果通过该组件导入excel，并下载该组件所呈现的数据，不需要传 后俩个参数。

    2、如果需要自定义下载数据，需要传入后俩个参数.

 * @example 具体调用实例可参考组件 @/pages/01_index/views/ParametersSet/ImportSubject.vue

 * -->

<template>

  <div class = "cbim-excel-plugins-wrap">

    <div class = "table-warp">

      <Table :columns="columns" :no-data-text="indexNoDataTextFn"  :data="excelDatas" style="width: 100%">

        <template v-for="(item,index) in columns" slot-scope="{ row,column,index }" :slot="item.slot">

          <div v-if="item.slot === 'customAction'">

            <slot name = "customAction" v-bind="{row,column,index}">

              <i class = "iconshanchu iconfont" style="width: 21px;height: 21px;cursor: pointer" @click = "delExcelData(row,column,index)"></i>

            </slot>

          </div>

          <div v-else>

            <Tooltip v-if="!row[item.slot].flag" :content="row[item.slot].errorInfo" placement="top" :style="`${row[item.slot].name ? 'width:auto;' : 'width:100%'}`">

              <span style="width: 100%;" @on-blur = "onBlur(row[item.slot])" :class = "row[item.slot].flag ? 'successClass' : 'errorClass' ">{{row[item.slot].name}}</span>

            </Tooltip>

            <span style="width: 100%;" v-else @on-blur = "onBlur(row[item.slot])" :class = "row[item.slot].flag ? 'successClass' : 'errorClass' ">{{row[item.slot].name}}</span>

          </div>

        </template>

      </Table>

    </div>

    <cbim-confirm

      :cbimPopData = "cbimPopData"

      @on-commit = "onCommit"

      @on-cancel = "onCancel">

    </cbim-confirm>

  </div>

</template>

<script>

  import XLSX from 'xlsx'

  import cptable from 'codepage/dist/cpexcel.full.js'

  import fs from '@/common/components/CbimExcelPlugins/fs.js'

  import RegularRule from '@/common/components/CbimExcelPlugins/Regular_Tmplate.js'

  export default {

    name: "CbimExcelPlugins",

    props:['columnsProp','excelRegDataAry','callBackData','indexNoDataText'],

    components:{

      'cbim-confirm':() =>import('@/common/components/pop/CbimConfirm.vue')  //二次确认弹窗

    },

    data () {

      return {

        columns:[], //表头

        excelDatas:[],//表体

        rABS:false, //是否将文件读取为二进制字符串

        isCSV:false, // 是否是csv文件

        excelReaderList:[], // 表格读取出来的数据,

        fileName:'',//文件名称

        fileSuffix:'',//文件后缀

        fileSize:'',//文件大小

        fileType:'',//文件类型

        cbimPopData:{  //二次确认弹窗传送数据

          switch:false,

          title:'提示',

          width:440,

          text:'你确定删除这一行的数据么？',

          other:{},

        },

      }

    },
    mounted () {

      //初始化
      this.initialize();

    },
    computed:{

      //验证规则
      ExcelRegulation(){

        let r = [];

        if(this.$props.excelRegDataAry!=undefined && this.$props.excelRegDataAry!=null){

          r = this.$props.excelRegDataAry;

        }

        return r;

      },
      //空表格时显示文本
      indexNoDataTextFn(){

        return this.$props.indexNoDataText

      }

    },
    watch:{

      //表格表头
      columnsProp:{

        handler(n){

          this.setTableBodyDatas(this.$props.columnsProp,this.excelReaderList)

        },

        deep:true

      },
      //提交后的回调
      'callBackData'(n){

        this.setErrorData(n);

      },
      //表格表体
      excelDatas(n){

        let flag = true;

        if(n.length){

          flag = false;

        }

        this.$emit('on_detection_isexceldatas',flag)

      },

    },
    methods: {

      //初始化
      initialize(){

        this.$props.columnsProp && this.$props.columnsProp.length>0 ? this.setTableBodyDatas(this.$props.columnsProp,this.excelReaderList) : '' ;

      },
      //解析xlsx_loading处理
      importFile(event){

        if(event){

          this.$Spin.show({

            render: (h) => {

              return h('div', [

                h('Icon', {

                  'class': 'demo-spin-icon-load',

                  props: {

                    type: 'ios-loading',

                    size: 18

                  }

                }),

                h('div', 'Loading')

              ])

            }

          });

          setTimeout(() =>{

            this.analysisXlsx(event);

          },1500);

        }

      },
      //解析xlsx
      analysisXlsx(fileObject){

        let persons = []; // 存储获取到的数据

        let SheetsAry = []; // 存储获取到的标签

        let workbook = null; //二进制的表格内容

        let fromTo = ""; //表格范围，可用于判断表头是否数量是否正确

        if (!fileObject) {

          this.$Message.destroy();

          this.$Message.error('文件获取失败，请联系管理员！');

          return;

        }

        if(fileObject.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileObject.type == 'application/vnd.ms-excel' || fileObject.type == "text/csv") {

          this.fileName = fileObject.name;

          this.fileSuffix = this.fileName.substring(this.fileName.lastIndexOf(".") + 1, this.fileName.length);

          this.fileSize = fileObject.size;

          this.fileType = fileObject.type;

          this.isCSV = this.fileSuffix == 'csv';

          let fileReader = new FileReader();

          //读取开始时
          fileReader.onloadstart = (e) =>{

            console.log(e,'开始读取文件……')

          };

          //读取成功时
          fileReader.onload = (e) => {

            console.log("读取完毕，解析中……");

            try{

              let data = e.target.result;

              if(this.isCSV){

                data = new Uint8Array(data);

                let f = fs.isUTF8(data);

                if(f){

                  data = e.target.result;

                }else{

                  let str = cptable.utils.decode(936, data);

                  workbook =XLSX.read(str, { type: "string",raw:true });

                }

              }

              if(!workbook){

                workbook = this.rABS || this.isCSV ? XLSX.read(btoa(this.fixdata(data)), {type: "base64",raw:true}) :  XLSX.read(data, {type: "binary",raw:true});

              }

            } catch (er) {

              console.log(er);

              this.$Spin.hide();

              this.$Message.destroy();

              this.$Message.error("文件类型不正确,读取失败！");

              return

            }

            //遍历每张表读取
            for (let sheet in workbook.Sheets) {

              let sheetAry = [];

              if (workbook.Sheets.hasOwnProperty(sheet)) {

                fromTo = workbook.Sheets[sheet]['!ref'];

                if(fromTo!=undefined){

                  sheetAry = XLSX.utils.sheet_to_json(workbook.Sheets[sheet],{raw:true});

                }

                // break; // 如果只取第一张表，就取消注释这行

              }

              if(sheetAry.length>0){

                persons.push(sheetAry);

                SheetsAry.push({sheet:sheet})

              }

            }

            console.log(persons,'personspersonspersons')

            this.verifyResult(persons); // 验证导入数据

          };

          //读取失败时
          fileReader.onerror = (er) =>{

            console.log(er,"文件读取失败……");

            this.$Spin.hide();

            this.$Message.destroy();

            this.$Message.error("表格中有错误数据");

          };

          if (this.rABS || this.isCSV) {

            fileReader.readAsArrayBuffer(fileObject);

          } else {

            fileReader.readAsBinaryString(fileObject);

          }

        }else{

          this.$Spin.hide();

          this.$Message.destroy();

          this.$Message.error("文件格式错误,读取失败！");

          return

        }

      },
      // 文件流转BinaryString
      fixdata(data) {

        var o = "";

        var l = 0;

        var w = 10240;

        for (; l < data.byteLength / w; ++l) {

          o += String.fromCharCode.apply(

            null,

            new Uint8Array(data.slice(l * w, l * w + w))

          );

        }

        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));

        return o;

      },
      //验证结果
      verifyResult(e){

        if (e.length <= 0) {

          this.$Spin.hide();

          this.$Message.destroy();

          this.$Message.error("请导入正确信息");

        }else{

          console.log("文件解析成功，渲染中……");

          this.$Spin.hide();

          let exceldatas = fs.pluralSheerAssemblyData(JSON.parse(JSON.stringify(e)),this.ExcelRegulation,"#000000","red"); //验证表格数据并改变数据结构

          if(exceldatas == "000000"){

            this.$Message.destroy();

            this.$Message.error("表结构错误！第一行不能有中文字符！");

            return

          }

          if(exceldatas.length<=0){

            this.$Message.destroy();

            this.$Message.error("数据处理错误,请联系管理员！");

            return

          };

          console.log("文件渲染成功！");

          this.excelReaderList = JSON.parse(JSON.stringify(exceldatas));

          this.excelReaderList[0].fileName = this.fileName;

          this.excelReaderList[0].fileSuffix = this.fileSuffix;

          this.excelReaderList[0].fileSize = this.fileSize;

          this.excelReaderList[0].fileType = this.fileType;

          this.setTableBodyDatas(this.columns,exceldatas);

        }

      },
      //拼装tableBody
      setTableBodyDatas(columns,excelBodys){

        this.columns = columns && columns.length ? columns : this.columns;

        let copyExcelBodys = JSON.parse(JSON.stringify(excelBodys));

        if(this.columns.length){

          if(copyExcelBodys && copyExcelBodys.length){

            let tableBodys = copyExcelBodys[0].tBody;

            for(let i = 0; i<this.columns.length;i++) {

              if (this.columns[i].key && this.columns[i].key !== 'index' && this.columns[i].key !== 'customAction') {

                if(tableBodys.length){

                  if (tableBodys[0].filter(item => item.key == this.columns[i].key).length < 1) {

                    for (let j = 0; j < tableBodys.length; j++) {

                      let obj = {

                        col: i,

                        color: undefined,

                        errorInfo: "",

                        flag: true,

                        innerText: this.columns[i].defaultValue,

                        isVerify: true,

                        key: this.columns[i].key,

                        lineDatas: [],

                        name: this.columns[i].defaultValue,

                        row: j,

                        sheet: 1

                      };

                      tableBodys[j].splice(i, 0, obj)

                    }

                  }

                }

              }

            }

            this.transformExcelData(tableBodys);

          }

        }

      },
      //处理excel数据
      transformExcelData(Ary){

        let tableBodys = [];

        if(Ary.length){

          for(let i = 0; i<Ary.length;i++){

            let rowObj = {};

            for(let j = 0;j<Ary[i].length;j++){

              rowObj[Ary[i][j].key] =Ary[i][j]

            }

            tableBodys.push(rowObj);
          }

        }


        this.excelDatas = tableBodys;

        this.detectionExcelData();

      },
      //检测数据
      detectionExcelData(){

        let flag = true;

        if(this.excelDatas.length){

          for(let i = 0; i<this.excelDatas.length;i++){

            for(let j in this.excelDatas[i]){

              if(!this.excelDatas[i][j].flag){

                flag = false;

                break;

              }

            }

          }

        }else{

          flag = false;

        }

        this.$emit('on_detection_excelInfo',flag);

      },
      //删除导入表格数据
      delExcelData(row,column,index){

        this.cbimPopData.switch = true;

        this.cbimPopData.other = {row,column,index};

      },
      //获取excel数据
      getExcelContents(type){

        let exportDatas = [];

        if(this.excelReaderList.length) {

          for (let i = 0; i < this.excelReaderList.length; i++) {

            let excelobj = {

              headData:this.excelReaderList[i].tHead,

              bodyData:[],

              sheet:`sheet${i+1}`,

              fileName:this.excelReaderList[i].fileName,

              fileSuffix:this.excelReaderList[i].fileSuffix,

              fileSize:this.excelReaderList[i].fileSize,

              fileType:this.excelReaderList[i].fileType,

            };

            let tableBodyAry = JSON.parse(JSON.stringify(this.excelReaderList[i].tBody));

            for(let i = 0; i<tableBodyAry.length;i++){

              let obj = {};

              for(let j = 0; j<tableBodyAry[i].length; j++){

                obj[tableBodyAry[i][j].key] = tableBodyAry[i][j].innerText;

                if(type == 'dowload' && !tableBodyAry[i][j].flag){

                  obj[tableBodyAry[i][j].key] = `${tableBodyAry[i][j].innerText}(错误:${tableBodyAry[i][j].errorInfo})`

                }

              }

              excelobj.bodyData.push(obj);

            }

            exportDatas.push(excelobj);

          }

        }

        return {

          exportDatas:exportDatas,

          callBack:(e) =>{

            this.setErrorData(e);

          }

        };

      },
      //下载表格
      downloadExcel(type,downloadDatas,fileName){

        type = type ? type : 'csv';

        let SheetAry = [];

        let exportDaras = downloadDatas ? downloadDatas : this.getExcelContents('dowload').exportDatas;

        let CopyExcelDatas = JSON.parse(JSON.stringify(exportDaras));

        for(let i = 0; i<CopyExcelDatas.length;i++){

          CopyExcelDatas[i].bodyData.unshift(CopyExcelDatas[i].headData[1]);

          SheetAry.push(CopyExcelDatas[i].bodyData)

        }

        if(SheetAry.length){

          this.download(SheetAry,type,fileName);

        }else{

          this.$Message.destroy();

          this.$Message.error('没有可下载的数据，请寻导入数据！')

        }

      },
      //下载
      download(Ary,type,fileName){

        try{

          let bookType = type == "xls" ? "biff2" : type;

          const wopts = { bookType:bookType, bookSST:false, type:'binary'};

          const wb = { SheetNames: [], Sheets: {}, Props: {} };

          if(Ary){

            for(let i = 0 ;i < Ary.length; i++){

              if(Ary[i] && Ary[i].length){

                for(let j = 0; j<Ary[i].length;j++){

                  for(let o in Ary[i][j]){

                    Ary[i][j][o] =  Ary[i][j][o]+'\n';

                  }

                }

              }

              wb.SheetNames.push('Sheet'+(i+1));

              wb.Sheets['Sheet'+(i+1)] = XLSX.utils.json_to_sheet(Ary[i])

            }

          }

          let downloadFileName = fileName ? `${fileName}.${type}` : this.fileName ? `${this.fileName.substring(0,this.fileName.lastIndexOf("."))}.${type}` : `下载.${type}`;

//              XLSX.writeFile(wb, downloadFileName,wopts);

          //创建二进制对象写入转换好的字节流

          let tmpDown =  new Blob([this.s2ab(XLSX.write(wb, wopts))], { type: 'application/octet-stream' });

          this.saveAs(tmpDown,downloadFileName);

        }
        catch (er) {

          console.log(er);

          this.$Message.destroy();

          this.$Message.error("下载格式设置错误,无法进行下载，请联系管理员！");

        }

      },
      //创建下载链接
      saveAs(obj, fileName) {//当然可以自定义简单的下载文件实现方式

        var tmpa = document.createElement("a");

        tmpa.download = fileName || "下载";

        tmpa.href = URL.createObjectURL(obj); //绑定a标签

        tmpa.click(); //模拟点击实现下载

        setTimeout(function () { //延时释放

          URL.revokeObjectURL(obj); //用URL.revokeObjectURL()来释放这个object URL

        }, 100);

      },
      //字符串转字符流
      s2ab (s) {

        if (typeof ArrayBuffer !== 'undefined') {

          var buf = new ArrayBuffer(s.length);

          var view = new Uint8Array(buf);

          for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;

          return buf;

        } else {

          var buf = new Array(s.length);

          for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;

          return buf;

        }

      },
      // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
      getCharCol(n) {

        let temCol = '',

          s = '',

          m = 0;

        while (n > 0) {

          m = n % 26 + 1;

          s = String.fromCharCode(m + 64) + s;

          n = (n - m) / 26;

        }

        return s

      },
      //清空数据
      wipeData(){

        let copyColumns = this.columns;

        Object.assign(this.$data, this.$options.data());

        this.columns = copyColumns;

        this.detectionExcelData();

      },
      //反选错误数据
      setErrorData(data){

        let infoData = data;

        if(infoData && !infoData.success && infoData.info && infoData.info.length){

          if(this.excelDatas.length){

            let firstsheetObj = infoData.info[0];

            if(firstsheetObj.errorInfo){

              for(let i = 0; i<firstsheetObj.errorInfo.length;i++){

                if(firstsheetObj.errorInfo[i].row <this.excelReaderList[0].tBody.length){

                  let primitiveDatasTaarget = this.excelReaderList[0].tBody[firstsheetObj.errorInfo[i].row][firstsheetObj.errorInfo[i].col];

                  primitiveDatasTaarget.color = 'red';

                  primitiveDatasTaarget.flag = false;

                  primitiveDatasTaarget.errorInfo = firstsheetObj.errorInfo[i].info;

                  primitiveDatasTaarget.errorFrom = 'server';

                }

              }

            }

          }

        }

        this.setTableBodyDatas(this.columns,this.excelReaderList);

      },
      //二次确认弹窗确定
      onCommit(data){

        let excelBodys = this.excelReaderList[0].tBody;

        excelBodys.splice(data.other.index,1);

        for(let i = 0; i<excelBodys.length;i++){

          for(let j = 0 ; j<excelBodys[i].length;j++){

            excelBodys[i][j].lineDatas.splice(data.other.index,1);

            if(excelBodys[i][j].errorFrom == "client"){

              let obj = {

                name:excelBodys[i][j].innerText,

                col:excelBodys[i][j].col,

                row:excelBodys[i][j].row,

                sheet:excelBodys[i][j].sheet,

                lineDatas:excelBodys[i][j].lineDatas

              };

              let verifierInfo = excelBodys[i][j].isVerify ? fs.verifier(this.ExcelRegulation,obj) : {flag:false,errorInfo:''};

              if(verifierInfo.flag){

                excelBodys[i][j].color = "#000000";

              }else{

                excelBodys[i][j].color = "#000000";

              }

              excelBodys[i][j].errorInfo = verifierInfo.errorInfo;

              excelBodys[i][j].flag = verifierInfo.flag;

            }

          }

        }

        this.setTableBodyDatas(this.$props.columnsProp,this.excelReaderList);

        this.cbimPopData.switch = false;

      },
      //二次确认弹窗取消
      onCancel(data){

        this.cbimPopData.switch = false;

      }

    }

  }
</script>

<style scoped lang="scss">

  .successClass{

    color: #000000;

  }

  .errorClass{

    color: red;

  }
  .iconfont{

    &:hover{

      color:#fabe15;

      transition: all ease-in-out .3s;

    }

  }

</style>
