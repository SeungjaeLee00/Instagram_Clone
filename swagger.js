const swaggerAutogen = require("swagger-autogen")();
const fs = require("fs");
const path = require("path");

const doc = {
  info: {
    title: "Instagram Clone API",
    description: "Instagram Clone 프로젝트의 API 문서",
  },
  host: "instagram-clone-ztsr.onrender.com",
  schemes: ["https"],
};

const outputFile = "./swagger-output.json";

const getFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath)); // 폴더면 재귀 호출
    } else if (file.endsWith(".js")) {
      results.push(fullPath);
    }
  });
  return results;
};

// index.js(루트) 포함 + routes 폴더 내 모든 .js 파일 자동 추가
const endpointsFiles = ["./index.js", ...getFiles("./routes")];

swaggerAutogen(outputFile, endpointsFiles);
