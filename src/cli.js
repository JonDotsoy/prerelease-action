"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("./lib/action");
const makeFlag = (args, spec) => {
    const ctx = { __: [] };
    let index = 0;
    const handlersMap = Array.from(spec);
    while (index < args.length) {
        const arg = args[index];
        const handler = handlersMap.find(([test]) => test(args[index]))?.[1] ?? ((ctx, index, arg) => {
            ctx.__.push(arg);
            return index + 1;
        });
        index = handler(ctx, index, arg, args);
    }
    return ctx;
};
const spec = new Map();
const flagIs = (flag, ...alt) => (arg) => [flag, ...alt].includes(arg);
const singleValue = (propName) => (ctx, index, arg, args) => {
    ctx[propName] = args[index + 1];
    return index + 2;
};
spec.set(flagIs("--label_name_to_merge", "--labelNameToMerge", "-l"), singleValue("labelNameToMerge"));
spec.set(flagIs("--base_brach", "--baseBranch", "-b"), singleValue("baseBranch"));
spec.set(flagIs("--destination_brach", "--destinationBranch", "-d"), singleValue("destinationBranch"));
function missingArgument(ctx, flag) {
    if (!ctx[flag]) {
        throw new Error(`missing argument: --${flag}`);
    }
}
const main = async (args) => {
    const ctx = makeFlag(args, spec);
    missingArgument(ctx, `labelNameToMerge`);
    missingArgument(ctx, `baseBranch`);
    // missingArgument(ctx, `destinationBranch`);
    await (0, action_1.action)(ctx);
};
main(process.argv.slice(2)).catch((ex) => {
    console.error(ex);
    process.exitCode = process.exitCode ?? 1;
});
//# sourceMappingURL=cli.js.map