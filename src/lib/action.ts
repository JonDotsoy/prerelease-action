import { exec } from "@actions/exec";
import { debug } from "@actions/core";
import { listAvailablePRs } from "../utils/gh/listAvailablePRs";
import { git } from "../utils/git/git";
import { makeListStringHistory } from "../utils/general/ref-history";
import {
  getLocalRefHistory,
  setLocalRefHistory,
} from "../utils/general/get-local-ref-history";

interface Options {
  labelNameToMerge: string;
  baseBranch: string;
  destinationBranch?: string;
}

export const action = async (
  { labelNameToMerge, baseBranch, ...options }: Options,
): Promise<boolean> => {
  const prs = await listAvailablePRs(labelNameToMerge);
  const destinationBranch = options.destinationBranch ?? `pre-${baseBranch}`;

  await git.switchOnly(baseBranch);

  const payloadPreReleaseHistory = makeListStringHistory(await git.currentHead(), prs);

  await git.setConfig("user.name", "github-actions[bot]");
  await git.setConfig(
    "user.email",
    "41898282+github-actions[bot]@users.noreply.github.com",
  );
  // git config advice.addIgnoredFile false
  await git.setConfig("advice.addIgnoredFile", "false");

  const committedRefHistory = await getLocalRefHistory(
    destinationBranch,
    baseBranch,
  );

  if (committedRefHistory === payloadPreReleaseHistory) {
    debug(`Cannot found new history to merge`);
    return false;
  }

  await exec("git", ["branch", "-D", destinationBranch], {
    ignoreReturnCode: true,
  });

  await git.switch(destinationBranch, baseBranch);

  if (!prs.length) {
    debug(`Cannot found features branches`);
    return false;
  }

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

  await setLocalRefHistory(payloadPreReleaseHistory);
  await exec("git", ["push", "-f", "origin", destinationBranch]);
  await git.switchOnly(baseBranch);
  return true;
};
