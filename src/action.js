#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const node_util_1 = require("node:util");
const action_1 = require("./lib/action");
const labelNameToMerge = (0, core_1.getInput)("label_name_to_merge", {
    required: true,
    trimWhitespace: true,
});
const baseBranch = (0, core_1.getInput)("base_brach", {
    required: true,
    trimWhitespace: true,
});
const destinationBranch = (0, core_1.getInput)("destination_brach", {
    required: false,
    trimWhitespace: true,
});
const withSummary = (0, core_1.getInput)("with_summary", {
    required: false,
    trimWhitespace: true,
});
(0, action_1.action)({
    labelNameToMerge: labelNameToMerge,
    baseBranch: baseBranch,
    destinationBranch: destinationBranch
        ? destinationBranch
        : `pre-${baseBranch}`,
    withSummary: withSummary === "true",
})
    .then((s) => {
    (0, core_1.setOutput)("changed", s.changed);
    (0, core_1.setOutput)("pr_name", s.prName);
    (0, core_1.setOutput)("ref", s.ref);
})
    .catch((ex) => {
    (0, core_1.setOutput)("changed", false);
    console.error(ex);
    (0, core_1.setFailed)(typeof ex === "string"
        ? ex
        : ex instanceof Error
            ? ex.message
            : (0, node_util_1.inspect)(ex));
    process.exitCode = 1;
});
//# sourceMappingURL=action.js.map