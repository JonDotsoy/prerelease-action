"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const compile_1 = require("./compile");
(0, vitest_1.test)("expect parse a string and return a document node", () => {
    console.log((0, compile_1.compile)()({
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
    }));
});
//# sourceMappingURL=compile.spec.js.map