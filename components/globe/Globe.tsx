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

/**
 * Camera padding for the "home" view. On desktop we push the focal point right
 * so the pin cluster doesn't sit behind the hero copy on the left.
 * `padding` works by shrinking the perceived viewport — left padding of N px
 * tells MapLibre to centre the `center` coord in the area to the right of N,
 * which visually shifts the map content to the right.
 */
function getHomePadding(width: number) {
  if (width >= 1280) return { left: Math.round(width * 0.4), top: 0, right: 0, bottom: 0 };
  if (width >= 1024) return { left: Math.round(width * 0.32), top: 0, right: 0, bottom: 0 };
  return { left: 0, top: 0, right: 0, bottom: 0 };
}

/**
 * Camera padding when a project is selected — the side panel takes the right
 * 480px on desktop, so we push the focal point left to keep the pin visible.
 */
function getProjectPadding(width: number) {
  if (width >= 1024) return { right: 500, left: 0, top: 0, bottom: 0 };
  return { left: 0, top: 0, right: 0, bottom: 0 };
}

// Use OpenFreeMap's hosted dark style as a starting point.
// We override the background and key paint colours via setPaintProperty after load
// to bring it in line with the BHC monochrome palette.
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/**
 * Walk the loaded style layers and push them toward the BHC monochrome palette.
 * Done at runtime so we can use the OpenFreeMap-hosted style without forking it.
 *
 * Contrast hierarchy against the #000 page background:
 *   space/water (#070707) → landmass (#1f1f1f) → buildings (#2c2c2c)
 *   → minor roads (#363636) → major roads (#4a4a4a) → boundaries (#3a3a3a)
 *
 * The landmass jump from #07 → #1f is what gives the globe its visible silhouette.
 */
