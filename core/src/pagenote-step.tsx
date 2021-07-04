// @ts-nocheck // TODO enable
import md5 from "blueimp-md5";
import {highlightKeywordInElement,removeElementHighlight} from "./utils/highlight";
import { whats } from './utils/index'
import {emptyChildren, getScroll, getViewPosition, gotoPosition} from "./utils/document";
import Draggable from 'draggable';
import toggleLightMenu from "./light-menu";
import {wrapperLightAttr,wrapperAnnotationAttr} from "./utils/light";
import modal from "./utils/modal";
import AnnotationEditor from "./annotationEditor";

const editorModal = new modal();

export interface StepProps {
  x: number, // 标记在文档中基于 body 的 x轴 位置
  y: number, // 标记在文档中基于 body 的 y轴 位置
  id: string, // 标记的元素节点，在文档中唯一标识符，取值参考 whats-element
  text?: string, // 标记的文本内容
  pre? : string, // 标记的文本内容 上文信息
  suffix?: string, // 标记的文本内容 下文信息
  tip?: string, // 标记的笔记（用户输入）
  bg: string, // 标记背景色
  isActive: boolean, // 是否为激活状态
  offsetX?: boolean, // 批注与高亮元素的相对偏移量
  offsetY?: boolean, // 批注与高亮元素的相对偏移量
  parentW?: number, // 高亮元素父节点宽度
  lightId?: string, // 每一条标记的唯一 hash id
  level: number, // 高亮层级
  images?: string[], // 图片高亮，待支持
  lightStatus? : LightStatus,
  annotationStatus? : AnnotationStatus,
  lightBg?: string, // 将废弃
  daskBg?: string, // 将废弃
  isFocus?: boolean, // 将废弃
  [other: string]: any,
}

enum LightStatus{
  UN_LIGHT=0,
  HALF=1,
  LIGHT=2,
}

enum AnnotationStatus {
  HIDE=0,
  SHOW=1,
}

interface StepOptions{
  onChange: Function,
  onRemove: Function,
}

const STORE_KEYS_VERSION_2_VALIDATE = ["x","y","id","text","tip","bg","time","isActive","offsetX","offsetY","parentW","pre","suffix","images","level","lightStatus","annotationStatus"]
const Step = function (info: StepProps,options: StepOptions,callback) {
  this.options = options;
  this.data = {
    lightStatus: LightStatus.LIGHT,
    annotationStatus: AnnotationStatus.SHOW,
    lightId : md5(info.id+info.text),
  }
  STORE_KEYS_VERSION_2_VALIDATE.forEach((key: string)=>{
    this.data[key] = info[key];
  });

  this.runtime = {
    warn: '',
    isVisible: false,
    isFocus: false,
    relatedNode: [],
  }

  this.listeners = {};
  this.initKeywordTags();
  this.initAnnotation();

  typeof callback === 'function' && callback(this)
}

const options = {

}
const io = new IntersectionObserver(function (entries) {
  entries.forEach((item)=>{
    if(item.target && item.target._light){
      item.target._light.changeData({
        isVisible: item.intersectionRatio>0
      },true)
    }
  })
}, options)

