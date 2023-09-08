"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalRefHistory = exports.setLocalRefHistory = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const fs_1 = require("fs");
const ref_history_name_1 = require("../common/ref-history-name");
const promises_1 = require("fs/promises");
const git_1 = require("../git/git");
const setLocalRefHistory = async (payloadRefHistory) => {
    (0, core_1.debug)(`Write ${ref_history_name_1.REF_HISTORY_NAME} file`);
    await (0, promises_1.writeFile)(ref_history_name_1.REF_HISTORY_NAME, payloadRefHistory);
    await (0, exec_1.exec)("git", ["add", "-f", ref_history_name_1.REF_HISTORY_NAME]);
    let statusMessage = new Uint8Array();
    await (0, exec_1.exec)("git", ["status", "-z"], {
        listeners: {
            stdout: (e) => (statusMessage = new Uint8Array([...statusMessage, ...e])),
        },
    });
    if (statusMessage.length) {
        await (0, exec_1.exec)("git", ["commit", "-m", `chore: add ${ref_history_name_1.REF_HISTORY_NAME}`]);
    }
};
exports.setLocalRefHistory = setLocalRefHistory;
const getLocalRefHistory = async (destinationBranch, backBranch) => {
    // Verify changes
    const codeStatus = await git_1.git.switchOnly(destinationBranch, {
        ignoreReturnCode: true,
    });
    if (codeStatus === 0) {
        if ((0, fs_1.existsSync)(ref_history_name_1.REF_HISTORY_NAME)) {
            (0, core_1.debug)(`Found ${ref_history_name_1.REF_HISTORY_NAME} file`);
            const payload = await (0, promises_1.readFile)(ref_history_name_1.REF_HISTORY_NAME, "utf-8");
            const head = await git_1.git.revParse(destinationBranch);
            await git_1.git.switchOnly(backBranch);
            return { payload, head };
        }
    }
    await git_1.git.switchOnly(backBranch);
    return null;
};
exports.getLocalRefHistory = getLocalRefHistory;
//# sourceMappingURL=get-local-ref-history.js.map