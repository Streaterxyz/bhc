import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CTABlock } from "@/components/marketing/CTABlock";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { MetricTile } from "@/components/projects/MetricTile";
import { PillarTile } from "@/components/projects/PillarTile";
import {
  projects,
  getProjectBySlug,
  getRelatedProjects,
  SERVICE_LABELS,
  TYPE_LABELS,
} from "@/lib/projects";
import { getHeroImage, getGalleryImages } from "@/lib/projectImages";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found — BHC" };
  return {
    title: `${project.name} — BHC`,
    description: project.summary,
    openGraph: {
      title: `${project.name} — BHC`,
      description: project.summary,
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const related = getRelatedProjects(slug, 3);
  const heroImage = await getHeroImage(slug);
  const galleryImages = await getGalleryImages(slug);

  return (
    <>
      <Header />
      <main>
        {/* ────────────────── Hero ────────────────── */}
        <section
          aria-labelledby="project-name"
          className="relative h-[80vh] min-h-[560px] lg:min-h-[680px] overflow-hidden bg-black"
        >
          {heroImage ? (
            <Image
              src={heroImage}
              alt={`${project.name} — ${TYPE_LABELS[project.type]} in ${project.suburb}`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            // Placeholder gradient when no hero photo has been supplied yet.
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(at 25% 30%, rgba(244,194,28,0.10), transparent 55%), radial-gradient(at 75% 80%, rgba(255,255,255,0.04), transparent 55%), linear-gradient(140deg, #1a1a1a 0%, #050505 60%, #111 100%)",
              }}
            />
          )}
          {/* Faint scanline grain — adds editorial texture over the photo */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.10] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
            }}
          />
          {/* Dark gradient for title + meta legibility */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/35 pointer-events-none"
          />

          {/* Top: back link */}
          <div className="relative z-10 px-6 lg:px-12 pt-24">
            <div className="max-w-[1440px] mx-auto">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
              >
                <span aria-hidden>←</span>
                <span>Back to the globe</span>
              </Link>
            </div>
          </div>

          {/* Bottom: title + meta */}
          <div className="relative z-10 absolute inset-x-0 bottom-0 px-6 lg:px-12 pb-12 lg:pb-20">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center gap-3 mb-5 text-[0.7rem] tracking-[0.2em] uppercase">
                <span className="text-[color:var(--accent)] font-semibold">
                  {TYPE_LABELS[project.type]}
                </span>
                <span className="text-fg-muted">·</span>
                <span className="text-fg-tertiary">{project.suburb}</span>
                <span className="text-fg-muted">·</span>
                <span className="text-fg-tertiary">{project.year}</span>
              </div>

              <h1
                id="project-name"
                className="display max-w-5xl"
              >
                {project.name}
              </h1>

              <p className="body-lg mt-6 max-w-2xl">{project.headline}</p>

              {project.website && (
                <Link
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-8 text-xs tracking-[0.18em] uppercase text-fg-tertiary hover:text-[color:var(--accent)] transition-colors"
                >
                  <span>Visit website</span>
                  <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ────────────────── Meta bar ────────────────── */}
        <section className="bg-bg-elevated border-t border-b border-[color:var(--border-subtle)] px-6 lg:px-12 py-6">
          <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetaItem label="Client" value={project.client} />
            <MetaItem label="Engagement" value={project.duration} />
            <MetaItem label="Year" value={String(project.year)} />
            <MetaItem
              label="Location"
              value={`${project.suburb}, Sydney`}
            />
          </div>
        </section>

        {/* ────────────────── Summary ────────────────── */}
        <section className="px-6 lg:px-12 py-20 lg:py-28">
          <div className="max-w-[1440px] mx-auto lg:pl-12">
            <p className="eyebrow mb-5">Overview</p>
            <p className="text-2xl lg:text-3xl font-light leading-[1.35] max-w-4xl text-fg-primary">
              {project.summary}
            </p>
          </div>
        </section>

        {/* ────────────────── Challenge / Approach / Outcome — optional long-form ────────────────── */}
        {(project.challenge || project.approach || project.outcome) && (
          <section className="px-6 lg:px-12 pb-20 lg:pb-28">
            <div className="max-w-[1440px] mx-auto lg:pl-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {project.challenge && (
                <NarrativeBlock
                  index="01"
                  title="The Challenge"
                  body={project.challenge}
                />
              )}
              {project.approach && (
                <NarrativeBlock
                  index="02"
                  title="The Approach"
                  body={project.approach}
                />
              )}
              {project.outcome && (
                <NarrativeBlock
                  index="03"
                  title="The Outcome"
                  body={project.outcome}
                />
              )}
            </div>
          </section>
        )}

        {/* ────────────────── Results / metrics ────────────────── */}
        <section
          aria-labelledby="results-heading"
          className="bg-black border-t border-[color:var(--border-subtle)] px-6 lg:px-12 py-20 lg:py-28"
        >
          <div className="max-w-[1440px] mx-auto lg:pl-12">
            <p className="eyebrow mb-5">Results</p>
            <h2
              id="results-heading"
              className="headline max-w-3xl mb-12 lg:mb-16"
            >
              {project.headline}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
              {project.pillars?.map((p, i) => (
                <PillarTile
                  key={p.title}
                  title={p.title}
                  body={p.body}
                  index={i}
                />
              ))}
              {project.metrics?.map((m, i) => (
                <MetricTile
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  index={i + (project.pillars?.length ?? 0)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────── Services applied ────────────────── */}
        <section className="px-6 lg:px-12 py-20 lg:py-28 border-t border-[color:var(--border-subtle)]">
          <div className="max-w-[1440px] mx-auto lg:pl-12">
            <p className="eyebrow mb-5">What We Brought</p>
            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-10">
              Disciplines applied to this engagement.
            </h3>
            <ul className="flex flex-wrap gap-3">
              {project.services.map((s) => (
                <li
                  key={s}
                  className="px-5 py-2.5 rounded-full border border-[color:var(--border-default)] text-fg-secondary text-sm"
                >
                  {SERVICE_LABELS[s]}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ────────────────── Gallery (optional) ────────────────── */}
        {galleryImages.length > 0 && (
          <section
            aria-label="Project gallery"
            className="bg-black px-6 lg:px-12 py-20 lg:py-28 border-t border-[color:var(--border-subtle)]"
          >
            <div className="max-w-[1440px] mx-auto lg:pl-12">
              <p className="eyebrow mb-5">Inside The Venue</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-10 lg:mb-14">
                A look at the engagement.
              </h3>
              <div
                className={`grid gap-3 lg:gap-4 ${
                  galleryImages.length === 1
                    ? "grid-cols-1"
                    : galleryImages.length === 2
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {galleryImages.map((src, i) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden bg-bg-elevated"
                  >
                    <Image
                      src={src}
                      alt={`${project.name} — photo ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ────────────────── Testimonial (optional) ────────────────── */}
        {project.testimonial && (
          <section className="bg-bg-elevated px-6 lg:px-12 py-20 lg:py-32 border-t border-[color:var(--border-subtle)]">
            <div className="max-w-4xl mx-auto text-center">
              <span
                aria-hidden
                className="block text-6xl text-[color:var(--accent)] font-extrabold mb-6"
              >
                &ldquo;
              </span>
              <blockquote className="text-2xl lg:text-3xl font-light leading-[1.4] text-fg-primary mb-10">
                {project.testimonial.quote}
              </blockquote>
              <div className="text-fg-primary font-semibold">
                {project.testimonial.name}
              </div>
              <div className="text-xs tracking-[0.16em] uppercase text-fg-tertiary mt-1">
                {project.testimonial.role}
              </div>
            </div>
          </section>
        )}

        {/* ────────────────── Related projects ────────────────── */}
        {related.length > 0 && (
          <section className="px-6 lg:px-12 py-20 lg:py-28 border-t border-[color:var(--border-subtle)]">
            <div className="max-w-[1440px] mx-auto lg:pl-12">
              <div className="mb-12 lg:mb-16">
                <p className="eyebrow mb-5">Related Projects</p>
                <h3 className="headline">More from our work.</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
                {related.map((p, i) => (
                  <ProjectCard
                    key={p.slug}
                    project={p}
                    aspect={i % 2 === 0 ? "tall" : "wide"}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <CTABlock />
      </main>
      <Footer />
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-fg-muted mb-2">
        {label}
      </div>
      <div className="text-sm text-fg-primary font-semibold">{value}</div>
    </div>
  );
}

function NarrativeBlock({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}) {
  return (
    <div className="lg:col-span-4">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-sm font-bold text-[color:var(--accent)]">
          {index}
        </span>
        <span className="h-px flex-1 bg-[color:var(--border-default)]" />
      </div>
      <h3 className="text-xl lg:text-2xl font-extrabold tracking-tight mb-4">
        {title}
      </h3>
      <p className="text-fg-secondary leading-relaxed">{body}</p>
    </div>
  );
}
