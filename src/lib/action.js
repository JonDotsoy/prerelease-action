"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = void 0;
const exec_1 = require("@actions/exec");
const core_1 = require("@actions/core");
const listAvailablePRs_1 = require("../utils/gh/listAvailablePRs");
const git_1 = require("../utils/git/git");
const ref_history_1 = require("../utils/general/ref-history");
const get_local_ref_history_1 = require("../utils/general/get-local-ref-history");
const action = async ({ labelNameToMerge, baseBranch, ...options }) => {
    const prs = await (0, listAvailablePRs_1.listAvailablePRs)(labelNameToMerge);
    const destinationBranch = options.destinationBranch ?? `pre-${baseBranch}`;
    const mergeStrategy = options.mergeStrategy;
    await git_1.git.switchOnly(baseBranch);
    const hashHistory = (0, ref_history_1.makeHashHistory)(await git_1.git.currentHead(), prs);
    await git_1.git.setConfig("user.name", "github-actions[bot]");
    await git_1.git.setConfig("user.email", "41898282+github-actions[bot]@users.noreply.github.com");
    // git config advice.addIgnoredFile false
    await git_1.git.setConfig("advice.addIgnoredFile", "false");
    const hashHistoryCommitted = await (0, get_local_ref_history_1.getLocalRefHistory)(destinationBranch, baseBranch);
    (0, core_1.debug)("Current Hash History");
    (0, core_1.debug)(hashHistoryCommitted ?? "[null]");
    if (hashHistoryCommitted === hashHistory) {
        (0, core_1.debug)(`Cannot found new history to merge`);
        const prName = destinationBranch;
        const ref = await git_1.git.revParse(prName);
        return {
            changed: false,
            prName,
            ref,
        };
    }
    await (0, exec_1.exec)("git", ["branch", "-D", destinationBranch], {
        ignoreReturnCode: true,
    });
    await git_1.git.switch(destinationBranch, baseBranch);
    for (const pr of prs) {
        // git merge sample1 --no-ff -m "(#1) sampel1"
        try {
            await (0, git_1.git)("merge", pr.headRefOid, ...(mergeStrategy ? ["-X", mergeStrategy] : []), "--no-ff", "-m", `(#${pr.number}) ${pr.title}`);
        }
        catch (ex) {
            if (ex instanceof Error) {
                throw new Error(`Failed merge PR #${pr.number}: ${ex.message}`);
            }
            throw ex;
        }
    }
    await (0, get_local_ref_history_1.setLocalRefHistory)(hashHistory);
    await (0, exec_1.exec)("git", ["push", "-f", "origin", destinationBranch]);
    await git_1.git.switchOnly(baseBranch);
    const prName = destinationBranch;
    const ref = await git_1.git.revParse(prName);
    return { changed: true, prName, ref };
};
exports.action = action;
//# sourceMappingURL=action.js.map