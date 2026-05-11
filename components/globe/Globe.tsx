"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map as MapLibreMap, LngLatLike } from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";

import { projects, type Project } from "@/lib/projects";
import { ProjectPanel } from "./ProjectPanel";

// Sydney centre — used as the "settle" target after the cinematic intro
const SYDNEY: LngLatLike = [151.21, -33.87];

// Use OpenFreeMap's hosted dark style as a starting point.
// We override the background and key paint colours via setPaintProperty after load
// to bring it in line with the BHC monochrome palette.
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/**
 * Walk the loaded style layers and push them toward our monochrome palette.
 * Done at runtime so we can use the OpenFreeMap-hosted style without forking it.
 */
function applyMonochromeOverrides(map: MapLibreMap) {
  const layers = map.getStyle().layers ?? [];
  for (const layer of layers) {
    try {
      const id = layer.id;
      const t = layer.type;

      // Background: solid black
      if (t === "background") {
        map.setPaintProperty(id, "background-color", "#000000");
        continue;
      }

      // Symbol (text/icons): hide labels for ultra-minimal aesthetic
      if (t === "symbol") {
        map.setLayoutProperty(id, "visibility", "none");
        continue;
      }

      // Water: very dark, near-black
      if (/water|ocean|sea/i.test(id)) {
        if (t === "fill") {
          map.setPaintProperty(id, "fill-color", "#040404");
          map.setPaintProperty(id, "fill-opacity", 1);
        }
        continue;
      }

      // Park / landcover / landuse — graduated dark greys
      if (/park|landcover|landuse|wood|grass|forest/i.test(id)) {
        if (t === "fill") {
          map.setPaintProperty(id, "fill-color", "#0c0c0c");
          map.setPaintProperty(id, "fill-opacity", 0.7);
        }
        continue;
      }

      // Buildings — slight contrast
      if (/building/i.test(id)) {
        if (t === "fill") {
          map.setPaintProperty(id, "fill-color", "#161616");
          map.setPaintProperty(id, "fill-opacity", 0.8);
        }
        if (t === "fill-extrusion") {
          map.setPaintProperty(id, "fill-extrusion-color", "#161616");
          map.setPaintProperty(id, "fill-extrusion-opacity", 0.9);
        }
        continue;
      }

      // Roads — subtle hairlines
      if (/road|tunnel|bridge|highway|motorway|street|transportation/i.test(id)) {
        if (t === "line") {
          map.setPaintProperty(id, "line-color", "#1f1f1f");
          map.setPaintProperty(id, "line-opacity", 0.85);
        }
        continue;
      }

      // Boundaries
      if (/boundary|admin/i.test(id)) {
        if (t === "line") {
          map.setPaintProperty(id, "line-color", "#262626");
          map.setPaintProperty(id, "line-opacity", 0.6);
        }
        continue;
      }

      // Generic fill fallback — push toward dark
      if (t === "fill") {
        map.setPaintProperty(id, "fill-color", "#0a0a0a");
      }
      if (t === "line") {
        map.setPaintProperty(id, "line-color", "#1a1a1a");
      }
    } catch {
      // Ignore — some properties aren't applicable to all layer types
    }
  }
}

