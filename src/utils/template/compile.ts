import * as handlebars from "handlebars";

const defaultTemplateSummary = `
### List of Changes

**Branch base:** [\`{{base}}\`]({{trim githubRepoURL}}/commit/{{trim baseHead}})

{{#each prs}}
- [PR #{{trim number}} {{trim title}}]({{trim ../githubRepoURL}}/pull/{{number}})
{{/each}}

**Full Changelog:** [\`{{trim base}}...{{trim destination}}\`]({{trim githubRepoURL}}/compare/{{trim baseHead}}...{{trim destinationHead}})

`.trimStart();

interface Options {
  githubRepoURL: string;
  base: string;
  baseHead: string;
  destination: string;
  destinationHead: string;
  prs: {
    number: number;
    title: string;
  }[];
}

export const compile = (template?: string): (options: Options) => string => {
  const h = handlebars.create();

  h.registerHelper("trim", (s) => `${s}`.trim());

  return h.compile(template ?? defaultTemplateSummary);
};
