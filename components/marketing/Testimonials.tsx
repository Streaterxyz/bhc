"use client";

import { motion } from "framer-motion";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "BHC has been a genuinely valuable partner for Sonnel Group. Their hands-on approach has elevated our service standards, grown beverage sales, and built operational systems our teams can actually follow. Reliable, proactive, and genuinely invested in our success.",
    name: "Jacqui Corbett",
    role: "General Manager Operations · Sonnel Group",
  },
  {
    quote:
      "BHC's strategic input was a game-changer. They didn't just give us ideas — they gave us the tools to execute them. The work landed across our teams, our service standards, and our commercial performance.",
    name: "Ramzey Chocker",
    role: "The Grounds of Alexandria",
  },
  {
    quote:
      "We increased in-house spend and created a premium experience. Brendon understood our brand's ethos and delivered value — aligning beverage, partnerships, and experience with our vision of simplicity, sustainability, and luxury tailoring.",
    name: "Theodore English",
    role: "Belancē Tailors",
  },
  {
    quote:
      "BHC's work with The Viral Group was transformative. The audit improved our beverage offerings, boosted profitability, and elevated customer experience — leading to stronger satisfaction and repeat business. The impact landed where it counts.",
    name: "Adam Levine",
    role: "The Viral Group",
  },
];

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative bg-bg-base py-24 lg:py-36 px-6 lg:px-12 border-t border-[color:var(--border-subtle)]"
    >
      {/* Vertical brand label */}
      <div
        aria-hidden
        className="hidden lg:block absolute top-24 left-6 label-vertical text-[0.7rem] tracking-[0.3em] uppercase text-fg-muted"
      >
        07 · Testimonials
      </div>

      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 lg:mb-24 max-w-4xl lg:pl-12"
        >
          <p className="eyebrow mb-5">In Their Words</p>
          <h2 id="testimonials-heading" className="headline">
            What partners{" "}
            <span className="text-[color:var(--accent)]">say</span> about the work.
          </h2>
        </motion.div>

        {/* Quotes — 2x2 editorial grid */}
        <div className="lg:pl-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-[color:var(--border-subtle)] border border-[color:var(--border-subtle)]">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1 * i,
              }}
              className="group relative bg-bg-base p-8 lg:p-12 hover:bg-bg-elevated transition-colors duration-500"
            >
              {/* Gold accent line that draws in on hover */}
              <div className="absolute top-0 left-0 h-px w-0 bg-[color:var(--accent)] group-hover:w-full transition-all duration-700 ease-out" />

              {/* Oversized opening quote mark */}
              <div
                aria-hidden
                className="text-6xl lg:text-7xl leading-none font-extrabold text-[color:var(--accent)] mb-4 select-none"
              >
                &ldquo;
              </div>

              <blockquote className="text-fg-secondary text-lg lg:text-xl leading-[1.55] font-light mb-8">
                {t.quote}
              </blockquote>

              <figcaption className="flex items-center gap-3 pt-6 border-t border-[color:var(--border-subtle)]">
                <div>
                  <div className="text-fg-primary font-semibold leading-tight">
                    {t.name}
                  </div>
                  <div className="text-fg-tertiary text-xs tracking-[0.12em] uppercase mt-1">
                    {t.role}
                  </div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
