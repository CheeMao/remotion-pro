import {AbsoluteFill,interpolate,spring,useCurrentFrame,useVideoConfig} from 'remotion';
import React from 'react';
import {getSlideMotionTiming} from '../templates/animationTiming';
import {getSafeAreaInsets} from '../layouts/safeArea';

type SlideType='cover'|'cards'|'steps'|'compare'|'stats'|'quote'|'timeline'|'chart'|'highlight'|'cta'|'list';

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
  ink:'#1d2637',
  muted:'#69798b',
  soft:'#8a97a6',
  pink:'#ff8ec8',
  aqua:'#7ce6ec',
  apricot:'#ffc892',
  lavender:'#b6a7ff',
  line:'rgba(124,138,160,0.18)',
};

const pill=(color:string)=>`linear-gradient(135deg, ${color} 0%, rgba(255,255,255,0.68) 100%)`;
const rise=(p:number,y=20)=>`translateY(${interpolate(p,[0,1],[y,0])}px)`;
const glassBase={
  background:'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.72) 100%)',
  border:'1px solid rgba(255,255,255,0.82)',
  boxShadow:'0 24px 48px rgba(146, 154, 172, 0.14), 0 6px 14px rgba(255,255,255,0.28) inset',
  backdropFilter:'blur(22px)',
  WebkitBackdropFilter:'blur(22px)',
} as const;

const tagStyle=(color:string)=>({
  display:'inline-flex',
  alignItems:'center',
  gap:8,
  padding:'9px 15px',
  borderRadius:999,
  background:`${color}22`,
  border:`1px solid ${color}52`,
  boxShadow:'0 4px 14px rgba(255,255,255,0.24) inset',
  fontSize:15,
  fontWeight:800,
  color:c.ink,
  letterSpacing:'0.02em',
} as const);

