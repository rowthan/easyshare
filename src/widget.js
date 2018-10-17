import {  h,app } from "hyperapp"
import style from "./widget.css"
import { getViewPosition } from "./document";

// var css = {
//   menu:`.menu{
//       position:absolute;
//       right:0px;
//       width: 20px;
//       height: 18px;
//       transform: scale(1);
//       background: #e6e6e6;
//       border-radius: 25%;
//       text-align:center;
//       transition:.5s;
//       cursor:pointer;
//       box-shadow:0 2px 4px 0 rgba(0,0,0,.04)
//   }`
// }

// var styles = document.createElement("style")
// for(let c in css){
//   styles.innerHTML += css[c].replace(/\s*/g,"");
// }
// document.head.appendChild(styles)

//TODO 增加dev 视图展示所有state信息 方便手机端调试
export default function widget(easyshare){
  const state = {
    //来自easyshare的状态
    status: "",
    steps: easyshare.recordedSteps,
    targetInfo: easyshare.target,
    runindex:null,
    url:easyshare.url,

    //自定义state
    ballPos:{},
    showBall:false,
    showMenu:false
  }

  const constant = easyshare.CONSTANT
    
  const actions = {
    refershState: value => state =>({
      status: easyshare.status,
      steps: easyshare.recordedSteps,
      targetInfo: easyshare.target,
      runindex:easyshare.runindex,
      url:easyshare.url
    }),
    setBallPos: value=> state =>({
      ballPos: value
    }),
    toggleShowBall: value=> state => ({
      showBall:value
    }),
    toggleMenu: value=> state=>({
      showMenu:!state.showMenu
    })
  }

  const toggleAllLight = ()=>{
    easyshare.replay(0,false,easyshare.highlightAll==true,true,null,200);easyshare.highlightAll=!easyshare.highlightAll
  }

  const record = (e,actions)=>{
    e.stopPropagation()

    let {top:startTop,left : startLeft} = getViewPosition(e.currentTarget)
    let {top:targetTop,left: targetLeft} = getViewPosition(document.getElementById("easyshare-menu"))
    
    const a = (targetTop/targetLeft-startTop/startLeft)/(targetLeft - startLeft);
    const b = targetTop/targetLeft - a*targetLeft;
    

    actions.toggleShowBall(true)
    const move = setInterval(()=>{
      if(startLeft<=targetLeft){
        startLeft += targetLeft-startLeft<=10 ? 1 : 30;
        startTop = a*startLeft*startLeft + b*startLeft
        actions.setBallPos({left:startLeft,top:startTop})
      }
      else{
        actions.toggleShowBall(false)
        easyshare.record()
        clearInterval(move)
    }
    },10)
  }

  const RecordButton = ({status,onclick}) =>(
    <button id="record" onclick={onclick}>
      {status===constant.WAITING && "标记此处"}
      {[constant.REPLAYING,constant.PLAYANDWAIT].indexOf(status)>-1 && "结束播放后可进行记录"}
    </button>
  )

  const Menu = ({state,actions})=>(
    <div
      id="easyshare-menu"
      style={{
        position:"absolute",
        visibility:state.steps.length>0?"visible":"hidden",
        right:0,
        top:state.steps.length*15+20+"px",
      }}
    >
      <div className={style.menu} onclick={actions.toggleMenu}>
        <svg  viewBox="0 0 8 16" version="1.1" width="20" height="16" aria-hidden="true">
          <path fill-rule="evenodd" d="M8 4v1H0V4h8zM0 8h8V7H0v1zm0 3h8v-1H0v1z"></path>
        </svg>
      </div>
      {
        state.showMenu && 
        <div className={style.menuContainer}>
          <a href="javascript:;" className={style.close} onclick={actions.toggleMenu}>
            <svg  style="" viewBox="0 0 1024 1024" version="1.1" 
    
              width="20" height="20">
              <path d="M804.470121 1015.46665c-24.911366 0-49.225121-10.026354-66.707284-27.508517L507.016499 757.210771 276.268114 987.958132c-17.48114 17.482163-41.794895 27.508517-66.707284 27.508517-24.941042 0-49.27117-10.026354-66.75231-27.508517L31.057343 876.205932c-17.48114-17.48114-27.507494-41.811268-27.507494-66.751287 0-24.912389 10.026354-49.225121 27.507494-66.707284l230.747361-230.748385L31.057343 281.251615c-17.48114-17.48114-27.507494-41.794895-27.507494-66.706261 0-24.941042 10.026354-49.27117 27.507494-66.75231L142.809543 36.040844c17.48114-17.48114 41.812291-27.507494 66.75231-27.507494 24.911366 0 49.225121 10.026354 66.707284 27.507494l230.747361 230.747361L737.76386 36.040844C755.245 18.558681 779.558755 8.53335 804.470121 8.53335c24.941042 0 49.27117 10.026354 66.75231 27.507494l111.7522 111.7522c17.48114 17.48114 27.507494 41.811268 27.507494 66.75231 0 24.911366-10.026354 49.225121-27.507494 66.706261L752.228293 512l230.747361 230.748385c17.48114 17.48114 27.507494 41.794895 27.507494 66.707284 0 24.940019-10.026354 49.270147-27.507494 66.751287L871.223454 987.958132C853.742315 1005.440295 829.41014 1015.46665 804.470121 1015.46665zM507.016499 713.795982 759.471254 966.250738c11.768021 11.766998 28.169573 18.516726 44.99989 18.516726 16.859993 0 33.277918-6.749728 45.045939-18.516726l111.7522-111.7522c11.766998-11.766998 18.515702-28.184923 18.515702-45.044916 0-16.830317-6.748704-33.232892-18.515702-44.99989L708.813504 512l252.454756-252.454756c11.766998-11.766998 18.515702-28.16855 18.515702-44.998867 0-16.859993-6.748704-33.278941-18.515702-45.045939L849.51606 57.748239c-11.766998-11.766998-28.185946-18.515702-45.045939-18.515702-16.830317 0-33.232892 6.748704-44.99989 18.515702L507.016499 310.202994 254.561743 57.748239c-11.768021-11.766998-28.16855-18.515702-44.99989-18.515702-16.859993 0-33.277918 6.748704-45.045939 18.515702L52.764738 169.500439c-11.766998 11.768021-18.515702 28.185946-18.515702 45.045939 0 16.830317 6.748704 33.231869 18.515702 44.998867l252.455779 252.454756L52.764738 764.454756c-11.766998 11.766998-18.515702 28.16855-18.515702 44.99989 0 16.85897 6.748704 33.277918 18.515702 45.044916l111.7522 111.7522c11.768021 11.766998 28.185946 18.516726 45.045939 18.516726 16.830317 0 33.231869-6.749728 44.99989-18.516726L507.016499 713.795982z"  fill="#000">
              </path>
            </svg>
          </a>
          <p>
              <label><input type="checkbox" checked={easyshare.options.playSetting.auto}
                onclick={(e)=>{easyshare.options.playSetting.auto = e.target.checked==true;
                  easyshare.makelink()
                  actions.refershState()
                }}
              />打开网页时候自动点亮标记
              </label> 
          </p>
          <div>
            <button onclick={()=>{const result = window.confirm("确认删除所有标记？");if(result){easyshare.remove(-1);actions.toggleMenu()}}}>删除所有标记</button>
            <button onclick={toggleAllLight}>
              {`${easyshare.highlightAll==true?"点亮":"隐藏"}所有标记`}
            </button>
          </div>
         
          
          <input style={{opacity:0}} value={state.url} readonly id="easyshare-url"/>
          <div style="color:#b7b7b7">
            已记录 <b>{state.steps.length}</b> 条标记。
            <br/>
            复制地址栏URL或 <a href="javascript:;" onclick={(e)=>{
              const url = document.getElementById("easyshare-url");
              url.focus();
              url.setSelectionRange(0, url.value.length);
              document.execCommand('copy', true);
              e.target.innerText = "已复制"
              }}>获取链接</a>
            <br/> 
            分享给好友，即可让对方看见你的标记。
          </div>
        </div>
      }
    </div>
  )
  //TODO 在视口范围内则激活 否则关闭
  const StepSign = ({step,running=false,index})=>(
    <span title="点击"
          className={`${style.stepSign} ${running?style.running:""} ${step.isActive?style.isActive:""}`}
          style={{
            top:(index+1)*15+"px"
            //TODO running 增加动画效果
          }}
          onclick={()=>{easyshare.replay(index,true,!step.isActive)}}
    >
    </span>
  )

  const StepTag = ({step,index,actions})=>(
    <div style={{position:"absolute",top:step.y+"px",left:step.x+"px"}}>
      <div title="查看"  class={`${style.point} ${step.isActive?style.active:""}`}
        onclick={()=>{step.writing=false;easyshare.replay(index,false,!step.isActive)}} >
        <svg style={{position:"absolute",display:step.isActive?"":"none"}}  viewBox="0 0 1024 1024" version="1.1" width="10" height="10">
          <path d="M192 448l640 0 0 128-640 0 0-128Z" p-id="4227" fill="#fff"></path>
        </svg>
      </div>
      {
        step.isActive && 
        <div className={style.box}>
          <div contentEditable={step.writing?"plaintext-only":"false"}
          // 节流处理 oninput
            oninput={(e)=>{const value = e.target.innerText; step.modify = value;}}
            innerText={step.tip}
            style={{width:"100%",border:`${step.writing?1:0}px solid`}}>
          </div>
          <span className={style.edit} onclick={()=>{step.writing=true;easyshare.replay(index,false)}}>
              <svg style="" viewBox="0 0 1024 1024" version="1.1" width="20" height="20"> 
              <path d="M924.766 187.485c-32.297-32.412-62.339-68.774-99.757-95.411-34.261-7.093-50.787 29.928-74.311 47.237 39.777 46.201 86.117 87.013 128.923 130.718 19.407-23.095 65.369-46.724 45.145-82.543zM903.499 362.026c-27.158 27.294-55.258 53.806-81.519 82.146-0.648 109.327 0.273 218.642-0.375 327.946-0.545 40.3-35.851 76.004-76.13 77.445-165.797 0.65-331.717 0.65-497.513 0.127-44.75-1.191-80.6-44.103-77.048-88.058-0.125-158.274-0.125-316.403 0-474.533-3.406-43.84 32.55-85.968 76.797-87.535 109.85-1.451 219.739 0.125 329.462-0.794 28.495-25.717 54.737-53.942 82.063-80.976-146.242 0-292.337-0.773-438.557 0.397-68.274 1.18-129.445 60.898-130.614 129.403-0.272 184.515-0.793 368.895 0.25 553.399 0.272 66.414 56.7 124.012 122.091 130.322l574.541 0c61.944-10.884 115.115-64.972 115.907-129.403 1.839-146.576 0.399-293.297 0.649-439.883zM859.669 290.243c-43.058-43.309-86.365-86.357-129.946-129.142-95.309 94.619-190.867 188.987-285.63 284.128 42.91 43.182 86.094 86.22 129.674 128.871 95.433-94.484 190.718-189.238 285.902-283.856zM373.604 643.78c58.392-15.877 89.499-25.874 147.911-41.616 15.607-4.973 25.989-7.98 33.992-11.167-41.345-39.369-88.852-87.891-130.072-127.523-17.32 60.106-34.534 120.201-51.832 180.305z" p-id="2079" fill="#ffffff">
              </path>
              </svg>
          </span>
          {
            step.writing &&
            <div style={{marginTop:"5px"}}>
              <a className={style.delete} onclick={()=>easyshare.remove(index)} title="删除">
                <svg viewBox="0 0 1024 1024" version="1.1" width="20" height="20">
                      <path d="M223.595474 318.284043l24.022113 480.742089c0 54.376445 44.989657 98.456383 100.485599 98.456383l331.963601 0c55.494918 0 100.489692-44.078914 100.489692-98.456383l23.109324-480.742089L223.595474 318.284043zM831.749418 284.181341c0.099261-20.274766 0.158612-21.623483 0.158612-22.981411 0-52.871161-31.298843-81.888032-73.29533-81.888032l-116.892267 0.122797c0-27.751041-27.105335-50.245358-54.855352-50.245358L441.349917 129.189338c-27.744901 0-55.727209 22.494317-55.727209 50.245358l-117.013017-0.122797c-46.387493 0-73.29533 35.359322-73.29533 81.888032 0 1.363044 0.054235 2.706645 0.158612 22.981411l636.281561 0L831.749418 284.181341zM614.168937 444.615287c0-15.32708 12.421914-27.750017 27.744901-27.750017 15.32708 0 27.750017 12.422937 27.750017 27.750017l0 317.882907c0 15.328104-12.422937 27.751041-27.750017 27.751041-15.322987 0-27.744901-12.422937-27.744901-27.751041L614.168937 444.615287 614.168937 444.615287zM485.85862 444.615287c0-15.32708 12.42703-27.750017 27.751041-27.750017 15.32708 0 27.750017 12.422937 27.750017 27.750017l0 317.882907c0 15.328104-12.422937 27.751041-27.750017 27.751041-15.322987 0-27.751041-12.422937-27.751041-27.751041L485.85862 444.615287 485.85862 444.615287zM357.63733 444.615287c0-15.32708 12.422937-27.750017 27.751041-27.750017 15.321964 0 27.750017 12.422937 27.750017 27.750017l0 317.882907c0 15.328104-12.42703 27.751041-27.750017 27.751041-15.328104 0-27.751041-12.422937-27.751041-27.751041L357.63733 444.615287 357.63733 444.615287zM357.63733 444.615287" fill="#fff"></path>
                </svg>
              </a>
  
             <span>
              <span style={{fontSize:"12px",color:"#bbb"}}> Tip:放弃保存请点击左上角，关闭编辑窗口</span>
              <a style={{float:"right",height:"20px",background:"#fff",borderRadius:"5px"}} href="javascript:;" 
                title="保存" onclick={()=>{
                const value = step.modify!=undefined?step.modify:step.tip ;
                const originTip = step.tip;
                step.tip = value; 
                const result = easyshare.makelink();
                const saveResult = result == undefined;
                !saveResult && alert(result)
                step.writing = !saveResult
                step.tip = saveResult?value:originTip
                actions.refershState()
                }}>
                  <svg viewBox="0 0 1024 1024" version="1.1" width="20" height="20">
                      <path d="M725.333333 128 213.333333 128C166.4 128 128 166.4 128 213.333333l0 597.333333c0 46.933333 38.4 85.333333 85.333333 85.333333l597.333333 0c46.933333 0 85.333333-38.4 85.333333-85.333333L896 298.666667 725.333333 128zM512 810.666667c-72.533333 0-128-55.466667-128-128s55.466667-128 128-128c72.533333 0 128 55.466667 128 128S584.533333 810.666667 512 810.666667zM640 384 213.333333 384 213.333333 213.333333l426.666667 0L640 384z"  fill="#949494"></path>
                  </svg>
                </a>
             </span>
            </div>
          }
          
        </div>
      }
    </div>
  )


  const view = (state, actions) => (
    <div
      oncreate={()=>{easyshare.onStateChange = actions.refershState; setTimeout(()=>{actions.refershState()},0)}}>
      <div style={{
        position:"absolute",
        left:state.targetInfo.x +"px",
        top:state.targetInfo.y+"px",
        transition:".5s",
        userSelect:"none"
        }}>
        {
          (state.status === constant.WAITING || state.status === constant.PLAYANDWAIT)
          &&
          <RecordButton status={state.status} onclick={(e)=>{record(e,actions)}}/>
        }
      </div>
      <div className={`${style.recordBall} ${state.showBall?style.recording:""}`} 
          style={{top:state.ballPos.top+"px",left:state.ballPos.left+"px"
        }}>
      </div>
      {
        state.steps.map((record,index)=>(
          <StepTag key={index} step={record} index={index} actions={actions}></StepTag>
        ))
      }
      
      <aside style={{position:"fixed",right:0,top:window.innerHeight/2-(state.steps.length+7)*15/2+"px"}}>
          {
            state.steps.length > 0 && 
            <a href="javascript:;" className={`${style.esLight} ${easyshare.highlightAll?"":style.lightAll}`} onclick={toggleAllLight}>
              <svg viewBox="0 0 1000 1000" version="1.1" width="25" height="25">
              <path d="M634.9 770.3l-4.4 28H393.6l-4.4-28h245.7zM512 931c-30.4 0-55.9-21.6-62-50.2h124c-6.1 28.6-31.6 50.2-62 50.2z m103.5-79.3h-207c-3.4 0-6.4-2.2-7.4-5.5l-2.9-18.9H626l-3 18.9c-1 3.3-4 5.5-7.5 5.5zM384.7 741.3l-8.1-51.9-0.1-0.6c-7.4-30.4-22.6-58.6-43.8-81.7-42.5-46.2-65.9-106.1-65.9-168.7 0-135.1 109.9-245.1 245-245.3h0.3c134 0 244 108.9 245.3 242.9 0.6 62.7-22.5 122.6-65 168.6-21.5 23.2-36.8 51.7-44.3 82.4l-0.1 0.6-8.4 53.6H384.7z" fill="#FFFFFF" p-id="10480"></path>
                <g id={style.light}>
                  <path d="M357 741.1l-8-51.9-0.1-0.6c-7.4-30.4-22.4-58.6-43.5-81.7-42.2-46.2-65.4-106.1-65.4-168.7 0-135.1 109-245.1 243.1-245.3h0.3c133 0 242.1 108.9 243.3 242.9 0.6 62.7-22.3 122.6-64.5 168.6-21.3 23.2-36.5 51.7-43.9 82.4l-0.1 0.6-8.3 53.6H357z" p-id="10481"></path>
                </g>
                <path d="M605.8 770.8l-4.3 28H370.4l-4.3-28h239.7zM587 852.2H384.9c-3.3 0-6.3-2.2-7.2-5.5l-2.9-18.9h222.3l-2.9 18.9c-1 3.3-3.9 5.5-7.2 5.5z" fill="#E87A66" p-id="10482"></path>
                
                <path d="M484.9 931c-29 0-53.4-21.6-59.2-50.2H544c-5.8 28.6-30.1 50.2-59.1 50.2z" fill="#65D5EF" p-id="10483">
                </path>

                <path d="M512 164.1h-0.3c-73.2 0.1-142 28.6-193.7 80.4-51.7 51.8-80.2 120.6-80.2 193.9 0 35.2 6.6 69.7 19.7 102.6 12.7 31.8 30.8 60.7 53.8 85.7 17.8 19.3 30.5 42.9 36.8 68.4l24.5 157 0.1 0.6c4 16.5 18.7 28 35.7 28h12c6.4 44.7 45 79.2 91.5 79.2s85.1-34.5 91.5-79.2h12c17 0 31.7-11.5 35.7-28l0.1-0.6 5.6-35.7c0.2-0.9 0.4-1.8 0.4-2.7l18.9-120.4c6.4-25.7 19.3-49.6 37.3-69.1 47.5-51.5 73.3-118.5 72.7-188.6-0.7-72.6-29.6-140.9-81.5-192.2-51.6-51.1-120.1-79.3-192.6-79.3z m122.9 606.2l-4.4 28H393.6l-4.4-28h245.7zM512 931c-30.4 0-55.9-21.6-62-50.2h124c-6.1 28.6-31.6 50.2-62 50.2z m103.5-79.3h-207c-3.4 0-6.4-2.2-7.4-5.5l-2.9-18.9H626l-3 18.9c-1 3.3-4 5.5-7.5 5.5z m76.8-247c-21.5 23.2-36.8 51.7-44.3 82.4l-0.1 0.6-8.4 53.6h-113V570.8c0-8-6.5-14.5-14.5-14.5s-14.5 6.5-14.5 14.5v170.5H384.7l-8.1-51.9-0.1-0.6c-7.4-30.4-22.6-58.6-43.8-81.7-42.5-46.2-65.9-106.1-65.9-168.7 0-135.1 109.9-245.1 245-245.3h0.3c134 0 244 108.9 245.3 242.9 0.4 62.8-22.6 122.6-65.1 168.7z" fill="#274359" p-id="10484">
                </path>
                <g id={style.sunshine}>
                  <path d="M512 467c-8 0-14.5 6.5-14.5 14.5v29.7c0 8 6.5 14.5 14.5 14.5s14.5-6.5 14.5-14.5v-29.7c0-8-6.5-14.5-14.5-14.5zM511.4 146.9c8 0 14.5-6.5 14.5-14.5V78.5c0-8-6.5-14.5-14.5-14.5s-14.5 6.5-14.5 14.5v53.8c0 8.1 6.5 14.6 14.5 14.6zM281.4 234.1c2.8 2.8 6.5 4.3 10.3 4.3 3.7 0 7.4-1.4 10.3-4.3 5.7-5.7 5.7-14.9 0-20.5l-38.1-38.1c-5.7-5.7-14.9-5.7-20.5 0-5.7 5.7-5.7 14.9 0 20.5l38 38.1zM201 429.4h-53.8c-8 0-14.5 6.5-14.5 14.5s6.5 14.5 14.5 14.5H201c8 0 14.5-6.5 14.5-14.5 0.1-8-6.4-14.5-14.5-14.5zM282.3 653.4l-38.1 38.1c-5.7 5.7-5.7 14.9 0 20.5 2.8 2.8 6.5 4.3 10.3 4.3 3.7 0 7.4-1.4 10.3-4.3l38.1-38.1c5.7-5.7 5.7-14.9 0-20.5-5.8-5.7-14.9-5.7-20.6 0zM742.6 652.5c-5.7-5.7-14.9-5.7-20.5 0-5.7 5.7-5.7 14.9 0 20.5l38.1 38.1c2.8 2.8 6.5 4.3 10.3 4.3s7.4-1.4 10.3-4.3c5.7-5.7 5.7-14.9 0-20.5l-38.2-38.1zM876.8 428.2H823c-8 0-14.5 6.5-14.5 14.5s6.5 14.5 14.5 14.5h53.8c8 0 14.5-6.5 14.5-14.5s-6.5-14.5-14.5-14.5zM731.4 237.5c3.7 0 7.4-1.4 10.3-4.3l38.1-38.1c5.7-5.7 5.7-14.9 0-20.5-5.7-5.7-14.9-5.7-20.5 0l-38.1 38.1c-5.7 5.7-5.7 14.9 0 20.5 2.8 2.9 6.5 4.3 10.2 4.3z" fill="#274359" p-id="10485">
                  </path>
                </g>
              </svg>
            </a>
          }
          
          <div style={{position:"relative",right:"6px"}}>
            {
              state.steps.map((record,index)=>(
                <StepSign  key={index} step = {record} running={index===state.runindex} index={index}/>
              ))
            }
          </div>
          <Menu state={state} actions={actions}/>
      </aside>
    </div>
  )
  const root = document.createElement("div");
  root.id = easyshare.id;
  document.body.append(root)
  app(state, actions, view, root)
}