"use client";

import { useEffect, useMemo, useState } from "react";

type Need = { id: number; name: string; importance: number };
type Technical = { id: number; name: string; direction: "up" | "down" | "target"; target: string };

const sampleNeeds: Need[] = [
  { id: 1, name: "Easy to learn", importance: 5 },
  { id: 2, name: "Fast to complete", importance: 4 },
  { id: 3, name: "Reliable results", importance: 5 },
  { id: 4, name: "Easy to share", importance: 3 },
];

const sampleTechnical: Technical[] = [
  { id: 1, name: "Onboarding time", direction: "down", target: "< 5 min" },
  { id: 2, name: "Steps per analysis", direction: "down", target: "≤ 8" },
  { id: 3, name: "Validation coverage", direction: "up", target: "≥ 95%" },
  { id: 4, name: "Export formats", direction: "up", target: "3" },
];

const initialRelations = [
  [9, 3, 1, 0],
  [1, 9, 3, 1],
  [1, 3, 9, 1],
  [0, 1, 1, 9],
];

const relationLabel: Record<number, string> = { 0: "None", 1: "Weak", 3: "Moderate", 9: "Strong" };

export default function Home() {
  const [needs, setNeeds] = useState(sampleNeeds);
  const [technical, setTechnical] = useState(sampleTechnical);
  const [relations, setRelations] = useState(initialRelations);
  const [projectName, setProjectName] = useState("Digital service concept");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("qfd-project");
    if (!stored) return;
    try {
      const data = JSON.parse(stored);
      setNeeds(data.needs || sampleNeeds);
      setTechnical(data.technical || sampleTechnical);
      setRelations(data.relations || initialRelations);
      setProjectName(data.projectName || "Digital service concept");
    } catch { /* keep the guided sample */ }
  }, []);

  const scores = useMemo(() => technical.map((_, col) =>
    needs.reduce((total, need, row) => total + need.importance * (relations[row]?.[col] || 0), 0)
  ), [needs, technical, relations]);
  const maxScore = Math.max(...scores, 1);

  function cycleRelation(row: number, col: number) {
    const values = [0, 1, 3, 9];
    setRelations(current => current.map((line, r) => line.map((value, c) =>
      r === row && c === col ? values[(values.indexOf(value) + 1) % values.length] : value
    )));
  }

  function saveProject() {
    localStorage.setItem("qfd-project", JSON.stringify({ projectName, needs, technical, relations }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function resetSample() {
    setNeeds(sampleNeeds); setTechnical(sampleTechnical); setRelations(initialRelations);
    setProjectName("Digital service concept"); localStorage.removeItem("qfd-project");
  }

  function exportCsv() {
    const rows = [["Customer need", "Importance", ...technical.map(t => t.name)],
      ...needs.map((n, i) => [n.name, n.importance, ...relations[i]]),
      ["Weighted priority", "", ...scores]];
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "house-of-quality.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brandMark">Q</span><div><b>Quality Function Deployment</b><small>Voice of customer → design priorities</small></div></div>
        <nav aria-label="Primary"><a href="#workspace">Workspace</a><a href="#method">Method</a></nav>
        <button className="save" onClick={saveProject}>{saved ? "Saved ✓" : "Save project"}</button>
      </header>

      <section className="hero">
        <div className="eyebrow">HOUSE OF QUALITY BUILDER</div>
        <h1>Turn customer needs into<br/><em>clear design decisions.</em></h1>
        <p>Build a focused Quality Function Deployment matrix, reveal the strongest technical priorities, and keep your team aligned on what customers value most.</p>
        <div className="heroActions"><a className="primary" href="#workspace">Open the workspace <span>→</span></a><a className="textLink" href="#method">How QFD works</a></div>
        <div className="heroStats"><div><strong>{needs.length}</strong><span>customer needs</span></div><div><strong>{technical.length}</strong><span>technical responses</span></div><div><strong>{scores.reduce((a,b)=>a+b,0)}</strong><span>weighted relationship points</span></div></div>
      </section>

      <section className="workspace" id="workspace">
        <div className="sectionHead"><div><span className="step">LIVE WORKSPACE</span><h2>Your House of Quality</h2><p>Click relationship cells to cycle through none, weak, moderate, and strong.</p></div><div className="toolbar"><button onClick={resetSample}>Reset sample</button><button onClick={exportCsv}>Export CSV ↓</button></div></div>
        <div className="projectLine"><label>Project</label><input value={projectName} onChange={e=>setProjectName(e.target.value)} aria-label="Project name"/><span>Local draft</span></div>
        <div className="matrixWrap">
          <table className="matrix">
            <thead><tr><th className="needHeading">Voice of the customer</th><th className="importanceHeading">Importance</th>{technical.map((t, i)=><th key={t.id}><textarea aria-label={`Technical response ${i+1}`} value={t.name} onChange={e=>setTechnical(technical.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/><span className="direction">{t.direction === "up" ? "↑ Maximize" : t.direction === "down" ? "↓ Minimize" : "◎ Target"}</span></th>)}</tr></thead>
            <tbody>{needs.map((need,row)=><tr key={need.id}><th><input aria-label={`Customer need ${row+1}`} value={need.name} onChange={e=>setNeeds(needs.map((n,i)=>i===row?{...n,name:e.target.value}:n))}/></th><td><select value={need.importance} onChange={e=>setNeeds(needs.map((n,i)=>i===row?{...n,importance:Number(e.target.value)}:n))} aria-label={`Importance of ${need.name}`}>{[1,2,3,4,5].map(v=><option key={v}>{v}</option>)}</select></td>{technical.map((_,col)=><td key={col}><button className={`relation r${relations[row]?.[col] || 0}`} onClick={()=>cycleRelation(row,col)} aria-label={`${relationLabel[relations[row]?.[col] || 0]} relationship between ${need.name} and ${technical[col].name}`}>{relations[row]?.[col] || "·"}</button></td>)}</tr>)}</tbody>
            <tfoot><tr><th>Target</th><td></td>{technical.map((t,i)=><td key={t.id}><input aria-label={`Target for ${t.name}`} value={t.target} onChange={e=>setTechnical(technical.map((x,j)=>j===i?{...x,target:e.target.value}:x))}/></td>)}</tr><tr className="scoreRow"><th>Weighted priority</th><td></td>{scores.map((s,i)=><td key={i}><strong>{s}</strong><span className="bar"><i style={{width:`${(s/maxScore)*100}%`}}/></span></td>)}</tr></tfoot>
          </table>
        </div>
        <div className="legend"><span><i className="dot r9">9</i> Strong</span><span><i className="dot r3">3</i> Moderate</span><span><i className="dot r1">1</i> Weak</span><span><i className="dot r0">·</i> None</span><small>Priority = importance × relationship strength</small></div>
      </section>

      <section className="insights">
        <div><span className="step">PRIORITY SIGNAL</span><h2>Focus effort where it matters.</h2><p>The weighted scores combine customer importance with relationship strength. The highest scoring technical response deserves the earliest team attention.</p></div>
        <ol>{scores.map((score,i)=>({score,name:technical[i].name,index:i})).sort((a,b)=>b.score-a.score).map((item,rank)=><li key={item.index}><b>0{rank+1}</b><span><strong>{item.name}</strong><small>{item.score} weighted points</small></span><div className="rankBar"><i style={{width:`${item.score/maxScore*100}%`}}/></div></li>)}</ol>
      </section>

      <section className="method" id="method">
        <div className="methodIntro"><span className="step">THE METHOD</span><h2>Customer voice,<br/>deployed with discipline.</h2><p>ASQ describes QFD as a focused methodology for listening carefully to the voice of the customer and responding to those needs through the responsible organizational functions.</p><a href="https://asq.org/quality-resources/qfd-quality-function-deployment" target="_blank" rel="noreferrer">Read the ASQ reference ↗</a></div>
        <div className="methodSteps"><article><b>01</b><h3>Listen</h3><p>Capture customer wows, wants, and musts in their own language.</p></article><article><b>02</b><h3>Translate</h3><p>Define measurable technical responses the team can influence.</p></article><article><b>03</b><h3>Relate</h3><p>Assess how strongly each response supports each customer need.</p></article><article><b>04</b><h3>Prioritize</h3><p>Use weighted evidence and targets to focus the work.</p></article></div>
      </section>

      <footer><div className="brand"><span className="brandMark">Q</span><div><b>Quality Function Deployment</b><small>Built for customer-driven teams</small></div></div><p>Methodology informed by public resources from the American Society for Quality. This independent tool is not affiliated with or endorsed by ASQ.</p></footer>
    </main>
  );
}
