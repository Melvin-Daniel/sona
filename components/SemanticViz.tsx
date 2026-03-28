"use client";

import type { SemanticGraph } from "@/lib/types";
import { tamilToTanglish } from "@/lib/tanglish";
import { useEffect, useMemo, useState } from "react";

type Props = {
  graph: SemanticGraph;
  highlightSenseId?: string | null;
};

/** Split "தமிழ் (English gloss)" from graph sense labels into two readable lines. */
function splitSenseDisplayLabel(label: string): { primary: string; secondary: string | null } {
  const m = label.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!m) return { primary: label.trim(), secondary: null };
  return { primary: m[1]!.trim(), secondary: m[2]!.trim() };
}

function exampleDisplayLines(sentence: string): { tamil: string; tanglishLine: string | null } {
  const tl = tamilToTanglish(sentence).trim();
  return { tamil: sentence, tanglishLine: tl ? `(${tl})` : null };
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

/**
 * Meaning-star layout: tap nodes to see example sentences; active sense highlighted.
 */
export function SemanticViz({ graph, highlightSenseId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const layout = useMemo(() => {
    const w = 760;
    const h = 620;
    const cx = w / 2;
    const cy = h / 2;
    const senseNodes = graph.nodes.filter((n) => n.type === "sense");
    const exampleNodes = graph.nodes.filter((n) => n.type === "example");
    const r1 = 172;
    const r2 = 268;

    const pos: Record<string, { x: number; y: number }> = {};
    pos["root"] = { x: cx, y: cy };

    senseNodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / Math.max(senseNodes.length, 1) - Math.PI / 2;
      pos[n.id] = { x: cx + r1 * Math.cos(angle), y: cy + r1 * Math.sin(angle) };
    });

    let exIdx = 0;
    for (const n of exampleNodes) {
      const parent = graph.links.find((l) => l.target === n.id)?.source;
      const base = parent && pos[parent] ? pos[parent] : { x: cx, y: cy };
      const angle = (2 * Math.PI * exIdx) / Math.max(exampleNodes.length, 1);
      pos[n.id] = {
        x: base.x + r2 * 0.48 * Math.cos(angle),
        y: base.y + r2 * 0.48 * Math.sin(angle),
      };
      exIdx++;
    }

    return { w, h, pos, cx, cy };
  }, [graph]);

  const selectedNode = graph.nodes.find((n) => n.id === selectedId);

  function isSenseActive(n: (typeof graph.nodes)[0]): boolean {
    if (n.type !== "sense") return false;
    const sid = n.senseEntityId ?? n.id;
    return highlightSenseId != null && highlightSenseId !== "" && sid === highlightSenseId;
  }

  if (!graph.nodes.length) {
    return (
      <div className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card-elevated)] p-8 text-center text-[var(--muted)]">
        Generate a challenge to see the semantic web.
      </div>
    );
  }

  const R = {
    root: 46,
    sense: 48,
    example: 56,
  } as const;

  const anim = !reducedMotion;

  return (
    <div className="lex-semantic-viz rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--card)_92%,var(--accent-ink))] p-4 shadow-[0_12px_40px_color-mix(in_srgb,var(--accent)_10%,transparent)] md:p-6">
      <svg
        viewBox={`0 0 ${layout.w} ${layout.h}`}
        className="mx-auto h-auto w-full max-w-[min(100%,920px)] min-h-[min(70vw,560px)] cursor-pointer touch-manipulation md:min-h-[500px]"
        role="img"
        aria-label="Semantic meaning graph"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Animated fills — disabled when prefers-reduced-motion */}
          <radialGradient
            id="lex-graph-root-fill"
            cx="50%"
            cy="50%"
            r="68%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#2d6a52" />
            <stop offset="55%" stopColor="#1f4a3a" />
            <stop offset="100%" stopColor="#163628" />
            {anim ? (
              <>
                <animate attributeName="cx" values="42%;58%;42%" dur="8s" repeatCount="indefinite" />
                <animate attributeName="cy" values="45%;55%;45%" dur="6s" repeatCount="indefinite" />
              </>
            ) : null}
          </radialGradient>
          <radialGradient
            id="lex-graph-sense-fill"
            cx="50%"
            cy="50%"
            r="72%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#d8efe4" />
            <stop offset="45%" stopColor="#b8dcc8" />
            <stop offset="100%" stopColor="#8fc4a8" />
            {anim ? (
              <>
                <animate attributeName="cx" values="35%;65%;35%" dur="7s" repeatCount="indefinite" />
                <animate attributeName="cy" values="38%;62%;38%" dur="5.5s" repeatCount="indefinite" />
                <animate
                  attributeName="r"
                  values="68%;76%;68%"
                  dur="9s"
                  repeatCount="indefinite"
                />
              </>
            ) : null}
          </radialGradient>
          <radialGradient
            id="lex-graph-sense-fill-active"
            cx="50%"
            cy="50%"
            r="70%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#a8e8c8" />
            <stop offset="50%" stopColor="#6bc48a" />
            <stop offset="100%" stopColor="#2a8f5c" />
            {anim ? (
              <>
                <animate attributeName="cx" values="40%;60%;40%" dur="5s" repeatCount="indefinite" />
                <animate attributeName="cy" values="42%;58%;42%" dur="4s" repeatCount="indefinite" />
              </>
            ) : null}
          </radialGradient>
          <radialGradient
            id="lex-graph-example-fill"
            cx="50%"
            cy="50%"
            r="75%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#faf7f2" />
            <stop offset="50%" stopColor="#f0ebe0" />
            <stop offset="100%" stopColor="#e4ddd0" />
            {anim ? (
              <>
                <animate attributeName="cx" values="55%;45%;55%" dur="10s" repeatCount="indefinite" />
                <animate attributeName="cy" values="50%;48%;50%" dur="8s" repeatCount="indefinite" />
              </>
            ) : null}
          </radialGradient>
          <filter id="lex-graph-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="var(--accent)" floodOpacity="0.22" />
          </filter>
          <filter id="lex-graph-node-shadow" x="-35%" y="-35%" width="170%" height="170%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#1a1a14" floodOpacity="0.14" />
          </filter>
        </defs>
        {graph.links.map((l, i) => {
          const a = layout.pos[l.source];
          const b = layout.pos[l.target];
          if (!a || !b) return null;
          return (
            <line
              key={`${l.source}-${l.target}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="color-mix(in srgb, var(--accent) 55%, var(--border))"
              strokeWidth={3.25}
              strokeLinecap="round"
              opacity={0.88}
            />
          );
        })}
        {graph.nodes.map((n) => {
          const p = layout.pos[n.id];
          if (!p) return null;
          const active = isSenseActive(n);
          const baseR = n.type === "root" ? R.root : n.type === "sense" ? R.sense : R.example;
          const r = baseR + (active ? 6 : 0);

          let fill: string;
          if (n.type === "root") {
            fill = reducedMotion ? "var(--accent)" : "url(#lex-graph-root-fill)";
          } else if (n.type === "sense") {
            fill = reducedMotion
              ? active
                ? "color-mix(in srgb, var(--success) 55%, var(--accent))"
                : "color-mix(in srgb, var(--accent) 22%, var(--card))"
              : active
                ? "url(#lex-graph-sense-fill-active)"
                : "url(#lex-graph-sense-fill)";
          } else {
            fill = reducedMotion ? "var(--card-elevated)" : "url(#lex-graph-example-fill)";
          }

          const stroke = active
            ? "var(--gold)"
            : n.type === "root"
              ? "color-mix(in srgb, var(--accent-ink) 25%, var(--accent))"
              : "color-mix(in srgb, var(--accent) 50%, var(--border))";
          const strokeW = active ? 4.5 : n.type === "root" ? 3.5 : 3;

          const textMain = n.type === "root" ? "var(--accent-ink)" : "var(--text)";
          const textSub = "color-mix(in srgb, var(--text) 82%, var(--muted))";

          return (
            <g
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(n.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
                filter={n.type === "root" ? "url(#lex-graph-glow)" : "url(#lex-graph-node-shadow)"}
              />
              {n.type === "example" ? (
                (() => {
                  const raw = n.exampleSentence ?? n.label;
                  const { tamil, tanglishLine } = exampleDisplayLines(raw);
                  const title = tanglishLine ? `${raw} ${tanglishLine}` : raw;
                  return (
                    <foreignObject
                      x={p.x - r}
                      y={p.y - r}
                      width={r * 2}
                      height={r * 2}
                      className="overflow-hidden"
                    >
                      <div
                        className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-1.5 py-1 text-center"
                        style={{
                          pointerEvents: "none",
                          color: "var(--text)",
                          fontFamily: "var(--font-noto), Noto Sans Tamil, system-ui, sans-serif",
                        }}
                      >
                        <p
                          className="line-clamp-3 text-[10.5px] font-semibold leading-snug md:text-[11.5px]"
                          title={title}
                        >
                          {tamil}
                        </p>
                        {tanglishLine ? (
                          <p
                            className="line-clamp-2 w-full font-body text-[8.5px] font-medium leading-tight text-[color-mix(in_srgb,var(--muted)_35%,var(--text))] md:text-[9.5px]"
                            style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
                          >
                            {tanglishLine}
                          </p>
                        ) : null}
                      </div>
                    </foreignObject>
                  );
                })()
              ) : n.type === "sense" ? (
                (() => {
                  const { primary, secondary } = splitSenseDisplayLabel(n.label);
                  return (
                    <text
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={p.x}
                        y={p.y + (secondary ? -8 : 4)}
                        className="font-tamil"
                        fill={textMain}
                        style={{ fontSize: 14, fontWeight: 700 }}
                      >
                        {primary.length > 20 ? `${primary.slice(0, 19)}…` : primary}
                      </tspan>
                      {secondary ? (
                        <tspan
                          x={p.x}
                          y={p.y + 12}
                          fill={textSub}
                          style={{ fontSize: 11.5, fontWeight: 600 }}
                        >
                          {secondary.length > 28 ? `${secondary.slice(0, 27)}…` : secondary}
                        </tspan>
                      ) : null}
                    </text>
                  );
                })()
              ) : (
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  className="pointer-events-none font-tamil select-none"
                  fill={textMain}
                  style={{ fontSize: 20, fontWeight: 800 }}
                >
                  {n.label.length > 12 ? `${n.label.slice(0, 11)}…` : n.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {selectedNode && (selectedNode.exampleSentence || selectedNode.label) ? (
        (() => {
          const raw = selectedNode.exampleSentence ?? selectedNode.label;
          const showRom = selectedNode.type === "example";
          const { tamil, tanglishLine } = showRom ? exampleDisplayLines(raw) : { tamil: raw, tanglishLine: null as string | null };
          return (
            <div className="mx-auto mt-4 max-w-2xl rounded-xl border-2 border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Selected</p>
              <p className="mt-2 font-tamil text-base font-medium leading-relaxed text-[var(--text)] md:text-lg">
                {tamil}
              </p>
              {tanglishLine ? (
                <p className="mt-2 font-body text-sm font-medium leading-relaxed text-[color-mix(in_srgb,var(--muted)_28%,var(--text))] md:text-base">
                  {tanglishLine}
                </p>
              ) : null}
            </div>
          );
        })()
      ) : null}
      <p className="mt-4 text-center text-sm font-semibold text-[color-mix(in_srgb,var(--muted)_65%,var(--text))]">
        Tap a node · active sense glows during play
      </p>
    </div>
  );
}
