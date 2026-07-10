"use client";

import { useEffect, useMemo, useState } from "react";

type Need = { id: string; name: string; importance: number; current: number; target: number };
type Response = { id: string; name: string; direction: "up" | "down" | "target"; unit: string; target: string };
type Project = { name: string; product: string; owner: string };

const newId = () => Math.random().toString(36).slice(2, 9);
const seedNeeds: Need[] = [
  { id: "n1", name: "Easy to learn", importance: 5, current: 3, target: 5 },
  { id: "n2", name: "Fast to complete", importance: 5, current: 2, target: 5 },
  { id: "n3", name: "Reliable results", importance: 4, current: 3, target: 5 },
  { id: "n4", name: "Simple to share", importance: 3, current: 2, target: 4 },
];
const seedResponses: Response[] = [
  { id: "r1", name: "Onboarding time", direction: "down", unit: "minutes", target: "≤ 5" },
  { id: "r2", name: "Steps per analysis", direction: "down", unit: "steps", target: "≤ 8" },
  { id: "r3", name: "Validation coverage", direction: "up", unit: "%", target: "≥ 95" },
  { id: "r4", name: "Export formats", direction: "up", unit: "count", target: "≥ 3" },
];
const seedRelations = [[9, 3, 1, 0], [1, 9, 3, 1], [3, 1, 9, 1], [0, 1, 3, 9]];
const relationValues = [0, 1, 3, 9];

