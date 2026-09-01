import { extractHeadings, htmlToPlainText, looksLikeHtml } from "./content-html";
import { breadcrumbListLd } from "./site-schema";

export type ContentSchemaInput = {
  kind: string;
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  body?: string | null;
  sectionTitle?: string;
};

const organization = {
  "@type": "Organization",
  name: "Alshafra",
  url: "https://alshafra.com/",
  logo: { "@type": "ImageObject", url: "https://alshafra.com/logo.png", width: 512, height: 512 },
};

function imageObject(input: ContentSchemaInput) {
  if (!input.image) return {};
  return {
    image: {
      "@type": "ImageObject",
      url: input.image,
      width: input.imageWidth || 1200,
      height: input.imageHeight || 675,
    },
  };
}

export function schemaTypeForKind(kind: string) {
  if (kind === "news") return "NewsArticle";
  if (kind === "guide") return "HowTo";
  if (kind === "faq") return "FAQPage";
  if (kind === "tool") return "WebApplication";
  if (kind === "article" || kind === "solution" || kind === "page") return "Article";
  return "WebPage";
}

function howToSteps(body: string | null | undefined, title: string, description: string) {
  const headings = body && looksLikeHtml(body) ? extractHeadings(body) : [];
  if (headings.length) return headings.map((heading, index) => ({ "@type": "HowToStep", position: index + 1, name: heading.text }));
  return [{ "@type": "HowToStep", position: 1, name: title, text: description }];
}

function faqEntities(title: string, description: string, body: string | null | undefined) {
  const headings = body && looksLikeHtml(body) ? extractHeadings(body) : [];
  if (headings.length) return headings.map((heading) => ({ "@type": "Question", name: heading.text, acceptedAnswer: { "@type": "Answer", text: description } }));
  return [{ "@type": "Question", name: title, acceptedAnswer: { "@type": "Answer", text: description } }];
}

export function contentKindJsonLd(input: ContentSchemaInput) {
  const type = schemaTypeForKind(input.kind);
  const base = {
    "@context": "https://schema.org",
    "@type": type,
    name: input.title,
    headline: input.title,
    description: input.description,
    url: input.url,
    inLanguage: "ar",
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    ...imageObject(input),
    ...(input.sectionTitle ? { articleSection: input.sectionTitle } : {}),
  };
  if (type === "WebApplication") {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: input.title,
      description: input.description,
      url: input.url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      inLanguage: "ar",
      isAccessibleForFree: true,
      publisher: organization,
    };
  }
  if (type === "HowTo") {
    return { ...base, "@type": "HowTo", step: howToSteps(input.body, input.title, input.description), publisher: organization };
  }
  if (type === "FAQPage") {
    return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqEntities(input.title, input.description, input.body), inLanguage: "ar", url: input.url };
  }
  if (type === "NewsArticle") {
    return { ...base, "@type": "NewsArticle", author: organization, publisher: organization };
  }
  return { ...base, "@type": "Article", author: organization, publisher: organization };
}

export function contentPageJsonLd(input: ContentSchemaInput, breadcrumbs: Array<{ name: string; url: string }>) {
  return [contentKindJsonLd(input), breadcrumbListLd(breadcrumbs)];
}

export function collectionPageJsonLd(name: string, description: string, url: string, items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    inLanguage: "ar",
    isPartOf: { "@type": "WebSite", name: "Alshafra", url: "https://alshafra.com/" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: item.url })),
    },
  };
}

export function ogTypeForKind(kind: string) {
  return kind === "tool" || kind === "page" ? "website" : "article";
}

export function plainDescription(value: string | null | undefined, fallback: string) {
  const text = htmlToPlainText(value ?? "");
  return text || fallback;
}
