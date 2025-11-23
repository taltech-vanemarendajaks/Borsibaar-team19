"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { InvDto } from "./page";

// ---------- Tallinn time helpers ----------
const tallinnParts = (d: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Tallinn",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(d);
  const m: Record<string, number> = Object.create(null);
  for (const p of parts) if (p.type !== "literal") m[p.type] = Number(p.value);
  return m;
};

const snapTallinn = (d: Date, stepMin: number) => {
  const { minute, second } = tallinnParts(d);
  const snapDelta =
    ((minute % stepMin) * 60 + second) * 1000 + d.getMilliseconds();
  return new Date(d.getTime() - snapDelta);
};

const tallinnTicks = (cutoff: Date, now: Date, stepMin: number) => {
  const first = snapTallinn(now, stepMin);
  const stepMs = stepMin * 60 * 1000;
  const out: Date[] = [];
  for (let t = first.getTime(); t >= cutoff.getTime(); t -= stepMs) {
    out.push(new Date(t));
  }
  out.reverse();
  if (+out[0] !== +cutoff) out.unshift(cutoff);
  if (+out[out.length - 1] !== +now) out.push(now);
  return out;
};

// ---------- Types ----------
type HistoryDto = {
  id: number;
  inventoryId: number;
  priceBefore: number;
  priceAfter: number;
  createdAt: string;
};
type CurrentHistory = {
  productInv: InvDto;
  priceHistory: HistoryDto[];
};

