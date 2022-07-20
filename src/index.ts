#!/usr/bin/env node
import path from "path";
import fs from "fs";
import inquirer from "inquirer";
const loadingSpinner = require("loading-spinner");
import chalk from "chalk";
import { exec } from "child_process";
const settings: {
  outDir: string;
} = {
  outDir: path.join(process.cwd(), "my-project"),
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

const createFiles = async () => {
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

const installPackages = async () => {
  new Promise((resolve, reject) => {
    exec(`cd ${process.cwd()}`, (err, stdout) => {
      if (err) return reject(err);
    });
    exec(
      `npm i onyxlibrary typeorm type-graphql graphql reflect-metadata`,
      (err, stdout) => {
        if (err) return reject(err);
      }
    );
    exec(`npm i -D @types/graphql`, (err, stdout) => {
      if (err) return reject(err);
    });

    resolve("success");
  });
};

inquirer
  .prompt([
    {
      name: "dir",
      message: "Choose where the project will be created",
      default: "my-project",
    },
  ])
  .then(async ({ dir }) => {
    fs.mkdirSync(path.join(process.cwd(), dir));
    settings.outDir = dir;
    console.log(chalk.magentaBright.bold("Installing packages..."));
    loadingSpinner.start(100, {
      clearChar: true,
    });
    await installPackages()
      .catch((e) => console.error)
      .then(() => {
        console.log(chalk.greenBright.bold("✓ Packages installed"));
        loadingSpinner.stop();
      });
    await createFiles()
      .then(() => {})
      .catch((e) => {
        throw new Error(e);
      });
  });
