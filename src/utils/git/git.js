"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.git = void 0;
const exec_1 = require("@actions/exec");
const git = async (...args) => {
    let out = new Uint8Array();
    const exitCode = await (0, exec_1.exec)("git", args, {
        listeners: {
            stdout: (b) => out = new Uint8Array([...out, ...b]),
        },
        ignoreReturnCode: true,
    });
    if (exitCode)
        throw new Error(new TextDecoder().decode(out));
};
exports.git = git;
exports.git.setConfig = (path, value) => (0, exec_1.exec)("git", ["config", path, value]);
exports.git.switchOnly = async (branchName, options) => await (0, exec_1.exec)("git", ["switch", branchName], options);
exports.git.revParse = async (refName) => {
    let out = new Uint8Array();
    await (0, exec_1.exec)("git", ["rev-parse", refName], {
        listeners: { stdout: (d) => out = new Uint8Array([...out, ...d]) },
    });
    return new TextDecoder().decode(out).trim();
};
exports.git.switch = async (branchName, branchBase) => {
    const firstIntentCodeStatus = await (0, exec_1.exec)("git", [
        "switch",
        "-c",
        branchName,
        branchBase,
    ], { ignoreReturnCode: true });
    if (firstIntentCodeStatus === 0)
        return 0;
    if (firstIntentCodeStatus === 128) {
        await exports.git.switchOnly(branchName);
        return;
    }
    throw new Error(`Failed switch branch exist code ${firstIntentCodeStatus}`);
};
exports.git.currentHead = async () => {
    let out = new Uint8Array([]);
    await (0, exec_1.exec)("git", ["rev-parse", "HEAD"], {
        listeners: {
            stdout: (e) => out = new Uint8Array([...out, ...e]),
        },
    });
    return new TextDecoder().decode(out);
};
//# sourceMappingURL=git.js.map