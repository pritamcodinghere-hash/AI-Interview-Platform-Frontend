import { useMemo } from "react";

function parseArray(str) {
  if (!str) return null;
  try {
    let s = str.trim();
    const m = s.match(/\[[\s\S]*\]/);
    if (!m) return null;
    s = m[0].replace(/'/g, '"').replace(/\bnull\b/gi, "null");
    return JSON.parse(s);
  } catch { return null; }
}

function buildTree(arr) {
  if (!arr || !arr.length || arr[0] === null) return null;
  const root = { val: arr[0], left: null, right: null };
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (i < arr.length) { const v = arr[i++]; if (v !== null) { node.left = { val: v, left: null, right: null }; queue.push(node.left); } }
    if (i < arr.length) { const v = arr[i++]; if (v !== null) { node.right = { val: v, left: null, right: null }; queue.push(node.right); } }
  }
  return root;
}

function layoutTree(root) {
  const nodes = [], edges = [];
  let minX = 0, maxX = 0;
  function dfs(node, depth, x) {
    if (!node) return;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    nodes.push({ val: node.val, x, depth });
    if (node.left) { edges.push({ x1: x, y1: depth, x2: x - 1, y2: depth + 1 }); dfs(node.left, depth + 1, x - 1); }
    if (node.right) { edges.push({ x1: x, y1: depth, x2: x + 1, y2: depth + 1 }); dfs(node.right, depth + 1, x + 1); }
  }
  dfs(root, 0, 0);
  return { nodes, edges, minX, maxX };
}

// === Diagram Components ===

function TreeDiagram({ data }) {
  const layout = useMemo(() => { const t = buildTree(data); return t ? layoutTree(t) : null; }, [data]);
  if (!layout || !layout.nodes.length) return null;
  const { nodes, edges, minX, maxX } = layout;
  const spanX = maxX - minX + 1;
  const maxDepth = Math.max(...nodes.map(n => n.depth));
  const R = 15, GAP = 44, PAD = 24;
  const W = spanX * GAP + PAD * 2, H = (maxDepth + 1) * GAP + PAD * 2;
  const sx = x => PAD + (x - minX + 0.5) * GAP, sy = d => PAD + (d + 0.5) * GAP;
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {edges.map((e, i) => <line key={i} x1={sx(e.x1)} y1={sy(e.y1)} x2={sx(e.x2)} y2={sy(e.y2)} stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />)}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={sx(n.x)} cy={sy(n.depth)} r={R} fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <text x={sx(n.x)} y={sy(n.depth) + 4} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600" fontFamily="monospace">{n.val}</text>
        </g>
      ))}
    </svg>
  );
}

function MatrixDiagram({ data, charMode }) {
  if (!Array.isArray(data) || !data.length || !Array.isArray(data[0])) return null;
  const R = data.length, C = data[0].length;
  const cell = Math.max(28, Math.min(40, Math.floor(360 / C)));
  const W = C * cell + 2, H = R * cell + 2;
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {data.map((row, r) => row.map((v, c) => {
        const x = c * cell + 1, y = r * cell + 1;
        let fill = "#1e293b", stroke = "#334155";
        if (charMode || typeof v === "string") {
          if (v === "1" || v === "X") { fill = "#164e63"; stroke = "#22d3ee"; }
          else if (v === "2") { fill = "#7c2d12"; stroke = "#fb923c"; }
        } else {
          if (v === 0) { fill = "#0f172a"; }
          else if (v === 1) { fill = "#164e63"; stroke = "#22d3ee"; }
          else if (v === 2) { fill = "#7c2d12"; stroke = "#fb923c"; }
        }
        return (
          <g key={`${r}-${c}`}>
            <rect x={x} y={y} width={cell - 2} height={cell - 2} rx="4" fill={fill} stroke={stroke} strokeWidth="1" />
            <text x={x + (cell - 2) / 2} y={y + (cell - 2) / 2 + 4} textAnchor="middle" fill="#e2e8f0" fontSize={Math.min(13, cell * 0.36)} fontWeight="600" fontFamily="monospace">{String(v)}</text>
          </g>
        );
      }))}
    </svg>
  );
}

