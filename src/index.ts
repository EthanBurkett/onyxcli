#!/usr/bin/env node
import path from "path";
import fs from "fs";
import inquirer from "inquirer";
const loadingSpinner = require("loading-spinner");
import chalk from "chalk";
import { exec } from "child_process";
import ora from "ora";
import logUpdate from "log-update";
const settings: {
  outDir: string;
  webOutDir: string;
  doWeb: boolean;
} = {
  outDir: path.join(process.cwd(), "my-project"),
  webOutDir: path.join(process.cwd(), "client"),
  doWeb: false,
};

var walk = function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          // @ts-ignore
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

const createBotFiles = async () => {
  new Promise((resolve, reject) => {
    walk(path.join(__dirname, "read"), (err, files: string[]) => {
      const writeTo = files.map((file) => {
        const fileSplit = file.split("\\");
        const indexOfRead = fileSplit.indexOf("read");
        return {
          Path: file,
          writeTo: fileSplit.slice(indexOfRead + 1).join("\\"),
        };
      });

      writeTo.map(({ writeTo, Path }) => {
        let fileData = fs.readFileSync(Path).toString();
        try {
          if (writeTo.includes("\\")) {
            const temp = writeTo.split("\\");
            temp
              .filter(
                (folder) => !folder.endsWith(".json") && !folder.endsWith(".ts")
              )
              .map((folder) => {
                fs.mkdirSync(path.join(process.cwd(), settings.outDir, folder));
              });
          }
          fs.writeFileSync(
            path.join(process.cwd(), settings.outDir, writeTo),
            fileData
          );
          resolve("success");
        } catch (e) {
          reject(e);
        }
      });
    });
  });
};
const createWebFiles = async () => {
  new Promise((resolve, reject) => {
    walk(path.join(__dirname, "read-web"), (err, files: string[]) => {
      const writeTo = files.map((file) => {
        const fileSplit = file.split("\\");
        const indexOfRead = fileSplit.indexOf("read-web");
        return {
          Path: file,
          writeTo: fileSplit.slice(indexOfRead + 1).join("\\"),
        };
      });

      writeTo.map(({ writeTo, Path }) => {
        let fileData = fs.readFileSync(Path).toString();
        try {
          if (writeTo.includes("\\")) {
            const temp = writeTo.split("\\");
            temp
              .filter(
                (folder) =>
                  !folder.endsWith(".json") &&
                  !folder.endsWith(".ts") &&
                  !folder.endsWith(".tsx") &&
                  !folder.endsWith(".js") &&
                  !folder.endsWith(".svg") &&
                  !folder.endsWith(".css")
              )
              .map((folder) => {
                fs.mkdirSync(
                  path.join(process.cwd(), settings.webOutDir, folder)
                );
              });
          }
          fs.writeFileSync(
            path.join(process.cwd(), settings.webOutDir, writeTo),
            fileData
          );
          resolve("success");
        } catch (e) {
          reject(e);
        }
      });
    });
  });
};
const installPackages = async (dir: string) => {
  new Promise((resolve, reject) => {
    const spinner = ora({
      text: "Installing packages...",
      interval: 100,
    });
    exec(
      `cd ${process.cwd()}\\${dir}&&npm init -y&&npm i onyxlibrary typeorm type-graphql graphql reflect-metadata&&npm i -D @types/graphql`,
      (err, stdout) => {
        if (err) return reject(err);
      }
    )
      .addListener("spawn", () => {
        spinner.start();
      })
      .addListener("exit", () => {
        spinner.stop();
        resolve("success");
        console.log(chalk.greenBright.bold("✓ Core Packages installed"));
      });
  });
};
const installDashboardPackages = async (dir: string) => {
  new Promise((resolve, reject) => {
    const spinner = ora({
      text: "Installing dashboard packages...",
      interval: 100,
    });
    exec(`cd ${process.cwd()}\\${dir}&&npm i`, (err, stdout) => {
      if (err) return reject(err);
    })
      .addListener("spawn", () => {
        spinner.start();
      })
      .addListener("exit", () => {
        spinner.stop();
        resolve("success");
        console.log(chalk.greenBright.bold("✓ Dashboard Packages installed"));
      });
  });
};

inquirer
  .prompt([
    {
      name: "dir",
      message: "Choose where the project will be created",
      default: "my-project",
    },
    {
      name: "webconfirm",
      message: "Create dashboard files?",
      type: "confirm",
      default: false,
    },
    {
      name: "webdir",
      message: "Choose where the dashboard files will be created",
      default: "client",
      when({ webconfirm }) {
        return webconfirm === true;
      },
    },
  ])
  .then(async ({ dir, webdir, webconfirm }) => {
    fs.mkdirSync(path.join(process.cwd(), dir), {
      recursive: true,
    });
    settings.outDir = dir;
    settings.webOutDir = webdir;

    if (webconfirm === true) {
      fs.mkdirSync(path.join(process.cwd(), webdir), {
        recursive: true,
      });
      createWebFiles()
        .then(() => {})
        .catch((e) => {
          throw new Error(e);
        });
    }

    createBotFiles()
      .then(() => {})
      .catch((e) => {
        throw new Error(e);
      });
    installPackages(dir)
      .then((value: any) => {
        if (value == "success" && webconfirm === true)
          installDashboardPackages(webdir).catch((e) => console.error);
      })
      .catch((e) => console.error);
  });
