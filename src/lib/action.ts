import { exec } from "@actions/exec";
import { debug } from "@actions/core";
import { listAvailablePRs } from "../utils/gh/listAvailablePRs";
import { git } from "../utils/git/git";
import { makeHashHistory } from "../utils/general/ref-history";
import {
  getLocalRefHistory,
  setLocalRefHistory,
} from "../utils/general/get-local-ref-history";

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
}

export const action = async (
  { labelNameToMerge, baseBranch, ...options }: Options,
): Promise<ActionReturn> => {
  const prs = await listAvailablePRs(labelNameToMerge);
  const destinationBranch = options.destinationBranch ?? `pre-${baseBranch}`;

  await git.switchOnly(baseBranch);

  const hashHistory = makeHashHistory(
    await git.currentHead(),
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
  debug(hashHistoryCommitted ?? "[null]");

  if (hashHistoryCommitted === hashHistory) {
    debug(`Cannot found new history to merge`);
    return {
      changed: false,
      prName: hashHistoryCommitted ? destinationBranch : baseBranch,
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
  return { changed: true, prName: prs.length ? destinationBranch : baseBranch };
};
