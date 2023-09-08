import {
  flag,
  flags,
  isBooleanAt,
  isStringAt,
  makeHelmMessage,
  Rule,
  rule,
} from "@jondotsoy/flags";
import { action } from "./lib/action";

class CommandError extends Error {
  constructor(ex: string, readonly helpMessage: () => string) {
    super(ex);
  }
}

interface MainCli {
  showHelp: boolean;
  labelNameToMerge: string;
  baseBranch: string;
  destinationBranch: string;
  withSummary: boolean;
}

const main = async (args: string[]) => {
  const rules: Rule<MainCli>[] = [
    rule(flag("--help", "-h"), isBooleanAt("showHelp")),
    rule(flag("--label-name-to-merge"), isStringAt("labelNameToMerge")),
    rule(flag("--base-branch"), isStringAt("baseBranch")),
    rule(flag("--with-summary"), isBooleanAt("withSummary")),
  ];

  const helpMessage = () => makeHelmMessage("feature-branching", rules);

  const {
    showHelp = false,
    labelNameToMerge,
    baseBranch,
    destinationBranch,
    withSummary = true,
  } = flags<MainCli>(
    args,
    {},
    rules,
  );

  if (showHelp) {
    return console.log(helpMessage);
  }

  if (!labelNameToMerge) {
    throw new CommandError(`Expected flag: --label-name-to-merge`, helpMessage);
  }
  if (!baseBranch) {
    throw new CommandError(`Expected flag: --base-branch`, helpMessage);
  }

  await action({
    baseBranch,
    labelNameToMerge,
    destinationBranch,
    withSummary,
  });
};

main(process.argv.slice(2))
  .catch((ex) => {
    process.exitCode = process.exitCode ?? 1;
    if (ex instanceof CommandError) {
      console.error(ex.message);
      console.error();
      console.error(ex.helpMessage());
      return;
    }
    console.error(ex);
  });
