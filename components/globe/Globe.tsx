"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map as MapLibreMap, LngLatLike } from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer } from "@deck.gl/layers";
import "maplibre-gl/dist/maplibre-gl.css";

import { projects, type Project } from "@/lib/projects";
import { ProjectPanel } from "./ProjectPanel";

// Sydney centre — used as a fallback only. The cinematic "home" camera below
// is now centred on the actual pin centroid so rotation orbits the pin cluster.
const SYDNEY: LngLatLike = [151.21, -33.87];

// ─────────────── Pin extent + rotation-safe camera ───────────────
// Computed once at module load.
const PIN_BBOX = projects.reduce(
  (acc, p) => {
    const [lng, lat] = p.coords;
    if (lng < acc.minLng) acc.minLng = lng;
    if (lng > acc.maxLng) acc.maxLng = lng;
    if (lat < acc.minLat) acc.minLat = lat;
    if (lat > acc.maxLat) acc.maxLat = lat;
    return acc;
  },
  { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity },
);

const PIN_CENTROID: LngLatLike = [
  (PIN_BBOX.minLng + PIN_BBOX.maxLng) / 2,
  (PIN_BBOX.minLat + PIN_BBOX.maxLat) / 2,
];

/**
 * Bounding box of all pins, inflated by √2 so the bbox fits the visible map
 * area at every possible bearing. Used by the mobile home-camera so pins
 * never leave the viewport during the cinematic auto-rotation.
 *
 * Geometric basis: the smallest square that contains a rectangle (w×h) at
 * any rotation angle has side length √2·max(w, h). Half-side is the
 * centre-to-edge distance the camera must accommodate.
 */
function getRotationSafeBounds(): [[number, number], [number, number]] {
  const w = PIN_BBOX.maxLng - PIN_BBOX.minLng;
  const h = PIN_BBOX.maxLat - PIN_BBOX.minLat;
  const cx = (PIN_BBOX.minLng + PIN_BBOX.maxLng) / 2;
  const cy = (PIN_BBOX.minLat + PIN_BBOX.maxLat) / 2;
  const half = (Math.max(w, h) * Math.SQRT2) / 2;
  return [
    [cx - half, cy - half],
    [cx + half, cy + half],
  ];
}

/**
 * Returns the "home" camera (no project selected) for a given viewport.
 *
 *   Mobile (<768px): pitch 30°, zoom dynamically fitted to the rotation-safe
 *     bbox so the pin cluster stays inside the viewport for every bearing.
 *   Desktop (≥768px): pitch 50° (dramatic), zoom 9.2 (matches the original
 *     framing).
 *
 * Centre is always PIN_CENTROID so the auto-rotation orbits the actual pin
 * cluster rather than Sydney CBD.
 */
function getHomeCamera(
  map: MapLibreMap,
  width: number,
  height: number,
  bearing = -12,
) {
  const padding = getHomePadding(width, height);
  if (width < 768) {
    const cam = map.cameraForBounds(getRotationSafeBounds(), {
      padding,
      pitch: 30,
      bearing: 0,
    });
    return {
      center: PIN_CENTROID,
      zoom: cam?.zoom ?? 8.4, // 8.4 fallback ≈ what cameraForBounds returns at 375px
      pitch: 30,
      bearing,
      padding,
    };
  }
  return {
    center: PIN_CENTROID,
    zoom: 9.2,
    pitch: 50,
    bearing,
    padding,
  };
}

/**
 * Camera padding for the "home" view. On desktop we push the focal point right
 * so the pin cluster doesn't sit behind the hero copy on the left.
 * On mobile we push the focal point upward via bottom padding so the pin
 * cluster sits above the hero text rather than behind it.
 *
 * `padding` works by shrinking the perceived viewport — padding of N px on a
 * side tells MapLibre to centre the `center` coord in the area minus N px on
 * that side, which visually shifts the map content away from that side.
 */
