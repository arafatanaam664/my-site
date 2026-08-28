export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Alshafra",
  url: "https://alshafra.com/",
  inLanguage: "ar",
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Alshafra",
  url: "https://alshafra.com/",
  inLanguage: "ar",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://alshafra.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export function toolWebApplicationLd(name: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: "ar",
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Alshafra", url: "https://alshafra.com/" },
  };
}

export function breadcrumbListLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageLd(questions: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export const legalSitemapPaths = ["about", "methodology", "privacy", "terms", "cookies", "ads", "copyright", "contact"] as const;
