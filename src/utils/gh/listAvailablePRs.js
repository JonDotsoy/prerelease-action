"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAvailablePRs = void 0;
const ghPRList_1 = require("./ghPRList");
const listAvailablePRs = async (labelToFilter) => {
    let prs = await (0, ghPRList_1.ghPRList)([
        "headRefName",
        "state",
        "id",
        "title",
        "number",
        "labels",
        "headRefOid",
    ]);
    return prs.filter((pr) => pr.labels.some((label) => label.name === labelToFilter)).sort((a, b) => a.number - b.number);
};
exports.listAvailablePRs = listAvailablePRs;
//# sourceMappingURL=listAvailablePRs.js.map