function getHomePadding(width: number, height: number) {
  if (width >= 1280) {
    return { left: Math.round(width * 0.4), top: 0, right: 0, bottom: 0 };
  }
  if (width >= 1024) {
    return { left: Math.round(width * 0.32), top: 0, right: 0, bottom: 0 };
  }
  // Mobile / tablet: shift focal point up so pins clear the hero copy below.
  return { left: 0, top: 0, right: 0, bottom: Math.round(height * 0.5) };
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

  // Mirror of `selected` so the rotation effect can read the current value
  // without being torn down and re-set-up on each selection change.
  const selectedRef = useRef<Project | null>(null);

  // Imperative handle exposed by the rotation system so the selection effect
  // can pause/resume without re-creating event listeners.
  const rotationCtlRef = useRef<{
    pause: () => void;
    scheduleResume: (delayMs: number) => void;
  } | null>(null);

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
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      ...getHomeCamera(map, window.innerWidth, window.innerHeight),
      duration: 1400,
      essential: true,
    });
  }, []);

  const closeProject = useCallback(() => {
    setSelected(null);
    resetView();
  }, [resetView]);

  const zoomBy = useCallback((delta: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      zoom: map.getZoom() + delta,
      duration: 350,
      easing: (t) => t * (2 - t),
    });
  }, []);

  // Escape key closes the project panel.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeProject]);

  // Keep selectedRef in sync for the rotation effect.
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Pause / resume the idle rotation when selection changes.
  // Separate from the rotation setup effect so we don't tear down listeners
  // on every selection toggle.
  useEffect(() => {
    const ctl = rotationCtlRef.current;
    if (!ctl) return;
    if (selected) {
      ctl.pause();
    } else {
      // 2s grace after the user closes the panel before idle rotation resumes —
      // gives the reset flyTo time to land.
      ctl.scheduleResume(2000);
    }
  }, [selected]);

  // ─────────────── Idle 360° rotation ───────────────
  // After the cinematic intro lands, the camera slowly orbits the current
  // centre at ~6°/sec (60s per full rotation). Pauses on any user interaction,
  // pin selection, or tab hide. Resumes after a short idle.
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map) return;
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;
    // Rotation runs on mobile too — the camera now uses a rotation-safe zoom
    // (see getHomeCamera) so pins stay in the viewport at every bearing.

    const DEG_PER_SEC = 6; // full rotation every 60s, both desktop + mobile

    let raf: number | null = null;
    let lastTs = 0;
    let resumeTimer: number | null = null;
    // `userPaused` blocks rotation until an explicit scheduleResume call.
    // The library-driven flyTo / easeTo animations would otherwise count as
    // "moves" and re-pause us forever.
    let userPaused = false;
    let started = false;

    const stop = () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    const start = () => {
      if (raf !== null) return;
      if (userPaused) return;
      if (selectedRef.current) return;
      if (document.hidden) return;
      lastTs = performance.now();
      const tick = (ts: number) => {
        const dt = (ts - lastTs) / 1000;
        lastTs = ts;
        // setBearing instead of easeTo to avoid triggering moveend bouncing.
        map.setBearing((map.getBearing() + DEG_PER_SEC * dt) % 360);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      started = true;
    };

    const pause = () => {
      userPaused = true;
      stop();
      if (resumeTimer !== null) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };

    const scheduleResume = (delayMs: number) => {
      if (resumeTimer !== null) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        resumeTimer = null;
        userPaused = false;
        start();
      }, delayMs);
    };

    // Initial start — kick in the moment the cinematic intro flyTo finishes.
    // Intro = 600ms pre-flyTo delay + 3200ms flyTo duration = 3800ms total.
    // No settle grace — rotation flows straight out of the intro animation.
    const initialTimer = window.setTimeout(() => {
      if (!selectedRef.current) start();
    }, 3800);

    // Expose imperative pause/resume to the selection effect.
    rotationCtlRef.current = { pause, scheduleResume };

    // Distinguish user-initiated moves from library-driven flyTo.
    // MapLibre fires `dragstart`/`zoomstart`/etc only for user input;
    // flyTo / easeTo / jumpTo do not. So these are safe to wire as pause triggers.
    const onUserStart = () => {
      pause();
    };
    const onUserEnd = () => {
      // After the user releases, resume after 1s of idle —
      // but only if no panel is open.
      if (selectedRef.current) return;
      scheduleResume(1000);
    };

    map.on("mousedown", onUserStart);
    map.on("touchstart", onUserStart);
    map.on("wheel", onUserStart);
    map.on("dragstart", onUserStart);
    map.on("zoomstart", onUserStart);
    map.on("pitchstart", onUserStart);
    map.on("rotatestart", onUserStart);

    map.on("dragend", onUserEnd);
    map.on("zoomend", onUserEnd);
    map.on("pitchend", onUserEnd);
    map.on("rotateend", onUserEnd);
    map.on("touchend", onUserEnd);

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else if (!userPaused && !selectedRef.current && started) {
        start();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(initialTimer);
      if (resumeTimer !== null) window.clearTimeout(resumeTimer);
      stop();
      rotationCtlRef.current = null;
      map.off("mousedown", onUserStart);
      map.off("touchstart", onUserStart);
      map.off("wheel", onUserStart);
      map.off("dragstart", onUserStart);
      map.off("zoomstart", onUserStart);
      map.off("pitchstart", onUserStart);
      map.off("rotatestart", onUserStart);
      map.off("dragend", onUserEnd);
      map.off("zoomend", onUserEnd);
      map.off("pitchend", onUserEnd);
      map.off("rotateend", onUserEnd);
      map.off("touchend", onUserEnd);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ready]);

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
    // debug-only handle on window; cast avoids a global type augmentation.
    if (typeof window !== "undefined") {
      (window as unknown as { __bhcMap?: unknown }).__bhcMap = map;
    }

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
            ...getHomeCamera(map, window.innerWidth, window.innerHeight),
            duration: 1400,
            essential: true,
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
      if (prefersReducedMotion) {
        // No animation — jump straight to the proper home view (centroid +
        // device-appropriate pitch/zoom). cameraForBounds inside getHomeCamera
        // now works because the map has loaded.
        map.jumpTo(
          getHomeCamera(map, window.innerWidth, window.innerHeight, 0),
        );
      } else {
        // Cinematic intro: from space → centroid of all pins, framed to fit
        // the full pin cluster within the visible viewport area so the
        // upcoming rotation never pushes a pin off-screen.
        setTimeout(() => {
          map.flyTo({
            ...getHomeCamera(map, window.innerWidth, window.innerHeight),
            duration: 3200,
            curve: 1.4,
            essential: true,
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

      {/* Hint — desktop / tablet only. On mobile the pulsing pins are
          intuitive enough and this would clash with the scroll cue + zoom
          controls in the cramped bottom band. */}
      {ready && !selected && (
        <div className="pointer-events-none hidden md:block absolute bottom-10 left-6 lg:left-12 z-20 text-fg-tertiary text-xs tracking-widest uppercase opacity-70">
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

      {/* Zoom controls — bottom right, away from hero copy + scroll cue.
          Hidden on mobile (<md): mobile users get pinch-to-zoom which is
          reliable, and showing the +/- pills clutters the cramped bottom
          band on phones. */}
      {ready && (
        <div className="hidden md:flex absolute bottom-10 right-6 lg:right-12 z-20 flex-col gap-1.5">
          <button
            onClick={() => zoomBy(1)}
            aria-label="Zoom in"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[color:var(--border-default)] text-fg-secondary hover:text-fg-primary hover:border-[color:var(--accent)] backdrop-blur-md bg-black/40 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => zoomBy(-1)}
            aria-label="Zoom out"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-[color:var(--border-default)] text-fg-secondary hover:text-fg-primary hover:border-[color:var(--accent)] backdrop-blur-md bg-black/40 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
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
