const fs = require("fs");
const path = require("path");

function getExcludedNames() {
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  const gitignoreContent = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, "utf8")
    : "";
  const gitignoreNames = gitignoreContent
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name && !name.startsWith("#"));

  return [
    "node_modules",
    ...gitignoreNames,
    "authTest.rest",
    "CombineJSFiles.js",
    "directoryStructure.js",
    "output.txt",
    "yarn.lock",
    ".gitignore",
    ".git",
    "debug",
    "tmp",
  ];
}

function getDirStructure(dir, prefix = "", excludedNames = []) {
  const files = fs.readdirSync(dir);
  let result = "";

  const excludedNameSet = new Set(excludedNames);

  files.forEach((file, index) => {
    const fileName = path.basename(file);
    const pathName = `${dir}/${file}`;
    const isLast = index === files.length - 1;
    const prefixWithPipe = prefix ? `${prefix} | ` : "";

    if (excludedNameSet.has(fileName) || excludedNameSet.has(pathName)) {
      return;
    }

    if (fs.statSync(pathName).isDirectory()) {
      result += `${prefixWithPipe}-- ${fileName}\n${getDirStructure(
        pathName,
        `${prefix}${isLast ? "   " : "|  "}`,
        excludedNames
      )}`;
    } else {
      result += `${prefixWithPipe}-- ${fileName}\n`;
    }
  });

  return result;
}

function appendJsFilesContent(outputPath, dir, excludedNames = []) {
  const files = fs.readdirSync(dir);

  const excludedNameSet = new Set(excludedNames);

  files.forEach((file) => {
    const fileName = path.basename(file);
    const pathName = `${dir}/${file}`;

    if (excludedNameSet.has(fileName) || excludedNameSet.has(pathName)) {
      return;
    }

    if (fs.statSync(pathName).isDirectory()) {
      appendJsFilesContent(outputPath, pathName, excludedNames);
    } else if (path.extname(file) === ".js") {
      let fileContent = fs.readFileSync(pathName, "utf8");

      // Remove extra spaces and line breaks
      fileContent = fileContent.replace(/\s+/g, " ");

      fs.appendFileSync(
        outputPath,
        `/* ${pathName} */\n${fileContent.trim()}\n\n`,
        "utf8"
      );
    }
  });
}

const outputPath = "output.txt";
const excludedNames = getExcludedNames();
const dirStructure = getDirStructure(".", "", excludedNames);
fs.writeFileSync(outputPath, dirStructure, "utf8");
appendJsFilesContent(outputPath, ".", excludedNames);
