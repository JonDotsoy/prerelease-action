"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ghPRList = void 0;
const exec_1 = require("@actions/exec");
const ghPRList = async (keys) => {
    let prsBuff = new Uint8Array([]);
    await (0, exec_1.exec)("gh", [
        "pr",
        "list",
        "--json",
        keys.join(","),
    ], {
        listeners: {
            stdout(data) {
                prsBuff = new Uint8Array([...prsBuff, ...data]);
            },
        },
    });
    return JSON.parse(new TextDecoder().decode(prsBuff));
};
exports.ghPRList = ghPRList;
//# sourceMappingURL=ghPRList.js.map