export default function PriceHistoryGraphFancy({
  groups,
}: {
  groups: Record<string, InvDto[]>;
}) {
  const [current, setCurrent] = useState<CurrentHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  // rotation (stable across reloads)
  const groupsRef = useRef<Record<string, InvDto[]>>({});
  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);
  const activeIdxRef = useRef(0);
  const activeProductRef = useRef<InvDto | null>(null);

  const flatten = useCallback((g: Record<string, InvDto[]>) => {
    const catNames = Object.keys(g).sort((a, b) => a.localeCompare(b));
    return catNames.flatMap((name) =>
      [...(g[name] ?? [])].sort((a, b) => a.productId - b.productId),
    );
  }, []);

  const loadPriceHistory = useCallback(async (productInv: InvDto) => {
    if (!productInv) return;
    try {
      setError(null);
      const res = await fetch(
        `/api/backend/inventory/product/${productInv.productId}/history`,
        {
          cache: "no-store",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const historyJson: HistoryDto[] = await res.json();
      setCurrent({ productInv, priceHistory: historyJson });
    } catch (e) {
      setError(e?.message || "Failed to fetch history");
    }
  }, []);

  const rotateOnce = useCallback(() => {
    const flat = flatten(groupsRef.current);
    if (flat.length === 0) return;
    const cur = activeProductRef.current;
    let nextIdx: number;
    if (cur) {
      const i = flat.findIndex((p) => p.productId === cur.productId);
      nextIdx = i >= 0 ? (i + 1) % flat.length : activeIdxRef.current % flat.length;
    } else {
      nextIdx = activeIdxRef.current % flat.length;
    }
    const next = flat[nextIdx];
    activeIdxRef.current = nextIdx;
    activeProductRef.current = next;
    loadPriceHistory(next);
  }, [flatten, loadPriceHistory]);

  useEffect(() => {
    if (!activeProductRef.current) {
      const flat = flatten(groupsRef.current);
      if (flat.length > 0) {
        activeIdxRef.current %= flat.length;
        const initial = flat[activeIdxRef.current];
        activeProductRef.current = initial;
        loadPriceHistory(initial);
      }
    }
    const id = setInterval(rotateOnce, 5000);
    return () => clearInterval(id);
  }, [flatten, rotateOnce, loadPriceHistory]);

  // build full step series (no zero baseline)
  const series = useMemo(() => {
    if (!current) return [] as { date: Date; price: number }[];

    const product = current.productInv;
    const hist = [...(current.priceHistory ?? [])]
      .map((h) => ({
        ts: new Date(h.createdAt),
        before: Number(h.priceBefore),
        after: Number(h.priceAfter),
      }))
      .filter((h) => !isNaN(h.ts.getTime()))
      .sort((a, b) => a.ts.getTime() - b.ts.getTime());

    const firstBefore = hist.find(
      (h) => Number.isFinite(h.before) && h.before !== 0,
    )?.before;
    const base =
      (firstBefore ??
        product?.basePrice ??
        product.unitPrice ??
        hist[0]?.after ??
        0) as number;

    const out: { date: Date; price: number }[] = [];
    if (hist.length === 0) {
      const now = new Date();
      out.push(
        { date: new Date(now.getTime() - 1), price: base },
        { date: now, price: base },
      );
      return out;
    }
    out.push({ date: new Date(hist[0].ts.getTime() - 1), price: base });
    let last = base;
    for (const e of hist) {
      const next = Number.isFinite(e.after) ? e.after : last;
      out.push({ date: e.ts, price: next });
      last = next;
    }
    if (+out[out.length - 1].date < Date.now()) {
      out.push({ date: new Date(), price: last });
    }
    return out;
  }, [current]);

  // ---- WINDOW: last 1 hour + delta ----
  const HOURS_WINDOW = 1;
  const { data: windowed, cutoff, now, delta } = useMemo(() => {
    const _now = new Date();
    const _cutoff = new Date(_now.getTime() - HOURS_WINDOW * 3600_000);
    if (!series.length)
      return { data: series, cutoff: _cutoff, now: _now, delta: 0 };

    // last point at/before cutoff
    let i = series.length - 1;
    while (i >= 0 && series[i].date > _cutoff) i--;

    const out: { date: Date; price: number }[] = [];
    const seedPrice = i >= 0 ? series[i].price : series[0].price;
    out.push({ date: _cutoff, price: seedPrice });

    for (let j = Math.max(i + 1, 0); j < series.length; j++) {
      if (series[j].date >= _cutoff) out.push(series[j]);
    }
    const last = out[out.length - 1];
    if (+last.date < +_now) out.push({ date: _now, price: last.price });

    const _delta = out[out.length - 1].price - out[0].price;
    return { data: out, cutoff: _cutoff, now: _now, delta: _delta };
  }, [series]);

  // ---------- D3 drawing ----------
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const money = useMemo(
    () => new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }),
    [],
  );

  useEffect(() => {
    if (!wrapRef.current) return;
    d3.select(wrapRef.current).selectAll("*").remove();

    const w = wrapRef.current.clientWidth || 760;
    const h = Math.max(320, Math.round(w * 0.48));
    const margin = { top: 56, right: 32, bottom: 56, left: 80 };

    const svg = d3
      .select(wrapRef.current)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .style("display", "block");

    const defs = svg.append("defs");

    // soft background gradient inside chart area
    const bgGrad = defs
      .append("linearGradient")
      .attr("id", "chartBg")
      .attr("x1", "0")
      .attr("x2", "0")
      .attr("y1", "0")
      .attr("y2", "1");
    bgGrad
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#18152b")
      .attr("stop-opacity", 1);
    bgGrad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#141326")
      .attr("stop-opacity", 1);

    const r = 20;
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", w)
      .attr("height", h)
      .attr("rx", r)
      .attr("ry", r)
      .attr("fill", "url(#chartBg)");

    // title
    svg
      .append("text")
      .attr("x", w / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#f9fafb")
      .style("font-weight", 700)
      .style("font-size", "16px")
      .text(`${current?.productInv.productName ?? "—"} • Last 1h`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerW = Math.max(140, w - margin.left - margin.right);
    const innerH = Math.max(140, h - margin.top - margin.bottom);

    if (!windowed.length) {
      g.append("text")
        .attr("fill", "#9aa4b2")
        .attr("x", innerW / 2)
        .attr("y", innerH / 2)
        .attr("text-anchor", "middle")
        .text("No data");
      return;
    }

    // scales
    const x = d3.scaleTime().domain([cutoff, now]).range([0, innerW]);
    const pMin = d3.min(windowed, (d) => d.price) ?? 0;
    const pMax = d3.max(windowed, (d) => d.price) ?? 1;
    const pad = Math.max((pMax - pMin) * 0.06, 0.1);
    const y = d3
      .scaleLinear()
      .domain([pMin - pad, pMax + pad])
      .nice()
      .range([innerH, 0]);

    // X axis ticks (Tallinn time, first label hidden)
    const stepMin = innerW < 520 ? 15 : 10;
    let ticks = tallinnTicks(cutoff, now, stepMin);
    const maxTicks = Math.max(3, Math.floor(innerW / 110));
    if (ticks.length > maxTicks) {
      const keep = new Set<number>([+ticks[0], +ticks[ticks.length - 1]]);
      const mids = ticks.slice(1, -1);
      const step = Math.ceil(mids.length / Math.max(1, maxTicks - 2));
      for (let i = 0; i < mids.length; i += step) keep.add(+mids[i]);
      ticks = ticks.filter((t) => keep.has(+t));
    }

    const tallinnFmt = (d: Date) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Tallinn",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);

    const xAxis = d3
      .axisBottom<Date>(x)
      .tickValues(ticks)
      .tickFormat((d, i) => (i === 0 ? "" : tallinnFmt(d)))
      .tickSizeOuter(0);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .call((s) =>
        s
          .select(".domain")
          .attr("stroke", "rgba(148, 163, 184, 0.4)")
          .attr("stroke-width", 0.8),
      )
      .call((s) =>
        s
          .selectAll("text")
          .attr("fill", "#cdd6f4")
          .style("font-size", "11px"),
      )
      .call((s) =>
        s
          .selectAll("line")
          .attr("stroke", "rgba(148,163,184,0.4)")
          .attr("stroke-width", 0.5),
      );

    // Y axis + label
    g.append("g")
      .call(
        d3
          .axisLeft<number>(y)
          .ticks(6)
          .tickFormat((v) => money.format(Number(v))),
      )
      .call((s) =>
        s
          .select(".domain")
          .attr("stroke", "rgba(148,163,184,0.4)")
          .attr("stroke-width", 0.8),
      )
      .call((s) =>
        s
          .selectAll("text")
          .attr("fill", "#cdd6f4")
          .style("font-size", "11px"),
      )
      .call((s) =>
        s
          .selectAll("line")
          .attr("stroke", "rgba(51,65,85,0.8)")
          .attr("stroke-dasharray", "3,3")
          .attr("stroke-width", 0.6),
      );

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("letter-spacing", "0.08em")
      .style("font-weight", 600)
      .attr("fill", "#d6d9e6")
      .text("PRICE (EUR)");

    // Glow + area gradient
    const glow = defs.append("filter").attr("id", "glowBlue");
    glow.append("feGaussianBlur").attr("stdDeviation", 1.6).attr("result", "b");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "b");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const areaGrad = defs
      .append("linearGradient")
      .attr("id", "areaBlue")
      .attr("x1", "0")
      .attr("x2", "0")
      .attr("y1", "0")
      .attr("y2", "1");
    areaGrad
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#8b5cf6")
      .attr("stop-opacity", 0.3);
    areaGrad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#1d1140")
      .attr("stop-opacity", 0.05);

    const line = d3
      .line<{ date: Date; price: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.price))
      .curve(d3.curveStepAfter);

    const area = d3
      .area<{ date: Date; price: number }>()
      .x((d) => x(d.date))
      .y0(() => y(pMin - pad))
      .y1((d) => y(d.price))
      .curve(d3.curveStepAfter);

    g.append("path").datum(windowed).attr("d", area).attr("fill", "url(#areaBlue)");

    g.append("path")
      .datum(windowed)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#a855f7")
      .attr("stroke-width", 2.6)
      .attr("filter", "url(#glowBlue)");

    // last price badge (top-right)
    // const firstPrice = windowed[0].price;
    // const lastPrice = windowed[windowed.length - 1].price;
    // const change = lastPrice - firstPrice;
    // const changePct =
    //   firstPrice !== 0 ? (change / firstPrice) * 100 : 0;

    // const priceLabel = money.format(lastPrice);
    // const changeLabel =
    //   change === 0
    //     ? "0.0%"
    //     : `${change > 0 ? "+" : "-"}${Math.abs(changePct).toFixed(1)}%`;

  }, [windowed, cutoff, now, delta, current?.productInv?.productName, money]);

  return (
    <div className="h-full w-full">
      {error && (
        <div className="mb-2 rounded-md bg-red-900/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}
      <div ref={wrapRef} className="h-full w-full" />
    </div>
  );
}
