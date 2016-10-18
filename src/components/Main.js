require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

//获取图片数据
let imageDatas = require('../data/imageDatas.json');

//利用自执行函数，将图片的信息转换为图片的url信息
imageDatas=((imageDatasArr) =>{
  for(let i=0,j=imageDatasArr.length;i<j;i++){
    let singleImageData=imageDatasArr[i];

    singleImageData.imageURL=require('../images/'+singleImageData.fileName);

    imageDatasArr[i]=singleImageData;
  }

  return imageDatasArr;
})(imageDatas);

//获取区间内的随机值
let getRangeRandom = (low, high) => Math.floor(Math.random() * (high - low) + low);

class ImgFigure extends React.Component {
  render () {

    let styleObj={};
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }
    return (
      <figure className="img-figure" style={styleObj}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
        </figcaption>
      </figure>
    );
  }
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.Contans={
      centerPos:{//中心点的取值
        left:0,
        top:0
      },
      hPosRange:{//左右部分的取值范围
        leftSecX:[0,0],
        rightSecX:[0,0],
        y:[0,0]
      },
      vPosRange:{//上部分的取值范围
        x:[0,0],
        topSecY:[0,0]
      }
    };
    this.state={
      imgsArrangeArr:[
        /*{
          pos:{
            left:0,
            top:0
          }
        }*/
      ]
    };
  }

  /*
   * 添加所有图片
   * @param centerIndex 指定居中排布哪个图片
   */
  rearrange(centerIndex){
    let imgsArrangeArr=this.state.imgsArrangeArr,
        Contans=this.Contans,
        centerPos=Contans.centerPos,
        hPosRange=Contans.hPosRange,
        vPosRange=Contans.vPosRange,
        hPosRangeLeftSecX=hPosRange.leftSecX,
        hPosRangeRightSecX=hPosRange.rightSecX,
        hPosRangeY=hPosRange.y,
        vPosRangeX=vPosRange.x,
        vPosRangeTopY=vPosRange.topSecY;

    //设置居中图片的位置信息
    let imgsArrangeCenterArr=imgsArrangeArr.splice(centerIndex,1);
    imgsArrangeCenterArr[0].pos=centerPos;

    //设置上区域图片的位置信息
    let topImgNum = Math.ceil(Math.random() * 2),//上区域取一个或者不取
        topImgSpliceIndex = Math.ceil(Math.random(imgsArrangeArr.length - topImgNum)),//因为要从索引位置开始取
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);
    imgsArrangeTopArr.forEach((value,index)=>{
      imgsArrangeTopArr[index].pos={
        top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
        left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
      }
    });

    //设置左右区域图片的位置
    for(let i=0,j=imgsArrangeArr.length,k=j/2;i<j;i++){
      let hPosRangeLOR=null;

      //前半数组布局左边，后半数组布局右边
      if(i<k){
        hPosRangeLOR=hPosRangeLeftSecX;
      }else{
        hPosRangeLOR=hPosRangeRightSecX;
      }

      imgsArrangeArr[i].pos={
        top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
        left:getRangeRandom(hPosRangeLOR[0],hPosRangeLOR[1])
      }
    }

    //取完之后再填充回去,这时被填充的数组单元已经有了位置值
    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
    }
    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr:imgsArrangeArr
    })
  }


  //在首次实例化时初始化contans,为每张图片计算其位置范围
  componentDidMount() {

    //获取舞台的大小
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW=stageDOM.scrollWidth,
        stageH=stageDOM.scrollHeight,
        halfStageW=Math.ceil(stageW/2),
        halfStageH=Math.ceil(stageH/2);

    //获取imgFigure的大小
    let imgFigDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgFigW=imgFigDOM.scrollWidth,
        imgFigH=imgFigDOM.scrollHeight,
        halfImgW=Math.ceil(imgFigW/2),
        halfImgH=Math.ceil(imgFigH/2);


    //计算中心图片的位置
    this.Contans.centerPos.left=halfStageW-halfImgW;
    this.Contans.centerPos.top=halfStageH-halfImgH;

    //计算左右区域的位置
    this.Contans.hPosRange.leftSecX[0] = -halfImgW;
    this.Contans.hPosRange.leftSecX[1] = halfStageW - halfImgW*3;
    this.Contans.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Contans.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Contans.hPosRange.y[0] = -halfImgH;
    this.Contans.hPosRange.y[1] = halfStageH - halfImgH;

    //计算上区域的位置
    this.Contans.vPosRange.x[0] = halfStageW - halfImgW;
    this.Contans.vPosRange.x[1] = halfStageW;
    this.Contans.vPosRange.topSecY[0]= -halfImgH;
    this.Contans.vPosRange.topSecY[1]=halfStageH - halfImgH * 3;

    this.rearrange(0);

  }

  render() {

    let controllerUnits=[],imgFigures=[];

    imageDatas.forEach((value,index) =>{
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index]={
          pos:{
            left:0,
            top:0
          }
        };
      }
      imgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]}/>);
    });

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
