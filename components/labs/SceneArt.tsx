"use client";

import { useId, type CSSProperties } from "react";

/** Decorative pacing form. Its expansion follows the actual phase timer. */
export function BreathBloom({ scale, duration, reduced }: { scale: number; duration: number; reduced: boolean }) {
  const id = useId();
  return <svg className="breath-bloom" viewBox="0 0 400 400" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-petal`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e0fff2"/><stop offset=".4" stopColor="#6fc8b9"/><stop offset="1" stopColor="#245f63"/></linearGradient>
      <radialGradient id={`${id}-core`} cx="35%" cy="25%"><stop stopColor="#d7fff2"/><stop offset=".5" stopColor="#71b9ad"/><stop offset="1" stopColor="#286466"/></radialGradient>
    </defs>
    <g style={{transformOrigin:"200px 200px",transform:`scale(${reduced ? .9 : .67 + scale * .33})`,transition:reduced ? "none" : `transform ${duration}s cubic-bezier(.45,0,.25,1)`}}>
      {Array.from({length:12},(_,i)=><g key={i} transform={`rotate(${i*30} 200 200)`}>
        <path d="M200 207C160 174 141 110 164 63C179 33 203 39 213 70C227 111 226 166 200 207Z" fill={`url(#${id}-petal)`} stroke="#c2efdf" strokeOpacity=".22" strokeWidth=".8"/>
        <path d="M200 198C182 150 177 91 184 58" fill="none" stroke="#e4fff3" strokeOpacity=".35" strokeWidth="1"/>
      </g>)}
      <circle cx="200" cy="200" r="54" fill={`url(#${id}-core)`}/>
      <circle cx="200" cy="200" r="47" fill="none" stroke="#d8fff1" strokeOpacity=".3"/>
    </g>
  </svg>;
}

/** A static iris study, not an anatomical prediction from the risk index. */
export function IrisStudy() {
  const id = useId();
  return <svg className="vision-eye-diagram" viewBox="0 0 500 310" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-white`} cx="42%" cy="35%"><stop stopColor="#f6f9ed"/><stop offset=".7" stopColor="#d8e7dc"/><stop offset="1" stopColor="#6e928b"/></radialGradient>
      <radialGradient id={`${id}-iris`}><stop offset=".25" stopColor="#233f3a"/><stop offset=".47" stopColor="#c1b583"/><stop offset=".65" stopColor="#739c86"/><stop offset=".9" stopColor="#315e54"/><stop offset="1" stopColor="#173d38"/></radialGradient>
      <clipPath id={`${id}-eye`}><path d="M34 160Q133 40 250 64Q373 43 466 160Q355 265 250 245Q135 265 34 160Z"/></clipPath>
    </defs>
    <g clipPath={`url(#${id}-eye)`}>
      <path d="M34 160Q133 40 250 64Q373 43 466 160Q355 265 250 245Q135 265 34 160Z" fill={`url(#${id}-white)`}/>
      <circle cx="252" cy="155" r="96" fill={`url(#${id}-iris)`}/>
      {Array.from({length:96},(_,i)=>{
        const a=i*Math.PI/48, start=37+(i%7)*1.7, end=83+(i%5)*2;
        const point = (radius: number, angle: number) => `${(252 + Math.cos(angle) * radius).toFixed(3)} ${(155 + Math.sin(angle) * radius).toFixed(3)}`;
        return <path key={i} d={`M${point(start,a)}Q${point(65,a+.05)} ${point(end,a)}`} fill="none" stroke={i%3 ? "#c0d0a1" : "#173d38"} strokeOpacity={i%3 ? ".48" : ".65"} strokeWidth={i%3 ? "1" : "1.8"}/>;
      })}
      <circle cx="252" cy="155" r="35" fill="#071e20"/>
      <ellipse cx="228" cy="117" rx="21" ry="12" transform="rotate(-28 228 117)" fill="#fff" opacity=".78"/>
      <circle cx="279" cy="181" r="7" fill="#fff" opacity=".3"/>
      <path d="M30 159Q145 31 250 60Q378 42 470 159" fill="none" stroke="#173c36" strokeOpacity=".5" strokeWidth="13"/>
    </g>
    <path d="M34 160Q133 40 250 64Q373 43 466 160" fill="none" stroke="#a2c8b3" strokeWidth="3"/>
    <path d="M34 160Q135 265 250 245Q355 265 466 160" fill="none" stroke="#41695e" strokeWidth="2"/>
  </svg>;
}

export function ReceptorStudy({ load, hasCaffeine }: { load: number; hasCaffeine: boolean }) {
  const id=useId();
  return <svg className="receptor-study" viewBox="0 0 660 240" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-membrane`} x2="0" y2="1"><stop stopColor="#5b7773"/><stop offset=".12" stopColor="#314b4b"/><stop offset="1" stopColor="#162b30"/></linearGradient>
      <linearGradient id={`${id}-socket`} x2="1" y2="1"><stop stopColor="#a4c6bb"/><stop offset=".45" stopColor="#547f76"/><stop offset="1" stopColor="#264b46"/></linearGradient>
      <radialGradient id={`${id}-molecule`} cx="30%" cy="25%"><stop stopColor="#fff1c0"/><stop offset=".45" stopColor="#dfba6c"/><stop offset="1" stopColor="#976d38"/></radialGradient>
    </defs>
    <path d="M0 153Q160 130 330 153T660 153V240H0Z" fill={`url(#${id}-membrane)`}/>
    {Array.from({length:44},(_,i)=><g key={i} opacity=".24"><path d={`M${i*16} 166v29m5-26v29`} stroke="#c3d9cb" strokeWidth="2"/><circle cx={i*16+2} cy="164" r="4" fill="#a8cab7"/></g>)}
    {[110,330,550].map((x,i)=>{
      const occupied=i<Math.ceil(load*3);
      return <g key={x}>
        <ellipse cx={x} cy="190" rx="58" ry="11" fill="#091b20" opacity=".5"/>
        <path d={`M${x-37} 185L${x-44} 122Q${x-44} 109 ${x-29} 106L${x-19} 129Q${x} 143 ${x+19} 129L${x+29} 106Q${x+44} 109 ${x+44} 122L${x+37} 185Q${x} 202 ${x-37} 185Z`} fill={`url(#${id}-socket)`} stroke="#b5d3be" strokeOpacity=".3"/>
        <path d={`M${x-28} 118Q${x} 153 ${x+28} 118`} fill="none" stroke="#132d2c" strokeWidth="6" strokeLinecap="round"/>
        {hasCaffeine && <g className={occupied ? "receptor-bound" : "receptor-free"} style={{"--drift-delay":`${i*-.7}s`} as CSSProperties}>
          <path d={`M${x} ${occupied?93:50}l20 12v23l-20 12-20-12v-23Z`} fill={`url(#${id}-molecule)`} stroke="#f3dca1" strokeWidth="1.5"/>
          <circle cx={x-6} cy={occupied?107:64} r="4" fill="#fff8dd" opacity=".65"/>
        </g>}
      </g>;
    })}
  </svg>;
}
