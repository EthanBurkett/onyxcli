#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const loadingSpinner = require("loading-spinner");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const ora_1 = __importDefault(require("ora"));
const settings = {
    outDir: path_1.default.join(process.cwd(), "my-project"),
};
var walk = function (dir, done) {
    var results = [];
    fs_1.default.readdir(dir, function (err, list) {
        if (err)
            return done(err);
        var pending = list.length;
        if (!pending)
            return done(null, results);
        list.forEach((file) => {
            file = path_1.default.resolve(dir, file);
            fs_1.default.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending)
                            done(null, results);
                    });
                }
                else {
                    results.push(file);
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};
const createFiles = async () => {
    new Promise((resolve, reject) => {
        walk(path_1.default.join(__dirname, "read"), (err, files) => {
            const writeTo = files.map((file) => {
                const fileSplit = file.split("\\");
                const indexOfRead = fileSplit.indexOf("read");
                return {
                    Path: file,
                    writeTo: fileSplit.slice(indexOfRead + 1).join("\\"),
                };
            });
            writeTo.map(({ writeTo, Path }) => {
                let fileData = fs_1.default.readFileSync(Path).toString();
                try {
                    if (writeTo.includes("\\")) {
                        const temp = writeTo.split("\\");
                        temp
                            .filter((folder) => !folder.endsWith(".json") && !folder.endsWith(".ts"))
                            .map((folder) => {
                            fs_1.default.mkdirSync(path_1.default.join(process.cwd(), settings.outDir, folder));
                        });
                    }
                    fs_1.default.writeFileSync(path_1.default.join(process.cwd(), settings.outDir, writeTo), fileData);
                    resolve("success");
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    });
};
const installPackages = async (dir) => {
    new Promise((resolve, reject) => {
        const spinner = (0, ora_1.default)({
            text: "Installing packages...",
            interval: 100,
        });
        (0, child_process_1.exec)(`cd ${process.cwd()}\\${dir}&&npm init -y&&npm i onyxlibrary typeorm type-graphql graphql reflect-metadata&&npm i -D @types/graphql`, (err, stdout) => {
            if (err)
                return reject(err);
        })
            .addListener("spawn", () => {
            spinner.start();
        })
            .addListener("exit", () => {
            spinner.stop();
            console.log(chalk_1.default.greenBright.bold("✓ Packages installed"));
        });
    });
};
inquirer_1.default
    .prompt([
    {
        name: "dir",
        message: "Choose where the project will be created",
        default: "my-project",
    },
])
    .then(async ({ dir }) => {
    fs_1.default.mkdirSync(path_1.default.join(process.cwd(), dir));
    settings.outDir = dir;
    installPackages(dir).catch((e) => console.error);
    createFiles()
        .then(() => { })
        .catch((e) => {
        throw new Error(e);
    });
});
//# sourceMappingURL=index.js.map