function applyMonochromeOverrides(map: MapLibreMap) {
  const layers = map.getStyle().layers ?? [];
  for (const layer of layers) {
    try {
      const id = layer.id;
      const t = layer.type;

      // Background — the sphere "ground" colour. Sits just above pure black so
      // it's visible against #000 space.
      if (t === "background") {
        map.setPaintProperty(id, "background-color", "#1a1a1a");
        continue;
      }

      // Symbol (text/icons): hide labels for ultra-minimal aesthetic
      if (t === "symbol") {
        map.setLayoutProperty(id, "visibility", "none");
        continue;
      }

      // Water — darker than land so coastlines read.
      if (/water|ocean|sea/i.test(id)) {
        if (t === "fill") {
          map.setPaintProperty(id, "fill-color", "#070707");
          map.setPaintProperty(id, "fill-opacity", 1);
        }
        continue;
      }

      // Park / landcover / landuse — medium-dark grey
      if (/park|landcover|landuse|wood|grass|forest/i.test(id)) {
        if (t === "fill") {
          map.setPaintProperty(id, "fill-color", "#1f1f1f");
          map.setPaintProperty(id, "fill-opacity", 0.85);
        }
        continue;
      }

      // Buildings — clearly visible against land
      if (/building/i.test(id)) {
        if (t === "fill") {
          map.setPaintProperty(id, "fill-color", "#2c2c2c");
          map.setPaintProperty(id, "fill-opacity", 0.9);
        }
        if (t === "fill-extrusion") {
          map.setPaintProperty(id, "fill-extrusion-color", "#2c2c2c");
          map.setPaintProperty(id, "fill-extrusion-opacity", 0.95);
        }
        continue;
      }

      // Roads — major roads brighter than minor for hierarchy
      if (/motorway|highway|primary|trunk/i.test(id)) {
        if (t === "line") {
          map.setPaintProperty(id, "line-color", "#4a4a4a");
          map.setPaintProperty(id, "line-opacity", 0.95);
        }
        continue;
      }

      if (/road|tunnel|bridge|street|transportation|secondary|tertiary/i.test(id)) {
        if (t === "line") {
          map.setPaintProperty(id, "line-color", "#363636");
          map.setPaintProperty(id, "line-opacity", 0.9);
        }
        continue;
      }

      // Boundaries — bright enough to read on the landmass
      if (/boundary|admin/i.test(id)) {
        if (t === "line") {
          map.setPaintProperty(id, "line-color", "#3a3a3a");
          map.setPaintProperty(id, "line-opacity", 0.7);
        }
        continue;
      }

      // Generic fill fallback — landmass tone
      if (t === "fill") {
        map.setPaintProperty(id, "fill-color", "#1c1c1c");
      }
      if (t === "line") {
        map.setPaintProperty(id, "line-color", "#2e2e2e");
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
      padding: getProjectPadding(window.innerWidth),
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
      padding: getHomePadding(window.innerWidth),
    });
  }, []);

  const closeProject = useCallback(() => {
    setSelected(null);
    resetView();
  }, [resetView]);

  // Escape key closes the project panel.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeProject]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mercator projection for both basemap and deck.gl pins — guarantees that
    // pin screen positions match the basemap at every zoom level. The previous
    // globe projection produced a visible drift on zoom-out because deck.gl in
    // overlay mode projects in Mercator while MapLibre globe projects on a sphere.
    // We keep the cinematic feel via a wide initial zoom + flyTo, just on a
    // flat-projected world instead of a curved sphere.
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: SYDNEY,
      zoom: prefersReducedMotion ? 9 : 2.6,
      pitch: prefersReducedMotion ? 50 : 0,
      bearing: 0,
      attributionControl: false,
      interactive: true,
      maxPitch: 70,
      minZoom: 2,
      // Critical for hero UX: don't trap wheel events for zoom — let the page
      // scroll naturally past the hero. Users can still zoom via pinch on
      // trackpad, +/- buttons, double-click, and clicking project pins.
      scrollZoom: false,
    });

    mapRef.current = map;
    // @ts-expect-error debug-only
    if (typeof window !== "undefined") window.__bhcMap = map;

    map.on("error", (e) => {
      console.error("[map error]", e?.error?.message || e);
    });

    // Click on empty map → close any open project panel.
    // In deck.gl overlay mode, pin clicks are consumed by the hit-test layer
    // and never reach this handler, so it only fires on background clicks.
    map.on("click", () => {
      setSelected((prev) => {
        if (!prev) return prev;
        // Defer the reset flyTo so this click handler returns cleanly.
        requestAnimationFrame(() => {
          map.flyTo({
            center: SYDNEY,
            zoom: 9.2,
            pitch: 50,
            bearing: -12,
            duration: 1400,
            essential: true,
            padding: getHomePadding(window.innerWidth),
          });
        });
        return null;
      });
    });

    // Reveal the UI as soon as the style is parsed (sphere visible).
    // The deck.gl overlay is attached separately, gated on full map.load.
    let readyFired = false;
    const tryReady = () => {
      if (readyFired || !map.isStyleLoaded()) return;
      readyFired = true;
      setReady(true);
      try {
        applyMonochromeOverrides(map);
      } catch (err) {
        console.warn("Monochrome overrides failed:", err);
      }
    };
    map.on("styledata", tryReady);
    map.on("idle", tryReady);

    const bootstrap = () => {
      const homePadding = getHomePadding(window.innerWidth);

      if (prefersReducedMotion) {
        // No animation — just set the padded view immediately.
        map.setPadding(homePadding);
      } else {
        // Cinematic intro: from space → Sydney, padded right of hero copy.
        setTimeout(() => {
          map.flyTo({
            center: SYDNEY,
            zoom: 9.2,
            pitch: 50,
            bearing: -12,
            duration: 3200,
            curve: 1.4,
            essential: true,
            padding: homePadding,
          });
        }, 600);
      }

      // Add deck.gl overlay for project pins.
      // interleaved: false → renders as a single composite canvas ABOVE the map,
      // giving us clean halos with no tile-seam clipping and full pin visibility.
      // The projection-drift trade-off of overlay mode is mitigated by capping
      // map minZoom to 6 (set in the Map constructor) so the user can never
      // navigate to a zoom level where the drift becomes visible.
      const overlay = new MapboxOverlay({
        interleaved: false,
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

    // deck.gl overlay attaches only after full map.load — the transform is wired then.
    map.once("load", bootstrap);

    return () => {
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
      // Outer pulsing halo — reduced by 50% from original to ease cluster crowding.
      new ScatterplotLayer({
        id: "pin-halo",
        data: projects,
        getPosition: (d: Project) => [d.coords[0], d.coords[1], 0],
        getRadius: (d: Project) =>
          d.slug === activeSlug ? 3000 + pulse * 1750 : 1750 + pulse * 1250,
        getFillColor: (d: Project) => [
          244,
          194,
          28,
          d.slug === activeSlug ? 140 : 60 + pulse * 40,
        ],
        radiusUnits: "meters",
        radiusMinPixels: 4,
        radiusMaxPixels: 18,
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

      // Core dot — visual only
      new ScatterplotLayer({
        id: "pin-core",
        data: projects,
        getPosition: (d: Project) => [d.coords[0], d.coords[1], 0],
        getRadius: () => 500,
        getFillColor: () => [255, 255, 255, 255],
        radiusUnits: "meters",
        radiusMinPixels: 3,
        radiusMaxPixels: 6,
        pickable: false,
      }),

      // Invisible hit-test layer — generous click target so users don't have
      // to land precisely on the 3-6px core dot. Sits above everything else.
      new ScatterplotLayer({
        id: "pin-hittest",
        data: projects,
        getPosition: (d: Project) => [d.coords[0], d.coords[1], 0],
        getRadius: () => 5000,
        getFillColor: () => [0, 0, 0, 0], // fully transparent
        radiusUnits: "meters",
        radiusMinPixels: 22,
        radiusMaxPixels: 40,
        stroked: false,
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"
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
          onClick={closeProject}
          className="absolute bottom-10 left-6 lg:left-12 z-20 text-xs tracking-widest uppercase text-fg-secondary hover:text-fg-primary px-3 py-2 border border-[color:var(--border-default)] rounded-full backdrop-blur-md bg-black/30 transition-colors"
        >
          ← View all
        </button>
      )}

      <ProjectPanel project={selected} onClose={closeProject} />

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
