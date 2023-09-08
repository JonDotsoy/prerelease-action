import { test } from "vitest";
import { compile } from "./compile";

test("expect parse a string and return a document node", () => {
  console.log(
    compile()({
      githubRepoURL: "https://github.com/owner/repo",
      base: "develop",
      baseHead: "fab3124\n",
      destination: `pre-develop`,
      destinationHead: "12345",
      prs: [
        { number: 1, title: "abc" },
        { number: 2, title: "def ghi" },
        { number: 3, title: "Idae (asd)" },
      ],
    }),
  );
});