Step.prototype.initKeywordTags = function (){
  const step = this;
  const {bg,id,text,pre,suffix,lightId,lightStatus} = step.data;

  function highlightElement(target) {
    // 查找文字、高亮元素
    const result = highlightKeywordInElement(target,text,pre,suffix,null,function warpFun(text,children){
      console.log(text,children)
      const lightElement = document.createElement('light');
      lightElement.dataset.highlight = lightId;

      if(text){
        lightElement.textContent = text;
      }
      if(children){
        // 已高亮过不再高亮
        if(children && children.parentNode.tagName==='LIGHT'){
          return children;
        }
        lightElement.dataset.type='img'
        lightElement.appendChild(children.cloneNode());
      }

      const appendElement = document.createElement('pagenote-icon');
      appendElement.onclick=function (e) {
        step.openEditor();
        step.changeData({
          lightStatus: LightStatus.LIGHT
        })
        e.stopPropagation();
      }
      appendElement.innerHTML  = '<svg t="1625328349729" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10721" width="16" height="16"><path d="M800 289.356H224a31.97 31.97 0 0 0 0 63.94h576a31.97 31.97 0 0 0 0-63.94z m0 190.737H224a31.97 31.97 0 1 0 0 63.94h576a31.97 31.97 0 1 0 0-63.94z m0 190.737H224a31.97 31.97 0 0 0 0 63.94h576a31.97 31.97 0 0 0 0-63.94z" p-id="10722"></path><path d="M948.041 156.144A150.75 150.75 0 0 0 809.165 63.94h-0.279l-73.444 1.326a31.988 31.988 0 0 0 1.113 63.965l72.866-1.26a86.124 86.124 0 0 1 61.1 25.45c16.412 16.41 25.367 38.233 25.367 61.44v594.278c0 23.207-8.955 44.957-25.366 61.368a86.06 86.06 0 0 1-61.357 25.378h-594.33c-23.206 0-45.061-8.97-61.473-25.378a86.19 86.19 0 0 1-25.482-61.368V214.861a86.944 86.944 0 0 1 86.94-86.883h73.174a31.97 31.97 0 1 0 0-63.94h-73.159A150.827 150.827 0 0 0 63.94 214.86v594.278a150.599 150.599 0 0 0 150.895 150.686h594.33a150.328 150.328 0 0 0 150.66-150.686V214.861a149.837 149.837 0 0 0-11.784-58.717z" p-id="10723"></path><path d="M415.998 127.88h192a31.97 31.97 0 0 0 0-63.94h-192a31.97 31.97 0 0 0 0 63.94z" p-id="10724"></path></svg>'
      wrapperLightAttr(lightElement, step.data,appendElement)

      step.addListener('light',function (data) {
        step.runtime.relatedNode.forEach((item)=>{
          wrapperLightAttr(item,data,appendElement)
        })
      })

      lightElement.onclick = function (e) {
        const {data} = step;
        const nextLightStatus = data.lightStatus + 1;
        step.changeData({
          lightStatus: nextLightStatus>2?0:nextLightStatus,
          annotationStatus: nextLightStatus === LightStatus.LIGHT ? AnnotationStatus.SHOW : AnnotationStatus.HIDE
        });
        e.stopPropagation();
      };

      let entered = false;
      lightElement.onmouseenter = ()=> {
        entered = true;
        setTimeout(()=>{
          entered && toggleLightMenu(true,step,step.runtime.relatedNode[0] || lightElement);
        },100)
      }
      lightElement.onmouseleave = function () {
        entered = false;
      }

      io.observe(lightElement)

      lightElement.remove = function () {
        io.unobserve(lightElement);
        removeElementHighlight(lightElement)
      }

      lightElement._light = step;
      return lightElement;
    });
    step.runtime.warn = result.match ? '' : '未找到匹配内容';
    if(result){
      step.runtime.relatedNode.push(...result.lightsElement);
    }
  }

  let timer = null;
  (function findElement(times){
    const targetEl = whats.getTarget(id);
    clearTimeout(timer);
    if(targetEl){
      highlightElement(targetEl)
    }else if(times<5){
      timer = setTimeout(()=>{
        findElement(++times)
      },1000*times)
    }else{
      highlightElement(document.body,true)
    }
  })(0)
}