export const LiquidBriefSlide:React.FC<Props>=({
  title,
  subtitle,
  items=[],
  type='cover',
  data,
  index,
  totalSlides,
  durationInFrames,
})=>{
  const frame=useCurrentFrame();
  const {fps,width,height}=useVideoConfig();
  const safeArea=getSafeAreaInsets(width,height);
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
    <div
      style={{
        width:58,
        height:40,
        borderRadius:999,
        background:pill(color),
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        boxShadow:`0 10px 24px ${color}45`,
      }}
    >
      <span style={{fontSize:18,fontWeight:800,color:c.ink}}>{number}</span>
    </div>
  );

  const panelShell=(color:string)=>({
    ...glassBase,
    borderRadius:28,
    position:'relative' as const,
    overflow:'hidden' as const,
    background:`linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%), linear-gradient(135deg, ${color}10 0%, transparent 40%)`,
  });

  const render=()=>{
    if(type==='cover'){
      return (
        <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:18}}>
          {items.map((item,i)=>{
            const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:16,stiffness:110}});
            const color=item.color||[c.pink,c.aqua,c.apricot][i%3];

            return (
              <div
                key={`${item.number}-${i}`}
                style={{
                  ...panelShell(color),
                  minHeight:i===0?176:154,
                  padding:'24px 28px 26px',
                  gridColumn:i===0?'1 / 2':'auto',
                  opacity:p,
                  transform:`${rise(p,22)} scale(${interpolate(p,[0,1],[0.986,1])})`,
                }}
              >
                <div
                  style={{
                    position:'absolute',
                    inset:0,
                    background:`radial-gradient(circle at 88% 18%, ${color}2c 0%, transparent 32%), radial-gradient(circle at 12% 100%, rgba(255,255,255,0.76) 0%, transparent 36%)`,
                    pointerEvents:'none',
                  }}
                />
                <div style={{position:'relative',zIndex:1}}>
                  {numPill(item.number,color)}
                  <div style={{marginTop:24,fontSize:i===0?34:30,fontWeight:800,lineHeight:1.22,color:c.ink,letterSpacing:'-0.035em',maxWidth:i===0?380:undefined}}>
                    {item.title}
                  </div>
                  <div style={{marginTop:20,width:i===0?96:72,height:4,borderRadius:999,background:`linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.95) 100%)`,boxShadow:`0 0 18px ${color}55`}} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if(type==='cards'){
      const cards=(data?.cards as Array<{eyebrow?:string;title:string;body:string;color?:string}>)||[];
      return (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
          {cards.map((card,i)=>{
            const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:16,stiffness:100}});
            const color=card.color||[c.pink,c.aqua,c.lavender,c.apricot][i%4];

            return (
              <div
                key={`${card.title}-${i}`}
                style={{
                  ...panelShell(color),
                  minHeight:248,
                  padding:'24px 24px 24px',
                  opacity:p,
                  transform:`${rise(p,18)} scale(${interpolate(p,[0,1],[0.984,1])})`,
                }}
              >
                <div style={{position:'absolute',top:-22,right:-16,width:118,height:118,borderRadius:'50%',background:`radial-gradient(circle, ${color}40 0%, ${color}08 52%, transparent 74%)`,filter:'blur(4px)'}} />
                <div style={{position:'absolute',left:0,right:0,bottom:0,height:5,background:`linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.85) 100%)`}} />
                <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',height:'100%'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                    <div style={tagStyle(color)}>{card.eyebrow||`0${i+1}`}</div>
                  </div>
                  <div style={{marginTop:22,fontSize:30,fontWeight:800,lineHeight:1.16,color:c.ink,letterSpacing:'-0.04em',maxWidth:290}}>
                    {card.title}
                  </div>
                  <div style={{marginTop:14,fontSize:21,lineHeight:1.58,color:c.muted,fontWeight:500}}>
                    {card.body}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if(type==='steps'){
      const steps=(data?.steps as Array<{title:string;description:string;color?:string}>)||[];
      return (
        <div style={{position:'relative',display:'flex',flexDirection:'column',gap:18}}>
          <div style={{position:'absolute',left:27,top:62,bottom:62,width:2,background:'linear-gradient(180deg, rgba(255,142,200,0.45) 0%, rgba(124,230,236,0.42) 52%, rgba(255,200,146,0.42) 100%)'}} />
          {steps.map((step,i)=>{
            const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:15,stiffness:100}});
            const color=step.color||[c.pink,c.aqua,c.apricot][i%3];

            return (
              <div key={`${step.title}-${i}`} style={{display:'flex',gap:18,opacity:p,transform:rise(p,18)}}>
                <div style={{width:56,paddingTop:16,display:'flex',justifyContent:'center',position:'relative',zIndex:1,flexShrink:0}}>
                  {numPill(String(i+1).padStart(2,'0'),color)}
                </div>
                <div style={{...panelShell(color),flex:1,padding:'22px 24px 24px'}}>
                  <div style={{fontSize:28,fontWeight:800,color:c.ink,letterSpacing:'-0.03em'}}>{step.title}</div>
                  <div style={{marginTop:10,fontSize:22,lineHeight:1.55,color:c.muted,fontWeight:500}}>{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if(type==='compare'){
      const compare=data as {left?:{label:string;title:string;points:string[]};right?:{label:string;title:string;points:string[]};centerLabel?:string;centerBadge?:string};
      const left=spring({frame:frame-t.pointsStart,fps,config:{damping:15,stiffness:100}});
      const right=spring({frame:frame-t.pointsStart-10,fps,config:{damping:15,stiffness:100}});
      const center=spring({frame:frame-t.pointsStart-4,fps,config:{damping:16,stiffness:100}});

      const panel=(side:{label:string;title:string;points:string[]}|undefined,color:string,p:number,d:number)=>{
        if(!side)return null;

        return (
          <div
            style={{
              ...panelShell(color),
              minHeight:274,
              padding:'26px 24px 28px',
              opacity:p,
              transform:`translateX(${interpolate(p,[0,1],[d,0])}px) rotate(${interpolate(p,[0,1],[d<0?-2:2,d<0?-0.8:0.8])}deg)`,
            }}
          >
            <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at ${d<0?'18% 16%':'82% 16%'}, rgba(255,255,255,0.82) 0%, transparent 34%), radial-gradient(circle at ${d<0?'88% 90%':'12% 90%'}, ${color}22 0%, transparent 40%)`,pointerEvents:'none'}} />
            <div style={{position:'relative',zIndex:1}}>
              <div style={tagStyle(color)}>{side.label}</div>
              <div style={{marginTop:18,fontSize:30,fontWeight:800,lineHeight:1.18,color:c.ink,letterSpacing:'-0.04em'}}>{side.title}</div>
              <div style={{marginTop:18,display:'flex',flexDirection:'column',gap:12}}>
                {side.points.map((point,i)=>(
                  <div key={`${point}-${i}`} style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:12,height:12,borderRadius:999,background:color,boxShadow:`0 0 16px ${color}80`}} />
                    <span style={{fontSize:22,lineHeight:1.45,color:c.muted,fontWeight:600}}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      };

      return (
        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'stretch',gap:18,position:'relative'}}>
          <div style={{position:'absolute',left:'50%',top:'50%',width:168,height:2,borderRadius:999,background:'linear-gradient(90deg, rgba(255,142,200,0.35) 0%, rgba(255,255,255,0.9) 52%, rgba(124,230,236,0.35) 100%)',transform:`translate(-50%, -50%) scaleX(${interpolate(center,[0,1],[0.45,1])})`,opacity:center,boxShadow:'0 0 18px rgba(255,255,255,0.45)'}} />
          {panel(compare.left,c.pink,left,-28)}
          <div
            style={{
              ...glassBase,
              width:92,
              height:92,
              alignSelf:'center',
              borderRadius:'50% 50% 42% 42%',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              opacity:center,
              transform:`scale(${interpolate(center,[0,1],[0.72,1])})`,
            }}
          >
            <div style={{fontSize:12,fontWeight:700,letterSpacing:'0.18em',color:c.soft,marginBottom:4}}>{compare.centerBadge||'MODE'}</div>
            <div style={{fontSize:22,fontWeight:900,color:c.ink,letterSpacing:'-0.03em'}}>{compare.centerLabel||'VS'}</div>
          </div>
          {panel(compare.right,c.aqua,right,28)}
        </div>
      );
    }

    if(type==='stats'){
      const stats=(data?.stats as Array<{value:string;label:string;note:string;color?:string}>)||[];
      const insights=(data?.insights as string[])||[];

      return (
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:18}}>
            {stats.map((stat,i)=>{
              const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:15,stiffness:100}});
              const color=stat.color||[c.pink,c.aqua,c.apricot][i%3];

              return (
                <div key={`${stat.label}-${i}`} style={{...panelShell(color),padding:'22px 22px 24px',opacity:p,transform:rise(p,16)}}>
                  <div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 84% 16%, ${color}26 0%, transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)`,pointerEvents:'none'}} />
                  <div style={{position:'relative',zIndex:1}}>
                    <div style={tagStyle(color)}>{stat.label}</div>
                    <div style={{marginTop:20,fontSize:56,fontWeight:900,lineHeight:0.95,letterSpacing:'-0.06em',color:c.ink}}>{stat.value}</div>
                    <div style={{marginTop:10,width:70,height:4,borderRadius:999,background:`linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.92) 100%)`}} />
                    <div style={{marginTop:14,fontSize:20,lineHeight:1.5,color:c.muted,fontWeight:600}}>{stat.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{...glassBase,borderRadius:30,padding:'24px 24px 26px'}}>
            <div style={{display:'grid',gap:12}}>
              {insights.map((text,i)=>{
                const color=[c.pink,c.aqua,c.apricot][i%3];
                return (
                  <div key={`${text}-${i}`} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'14px 16px',borderRadius:22,background:'rgba(255,255,255,0.52)',border:'1px solid rgba(255,255,255,0.74)'}}>
                    <div style={{width:12,height:12,borderRadius:'50%',background:color,boxShadow:`0 0 16px ${color}80`,marginTop:10,flexShrink:0}} />
                    <div style={{fontSize:22,lineHeight:1.5,color:c.ink,fontWeight:700}}>{text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if(type==='timeline'){
      const timeline=(data?.timeline as Array<{year:string;title:string;description?:string}>)||[];
      return (
        <div style={{position:'relative',display:'flex',flexDirection:'column',gap:14}}>
          <div style={{position:'absolute',left:30,top:48,bottom:48,width:2,background:'linear-gradient(180deg, rgba(255,142,200,0.5) 0%, rgba(124,230,236,0.5) 50%, rgba(255,200,146,0.5) 100%)'}} />
          {timeline.map((item,i)=>{
            const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:15,stiffness:100}});
            const color=[c.pink,c.aqua,c.apricot,c.lavender][i%4];
            return (
              <div key={`${item.year}-${i}`} style={{display:'flex',gap:18,alignItems:'flex-start',opacity:p,transform:rise(p,16)}}>
                <div style={{width:62,paddingTop:14,display:'flex',justifyContent:'center',position:'relative',zIndex:1,flexShrink:0}}>
                  <div style={{width:18,height:18,borderRadius:'50%',background:color,boxShadow:`0 0 0 5px ${color}25, 0 0 18px ${color}90`}} />
                </div>
                <div style={{...panelShell(color),flex:1,padding:'18px 22px 20px'}}>
                  <div style={{fontSize:20,fontWeight:800,color:color,letterSpacing:'0.02em'}}>{item.year}</div>
                  <div style={{marginTop:6,fontSize:26,fontWeight:800,color:c.ink,letterSpacing:'-0.025em',lineHeight:1.22}}>{item.title}</div>
                  {item.description?(
                    <div style={{marginTop:8,fontSize:20,lineHeight:1.55,color:c.muted,fontWeight:500}}>{item.description}</div>
                  ):null}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if(type==='chart'){
      const bars=(data?.bars as Array<{label:string;value:number;percent?:number;color?:string}>)||[];
      return (
        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          {bars.map((bar,i)=>{
            const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:16,stiffness:100}});
            const value=Math.max(0,Math.min(100,bar.percent??bar.value));
            const fillP=spring({frame:frame-t.pointsStart-i*t.pointStagger-4,fps,config:{damping:18,stiffness:80}});
            const color=bar.color||[c.pink,c.aqua,c.apricot,c.lavender][i%4];
            return (
              <div key={`${bar.label}-${i}`} style={{...panelShell(color),padding:'20px 24px 22px',opacity:p,transform:rise(p,14)}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14}}>
                  <div style={{fontSize:24,fontWeight:800,color:c.ink,letterSpacing:'-0.02em'}}>{bar.label}</div>
                  <div style={{fontSize:36,fontWeight:900,color:color,letterSpacing:'-0.04em'}}>{Math.floor(value*fillP)}<span style={{fontSize:22,marginLeft:2}}>%</span></div>
                </div>
                <div style={{height:14,borderRadius:999,background:'rgba(124,138,160,0.14)',overflow:'hidden',position:'relative'}}>
                  <div style={{height:'100%',width:`${value*fillP}%`,borderRadius:999,background:`linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0.92) 100%)`,boxShadow:`0 0 18px ${color}65`}} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if(type==='highlight'){
      const items=(data?.highlights as string[])||[];
      return (
        <div style={{display:'flex',flexWrap:'wrap',gap:14,justifyContent:'center',alignItems:'center',minHeight:300}}>
          {items.map((it,i)=>{
            const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:14,stiffness:100}});
            const color=[c.pink,c.aqua,c.apricot,c.lavender][i%4];
            return (
              <div
                key={`${it}-${i}`}
                style={{
                  ...glassBase,
                  borderRadius:24,
                  padding:'18px 26px',
                  border:`1px solid ${color}50`,
                  background:`linear-gradient(135deg, ${color}20 0%, rgba(255,255,255,0.85) 100%)`,
                  fontSize:26,
                  fontWeight:800,
                  color:c.ink,
                  letterSpacing:'-0.02em',
                  opacity:p,
                  transform:`scale(${interpolate(p,[0,1],[0.86,1])}) ${rise(p,10)}`,
                  display:'inline-flex',
                  alignItems:'center',
                  gap:12,
                }}
              >
                <span style={{width:8,height:8,borderRadius:'50%',background:color,boxShadow:`0 0 14px ${color}`}} />
                {it}
              </div>
            );
          })}
        </div>
      );
    }

    if(type==='cta'){
      const ctaText=typeof data?.cta==='string'?data.cta:'点赞收藏';
      const cards=(data?.cards as Array<{eyebrow?:string;title:string;body:string}>)||[];
      const tags=cards.map(c=>c.title).slice(0,4);
      const pulse=1+Math.sin(frame*0.12)*0.04;
      const ctaP=spring({frame:frame-t.pointsStart-4,fps,config:{damping:13,stiffness:110}});
      return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:32,padding:'20px 0'}}>
          <div style={{...glassBase,borderRadius:32,padding:'30px 44px 34px',position:'relative',overflow:'hidden',textAlign:'center'}}>
            <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 50% 0%, rgba(255,142,200,0.30) 0%, transparent 60%)',pointerEvents:'none'}} />
            <div style={{position:'relative',zIndex:1}}>
              <div
                style={{
                  display:'inline-flex',
                  alignItems:'center',
                  gap:14,
                  padding:'24px 56px',
                  borderRadius:999,
                  background:'linear-gradient(135deg, #ff64bf 0%, #7de5ef 100%)',
                  fontSize:32,
                  fontWeight:800,
                  color:'white',
                  boxShadow:'0 24px 56px rgba(255,100,191,0.40), inset 0 1px 0 rgba(255,255,255,0.45)',
                  transform:`scale(${pulse*interpolate(ctaP,[0,1],[0.86,1])})`,
                  opacity:ctaP,
                  letterSpacing:'-0.01em',
                }}
              >
                <span style={{fontSize:28}}>→</span>
                {ctaText}
              </div>
            </div>
          </div>
          {tags.length>0?(
            <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
              {tags.map((tg,i)=>{
                const color=[c.pink,c.aqua,c.apricot,c.lavender][i%4];
                const tp=spring({frame:frame-t.pointsStart-12-i*4,fps,config:{damping:16}});
                return <div key={`${tg}-${i}`} style={{opacity:tp}}><div style={tagStyle(color)}>#{tg}</div></div>;
              })}
            </div>
          ):null}
        </div>
      );
    }

    if(type==='list'){
      const listItems=(data?.items as Array<{icon?:string;title:string;desc?:string}>)||[];
      return (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {listItems.map((item,i)=>{
            const p=spring({frame:frame-t.pointsStart-i*t.pointStagger,fps,config:{damping:16,stiffness:100}});
            const color=[c.pink,c.aqua,c.apricot,c.lavender][i%4];
            return (
              <div
                key={`${item.title}-${i}`}
                style={{
                  ...panelShell(color),
                  padding:'20px 24px 22px',
                  opacity:p,
                  transform:rise(p,16),
                  display:'flex',
                  alignItems:'center',
                  gap:20,
                }}
              >
                <div style={{position:'absolute',left:0,top:0,bottom:0,width:5,background:`linear-gradient(180deg, ${color} 0%, rgba(255,255,255,0.9) 100%)`,borderRadius:'28px 0 0 28px'}} />
                <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:20,width:'100%'}}>
                  <div
                    style={{
                      width:48,
                      height:48,
                      borderRadius:'50%',
                      background:`${color}28`,
                      border:`1.5px solid ${color}60`,
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      fontSize:22,
                      flexShrink:0,
                    }}
                  >
                    {item.icon||<span style={{fontWeight:900,color:color,fontSize:18}}>{String(i+1).padStart(2,'0')}</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:26,fontWeight:800,color:c.ink,letterSpacing:'-0.025em',lineHeight:1.2}}>{item.title}</div>
                    {item.desc?(
                      <div style={{marginTop:6,fontSize:20,lineHeight:1.5,color:c.muted,fontWeight:500}}>{item.desc}</div>
                    ):null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    const quote=data as {quote?:string;author?:string;tags?:string[]};
    const tags=quote?.tags||[];

    return (
      <div style={{display:'grid',gridTemplateColumns:'1.25fr 0.75fr',gap:20,alignItems:'stretch'}}>
        <div style={{...glassBase,borderRadius:32,padding:'34px 34px 32px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-36,right:-20,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle, rgba(182,167,255,0.32) 0%, rgba(182,167,255,0.06) 48%, transparent 72%)'}} />
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:84,lineHeight:0.82,color:c.lavender,fontWeight:800}}>“</div>
            <div style={{marginTop:8,fontSize:38,lineHeight:1.38,color:c.ink,fontWeight:800,letterSpacing:'-0.035em'}}>{quote?.quote||title}</div>
            <div style={{marginTop:22,paddingTop:18,borderTop:'1px solid rgba(182,167,255,0.18)',fontSize:22,color:c.muted,fontWeight:700}}>{quote?.author||subtitle}</div>
          </div>
        </div>
        <div style={{...glassBase,borderRadius:28,padding:'22px 20px',display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:14}}>
            {tags.map((tag,i)=>{
              const p=spring({frame:frame-t.pointsStart-i*4,fps,config:{damping:18,stiffness:110}});
              const color=[c.pink,c.aqua,c.apricot,c.lavender][i%4];
              return <div key={`${tag}-${i}`} style={{opacity:p,transform:`scale(${interpolate(p,[0,1],[0.84,1])})`}}><div style={tagStyle(color)}>{tag}</div></div>;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background:'linear-gradient(180deg, #efebee 0%, #ebe7e8 34%, #e7e5e5 100%)',
        justifyContent:'center',
        alignItems:'center',
        overflow:'hidden',
        fontFamily:"'SF Pro Display', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
      }}
    >
      <div
        style={{
          position:'absolute',
          inset:0,
          background:`
            radial-gradient(58% 34% at ${18+shift*0.05}% 10%, rgba(250,158,196,0.74) 0%, rgba(250,158,196,0.22) 42%, transparent 80%),
            radial-gradient(52% 32% at ${84-shift*0.06}% 10%, rgba(171,145,244,0.82) 0%, rgba(171,145,244,0.22) 45%, transparent 78%),
            radial-gradient(48% 30% at ${22+shift*0.04}% 58%, rgba(142,236,239,0.62) 0%, rgba(142,236,239,0.16) 42%, transparent 76%),
            radial-gradient(42% 28% at ${78-shift*0.03}% 74%, rgba(255,203,120,0.64) 0%, rgba(255,203,120,0.16) 44%, transparent 74%),
            radial-gradient(44% 28% at ${82-shift*0.03}% 92%, rgba(175,232,255,0.56) 0%, rgba(175,232,255,0.12) 42%, transparent 74%)
          `,
        }}
      />
      <div style={{position:'absolute',inset:0,backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)'}} />
      <AbsoluteFill style={{opacity:exit,alignItems:'center',justifyContent:'center',padding:`${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`}}>
        <div
          style={{
            ...glassBase,
            position:'relative',
            width:922,
            marginTop:type==='cover'?54:34,
            borderRadius:34,
            padding:'44px 44px 40px',
            transform:`translateY(${interpolate(enter,[0,1],[28,0])}px) scale(${interpolate(enter,[0,1],[0.978,1])})`,
            opacity:enter,
            overflow:'hidden',
          }}
        >
          <div style={{position:'absolute',inset:0,background:'radial-gradient(42% 34% at 22% 72%, rgba(162,240,243,0.28) 0%, transparent 68%), radial-gradient(34% 28% at 80% 88%, rgba(255,214,140,0.24) 0%, transparent 68%), linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',pointerEvents:'none'}} />
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',marginBottom:28,opacity:head,transform:rise(head,10)}}>
              <div style={{padding:'13px 18px',borderRadius:999,background:'rgba(255,255,255,0.52)',minWidth:96,textAlign:'center',boxShadow:'0 6px 18px rgba(255,255,255,0.28) inset'}}>
                <span style={{fontSize:18,fontWeight:800,color:'#273243',letterSpacing:'0.02em'}}>{String(index+1).padStart(2,'0')} / {String(totalSlides).padStart(2,'0')}</span>
              </div>
            </div>
            <h1 style={{margin:0,maxWidth:type==='cover'?780:790,fontSize:titleSize,lineHeight:titleLine,letterSpacing:type==='cover'?'-0.058em':'-0.05em',fontWeight:900,color:c.ink,whiteSpace:'pre-line',opacity:titleIn,transform:rise(titleIn,22)}}>
              {title}
            </h1>
            <div style={{width:interpolate(lineIn,[0,1],[0,type==='cover'?160:150]),height:6,borderRadius:999,marginTop:22,background:'linear-gradient(90deg, #ff64bf 0%, #7de5ef 52%, #19c4b7 100%)'}} />
            {subtitle?(
              <p style={{margin:type==='cover'?'26px 0 34px':'24px 0 30px',maxWidth:780,fontSize:28,lineHeight:1.48,color:c.muted,fontWeight:500,opacity:subIn,transform:rise(subIn,14)}}>
                {subtitle}
              </p>
            ):null}
            {render()}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
