import {AbsoluteFill,interpolate,spring,useCurrentFrame,useVideoConfig} from 'remotion';
import React from 'react';
import {getSlideMotionTiming} from '../templates/animationTiming';

type SlideType='cover'|'cards'|'steps'|'compare'|'stats'|'quote';

type Item={number:string;title:string;color?:string};
type SlideData=Record<string,unknown>;

interface Props{
  title:string;
  subtitle?:string;
  badge?:string;
  items?:Item[];
  type?:SlideType;
  data?:SlideData;
  index:number;
  totalSlides:number;
  durationInFrames:number;
}

const c={
  ink:'#1d2637', muted:'#69798b', pink:'#ff8ec8', aqua:'#7ce6ec',
  apricot:'#ffc892', lavender:'#b6a7ff', shell:'rgba(255,255,255,0.8)',
};

const pill=(color:string)=>`linear-gradient(135deg, ${color} 0%, rgba(255,255,255,0.62) 100%)`;
const rise=(p:number,y=20)=>`translateY(${interpolate(p,[0,1],[y,0])}px)`;
const tagStyle=(color:string)=>({
  display:'inline-flex', padding:'10px 16px', borderRadius:999,
  background:`${color}24`, border:`1px solid ${color}55`,
  boxShadow:'0 4px 14px rgba(255,255,255,0.24) inset',
  fontSize:16, fontWeight:800, color:c.ink, letterSpacing:'-0.01em',
} as const);