Step.prototype.initAnnotation = function () {
  const step = this;
  const renderMethod = step.options.renderAnnotation;
  if(typeof renderMethod!=="function"){
    return;
  }

  const {bg,x,y,text} = step.data;
  const element = document.createElement('pagenote-annotation');// 根容器
  const customInner = document.createElement('pagenote-annotation-inner') // 使用方自定义容器
  const actionArray = document.createElement('pagenote-annotation-menus') // 拖拽容器
  actionArray.innerHTML = `<pagenote-block aria-controls="light-ref">${text}</pagenote-block>`
  customInner.appendChild(actionArray);

  const customContent = document.createElement('pagenote-block');
  customContent.dataset.role = 'custom-content';
  customInner.appendChild(customContent);

  function renderContent() {
    emptyChildren(customContent);
    const customAnnotation = renderMethod(step.data,step);
    customContent.appendChild(customAnnotation);
  }

  renderContent();
  element.appendChild(customInner);

  const options = {
    grid: 10,
    setPosition: true,
    setCursor: false,
    handle: actionArray,
    onDragEnd: function(result,x,y){
      step.changeData({
        x,y,
      })
    }
  };
  new Draggable (element, options).set(x,y);
  const container = document.querySelector('pagenote-annotations');
  container.appendChild(element);

  element.remove = function () {
    element.parentNode.removeChild(element);
  }

  this._annotationEle = element;

  function checkShowAnnotation() {
    return step.data.lightStatus===LightStatus.LIGHT && !!step.data.tip;
  }
  
  wrapperAnnotationAttr(customInner,bg,checkShowAnnotation())
  this.addListener('annotation',function (data,change) {
    renderContent();
    wrapperAnnotationAttr(customInner,data.bg,checkShowAnnotation());
  })
  element.toggleShow = wrapperAnnotationAttr;
}

Step.prototype.openEditor = function () {
  const that = this;
  this.changeData({annotationStatus:2});
  const {tip,x,y} = this.data;

  let pos = {};
  if(that.runtime.relatedNode[0]){
    pos = getViewPosition(that.runtime.relatedNode[0]);
  } else {
    pos = {
      bodyLeft: getScroll().y + 200,
    }
  }
  editorModal.show(null,{
    left: pos.bodyLeft+'px',
    top: pos.bodyTop+'px',
  });
  AnnotationEditor({
    tip,
    onchange: function (e) {
      that.changeData({
        tip: e.target.value.trim(),
        annotationStatus: !!e.target.value ? AnnotationStatus.SHOW : AnnotationStatus.HIDE
      })
    },
    root:editorModal.content,
  });

  const el = document.querySelector('pagenote-block[contenteditable="true"]');
  if(el){
    el.focus();
  }
}

Step.prototype.delete = function () {
  this.runtime.relatedNode.forEach((element)=>{
    element.remove();
  });
  this._annotationEle.remove();
  this.options.onRemove(this.data);
  toggleLightMenu(false);
}

Step.prototype.gotoView = function (callback=function(){}){
  let targetEl = this.runtime.relatedNode?this.runtime.relatedNode[0]:null;
  if(!targetEl){
    try{
      targetEl = whats.getTarget(this.data.id);
    }catch (e){

    }
  }
  return gotoPosition(targetEl,this.data.x-window.innerWidth/2,this.data.y-window.innerHeight/3,()=>{
    callback();
  })
}

Step.prototype.addListener = function (key,fun) {
  if(key && typeof fun === 'function'){
    this.listeners[key] = fun;
  }
}

// 修改 data 数据 TODO 使用 proxy
Step.prototype.changeData = function (object,isRuntime) {
  let changed = false;
  const targetObject = isRuntime ? this.runtime : this.data;
  for(let i in object){
    if(targetObject[i]!==object[i]){
      targetObject[i] = object[i];
      changed = true;
    }
  }
  if(changed){
    this._triggerChangeData(object);
  }
}

Step.prototype._triggerChangeData = function (object) {
  for(let i in this.listeners){
    this.listeners[i](this.data,object);
  }
  this.options.onChange(this.data);
}


function Steps(option: { max: number; }) {
  this.option = option;
}
Steps.prototype = Array.prototype;
Steps.prototype.add = function (item) {
  if(item.changeData){
    this.push(item);
  }else{
    console.error('非法类型',item,item.prototype,item.__proto__,Step.constructor);
  }
};
// @ts-ignore-end


export {
  Step,
  Steps,
}