function ArrayDiagram({ data }) {
  if (!Array.isArray(data) || !data.length) return null;
  const n = data.length;
  const cell = Math.max(30, Math.min(48, Math.floor(380 / n)));
  const W = n * cell + 2, H = cell + 36;
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {data.map((v, i) => {
        const x = i * cell + 1;
        return (
          <g key={i}>
            <rect x={x} y={1} width={cell - 2} height={cell - 2} rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            <text x={x + (cell - 2) / 2} y={1 + (cell - 2) / 2 + 4} textAnchor="middle" fill="#e2e8f0" fontSize={Math.min(12, cell * 0.3)} fontWeight="600" fontFamily="monospace">{String(v)}</text>
            <text x={x + (cell - 2) / 2} y={cell + 18} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">{i}</text>
          </g>
        );
      })}
    </svg>
  );
}

function StringDiagram({ str }) {
  if (!str || typeof str !== "string") return null;
  const chars = [...str];
  const n = chars.length;
  const cell = Math.max(28, Math.min(42, Math.floor(380 / n)));
  const W = n * cell + 2, H = cell + 20;
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {chars.map((ch, i) => {
        const x = i * cell + 1;
        return (
          <g key={i}>
            <rect x={x} y={1} width={cell - 2} height={cell - 2} rx="4" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1" />
            <text x={x + (cell - 2) / 2} y={1 + (cell - 2) / 2 + 4} textAnchor="middle" fill="#e2e8f0" fontSize={Math.min(13, cell * 0.35)} fontWeight="600" fontFamily="monospace">{ch}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LinkedListDiagram({ arr }) {
  if (!Array.isArray(arr) || !arr.length) return null;
  const n = arr.length;
  const nodeW = 44, gap = 28;
  const W = n * (nodeW + gap), H = 60;
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {arr.map((v, i) => {
        const x = i * (nodeW + gap);
        return (
          <g key={i}>
            <rect x={x} y={10} width={nodeW} height={32} rx="6" fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5" />
            <text x={x + nodeW / 2} y={31} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600" fontFamily="monospace">{v}</text>
            {i < n - 1 && <line x1={x + nodeW} y1={26} x2={x + nodeW + gap - 4} y2={26} stroke="#64748b" strokeWidth="1.5" markerEnd="url(#llArrow)" />}
          </g>
        );
      })}
      <defs><marker id="llArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#64748b" /></marker></defs>
    </svg>
  );
}

function GraphDiagram({ adjList }) {
  if (!adjList || !adjList.length) return null;
  const nodes = adjList.length;
  const cx = 150, cy = 120, rad = Math.min(85, 28 + nodes * 8);
  const pos = Array.from({ length: nodes }, (_, i) => {
    const a = (2 * Math.PI * i) / nodes - Math.PI / 2;
    return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
  });
  const R = Math.min(16, 110 / nodes + 10);
  const edges = [], seen = new Set();
  adjList.forEach((nbrs, u) => (nbrs || []).forEach(v => {
    const key = u < v ? `${u}-${v}` : `${v}-${u}`;
    if (!seen.has(key) && pos[u] && pos[v]) { seen.add(key); edges.push([u, v]); }
  }));
  return (
    <svg className="diagram-svg" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid meet">
      {edges.map(([u, v], i) => <line key={i} x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} stroke="#475569" strokeWidth="1.5" />)}
      {pos.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={R} fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600" fontFamily="monospace">{i}</text>
        </g>
      ))}
    </svg>
  );
}

function EdgeListGraph({ edges, n }) {
  const nodes = n || Math.max(...edges.flat()) + 1;
  const cx = 150, cy = 120, rad = Math.min(85, 28 + nodes * 8);
  const pos = Array.from({ length: nodes }, (_, i) => {
    const a = (2 * Math.PI * i) / nodes - Math.PI / 2;
    return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
  });
  const R = Math.min(15, 100 / nodes + 10);
  return (
    <svg className="diagram-svg" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid meet">
      {edges.map(([u, v], i) => (
        <g key={i}>
          <defs><marker id={`arr${i}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#64748b" /></marker></defs>
          <line x1={pos[u]?.x} y1={pos[u]?.y} x2={pos[v]?.x} y2={pos[v]?.y} stroke="#64748b" strokeWidth="1.5" markerEnd={`url(#arr${i})`} />
        </g>
      ))}
      {pos.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={R} fill="#1e293b" stroke="#22d3ee" strokeWidth="1.5" />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600" fontFamily="monospace">{i}</text>
        </g>
      ))}
    </svg>
  );
}

function IntervalsDiagram({ intervals }) {
  if (!Array.isArray(intervals) || !intervals.length) return null;
  const maxEnd = Math.max(...intervals.map(iv => iv[1]));
  const W = 340, rowH = 28, H = intervals.length * rowH + 30;
  const scaleX = v => 30 + (v / (maxEnd || 1)) * (W - 60);
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {intervals.map((iv, i) => {
        const x1 = scaleX(iv[0]), x2 = scaleX(iv[1]);
        const y = 16 + i * rowH;
        return (
          <g key={i}>
            <line x1={30} y1={y} x2={W - 30} y2={y} stroke="#1e293b" strokeWidth="1" />
            <rect x={x1} y={y - 8} width={Math.max(x2 - x1, 4)} height={16} rx="4" fill="#164e63" stroke="#22d3ee" strokeWidth="1" />
            <text x={x1 - 4} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="monospace">{iv[0]}</text>
            <text x={x2 + 4} y={y + 4} fill="#94a3b8" fontSize="9" fontFamily="monospace">{iv[1]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function StackDiagram({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  const n = items.length;
  const cellH = 32, W = 120, H = n * cellH + 30;
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {items.map((v, i) => {
        const y = H - 26 - (i + 1) * cellH;
        return (
          <g key={i}>
            <rect x={30} y={y} width={60} height={cellH - 4} rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
            <text x={60} y={y + cellH / 2} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600" fontFamily="monospace">{v}</text>
          </g>
        );
      })}
      <text x={60} y={H - 6} textAnchor="middle" fill="#64748b" fontSize="9">↑ top</text>
    </svg>
  );
}

function HistogramDiagram({ data }) {
  if (!Array.isArray(data) || !data.length) return null;
  const n = data.length;
  const maxV = Math.max(...data);
  const barW = Math.max(16, Math.min(32, Math.floor(340 / n)));
  const maxH = 120;
  const W = n * (barW + 4) + 10, H = maxH + 30;
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {data.map((v, i) => {
        const h = maxV > 0 ? (v / maxV) * maxH : 0;
        const x = 5 + i * (barW + 4);
        return (
          <g key={i}>
            <rect x={x} y={maxH - h + 5} width={barW} height={Math.max(h, 2)} rx="2" fill="#164e63" stroke="#22d3ee" strokeWidth="1" />
            <text x={x + barW / 2} y={maxH + 18} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">{v}</text>
          </g>
        );
      })}
    </svg>
  );
}

function NumberDiagram({ value, label }) {
  const n = parseInt(value);
  if (isNaN(n)) return null;
  const bits = (n >>> 0).toString(2).padStart(8, "0").slice(-16);
  const W = Math.min(bits.length * 22 + 20, 380), H = 50;
  return (
    <svg className="diagram-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <text x={10} y={14} fill="#93c5fd" fontSize="10" fontWeight="600">{label || `n = ${n}`}</text>
      {bits.split("").map((b, i) => (
        <g key={i}>
          <rect x={10 + i * 20} y={20} width={18} height={22} rx="3" fill={b === "1" ? "#164e63" : "#0f172a"} stroke={b === "1" ? "#22d3ee" : "#334155"} strokeWidth="1" />
          <text x={10 + i * 20 + 9} y={35} textAnchor="middle" fill={b === "1" ? "#e2e8f0" : "#475569"} fontSize="10" fontWeight="600" fontFamily="monospace">{b}</text>
        </g>
      ))}
    </svg>
  );
}

// === Detection Logic ===

const TREE_IDS = new Set([30, 31, 32, 33, 90, 91, 92, 93, 94, 95, 96, 97, 98]);
const LINKED_LIST_IDS = new Set([13, 14, 15, 28, 29, 56, 150]);
const MATRIX_IDS = new Set([52, 53, 55, 64, 65, 66, 86, 103, 142]);
const GRID_GRAPH_IDS = new Set([36, 38, 68, 69, 70, 143, 144, 145]);
const ADJ_LIST_IDS = new Set([37, 71, 72]);
const EDGE_LIST_IDS = new Set([39, 40, 41, 42, 43, 73, 75]);
const ADJ_MATRIX_IDS = new Set([44, 67]);
const INTERVAL_IDS = new Set([81, 82, 149]);
const STACK_IDS = new Set([17, 27, 85, 127]);
const HISTOGRAM_IDS = new Set([85, 86]);
const TWO_PTR_IDS = new Set([1, 11, 15, 23, 24, 133, 135, 136, 148, 114]);
const SLIDING_WINDOW_IDS = new Set([3, 21, 22, 76, 109, 111, 137, 138, 139, 58]);
const STRING_IDS = new Set([6, 7, 8, 9, 10, 16, 21, 25, 74, 77, 78, 79, 80, 99, 106, 107, 108, 109, 110, 111, 112, 113, 121, 126, 129, 146, 147]);
const ARRAY_IDS = new Set([1, 2, 4, 5, 11, 12, 19, 20, 23, 24, 26, 34, 35, 46, 47, 48, 49, 50, 51, 57, 58, 59, 60, 61, 62, 63, 76, 77, 78, 83, 84, 87, 88, 89, 100, 101, 102, 104, 105, 115, 116, 117, 118, 119, 120, 122, 123, 124, 125, 130, 131, 132, 133, 134, 135, 136, 137, 140, 141, 148]);
const NUMBER_IDS = new Set([10, 46, 119, 120, 122, 123, 124, 125, 118]);

function extractArray(input) {
  const m = input.match(/\[([^\]]+)\]/);
  if (!m) return null;
  try {
    const s = m[0].replace(/'/g, '"').replace(/\bnull\b/gi, "null");
    const arr = JSON.parse(s);
    if (Array.isArray(arr) && arr.length && typeof arr[0] !== "object") return arr;
  } catch { /* not a valid array */ }
  return null;
}

function extractNested(input) {
  const m = input.match(/\[\[[\s\S]*?\]\]/);
  if (!m) return null;
  try { return JSON.parse(m[0].replace(/'/g, '"')); } catch { return null; }
}

function buildDiagram(id, input) {
  // Trees
  if (TREE_IDS.has(id)) {
    const arr = parseArray(input);
    if (arr) return <TreeDiagram data={arr} />;
  }
  // Linked lists (arrow format: 1->2->3)
  if (LINKED_LIST_IDS.has(id)) {
    const m = input.match(/(\d+(?:->\d+)+)/);
    if (m) return <LinkedListDiagram arr={m[1].split("->").map(Number)} />;
    const arr = parseArray(input);
    if (arr && arr.length && typeof arr[0] === "number") return <LinkedListDiagram arr={arr} />;
  }
  // Grid graphs
  if (GRID_GRAPH_IDS.has(id)) {
    const arr = parseArray(input);
    if (arr && Array.isArray(arr[0])) return <MatrixDiagram data={arr} charMode={id === 36 || id === 69} />;
  }
  // Adj list graphs
  if (ADJ_LIST_IDS.has(id)) {
    const arr = parseArray(input);
    if (arr && Array.isArray(arr[0])) return <GraphDiagram adjList={arr} />;
    if (arr && Array.isArray(arr)) return <GraphDiagram adjList={arr} />;
  }
  // Edge list graphs
  if (EDGE_LIST_IDS.has(id)) {
    const m = input.match(/\[\[[\s\S]*?\]\]/);
    if (m) {
      let edges;
      try { edges = JSON.parse(m[0].replace(/'/g, '"')); } catch { edges = undefined; }
      if (Array.isArray(edges) && edges.length && Array.isArray(edges[0])) {
        const nMatch = input.match(/n\s*=\s*(\d+)/i);
        return <EdgeListGraph edges={edges} n={nMatch ? +nMatch[1] : undefined} />;
      }
    }
  }
  // Adj matrix graphs
  if (ADJ_MATRIX_IDS.has(id)) {
    const arr = parseArray(input);
    if (arr && Array.isArray(arr[0])) return <MatrixDiagram data={arr} />;
  }
  // Intervals
  if (INTERVAL_IDS.has(id)) {
    const nested = extractNested(input);
    if (nested && Array.isArray(nested[0]) && nested[0].length === 2) return <IntervalsDiagram intervals={nested} />;
  }
  // Stack visualization
  if (STACK_IDS.has(id)) {
    const arr = parseArray(input);
    if (arr && arr.length && typeof arr[0] === "number") return <StackDiagram items={arr.slice(0, 8)} />;
  }
  // Matrix problems
  if (MATRIX_IDS.has(id)) {
    const arr = parseArray(input);
    if (arr && Array.isArray(arr[0])) return <MatrixDiagram data={arr} charMode={[52, 53, 55, 86].includes(id)} />;
  }
  // Histogram
  if (HISTOGRAM_IDS.has(id)) {
    const arr = extractArray(input);
    if (arr && arr.length >= 2 && arr.length <= 20) return <HistogramDiagram data={arr} />;
  }
  // Number / bit manipulation
  if (NUMBER_IDS.has(id)) {
    const nm = input.match(/(?:n|x|num)\s*=\s*(\d+)/i) || input.match(/^(\d+)$/);
    if (nm) return <NumberDiagram value={nm[1]} />;
  }
  // Two-pointer / sliding window: show array
  if (TWO_PTR_IDS.has(id) || SLIDING_WINDOW_IDS.has(id)) {
    const arr = extractArray(input);
    if (arr && arr.length >= 2 && arr.length <= 20) return <ArrayDiagram data={arr} />;
    const sm = input.match(/s=['"]([^'"]+)['"]/);
    if (sm && sm[1].length >= 2 && sm[1].length <= 20) return <StringDiagram str={sm[1]} />;
  }
  // String problems
  if (STRING_IDS.has(id)) {
    const sm = input.match(/s=['"]([^'"]+)['"]/) || input.match(/^['"]([^'"]+)['"]/) || input.match(/word1=['"]([^'"]+)['"]/) || input.match(/text1=['"]([^'"]+)['"]/) || input.match(/strs?=\[([^\]]+)\]/);
    if (sm) {
      const s = sm[1].replace(/['"]/g, "");
      if (s.length >= 2 && s.length <= 20) return <StringDiagram str={s} />;
      // For string arrays like ['eat','tea'], show first string
      if (s.includes(",")) {
        const first = s.split(",")[0].trim().replace(/['"]/g, "");
        if (first.length >= 2) return <StringDiagram str={first} />;
      }
    }
  }
  // Array problems (fallback)
  if (ARRAY_IDS.has(id)) {
    const arr = extractArray(input);
    if (arr && arr.length >= 2 && arr.length <= 20) return <ArrayDiagram data={arr} />;
  }
  // Generic: any [[...]] -> matrix, any [...] -> array
  if (input.trim().startsWith("[[")) {
    const nested = extractNested(input);
    if (nested && Array.isArray(nested[0]) && typeof nested[0][0] !== "object") return <MatrixDiagram data={nested} />;
  }
  const arr = extractArray(input);
  if (arr && arr.length >= 2 && arr.length <= 20) return <ArrayDiagram data={arr} />;
  // Universal fallback: extract any number
  const anyNum = input.match(/(?:n|x|target|k|amount)\s*=\s*(\d+)/i) || input.match(/^(\d+)$/);
  if (anyNum) return <NumberDiagram value={anyNum[1]} label={input.length < 40 ? input : undefined} />;
  // Universal fallback: extract any string
  const anyStr = input.match(/['"]([^'"]{2,20})['"]/);
  if (anyStr) return <StringDiagram str={anyStr[1]} />;
  return null;
}

export default function VisualDiagram({ question, exampleInput }) {
  const id = question?.id;
  const input = exampleInput || question?.input || "";
  const diagram = useMemo(() => {
    if (!id || !input) return null;
    return buildDiagram(id, input);
  }, [id, input]);
  if (!diagram) return null;
  return (
    <div className="diagram-box">
      <div className="diagram-label">Visual Diagram</div>
      <div className="diagram-content">{diagram}</div>
    </div>
  );
}
