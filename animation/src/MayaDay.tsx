import React from "react";
import { AbsoluteFill, Html5Audio, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import narration from "../../public/lessons/maya-day/narration.json";
import { Maya } from "./Maya";
import { JourneyMap } from "./Map";

const ink = "#17243c", teal = "#087f72", violet = "#7155d9", cream = "#f7f5ef";
const ease = (time: number, start: number, end: number) => interpolate(time, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const sceneStart = (id: string) => narration.scenes.find((scene) => scene.id === id)?.start ?? 0;
const sceneMoment = (id: string, beat: string) => (narration.beats as Record<string, Record<string, number>>)[id]?.[beat] ?? 0;
const style = (opacity: number, y = 18): React.CSSProperties => ({ opacity, transform: `translateY(${(1 - opacity) * y}px)` });

function CameraIcon({ size = 80 }: { size?: number }) {
  return <svg width={size} height={size * .75} viewBox="0 0 120 90" aria-hidden="true">
    <rect x="9" y="23" width="102" height="58" rx="12" fill={ink}/><path d="M30 25l10-17h31l10 17" fill={ink}/>
    <circle cx="61" cy="52" r="23" fill={cream}/><circle cx="61" cy="52" r="16" fill={teal}/><circle cx="61" cy="52" r="8" fill="#9bd3c9"/>
    <circle cx="95" cy="38" r="5" fill="#e9c88e"/>
  </svg>;
}
function GalleryPhoto({ tile }: { tile: string }) {
  const positions: Record<string, [number, number]> = {
    dog0: [0, 0], sky: [1, 0], cat: [2, 0], dog1: [0, 1], flower: [1, 1], dog2: [2, 1],
  };
  const [column, row] = positions[tile];
  return <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",width:"100%",aspectRatio:"1 / 1",top:"50%",transform:"translateY(-50%)"}}>
      <Img src={staticFile("lessons/maya-day/gallery-contact-sheet.png")} style={{position:"absolute",width:"300%",height:"200%",maxWidth:"none",left:`${-column * 100}%`,top:`${-row * 100}%`}}/>
    </div>
  </div>;
}
function CameraBag({ color = violet, size = 145 }: { color?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 145 145" aria-hidden="true">
    <path d="M45 39V25q28-21 56 0v14" fill="none" stroke={ink} strokeWidth="7"/>
    <rect x="18" y="37" width="109" height="93" rx="21" fill={color} stroke={ink} strokeWidth="4"/>
    <path d="M20 77h105M34 98h80" stroke="#fffdf7" strokeWidth="5" opacity=".7"/>
    <rect x="48" y="83" width="49" height="31" rx="8" fill="#fffdf7" opacity=".8"/>
  </svg>;
}
function Setting({ place, mobile, time, checking = 1 }: { place: "home" | "centre"; mobile: boolean; time: number; checking?: number }) {
  return <AbsoluteFill style={{overflow:"hidden"}}>
    <Img src={staticFile(`lessons/maya-day/${place === "home" ? "hallway" : "community-centre"}.png`)} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:mobile ? "53% center" : "center"}}/>
    <div style={{position:"absolute",inset:0,background:place === "home" ? "linear-gradient(90deg,#f7f5ef46,transparent 75%)" : "linear-gradient(90deg,#f7f5ef38,transparent 80%)"}}/>
    <div style={{position:"absolute",left:mobile?20:85,top:mobile?175:145,width:mobile?400:510,height:mobile?710:900,transform:place==="centre"&&time<sceneStart("shopping")+2?`translateX(${(ease(time,sceneStart("shopping"),sceneStart("shopping")+2)-1)*90}px)`:"none"}}>
      <Maya time={time} checking={checking} walking={place==="centre"&&time<sceneStart("shopping")+2}/>
    </div>
  </AbsoluteFill>;
}
function Device({ children, mobile, narrower = false }: {children:React.ReactNode;mobile:boolean;narrower?:boolean}) {
  return <div style={{position:"absolute",left:mobile?108:(narrower?780:690),top:mobile?505:135,width:mobile?800:(narrower?940:1115),height:mobile?625:835,background:"#fffdf9",border:"13px solid #17243c",borderRadius:42,boxShadow:"0 30px 80px #17243c45",overflow:"hidden",color:ink}}>
    <div style={{height:58,background:ink,display:"flex",alignItems:"center",gap:12,padding:"0 28px"}}><span style={{width:17,height:17,borderRadius:50,background:"#e6a9a0"}}/><span style={{width:17,height:17,borderRadius:50,background:"#e5ce9c"}}/><span style={{width:17,height:17,borderRadius:50,background:"#9bd5bb"}}/></div>
    <div style={{height:"calc(100% - 58px)",padding:mobile?32:43}}>{children}</div>
  </div>;
}
function Morning({t,mobile}:{t:number;mobile:boolean}) {
  const ring=ease(t,sceneMoment("morning","alarm"),sceneMoment("morning","alarm")+.6);
  const next=ease(t,sceneMoment("morning","otherTools"),sceneMoment("morning","otherTools")+.6);
  return <><Setting place="home" mobile={mobile} time={t} checking={ring}/>
    <div style={{position:"absolute",left:mobile?450:1070,top:mobile?215:185,width:mobile?445:615,padding:mobile?34:45,borderRadius:30,background:"#fffdf7eb",boxShadow:"0 15px 50px #17243c25",...style(ease(t,.6,1.4))}}>
      <div style={{display:"flex",alignItems:"center",gap:25}}><CameraIcon size={mobile?95:125}/><div style={{fontSize:mobile?38:52,fontWeight:800,lineHeight:1.12}}>Photography club <span style={{display:"block",color:teal,fontSize:mobile?29:35,marginTop:10}}>Tonight at the centre</span></div></div>
      <div style={{marginTop:30,display:"flex",alignItems:"center",gap:22,background:"#eae5fa",padding:20,borderRadius:24}}><span style={{fontSize:mobile?68:87,transform:`rotate(${ring?Math.sin(t*25)*ring*8:0}deg)`}}>◷</span><div><span style={{fontSize:mobile?56:70,fontWeight:800}}>7:00</span><span style={{display:"block",fontSize:mobile?23:28}}>Maya set this alarm</span></div></div>
      {ring>0&&<div style={{marginTop:22,fontSize:mobile?27:32,fontWeight:700,color:teal,...style(ring)}}>A simple automatic action</div>}
      {next>0&&<div style={{marginTop:20,fontSize:mobile?25:30,color:ink,...style(next)}}>Now, let's see the tools that help her prepare.</div>}
    </div>
  </>;
}
function Photos({t,mobile}:{t:number;mobile:boolean}) {
  const search=ease(t,sceneMoment("photos","search"),sceneMoment("photos","search")+1.4);
  const results=ease(t,sceneMoment("photos","results"),sceneMoment("photos","results")+.7);
  const ai=ease(t,sceneMoment("photos","ai"),sceneMoment("photos","ai")+.7);
  const check=ease(t,sceneMoment("photos","check"),sceneMoment("photos","check")+.7);
  const words=search<.34?"":search<.67?"d":search<1?"do":"dog";
  const tiles=results<.1 ? ["dog0","sky","cat","dog1","flower","dog2"] : ["dog0","dog1","dog2"];
  return <><Setting place="home" mobile={mobile} time={t} checking={1}/>
    <Device mobile={mobile}><div style={{fontSize:mobile?39:47,fontWeight:800}}>Maya's photos</div>
      <div style={{marginTop:22,border:"3px solid #b5b4c4",borderRadius:22,padding:"16px 24px",fontSize:mobile?33:37,color:search?ink:"#777b83"}}>⌕ <span style={{marginLeft:12}}>{search?words:"Search your photos"}</span><span style={{opacity:search}}>▏</span></div>
      <div style={{position:"relative",height:mobile?240:350,marginTop:22}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:mobile?12:19,opacity:1-check}}>{tiles.map((tile,i)=><div key={tile} style={{height:results>.1?(mobile?225:325):(mobile?110:160),borderRadius:16,overflow:"hidden",border:ai?`5px solid ${teal}`:"3px solid #e6e5df",transform:`translateY(${(1-ease(t,sceneStart("photos")+i*.11,sceneStart("photos")+i*.11+.55))*20}px)`}}><GalleryPhoto tile={tile}/></div>)}</div>
        <div style={{position:"absolute",inset:0,opacity:check,transform:`scale(${.92+.08*check})`,borderRadius:18,overflow:"hidden",border:`5px solid ${teal}`,background:"#e8eee5",display:"flex",justifyContent:"center"}}><div style={{height:"100%",aspectRatio:"1 / 1"}}><GalleryPhoto tile="dog1"/></div></div>
      </div>
      {ai>0&&<div style={{marginTop:mobile?10:20,fontSize:mobile?27:31,color:teal,fontWeight:800,...style(ai)}}>{check>.5?"Photo checked for the club poster":"Likely matches from the pictures"}</div>}
    </Device>
  </>;
}
function Journey({t,mobile}:{t:number;mobile:boolean}) {
  const traffic=sceneMoment("journey","traffic"),compare=ease(t,sceneMoment("journey","compare"),sceneMoment("journey","compare")+.7);
  const explain=ease(t,sceneMoment("journey","explain"),sceneMoment("journey","explain")+.7);
  const check=ease(t,sceneMoment("journey","check"),sceneMoment("journey","check")+.7);
  return <><Setting place="home" mobile={mobile} time={t} checking={1}/>
    <div style={{position:"absolute",left:mobile?100:700,top:mobile?480:130,width:mobile?830:1110,height:mobile?650:790,border:`13px solid ${ink}`,borderRadius:40,overflow:"hidden",background:"#eaf0e5",boxShadow:"0 30px 70px #17243c50"}}>
      <JourneyMap time={9+Math.max(0,t-traffic)} heavy={t>=traffic} compare={compare>.2} routeProgress={check?ease(t,sceneMoment("journey","check")+.4,sceneMoment("journey","check")+2.1):0}/>
    </div>
    {explain>0&&<div style={{position:"absolute",left:mobile?420:760,top:mobile?330:40,maxWidth:mobile?470:undefined,background:"#fffdf7",padding:"13px 20px",borderRadius:16,fontSize:mobile?25:29,fontWeight:700,...style(explain)}}>Traffic now + earlier journeys → estimate</div>}
    {check>0&&<div style={{position:"absolute",left:mobile?420:215,top:mobile?230:795,background:teal,color:"white",padding:"14px 22px",borderRadius:17,fontSize:mobile?27:32,fontWeight:800,...style(check)}}>Maya checks the route</div>}
  </>;
}
function Shopping({t,mobile}:{t:number;mobile:boolean}) {
  const suggest=ease(t,sceneMoment("shopping","suggest"),sceneMoment("shopping","suggest")+.7);
  const decide=ease(t,sceneMoment("shopping","decide"),sceneMoment("shopping","decide")+.7);
  const mismatch=ease(t,sceneMoment("shopping","mismatch"),sceneMoment("shopping","mismatch")+.7);
  return <><Setting place="centre" mobile={mobile} time={t} checking={1}/>
    <Device mobile={mobile}><div style={{fontSize:mobile?38:47,fontWeight:800}}>Bags for the club camera</div>
      <div style={{fontSize:mobile?25:29,marginTop:6,color:"#586579"}}>Maya viewed these</div>
      <div style={{display:"flex",gap:mobile?12:25,marginTop:mobile?10:22}}>{["#dca987","#b9c8d8"].map(color=><div key={color} style={{background:"#eeeaf0",borderRadius:20,padding:mobile?6:16}}><CameraBag color={color} size={mobile?80:132}/></div>)}</div>
      {suggest>0&&<div style={{borderTop:`3px solid #ddd6e8`,marginTop:mobile?8:24,paddingTop:mobile?8:20,...style(suggest)}}><div style={{fontSize:mobile?29:34,fontWeight:800,color:teal}}>You might also like</div><div style={{display:"flex",alignItems:"center",gap:mobile?14:25,marginTop:mobile?4:10}}><CameraBag size={mobile?90:145}/><span style={{fontSize:mobile?30:35}}>Camera bag<br/><b>$38</b></span></div></div>}
      {decide>0&&<div style={{fontSize:mobile?27:31,marginTop:mobile?4:20,...style(decide)}}>Maya checks the fit and price.</div>}
      {mismatch>0&&<div style={{background:"#f8dfd0",border:`3px solid #bb725c`,borderRadius:20,padding:"12px 22px",fontSize:mobile?29:34,fontWeight:800,marginTop:mobile?5:18,...style(mismatch)}}>Camera 28 cm &nbsp; Bag inside 25 cm &nbsp; ✕</div>}
    </Device>
  </>;
}
function Messages({t,mobile}:{t:number;mobile:boolean}) {
  const found=ease(t,sceneMoment("messages","find"),sceneMoment("messages","find")+.7);
  const sorting=ease(t,sceneMoment("messages","sorting"),sceneMoment("messages","sorting")+.7);
  const checking=ease(t,sceneMoment("messages","checking"),sceneMoment("messages","checking")+.7);
  const verify=ease(t,sceneMoment("messages","verify"),sceneMoment("messages","verify")+.7);
  return <><Setting place="centre" mobile={mobile} time={t} checking={1}/>
    <Device mobile={mobile}><div style={{fontSize:mobile?40:48,fontWeight:800}}>Maya's messages</div>
      <div style={{display:"flex",gap:14,marginTop:22,fontSize:mobile?28:32,fontWeight:800}}><span style={{padding:"12px 19px",borderRadius:15,background:"#ecebf0"}}>Inbox · 0</span><span style={{padding:"12px 19px",borderRadius:15,background:"#dff0e7",color:teal}}>Spam · 1</span></div>
      <div style={{marginTop:25,padding:mobile?18:25,border:`3px solid ${teal}`,background:"#f9fbf7",borderRadius:21,transform:`translateY(${(1-found)*40}px)`,opacity:found}}><div style={{fontSize:mobile?31:37,fontWeight:800}}>Club booking confirmation</div><div style={{fontSize:mobile?25:29,marginTop:9}}>Evening photography club · one room</div><div style={{fontSize:mobile?23:26,marginTop:10,color:"#566579"}}>Found in Spam</div></div>
      {sorting>0&&<div style={{marginTop:mobile?18:24,fontSize:mobile?26:30,color:teal,fontWeight:800,...style(sorting)}}>A sorting guess: Inbox or Spam</div>}
      {checking>0&&<div style={{marginTop:mobile?16:24,borderRadius:17,background:"#eae5fa",padding:"15px 20px",fontSize:mobile?27:32,...style(checking)}}>Maya compares it with her booking record.</div>}
      {verify>0&&<div style={{marginTop:mobile?12:19,fontSize:mobile?24:29,fontWeight:700,...style(verify)}}>If unsure, use a known contact.</div>}
    </Device>
  </>;
}
function Recap({t,mobile}:{t:number;mobile:boolean}) {
  const reveal=ease(t,sceneMoment("recap","reveal"),sceneMoment("recap","reveal")+.7);
  const reflect=ease(t,sceneMoment("recap","reflect"),sceneMoment("recap","reflect")+.7);
  const items=[{symbol:"▣",name:"Recognise",check:"Check the photo"},{symbol:"⌁",name:"Predict",check:"Check the route"},{symbol:"▤",name:"Recommend",check:"Check the fit"},{symbol:"✉",name:"Sort",check:"Check the message"}];
  return <><Setting place="centre" mobile={mobile} time={t} checking={0}/>
    <div style={{position:"absolute",left:mobile?60:720,top:mobile?470:125,width:mobile?835:1080,background:"#fffdf7ee",padding:mobile?26:38,borderRadius:30,boxShadow:"0 24px 70px #17243c30"}}><div style={{fontSize:mobile?44:58,fontWeight:800,color:ink}}>What helped Maya today?</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:mobile?15:23,marginTop:mobile?22:33}}>{items.map((item,i)=>{const a=ease(t,sceneStart("recap")+i*1.5,sceneStart("recap")+i*1.5+.65);return <div key={item.name} style={{display:"flex",alignItems:"center",gap:15,padding:"14px 18px",background:i%2?"#dff0e7":"#eae5fa",borderRadius:18,...style(a)}}><span style={{fontSize:mobile?48:62,color:i%2?teal:violet}}>{item.symbol}</span><div style={{fontSize:mobile?26:32,fontWeight:800}}>{item.name}{reveal>0&&<span style={{display:"block",fontSize:mobile?20:24,fontWeight:400,opacity:reveal}}>{item.check}</span>}</div></div>})}</div>
      {reflect>0&&<div style={{fontSize:mobile?29:36,fontWeight:700,marginTop:mobile?19:28,color:teal,...style(reflect)}}>What would you check in your day?</div>}
    </div>
  </>;
}
export function MayaDay({mobile=false}:{mobile?:boolean}) {
  const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps;
  const index=Math.max(0,narration.scenes.findLastIndex(scene=>scene.start<=t));
  const scene=narration.scenes[index],next=narration.scenes[index+1];
  const alpha=ease(t,scene.start-.55,scene.start+.35)*(next?1-ease(t,next.start-.45,next.start+.2):1);
  const virtualWidth=mobile?960:1920, virtualHeight=mobile?1200:1080;
  return <AbsoluteFill style={{background:cream,overflow:"hidden"}}><Html5Audio src={staticFile("lessons/maya-day/narration.mp3")}/>
    <div style={{width:virtualWidth,height:virtualHeight,position:"relative",opacity:alpha,fontFamily:"Arial, Helvetica, sans-serif",color:ink}}>
      {scene.id==="morning"&&<Morning t={t} mobile={mobile}/>}
      {scene.id==="photos"&&<Photos t={t} mobile={mobile}/>}
      {scene.id==="journey"&&<Journey t={t} mobile={mobile}/>}
      {scene.id==="shopping"&&<Shopping t={t} mobile={mobile}/>}
      {scene.id==="messages"&&<Messages t={t} mobile={mobile}/>}
      {scene.id==="recap"&&<Recap t={t} mobile={mobile}/>}
    </div>
  </AbsoluteFill>;
}
