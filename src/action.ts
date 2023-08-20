import { exec } from "@actions/exec";
import { debug, getInput, setFailed, setOutput } from "@actions/core";
import { inspect } from "node:util";
import { listAvailablePRs } from "./utils/gh/listAvailablePRs";
import { git } from "./utils/git/git";
import { makeListStringHistory } from "./utils/general/ref-history";
import {
  getLocalRefHistory,
  setLocalRefHistory,
} from "./utils/general/get-local-ref-history";

interface Options {
  labelNameToMerge: string;
  baseBranch: string;
  destinationBranch: string;
}

export const main = async (
  { labelNameToMerge: labelToFilter, baseBranch, destinationBranch }: Options,
) => {
  const prs = await listAvailablePRs(labelToFilter);

  const payloadPreReleaseHistory = makeListStringHistory(prs);

  await exec("git", ["config", "user.name", "github-actions[bot]"]);
  await exec("git", [
    "config",
    "user.email",
    "41898282+github-actions[bot]@users.noreply.github.com",
  ]);

  const committedRefHistory = await getLocalRefHistory(
    destinationBranch,
    baseBranch,
  );

  if (committedRefHistory === payloadPreReleaseHistory) {
    debug(`Skip merge histories`);
    return;
  }

  await exec("git", ["branch", "-d", destinationBranch], {
    ignoreReturnCode: true,
  });
  await exec("git", ["checkout", baseBranch]);
  await exec("git", ["switch", "-c", destinationBranch, baseBranch]);

  if (!prs.length) return;
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
};

const labelNameToMerge = getInput(
  "label_name_to_merge",
  {
    required: true,
    trimWhitespace: true,
  },
);
const baseBranch = getInput(
  "base_brach",
  {
    required: true,
    trimWhitespace: true,
  },
);
const destinationBranch = getInput(
  "destination_brach",
  {
    required: false,
    trimWhitespace: true,
  },
);

main({
  labelNameToMerge: labelNameToMerge,
  baseBranch: baseBranch,
  destinationBranch: destinationBranch,
})
  .then(() => {
    setOutput("created", true);
  })
  .catch((ex) => {
    setOutput("created", false);
    console.error(ex);
    setFailed(
      typeof ex === "string"
        ? ex
        : ex instanceof Error
        ? ex.message
        : inspect(ex),
    );
  });