export default function Home() {
  const [project, setProject] = useState<Project>({ name: "Digital Service Redesign", product: "Customer portal", owner: "Product & Quality Team" });
  const [needs, setNeeds] = useState(seedNeeds);
  const [responses, setResponses] = useState(seedResponses);
  const [relations, setRelations] = useState(seedRelations);
  const [view, setView] = useState<"matrix" | "priorities">("matrix");
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("qfd-workspace-v2");
    if (!saved) return;
    try { const data = JSON.parse(saved); setProject(data.project); setNeeds(data.needs); setResponses(data.responses); setRelations(data.relations); } catch { /* use sample */ }
  }, []);

  const scores = useMemo(() => responses.map((_, c) => needs.reduce((sum, need, r) => sum + need.importance * (relations[r]?.[c] || 0), 0)), [needs, responses, relations]);
  const maxScore = Math.max(...scores, 1);
  const completion = Math.round(((needs.filter(n => n.name.trim()).length + responses.filter(r => r.name.trim()).length) / Math.max(needs.length + responses.length, 1)) * 100);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 1800); };
  const save = () => { localStorage.setItem("qfd-workspace-v2", JSON.stringify({ project, needs, responses, relations })); notify("Project saved to this browser"); };
  const cycle = (row: number, col: number) => setRelations(current => current.map((line, r) => line.map((value, c) => r === row && c === col ? relationValues[(relationValues.indexOf(value) + 1) % relationValues.length] : value)));
  const addNeed = () => { setNeeds(v => [...v, { id: newId(), name: "New customer need", importance: 3, current: 2, target: 4 }]); setRelations(v => [...v, responses.map(() => 0)]); };
  const removeNeed = (index: number) => { if (needs.length === 1) return; setNeeds(v => v.filter((_, i) => i !== index)); setRelations(v => v.filter((_, i) => i !== index)); };
  const addResponse = () => { setResponses(v => [...v, { id: newId(), name: "New technical response", direction: "up", unit: "measure", target: "TBD" }]); setRelations(v => v.map(row => [...row, 0])); };
  const removeResponse = (index: number) => { if (responses.length === 1) return; setResponses(v => v.filter((_, i) => i !== index)); setRelations(v => v.map(row => row.filter((_, i) => i !== index))); };
  const reset = () => { setProject({ name: "Digital Service Redesign", product: "Customer portal", owner: "Product & Quality Team" }); setNeeds(seedNeeds); setResponses(seedResponses); setRelations(seedRelations); localStorage.removeItem("qfd-workspace-v2"); notify("Sample restored"); };
  const exportCsv = () => {
    const rows = [["Customer need", "Importance", "Current", "Target", ...responses.map(r => r.name)], ...needs.map((n, i) => [n.name, n.importance, n.current, n.target, ...relations[i]]), ["Weighted priority", "", "", "", ...scores]];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const a = document.createElement("a"); a.href = url; a.download = `${project.name.toLowerCase().replaceAll(" ", "-")}-qfd.csv`; a.click(); URL.revokeObjectURL(url); notify("CSV exported");
  };

  return <div className="appShell">
    <aside>
      <div className="logo"><span>Q</span><div><b>QFD Studio</b><small>House of Quality</small></div></div>
      <div className="projectMini"><small>ACTIVE PROJECT</small><strong>{project.name}</strong><span>{completion}% configured</span><i><b style={{ width: `${completion}%` }} /></i></div>
      <nav>
        <p>BUILD</p><button className="active"><span>01</span>House of Quality</button><button onClick={() => setView("priorities")}><span>02</span>Priority analysis</button>
        <p>REFERENCE</p><a href="https://asq.org/quality-resources/qfd-quality-function-deployment" target="_blank" rel="noreferrer"><span>↗</span>ASQ methodology</a>
      </nav>
      <div className="sidebarFoot"><button onClick={() => setHelp(true)}>?</button><div><b>Need help?</b><small>Open the quick guide</small></div></div>
    </aside>

    <main>
      <header><div><div className="crumb">PROJECTS <span>/</span> {project.name.toUpperCase()}</div><h1>House of Quality</h1></div><div className="headerActions"><button className="ghost" onClick={reset}>Reset</button><button className="ghost" onClick={exportCsv}>Export CSV</button><button className="primary" onClick={save}>Save project</button></div></header>

      <section className="projectCard">
        <label>Project name<input value={project.name} onChange={e => setProject({ ...project, name: e.target.value })} /></label>
        <label>Product or service<input value={project.product} onChange={e => setProject({ ...project, product: e.target.value })} /></label>
        <label>Project owner<input value={project.owner} onChange={e => setProject({ ...project, owner: e.target.value })} /></label>
        <div className="status"><span>Draft</span><small>Saved locally</small></div>
      </section>

      <div className="viewTabs"><button className={view === "matrix" ? "active" : ""} onClick={() => setView("matrix")}>Relationship matrix</button><button className={view === "priorities" ? "active" : ""} onClick={() => setView("priorities")}>Priority analysis <span>{responses.length}</span></button></div>

      {view === "matrix" ? <>
        <section className="panel introPanel"><div><span className="kicker">STEP 1–3</span><h2>Connect customer needs to technical responses</h2><p>Edit the labels, set importance, then click each relationship cell to cycle through none, weak, moderate, and strong.</p></div><div className="legend"><span><i className="strong">9</i>Strong</span><span><i className="medium">3</i>Moderate</span><span><i className="weak">1</i>Weak</span><span><i>—</i>None</span></div></section>
        <section className="matrixPanel">
          <div className="matrixScroll"><table>
            <thead><tr><th className="needCol"><small>WHATs</small>Customer needs</th><th className="rateCol">Importance</th><th className="rateCol">Current</th><th className="rateCol">Target</th>{responses.map((response, i) => <th className="responseCol" key={response.id}><button className="remove" title="Remove response" onClick={() => removeResponse(i)}>×</button><textarea value={response.name} aria-label={`Technical response ${i + 1}`} onChange={e => setResponses(responses.map((r, x) => x === i ? { ...r, name: e.target.value } : r))} /><select value={response.direction} onChange={e => setResponses(responses.map((r, x) => x === i ? { ...r, direction: e.target.value as Response["direction"] } : r))}><option value="up">↑ Maximize</option><option value="down">↓ Minimize</option><option value="target">◎ Target</option></select></th>)}</tr></thead>
            <tbody>{needs.map((need, row) => <tr key={need.id}><th><button className="remove" title="Remove need" onClick={() => removeNeed(row)}>×</button><input value={need.name} aria-label={`Customer need ${row + 1}`} onChange={e => setNeeds(needs.map((n, i) => i === row ? { ...n, name: e.target.value } : n))} /></th>{(["importance", "current", "target"] as const).map(field => <td className="rating" key={field}><select value={need[field]} onChange={e => setNeeds(needs.map((n, i) => i === row ? { ...n, [field]: Number(e.target.value) } : n))}>{[1,2,3,4,5].map(v => <option key={v}>{v}</option>)}</select></td>)}{responses.map((response, col) => { const value = relations[row]?.[col] || 0; return <td className="relationCell" key={response.id}><button className={`relation v${value}`} onClick={() => cycle(row, col)} aria-label={`${value || "No"} relationship between ${need.name} and ${response.name}`}>{value || "—"}</button></td>})}</tr>)}</tbody>
            <tfoot><tr className="targetRow"><th>Technical target</th><td colSpan={3}></td>{responses.map((response, i) => <td key={response.id}><input value={response.target} onChange={e => setResponses(responses.map((r, x) => x === i ? { ...r, target: e.target.value } : r))} aria-label={`Target for ${response.name}`} /></td>)}</tr><tr className="scoreRow"><th>Weighted priority</th><td colSpan={3}></td>{scores.map((score, i) => <td key={responses[i].id}><b>{score}</b><i><span style={{ width: `${score / maxScore * 100}%` }} /></i></td>)}</tr></tfoot>
          </table></div>
          <div className="matrixActions"><button onClick={addNeed}>＋ Add customer need</button><button onClick={addResponse}>＋ Add technical response</button></div>
        </section>
      </> : <section className="analysisGrid">
        <div className="panel analysisLead"><span className="kicker">CALCULATED PRIORITIES</span><h2>Where should the team focus?</h2><p>Scores combine customer importance and relationship strength. Higher scores indicate technical responses with greater potential customer impact.</p><div className="metric"><strong>{scores.reduce((a,b) => a+b, 0)}</strong><span>Total weighted points</span></div></div>
        <div className="panel ranking"><h3>Technical response ranking</h3>{scores.map((score, i) => ({ score, response: responses[i] })).sort((a,b) => b.score-a.score).map((item, rank) => <article key={item.response.id}><span className="rank">{rank + 1}</span><div><b>{item.response.name}</b><small>{item.response.direction === "up" ? "Maximize" : item.response.direction === "down" ? "Minimize" : "Hit target"} · Target {item.response.target}</small><i><span style={{ width: `${item.score / maxScore * 100}%` }} /></i></div><strong>{item.score}</strong></article>)}</div>
        <div className="panel gaps"><h3>Customer satisfaction gaps</h3>{needs.map(n => <article key={n.id}><div><b>{n.name}</b><small>Current {n.current} → Target {n.target}</small></div><strong className={n.target - n.current >= 2 ? "highGap" : ""}>+{n.target - n.current}</strong></article>)}</div>
      </section>}

      <footer><span>QFD Studio</span><p>Methodology informed by public American Society for Quality resources. Independent tool; not affiliated with or endorsed by ASQ.</p></footer>
    </main>

    {toast && <div className="toast">✓ {toast}</div>}
    {help && <div className="modalBack" onClick={() => setHelp(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="modalClose" onClick={() => setHelp(false)}>×</button><span className="kicker">QUICK GUIDE</span><h2>Build your House of Quality</h2><ol><li><b>Capture customer needs.</b> Use the customer’s language and assign importance from 1–5.</li><li><b>Define technical responses.</b> Add measurable characteristics your team can influence.</li><li><b>Map relationships.</b> Click a matrix cell: weak (1), moderate (3), or strong (9).</li><li><b>Act on priorities.</b> Review the calculated ranking and set measurable targets.</li></ol><button className="primary" onClick={() => setHelp(false)}>Start building</button></div></div>}
  </div>;
}