export function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [selected, setSelected] = useState<Project | null>(null);
  const [ready, setReady] = useState(false);

  // Single source of truth for pin animation phase.
  // We mutate this on each frame and rebuild the deck layer.
  const phaseRef = useRef(0);

  const flyToProject = useCallback((p: Project) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: p.coords,
      zoom: 13,
      pitch: 55,
      bearing: -15,
      duration: 1600,
      essential: true,
    });
  }, []);

  const resetView = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: SYDNEY,
      zoom: 9.2,
      pitch: 50,
      bearing: -12,
      duration: 1400,
      essential: true,
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Start zoomed way out — globe view from space
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: SYDNEY,
      zoom: prefersReducedMotion ? 9 : 2.2,
      pitch: prefersReducedMotion ? 50 : 0,
      bearing: 0,
      attributionControl: false,
      interactive: true,
      maxPitch: 70,
      minZoom: 1,
    });

    // Enable MapLibre v5 globe projection on style load.
    map.on("style.load", () => {
      try {
        map.setProjection({ type: "globe" });
      } catch (e) {
        console.warn("Globe projection not available:", e);
      }
    });

    mapRef.current = map;
    // @ts-expect-error debug-only
    if (typeof window !== "undefined") window.__bhcMap = map;

    map.on("error", (e) => {
      console.error("[map error]", e?.error?.message || e);
    });

    let readyFired = false;
    const onReady = () => {
      if (readyFired) return;
      readyFired = true;
      setReady(true);
      try {
        applyMonochromeOverrides(map);
      } catch (err) {
        console.warn("Monochrome overrides failed:", err);
      }
    };

    // Fire on whichever event arrives first. Some environments stall on 'load' so
    // we also use 'idle' (no pending changes) and a safety timeout.
    map.once("load", onReady);
    map.once("idle", onReady);
    const readyTimeout = setTimeout(onReady, 4000);

    let bootstrapped = false;
    const bootstrap = () => {
      if (bootstrapped) return;
      bootstrapped = true;

      // Cinematic intro: from space → Sydney
      if (!prefersReducedMotion) {
        setTimeout(() => {
          map.flyTo({
            center: SYDNEY,
            zoom: 9.2,
            pitch: 50,
            bearing: -12,
            duration: 3200,
            curve: 1.4,
            essential: true,
          });
        }, 600);
      }

      // Add deck.gl overlay for project pins
      const overlay = new MapboxOverlay({
        interleaved: true,
        layers: buildPinLayers(0, null),
      });
      map.addControl(overlay as unknown as maplibregl.IControl);
      overlayRef.current = overlay;

      // Animate the pulse phase
      const startTs = performance.now();
      const tick = (ts: number) => {
        phaseRef.current = ((ts - startTs) / 1600) % 1;
        if (overlayRef.current) {
          overlayRef.current.setProps({
            layers: buildPinLayers(phaseRef.current, selected?.slug ?? null),
          });
        }
        animFrameRef.current = requestAnimationFrame(tick);
      };
      if (!prefersReducedMotion) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    map.once("load", bootstrap);
    // Also bootstrap once ready fires, in case 'load' is delayed.
    map.once("idle", bootstrap);
    setTimeout(bootstrap, 4500);

    return () => {
      clearTimeout(readyTimeout);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild layers when selected changes (so active pin glows brighter)
  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.setProps({
      layers: buildPinLayers(phaseRef.current, selected?.slug ?? null),
    });
  }, [selected]);

  function buildPinLayers(phase: number, activeSlug: string | null) {
    // phase: 0..1 — drives pulse alpha + radius
    const pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);

    return [
      // Outer pulsing halo
      new ScatterplotLayer({
        id: "pin-halo",
        data: projects,
        getPosition: (d: Project) => [d.coords[0], d.coords[1], 0],
        getRadius: (d: Project) =>
          d.slug === activeSlug ? 6000 + pulse * 3500 : 3500 + pulse * 2500,
        getFillColor: (d: Project) => [
          244,
          194,
          28,
          d.slug === activeSlug ? 140 : 60 + pulse * 40,
        ],
        radiusUnits: "meters",
        radiusMinPixels: 8,
        radiusMaxPixels: 36,
        stroked: false,
        pickable: false,
        updateTriggers: {
          getRadius: [phase, activeSlug],
          getFillColor: [phase, activeSlug],
        },
      }),

      // Mid ring
      new ScatterplotLayer({
        id: "pin-ring",
        data: projects,
        getPosition: (d: Project) => [d.coords[0], d.coords[1], 0],
        getRadius: (d: Project) => (d.slug === activeSlug ? 2200 : 1400),
        getLineColor: () => [244, 194, 28, 200],
        getFillColor: () => [0, 0, 0, 0],
        stroked: true,
        getLineWidth: 1.5,
        lineWidthUnits: "pixels",
        radiusUnits: "meters",
        radiusMinPixels: 5,
        radiusMaxPixels: 14,
        pickable: false,
        updateTriggers: { getRadius: [activeSlug] },
      }),

      // Core dot — clickable
      new ScatterplotLayer({
        id: "pin-core",
        data: projects,
        getPosition: (d: Project) => [d.coords[0], d.coords[1], 0],
        getRadius: () => 500,
        getFillColor: () => [255, 255, 255, 255],
        radiusUnits: "meters",
        radiusMinPixels: 3,
        radiusMaxPixels: 6,
        pickable: true,
        onClick: (info) => {
          const p = info.object as Project | undefined;
          if (p) {
            setSelected(p);
            flyToProject(p);
          }
        },
        onHover: (info) => {
          const canvas = mapRef.current?.getCanvas();
          if (canvas) {
            canvas.style.cursor = info.object ? "pointer" : "";
          }
        },
      }),
    ];
  }

  return (
    <>
      <div className="absolute inset-0">
        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
          aria-label="Interactive 3D globe showing BHC project locations across Greater Sydney"
        />
      </div>

      {/* Top vignette for nav legibility */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-10"
        aria-hidden
      />
      {/* Bottom vignette for hint legibility */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/60 to-transparent z-10"
        aria-hidden
      />

      {/* Loading state */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-fg-tertiary text-sm tracking-widest uppercase animate-pulse">
            Loading
          </div>
        </div>
      )}

      {/* Hint */}
      {ready && !selected && (
        <div className="pointer-events-none absolute bottom-10 left-6 lg:left-12 z-20 text-fg-tertiary text-xs tracking-widest uppercase opacity-70">
          Click a pin to explore a project
        </div>
      )}

      {/* Reset view button */}
      {ready && selected && (
        <button
          onClick={() => {
            setSelected(null);
            resetView();
          }}
          className="absolute bottom-10 left-6 lg:left-12 z-20 text-xs tracking-widest uppercase text-fg-secondary hover:text-fg-primary px-3 py-2 border border-[color:var(--border-default)] rounded-full backdrop-blur-md bg-black/30 transition-colors"
        >
          ← View all
        </button>
      )}

      <ProjectPanel
        project={selected}
        onClose={() => {
          setSelected(null);
          resetView();
        }}
      />

      {/* Hidden screen-reader project list */}
      <ul className="sr-only">
        {projects.map((p) => (
          <li key={p.slug}>
            <button onClick={() => { setSelected(p); flyToProject(p); }}>
              {p.name} — {p.suburb}. {p.headline}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
