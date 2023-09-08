"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = void 0;
const exec_1 = require("@actions/exec");
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const listAvailablePRs_1 = require("../utils/gh/listAvailablePRs");
const git_1 = require("../utils/git/git");
const ref_history_1 = require("../utils/general/ref-history");
const get_local_ref_history_1 = require("../utils/general/get-local-ref-history");
const compile_1 = require("../utils/template/compile");
const action = async ({ labelNameToMerge, baseBranch, withSummary = true, ...options }) => {
    const summaryTemplate = (0, compile_1.compile)();
    const prs = await (0, listAvailablePRs_1.listAvailablePRs)(labelNameToMerge);
    const destinationBranch = options.destinationBranch ?? `pre-${baseBranch}`;
    await git_1.git.switchOnly(baseBranch);
    const baseBranchHead = await git_1.git.currentHead();
    const hashHistory = (0, ref_history_1.makeHashHistory)(baseBranchHead, prs);
    await git_1.git.setConfig("user.name", "github-actions[bot]");
    await git_1.git.setConfig("user.email", "41898282+github-actions[bot]@users.noreply.github.com");
    // git config advice.addIgnoredFile false
    await git_1.git.setConfig("advice.addIgnoredFile", "false");
    const hashHistoryCommitted = await (0, get_local_ref_history_1.getLocalRefHistory)(destinationBranch, baseBranch);
    (0, core_1.debug)("Current Hash History");
    (0, core_1.debug)(hashHistoryCommitted?.payload ?? "[null]");
    if (hashHistoryCommitted?.payload === hashHistory) {
        (0, core_1.debug)(`Cannot found new history to merge`);
        const prName = destinationBranch;
        const ref = await git_1.git.revParse(prName);
        if (withSummary) {
            await core_1.summary
                .addRaw(summaryTemplate({
                githubRepoURL: `https://github.com/${github_1.context.repo.owner}/${github_1.context.repo.repo}`,
                base: baseBranch,
                baseHead: baseBranchHead,
                destination: destinationBranch,
                destinationHead: hashHistoryCommitted.head,
                prs,
            }))
                .write();
        }
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
            await (0, git_1.git)("merge", pr.headRefOid, "--no-ff", "-m", `(#${pr.number}) ${pr.title}`);
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
    if (withSummary) {
        await core_1.summary
            .addRaw(summaryTemplate({
            githubRepoURL: `https://github.com/${github_1.context.repo.owner}/${github_1.context.repo.repo}`,
            base: baseBranch,
            baseHead: baseBranchHead,
            destination: destinationBranch,
            destinationHead: ref,
            prs,
        }))
            .write();
    }
    return { changed: true, prName, ref };
};
exports.action = action;
//# sourceMappingURL=action.js.map