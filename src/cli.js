"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flags_1 = require("@jondotsoy/flags");
const action_1 = require("./lib/action");
class CommandError extends Error {
    constructor(ex, helpMessage) {
        super(ex);
        this.helpMessage = helpMessage;
    }
}
const main = async (args) => {
    const rules = [
        (0, flags_1.rule)((0, flags_1.flag)("--help", "-h"), (0, flags_1.isBooleanAt)("showHelp")),
        (0, flags_1.rule)((0, flags_1.flag)("--label-name-to-merge"), (0, flags_1.isStringAt)("labelNameToMerge")),
        (0, flags_1.rule)((0, flags_1.flag)("--base-branch"), (0, flags_1.isStringAt)("baseBranch")),
        (0, flags_1.rule)((0, flags_1.flag)("--with-summary"), (0, flags_1.isBooleanAt)("withSummary")),
    ];
    const helpMessage = () => (0, flags_1.makeHelmMessage)("feature-branching", rules);
    const { showHelp = false, labelNameToMerge, baseBranch, destinationBranch, withSummary = true, } = (0, flags_1.flags)(args, {}, rules);
    if (showHelp) {
        return console.log(helpMessage);
    }
    if (!labelNameToMerge) {
        throw new CommandError(`Expected flag: --label-name-to-merge`, helpMessage);
    }
    if (!baseBranch) {
        throw new CommandError(`Expected flag: --base-branch`, helpMessage);
    }
    await (0, action_1.action)({
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
//# sourceMappingURL=cli.js.map