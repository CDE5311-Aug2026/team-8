import DevBadge from './DevBadge';
import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { categories, fieldLabels, fieldNames, validateAnalysis, type Analysis, type FieldName } from '../shared/analysis';

export type ProductInfo = Record<FieldName, string>;
export function emptyInfo(): ProductInfo { return Object.fromEntries(fieldNames.map(key => [key, ''])) as ProductInfo; }
export default function ProductScanner({ onUse, onSample }: { onUse: (info: ProductInfo, photo: string) => void; onSample: () => void }) {
  const [photo, setPhoto] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [values, setValues] = useState<ProductInfo>(emptyInfo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [reading, setReading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const active = useRef<AbortController | null>(null);
  const readerRef = useRef<FileReader | null>(null);
  useEffect(() => () => { active.current?.abort(); readerRef.current?.abort(); }, []);
  async function analyze() {
    if (!photo || busy) return;
    active.current?.abort(); const controller = new AbortController(); active.current = controller;
    setBusy(true); setError(''); setAnalysis(null); setConfirmed(false);
    const timeout = window.setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Scan-Token': token } : {}) }, body: JSON.stringify({ image: photo }), signal: controller.signal });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'Photo analysis is unavailable. Please try again or enter details manually.');
      const result = validateAnalysis(payload?.analysis); setAnalysis(result);
      setValues(Object.fromEntries(fieldNames.map(key => [key, result.fields[key].value || ''])) as ProductInfo);
    } catch (err) {
      if (active.current === controller) setError(err instanceof Error && err.name === 'AbortError' ? 'Analysis stopped. You can retry or enter details manually.' : err instanceof Error ? err.message : 'Photo analysis failed.');
    } finally { clearTimeout(timeout); if (active.current === controller) { setBusy(false); active.current = null; } }
  }
  function select(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { setError('Choose a JPG, PNG or WebP photo smaller than 2 MB.'); return; }
    readerRef.current?.abort(); active.current?.abort(); active.current = null; setBusy(false); setError(''); setAnalysis(null); setConfirmed(false); setReading(true);
    const reader = new FileReader(); readerRef.current = reader;
    reader.onload = () => { setPhoto(String(reader.result)); setReading(false); };
    reader.onerror = () => { setError('We could not open this photo. Please choose another.'); setReading(false); };
    reader.readAsDataURL(file);
  }
  return <section aria-label="Product photo analysis">
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { select(e.target.files?.[0]); e.target.value = ''; }} />
    <input ref={camera} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={e => { select(e.target.files?.[0]); e.target.value = ''; }} />
    {photo ? <div className="scan-photo"><img src={photo} alt="Selected product to analyze" />{busy && <><span className="scan-badge">✦ AI</span><div className="scan-line" /></>}</div> : <button className="photo-drop" onClick={() => input.current?.click()}><span className="camera-circle"><Camera size={44} strokeWidth={1.4} /></span><span>Add a clear photo of your product or its label</span></button>}
    <div className="two-buttons"><button className="button secondary" disabled={busy || reading} onClick={() => camera.current?.click()}>Take a photo</button><button className="button secondary" disabled={busy || reading} onClick={() => input.current?.click()}>Upload a photo</button></div>
    <div className="ai-callout"><strong>✦ Farmily AI</strong><p>Have a label? We’ll read its details. No label? We’ll suggest basic product information. You’ll check everything before using it.</p></div>
    <p className="fine-print">When you choose Analyze photo, this image is sent to OpenAI for analysis. Missing information stays blank.</p>
    <details className="scan-access"><summary><DevBadge/> Demo scan access code</summary><label className="field"><span>Scan access code</span><input type="password" autoComplete="off" value={token} onChange={e => setToken(e.target.value)} /></label></details>
    {error && <div className="scan-error" role="alert">{error}</div>}
    <div aria-live="polite">{reading && <p>Opening photo…</p>}{busy && <p>Reading your photo… This may take a moment.</p>}</div>
    {busy ? <button className="button secondary" onClick={() => active.current?.abort()}>Cancel analysis</button> : photo && <button className="button primary" disabled={reading} onClick={() => void analyze()}>{analysis ? 'Analyze again' : 'Analyze photo'}</button>}
    {analysis && <section className="card scan-review" aria-labelledby="scan-review-title">
      <h2 id="scan-review-title">Review photo results</h2>
      <span className="badge">{analysis.mode === 'label' ? 'Label detected' : analysis.mode === 'visual' ? 'Visual suggestions' : 'Product unclear'}</span>
      <small>AI certainty: {analysis.confidence}. Please verify all details.</small>
      {analysis.questions.length > 0 && <div className="scan-questions"><strong>A little more information</strong>{analysis.questions.map((q, i) => <p key={i}>{q}</p>)}<small>Answer these by editing the fields below, or try another photo.</small></div>}
      {analysis.warnings.map((warning, i) => <p className="fine-print" key={i}>{warning}</p>)}
      {fieldNames.map(key => <label className="field" key={key}><span>{fieldLabels[key]}</span>{key === 'category' ? <select value={values.category} onChange={e => { setValues(v => ({ ...v, category: e.target.value })); setConfirmed(false); }}><option value="">Choose a category</option>{categories.map(category => <option key={category}>{category}</option>)}</select> : <textarea rows={key === 'ingredients' || key === 'nutrition' ? 3 : 2} value={values[key]} placeholder="Not identified — add if known" onChange={e => { setValues(v => ({ ...v, [key]: e.target.value })); setConfirmed(false); }} />}<small>{analysis.fields[key].source === 'label' ? `Read from label: “${analysis.fields[key].evidence || analysis.fields[key].value}”` : analysis.fields[key].source === 'visual' ? 'Suggested from appearance — confirm or correct' : 'Not identified from this photo'}</small></label>)}
      <label className="check-row"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I’ve reviewed these suggestions. Missing ingredients, allergens and dates still need checking.</label>
      <button className="button primary" disabled={!confirmed || !values.name.trim()} onClick={() => onUse(values, photo)}>Use reviewed details</button>
    </section>}
    {!busy && <div className="actions"><button className="button secondary" disabled={reading} onClick={() => onUse(emptyInfo(), photo)}>Enter details manually</button>{!photo && <button className="text-button" onClick={onSample}><DevBadge/> Explore with sample data</button>}</div>}
  </section>;
}
