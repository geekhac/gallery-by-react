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
//获取0到30度之间的任意正负角度
let get30DegRandom = ()=>((Math.random()>=0.5)?'':'-')+Math.random()*30;


class ImgFigure extends React.Component {

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  /**
   * imgFigure的点击处理函数
   */
  handleClick(e){
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.stopPropagation();
    e.preventDefault();
  }

  render () {

    let styleObj={};
    //如果props属性指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }
    //如果图片的旋转角度有值且不为0，则设置旋转角度
    if(this.props.arrange.rotate){
      (['MozT','msT','OT','WebkitT','t']).forEach(
        (value,index)=>styleObj[value+'ransform'] = 'rotate('+this.props.arrange.rotate+'deg)'
      );
    }

    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }

    let imgFigureClassName =  'img-figure';
        imgFigureClassName += this.props.arrange.isInverse?' is-inverse':' ';
    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className = 'img-back' onClick={this.handleClick} >
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );
  }
}

class ControllerUnit extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e){

    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();

    }

    e.stopPropagation();
    e.preventDefault();
  }

  render(){
    let controllerName = 'controller-unit';

    //对应的图片如果居中，则按钮居中
    if(this.props.arrange.isCenter){
      controllerName += this.props.arrange.isCenter?' is-center':' ';

      //如果对应的图片翻转，则按钮旋转
      if(this.props.arrange.isInverse){
        controllerName += this.props.arrange.isInverse?' is-inverse':' ';
      }
    }

    return (
      <span className={controllerName} onClick={this.handleClick}></span>
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
          },
          rotate:0, //旋转角度
          isInverse:false //图片正反面
        }*/
      ]
    };
  }

  /**
   * 反转图片
   * @param index 输入当前被执行inverse操作的图片的索引
   * return {Function} 返回一个真正的待被执行的函数
   */
  inverse(index){
    return () =>{
      let imgsArrangeArr = this.state.imgsArrangeArr;
      imgsArrangeArr[index].isInverse=!imgsArrangeArr[index].isInverse;

      this.setState({
        imgsArrangeArr: imgsArrangeArr
      });
    }
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

    //设置居中图片的状态信息
    let imgsArrangeCenterArr=imgsArrangeArr.splice(centerIndex,1);
    imgsArrangeCenterArr[0]={
      pos:centerPos,
      rotate:0,
      isCenter:true
    };


    //设置上区域图片的状态信息
    let topImgNum = Math.floor(Math.random() * 2),//上区域取一个或者不取
        topImgSpliceIndex = Math.floor(Math.random(imgsArrangeArr.length - topImgNum)),//因为要从索引位置开始取
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);
    imgsArrangeTopArr.forEach((value,index)=>{
      imgsArrangeTopArr[index]={
        pos:{
          top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
          left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
        },
        rotate:get30DegRandom(),
        isCenter:false
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

      imgsArrangeArr[i]={
        pos:{
          top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
          left:getRangeRandom(hPosRangeLOR[0],hPosRangeLOR[1])
        },
        rotate:get30DegRandom(),
        isCenter:false
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

  /**
   * 利用rearrange函数居中对应index的图片
   * @param index 需要被居中的图片的索引值
   * return {function}
   */
  center(index){
    return ()=>this.rearrange(index)
  }

  //在首次实例化时初始化contans,为每张图片计算其位置范围
  componentDidMount() {

    //获取舞台的大小
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW=stageDOM.scrollWidth,
        stageH=stageDOM.scrollHeight,
        halfStageW=Math.floor(stageW/2),
        halfStageH=Math.floor(stageH/2);

    //获取imgFigure的大小
    let imgFigDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgFigW=imgFigDOM.scrollWidth,
        imgFigH=imgFigDOM.scrollHeight,
        halfImgW=Math.floor(imgFigW/2),
        halfImgH=Math.floor(imgFigH/2);


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
          },
          rotate:0,//旋转角度
          isInverse:false,//图片是否旋转
          isCenter:false//图片是否居中
        };
      }
      imgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>)
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
