export default function FutureCard({text,onClose}:{text:string;onClose:()=>void}){
 const save=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const x=c.getContext('2d')!
  const g=x.createLinearGradient(0,0,640,360);g.addColorStop(0,'#4f46e5');g.addColorStop(1,'#c026d3');x.fillStyle=g;x.fillRect(0,0,640,360)
  x.fillStyle='#fff';x.font='bold 30px sans-serif';x.fillText('🪐 ORBIT Future Card',30,60);x.font='20px sans-serif'
  const words=text.split(' ');let line='',y=120;for(const w of words){if(x.measureText(line+w).width>580){x.fillText(line,30,y);y+=30;line=''}line+=w+' '}
  x.fillText(line,30,y);x.font='14px sans-serif';x.fillText('What happens to my month if I do this?',30,330)
  const a=document.createElement('a');a.download='orbit-future-card.png';a.href=c.toDataURL('image/png');a.click()}
 return <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-2xl p-4 text-white"><b>🪐 Future Card</b><p>{text}</p>
  <button className="underline text-sm mr-4" onClick={save}>Download image</button><button className="underline text-sm" onClick={onClose}>close</button></div>}
