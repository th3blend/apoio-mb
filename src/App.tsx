import { useRef, useState } from 'react';
import { Download, ImagePlus, Minus, Plus, RotateCcw, Share2 } from 'lucide-react';

const MATRIX = `${import.meta.env.BASE_URL}assets/matriz-apoio-digital.png`;

export default function App() {
  const input = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string>();
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState('');
  const userAgent = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);

  function choose(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage('Escolha um arquivo de imagem válido.'); return; }
    const reader = new FileReader();
    reader.onerror = () => setMessage('Não foi possível ler essa imagem.');
    reader.onload = () => { setPhoto(String(reader.result)); setMessage(''); };
    reader.readAsDataURL(file);
  }

  function download() {
    if (!photo) { setMessage('Escolha sua foto antes de baixar a arte.'); return; }
    setMessage('Preparando sua arte…');
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1440;
    const ctx = canvas.getContext('2d')!; const matrix = new Image(); matrix.src = MATRIX;
    matrix.onload = () => { ctx.drawImage(matrix, 0, 0, 1080, 1440); const image = new Image(); image.src = photo; image.onload = () => {
      ctx.save(); ctx.beginPath(); ctx.arc(320, 407, 227, 0, Math.PI * 2); ctx.clip();
      const size = Math.max(454 / image.width, 454 / image.height) * zoom; const w = image.width * size, h = image.height * size;
      ctx.drawImage(image, 320 - w / 2, 407 - h / 2, w, h); ctx.restore(); canvas.toBlob(async blob => { if (!blob) { setMessage('Não foi possível preparar a arte.'); return; } const file = new File([blob], 'minha-arte-de-apoio.png', { type: 'image/png' });
        if (isIOS && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) { try { await navigator.share({ files: [file], title: 'Minha arte de apoio' }); setMessage('Escolha “Salvar imagem” no menu de compartilhamento.'); } catch { setMessage('Arte pronta. Escolha “Salvar imagem” para guardar na galeria.'); } return; }
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'minha-arte-de-apoio.png'; a.click(); URL.revokeObjectURL(url); setMessage(isAndroid ? 'Arte salva. Confira a pasta de downloads ou sua galeria.' : 'Arte pronta! O download foi iniciado.');
      }, 'image/png');
    }; };
  }

  return <main className={photo ? 'editing' : 'welcome'}><header><span className="mark">♥</span><div><h1>Faça sua arte de apoio</h1><p>Escolha sua foto, ajuste como preferir e salve a arte no seu celular.</p></div></header>
    <input ref={input} hidden type="file" accept="image/*" onChange={e => choose(e.target.files?.[0])}/>
    {!photo ? <section className="welcome-card"><div className="welcome-icon"><ImagePlus/></div><h2>Escolha uma foto</h2><p>Selecione uma imagem para começar.</p><button className="primary hero-button" onClick={() => input.current?.click()}><ImagePlus/> Escolher minha foto</button></section> : <>
      <section className="preview">{<div className="photo-window"><img className="photo" src={photo} alt="Sua foto" style={{ transform: `scale(${zoom})` }} /></div>}<img className="matrix" src={MATRIX} alt="Prévia da matriz da arte" /></section>
      <section className="controls"><button className="secondary" onClick={() => input.current?.click()}><ImagePlus/> Trocar foto</button><div className="zoom"><button aria-label="Reduzir zoom" onClick={() => setZoom(Math.max(1, zoom - .1))}><Minus/></button><input aria-label="Zoom" type="range" min="1" max="3" step=".05" value={zoom} onChange={e => setZoom(+e.target.value)}/><button aria-label="Aumentar zoom" onClick={() => setZoom(Math.min(3, zoom + .1))}><Plus/></button></div><button className="secondary" onClick={() => setZoom(1)}><RotateCcw/> Centralizar foto</button></section>
      <button className="download floating-download" onClick={download}><Download/> {isIOS ? 'Salvar na galeria' : 'Baixar minha arte'}</button></>}
      {message && <p className="message" role="status">{message}</p>}<small>Sua foto não é enviada para nenhum servidor. Todo o processamento acontece neste dispositivo.</small></main>;
}
