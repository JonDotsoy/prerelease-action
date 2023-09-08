"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHashHistory = void 0;
const makeHashHistory = (mainHeadRefOid, prs) => [`${mainHeadRefOid}\n`, ...prs.map((pr) => `${pr.number} ${pr.headRefOid}\n`)]
    .join("");
exports.makeHashHistory = makeHashHistory;
//# sourceMappingURL=ref-history.js.map