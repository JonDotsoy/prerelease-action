import { exec } from "@actions/exec";
import { debug, summary } from "@actions/core";
import { context } from "@actions/github";
import { listAvailablePRs } from "../utils/gh/listAvailablePRs";
import { git } from "../utils/git/git";
import { makeHashHistory } from "../utils/general/ref-history";
import {
  getLocalRefHistory,
  setLocalRefHistory,
} from "../utils/general/get-local-ref-history";
import { compile } from "../utils/template/compile";

export interface Options {
  labelNameToMerge: string;
  baseBranch: string;
  destinationBranch?: string;
}

export interface ActionReturn {
  /** Describe if exists changes on history */
  changed: boolean;
  /** Describe the PR the the last changes */
  prName: string;
  /** REF hash of the last commit */
  ref: string;
}

export const action = async (
  { labelNameToMerge, baseBranch, ...options }: Options,
): Promise<ActionReturn> => {
  const summaryTemplate = compile();
  const prs = await listAvailablePRs(labelNameToMerge);
  const destinationBranch = options.destinationBranch ?? `pre-${baseBranch}`;

  await git.switchOnly(baseBranch);

  const baseBranchHead = await git.currentHead();
  const hashHistory = makeHashHistory(
    baseBranchHead,
    prs,
  );

  await git.setConfig("user.name", "github-actions[bot]");
  await git.setConfig(
    "user.email",
    "41898282+github-actions[bot]@users.noreply.github.com",
  );
  // git config advice.addIgnoredFile false
  await git.setConfig("advice.addIgnoredFile", "false");

  const hashHistoryCommitted = await getLocalRefHistory(
    destinationBranch,
    baseBranch,
  );

  debug("Current Hash History");
  debug(hashHistoryCommitted?.payload ?? "[null]");

  if (hashHistoryCommitted?.payload === hashHistory) {
    debug(`Cannot found new history to merge`);
    const prName = destinationBranch;
    const ref = await git.revParse(prName);

    await summary
      .addRaw(summaryTemplate({
        githubRepoURL:
          `https://github.com/${context.repo.owner}/${context.repo.repo}`,
        base: baseBranch,
        baseHead: baseBranchHead,
        destination: destinationBranch,
        destinationHead: hashHistoryCommitted.head,
        prs,
      }))
      .write();

    return {
      changed: false,
      prName,
      ref,
    };
  }

  await exec("git", ["branch", "-D", destinationBranch], {
    ignoreReturnCode: true,
  });

  await git.switch(destinationBranch, baseBranch);

  for (const pr of prs) {
    // git merge sample1 --no-ff -m "(#1) sampel1"
    try {
      await git(
        "merge",
        pr.headRefOid,
        "--no-ff",
        "-m",
        `(#${pr.number}) ${pr.title}`,
      );
    } catch (ex) {
      if (ex instanceof Error) {
        throw new Error(`Failed merge PR #${pr.number}: ${ex.message}`);
      }
      throw ex;
    }
  }

  await setLocalRefHistory(hashHistory);
  await exec("git", ["push", "-f", "origin", destinationBranch]);
  await git.switchOnly(baseBranch);

  const prName = destinationBranch;
  const ref = await git.revParse(prName);

  await summary
    .addRaw(summaryTemplate({
      githubRepoURL:
        `https://github.com/${context.repo.owner}/${context.repo.repo}`,
      base: baseBranch,
      baseHead: baseBranchHead,
      destination: destinationBranch,
      destinationHead: ref,
      prs,
    }))
    .write();

  return { changed: true, prName, ref };
};