export const LiquidBriefSlide:React.FC<Props>=({
  title, subtitle, badge='LIQUID BRIEF', items=[], type='cover', data, index, totalSlides, durationInFrames,
})=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const count=
    type==='cover'?items.length:
    type==='cards'&&Array.isArray(data?.cards)?(data.cards as unknown[]).length:
    type==='steps'&&Array.isArray(data?.steps)?(data.steps as unknown[]).length:
    type==='stats'&&Array.isArray(data?.stats)?(data.stats as unknown[]).length:
    type==='quote'&&Array.isArray(data?.tags)?(data.tags as unknown[]).length:2;
  const t=getSlideMotionTiming(durationInFrames,count);
  const enter=spring({frame,fps,config:{damping:18,stiffness:100}});
  const head=spring({frame:frame-4,fps,config:{damping:18,stiffness:120}});
  const titleIn=spring({frame:frame-t.titleStart,fps,config:{damping:18,stiffness:100}});
  const subIn=spring({frame:frame-t.subtitleStart,fps,config:{damping:18,stiffness:90}});
  const lineIn=spring({frame:frame-t.lineStart,fps,config:{damping:18,stiffness:110}});
  const exit=interpolate(frame,[t.exitStart,t.exitEnd],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const shift=Math.sin(frame*0.012)*20;
  const titleSize=type==='cover'?74:58;
  const titleLine=type==='cover'?1.05:1.08;

  const numPill=(number:string,color:string)=>(
    <div style={{width:58,height:40,borderRadius:999,background:pill(color),display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 10px 24px ${color}45`}}>
      <span style={{fontSize:18,fontWeight:800,color:c.ink}}>{number}</span>
    </div>
  );

  const boxStyle={
    borderRadius:28,
    background:'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.72) 100%)',
    border:'1px solid rgba(255,255,255,0.74)',
    boxShadow:'0 14px 28px rgba(196, 200, 210, 0.14), 0 4px 10px rgba(255,255,255,0.24) inset',
  } as const;

  const render=()=>{
    if(type==='cover'){
      return <div style={{display:'flex',flexDirection:'column',gap:18}}>
        {items.map((item,i)=>{
          const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:16,stiffness:110}});
          const color=item.color||[c.pink,c.aqua,c.apricot][i%3];
          return <div key={`${item.number}-${i}`} style={{...boxStyle,minHeight:154,padding:'24px 28px 26px',opacity:p,transform:`${rise(p,22)} scale(${interpolate(p,[0,1],[0.986,1])})`}}>
            {numPill(item.number,color)}
            <div style={{marginTop:24,fontSize:30,fontWeight:800,lineHeight:1.28,color:c.ink,letterSpacing:'-0.03em'}}>{item.title}</div>
          </div>;
        })}
      </div>;
    }

    if(type==='cards'){
      const cards=(data?.cards as Array<{eyebrow?:string;title:string;body:string;color?:string}>)||[];
      return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        {cards.map((card,i)=>{
          const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:16,stiffness:100}});
          const color=card.color||[c.pink,c.aqua,c.lavender,c.apricot][i%4];
          return <div key={`${card.title}-${i}`} style={{...boxStyle,minHeight:232,padding:'24px 24px 28px',opacity:p,transform:`${rise(p,18)} scale(${interpolate(p,[0,1],[0.984,1])})`}}>
            <div style={tagStyle(color)}>{card.eyebrow||`0${i+1}`}</div>
            <div style={{marginTop:18,fontSize:28,fontWeight:800,lineHeight:1.2,color:c.ink,letterSpacing:'-0.03em'}}>{card.title}</div>
            <div style={{marginTop:12,fontSize:22,lineHeight:1.55,color:c.muted,fontWeight:500}}>{card.body}</div>
          </div>;
        })}
      </div>;
    }

    if(type==='steps'){
      const steps=(data?.steps as Array<{title:string;description:string;color?:string}>)||[];
      return <div style={{position:'relative',display:'flex',flexDirection:'column',gap:18}}>
        <div style={{position:'absolute',left:27,top:62,bottom:62,width:2,background:'linear-gradient(180deg, rgba(255,142,200,0.45) 0%, rgba(124,230,236,0.42) 52%, rgba(255,200,146,0.42) 100%)'}} />
        {steps.map((step,i)=>{
          const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:15,stiffness:100}});
          const color=step.color||[c.pink,c.aqua,c.apricot][i%3];
          return <div key={`${step.title}-${i}`} style={{display:'flex',gap:18,opacity:p,transform:rise(p,18)}}>
            <div style={{width:56,paddingTop:16,display:'flex',justifyContent:'center',position:'relative',zIndex:1,flexShrink:0}}>
              {numPill(String(i+1).padStart(2,'0'),color)}
            </div>
            <div style={{...boxStyle,flex:1,padding:'22px 24px 24px'}}>
              <div style={{fontSize:28,fontWeight:800,color:c.ink,letterSpacing:'-0.03em'}}>{step.title}</div>
              <div style={{marginTop:10,fontSize:22,lineHeight:1.55,color:c.muted,fontWeight:500}}>{step.description}</div>
            </div>
          </div>;
        })}
      </div>;
    }

    if(type==='compare'){
      const compare=data as {left?:{label:string;title:string;points:string[]};right?:{label:string;title:string;points:string[]};centerLabel?:string};
      const panel=(side:{label:string;title:string;points:string[]}|undefined,color:string,p:number,d:number)=>{
        if(!side)return null;
        return <div style={{...boxStyle,flex:1,padding:'24px 24px 28px',opacity:p,transform:`translateX(${interpolate(p,[0,1],[d,0])}px)`}}>
          <div style={tagStyle(color)}>{side.label}</div>
          <div style={{marginTop:18,fontSize:28,fontWeight:800,lineHeight:1.2,color:c.ink,letterSpacing:'-0.03em'}}>{side.title}</div>
          <div style={{marginTop:18,display:'flex',flexDirection:'column',gap:12}}>
            {side.points.map((point,i)=><div key={`${point}-${i}`} style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:12,height:12,borderRadius:999,background:color,boxShadow:`0 0 16px ${color}80`}} />
              <span style={{fontSize:22,lineHeight:1.45,color:c.muted,fontWeight:600}}>{point}</span>
            </div>)}
          </div>
        </div>;
      };
      const left=spring({frame:frame-t.pointsStart,fps,config:{damping:15,stiffness:100}});
      const right=spring({frame:frame-t.pointsStart-10,fps,config:{damping:15,stiffness:100}});
      return <div style={{display:'flex',alignItems:'center',gap:18}}>
        {panel(compare.left,c.pink,left,-28)}
        <div style={{...boxStyle,width:80,height:80,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:c.ink,letterSpacing:'-0.03em'}}>{compare.centerLabel||'VS'}</div>
        {panel(compare.right,c.aqua,right,28)}
      </div>;
    }

    if(type==='stats'){
      const stats=(data?.stats as Array<{value:string;label:string;note:string;color?:string}>)||[];
      const insights=(data?.insights as string[])||[];
      return <div style={{display:'flex',flexDirection:'column',gap:20}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18}}>
          {stats.map((stat,i)=>{
            const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:15,stiffness:100}});
            const color=stat.color||[c.pink,c.aqua,c.apricot][i%3];
            return <div key={`${stat.label}-${i}`} style={{...boxStyle,padding:'24px 24px 26px',opacity:p,transform:rise(p,16)}}>
              <div style={tagStyle(color)}>{stat.label}</div>
              <div style={{marginTop:22,fontSize:52,fontWeight:900,lineHeight:1,letterSpacing:'-0.05em',color:c.ink}}>{stat.value}</div>
              <div style={{marginTop:12,fontSize:20,lineHeight:1.5,color:c.muted,fontWeight:600}}>{stat.note}</div>
            </div>;
          })}
        </div>
        <div style={{...boxStyle,padding:'24px 24px 26px'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
            <div style={tagStyle(c.lavender)}>读图结论</div>
            <div style={{fontSize:22,color:c.muted,fontWeight:600}}>数字需要有解释，不能只堆数值</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {insights.map((text,i)=><div key={`${text}-${i}`} style={{fontSize:22,lineHeight:1.5,color:c.ink,fontWeight:700}}>{text}</div>)}
          </div>
        </div>
      </div>;
    }

    const quote=data as {quote?:string;author?:string;tags?:string[]};
    const tags=quote?.tags||[];
    return <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div style={{...boxStyle,borderRadius:32,padding:'34px 34px 32px',boxShadow:'0 18px 36px rgba(196, 200, 210, 0.16), 0 4px 10px rgba(255,255,255,0.24) inset'}}>
        <div style={{fontSize:84,lineHeight:0.82,color:c.lavender,fontWeight:800}}>“</div>
        <div style={{marginTop:8,fontSize:36,lineHeight:1.42,color:c.ink,fontWeight:800,letterSpacing:'-0.03em'}}>{quote?.quote||title}</div>
        <div style={{marginTop:20,fontSize:22,color:c.muted,fontWeight:600}}>{quote?.author||subtitle}</div>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:14}}>
        {tags.map((tag,i)=>{
          const p=spring({frame:frame-t.pointsStart-i*4,fps,config:{damping:18,stiffness:110}});
          const color=[c.pink,c.aqua,c.apricot,c.lavender][i%4];
          return <div key={`${tag}-${i}`} style={{opacity:p,transform:`scale(${interpolate(p,[0,1],[0.84,1])})`}}><div style={tagStyle(color)}>{tag}</div></div>;
        })}
      </div>
    </div>;
  };

  return <AbsoluteFill style={{background:'linear-gradient(180deg, #efebee 0%, #ebe7e8 34%, #e7e5e5 100%)',justifyContent:'center',alignItems:'center',overflow:'hidden',fontFamily:"'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"}}>
    <div style={{position:'absolute',inset:0,background:`
      radial-gradient(58% 34% at ${18+shift*0.05}% 10%, rgba(250,158,196,0.74) 0%, rgba(250,158,196,0.22) 42%, transparent 80%),
      radial-gradient(52% 32% at ${84-shift*0.06}% 10%, rgba(171,145,244,0.82) 0%, rgba(171,145,244,0.22) 45%, transparent 78%),
      radial-gradient(48% 30% at ${22+shift*0.04}% 58%, rgba(142,236,239,0.62) 0%, rgba(142,236,239,0.16) 42%, transparent 76%),
      radial-gradient(42% 28% at ${78-shift*0.03}% 74%, rgba(255,203,120,0.64) 0%, rgba(255,203,120,0.16) 44%, transparent 74%),
      radial-gradient(44% 28% at ${82-shift*0.03}% 92%, rgba(175,232,255,0.56) 0%, rgba(175,232,255,0.12) 42%, transparent 74%)
    `}} />
    <div style={{position:'absolute',inset:0,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)'}} />
    <AbsoluteFill style={{opacity:exit,alignItems:'center',justifyContent:'center',padding:'42px 44px 56px'}}>
      <div style={{position:'relative',width:922,marginTop:type==='cover'?54:34,borderRadius:34,padding:'44px 44px 40px',background:'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.82) 100%)',border:'1.5px solid rgba(255,255,255,0.78)',boxShadow:'0 32px 80px rgba(141,141,160,0.18), 0 10px 24px rgba(255,255,255,0.24) inset',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',transform:`translateY(${interpolate(enter,[0,1],[28,0])}px) scale(${interpolate(enter,[0,1],[0.978,1])})`,opacity:enter,overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(42% 34% at 22% 72%, rgba(162,240,243,0.28) 0%, transparent 68%), radial-gradient(34% 28% at 80% 88%, rgba(255,214,140,0.24) 0%, transparent 68%), linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',pointerEvents:'none'}} />
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28,opacity:head,transform:rise(head,10)}}>
            <div style={{padding:'13px 18px',borderRadius:999,background:'rgba(255,255,255,0.56)',boxShadow:'0 6px 18px rgba(255,255,255,0.3) inset'}}><span style={{fontSize:16,fontWeight:700,letterSpacing:'0.11em',color:'#6d7788'}}>{badge}</span></div>
            <div style={{padding:'13px 18px',borderRadius:999,background:'rgba(255,255,255,0.52)',minWidth:96,textAlign:'center',boxShadow:'0 6px 18px rgba(255,255,255,0.28) inset'}}><span style={{fontSize:18,fontWeight:800,color:'#273243',letterSpacing:'0.02em'}}>{String(index+1).padStart(2,'0')} / {String(totalSlides).padStart(2,'0')}</span></div>
          </div>
          <h1 style={{margin:0,maxWidth:type==='cover'?780:790,fontSize:titleSize,lineHeight:titleLine,letterSpacing:type==='cover'?'-0.058em':'-0.05em',fontWeight:900,color:c.ink,whiteSpace:'pre-line',opacity:titleIn,transform:rise(titleIn,22)}}>{title}</h1>
          <div style={{width:interpolate(lineIn,[0,1],[0,type==='cover'?160:150]),height:6,borderRadius:999,marginTop:22,background:'linear-gradient(90deg, #ff64bf 0%, #7de5ef 52%, #19c4b7 100%)'}} />
          {subtitle?<p style={{margin:type==='cover'?'26px 0 34px':'24px 0 30px',maxWidth:780,fontSize:28,lineHeight:1.48,color:c.muted,fontWeight:500,opacity:subIn,transform:rise(subIn,14)}}>{subtitle}</p>:null}
          {render()}
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>;
};
