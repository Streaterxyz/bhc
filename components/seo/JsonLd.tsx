/**
 * Renders a JSON-LD structured-data block. Server component — no client JS.
 * JSON.stringify with `<` escaped so markup inside string values can never
 * break out of the script element.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
