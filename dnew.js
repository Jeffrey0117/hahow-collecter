const axios = require("axios");
const fs = require("fs");
const fs2 = require("fs").promises;
require("dotenv").config();
const path = require("path");

const readline = require("readline");

const prompt = require("prompt-sync")();
const { createWriteStream } = require("fs");
const { data } = require("jquery");
const { join } = require("path");

String.prototype.customReplace = function () {
  return this.replaceAll("：", "-")
    .replaceAll(":", "-")
    .replaceAll("*", "")
    .replaceAll("/", "或")
    .replaceAll(/[<>"\\|?]/g, "");
};

async function downloadVideo(title, videoUrl, Path) {
  const fileName = `${title}`;
  const filePath = path.join(".", Path, fileName);

  try {
    await fs.promises.access(filePath);
    console.log(`Skipped: ${fileName} (File already exists)`);
    return filePath;
  } catch (error) {
    // 文件不存在，继续下载
  }

  const response = await axios.get(videoUrl, { responseType: "stream" });
  const writeStream = createWriteStream(filePath);

  response.data.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      console.log(`Downloaded: ${fileName}`);
      resolve(filePath);
    });

    writeStream.on("error", (error) => {
      console.error("Error writing to file:", error);
      reject(error);
    });
  });
}

async function checkAndCreateFolder(folderPath) {
  try {
    await fs.promises.access(folderPath);
    console.log(`Folder '${folderPath}' already exists!`);
  } catch (error) {
    try {
      await fs.promises.mkdir(folderPath);
      console.log(`Folder '${folderPath}' created successfully!`);
    } catch (error) {
      console.error(`Error creating folder '${folderPath}':`, error);
    }
  }
}

async function createFolder(chapterTitle, check) {
  let folderPath = path.join(".", chapterTitle);

  if (check !== 0) {
    folderPath = path.join(".", ClassTitle, chapterTitle);
  }

  await checkAndCreateFolder(folderPath);
}

async function createHomework(fileName, fileContent, Path) {
  const filePath = join("./" + Path, fileName);

  try {
    await fs2.writeFile(filePath, fileContent);
    console.log(`Homework '${fileName}' created successfully!`);
  } catch (error) {
    console.error(`Error creating Homework '${fileName}':`, error);
  }
}

async function downloadChapterItems(data, chapterTitle) {
  let myItem = data.items;
  for (let j = 0; j < myItem.length; j++) {
    const courseTitle = myItem[j].content.title.customReplace();

    const courseUrl = myItem[j].content._id;
    const courseType = myItem[j].type;

    console.log("正在下载: " + courseTitle);

    // 使用 await 等待下载完成
    await new Promise((resolve, reject) => {
      if (courseType == "LECTURE") {
        let fetchUrl =
          "https://api.hahow.in/api/lectures/" +
          courseUrl +
          "?requestBackup=false";
        //下載課程影片的部分
        customFetch(fetchUrl, async (data) => {
          try {
            const index = data.video.videos.findIndex(
              (item) => item.width === 1920 && item.height === 1080
            );
            const itemUrl = data.video.videos[index].link;
            const subtitle = data.video.subtitles[0].link;

            await downloadVideo(
              j + 1 + "." + courseTitle + ".mp4",
              itemUrl,
              ClassTitle + "/" + chapterTitle
            );
            console.log("成功下载影片: " + courseTitle);
            await downloadVideo(
              j + 1 + "." + courseTitle + "(字幕)" + ".srt",
              subtitle,
              ClassTitle + "/" + chapterTitle
            );
            console.log("字幕下载成功: " + courseTitle);
            resolve();
          } catch (error) {
            console.error("下载失败:", error);
            reject(error);
          }

          //---------------------------------
        });
      } else if (courseType == "ASSIGNMENT") {
        //下載指定作業的狀況

        fetchUrl =
          "https://api.hahow.in/api/assignments/" +
          courseUrl +
          "?requestBackup=false";

        customFetch(fetchUrl, async (data) => {
          let fileName = data.title;
          fileName = fileName.customReplace();
          const fileContent = data.description;

          try {
            await createHomework(
              j + 1 + "." + fileName + "(回家作業)" + ".html",
              fileContent,
              ClassTitle + "/" + chapterTitle
            );
            console.log("成功下载回家作業: " + fileName);
            resolve();
          } catch (error) {
            console.error("下载失败:", error);
            reject(error);
          }
        });
      }
      //
    });
  }
}

async function customFetch(url, thenCallback) {
  let headers = {
    accept: "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "zh-TW",
    authorization: authorization,
    "content-type": "application/json; charset=utf-8",
    "if-none-match": authorizationINM,
    origin: "https://hahow.in",
    referer: "https://hahow.in/",
    "sec-ch-ua":
      '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "x-country-code": "TW",
    "x-hahow-platform": "web:unknown:1.0.0+1708670862-25712f225b",
    "x-referrer": "https://hahow.in/",
  };

  try {
    const response = await axios.get(url, {
      headers: headers, // 你的 headers 变量
      withCredentials: true, // 包含凭据信息，类似于 credentials: "include"
    });

    // axios 会自动解析 JSON 数据
    const data = response.data;

    // 在这里进行你的逻辑处理
    thenCallback(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

let ClassTitle; //創建課程的資料夾名稱

ClassId = process.env.ClassId;
authorization = process.env.authorization;
authorizationINM = process.env.authorizationINM;

function MainProcess() {
  let HahowClassUrl = "https://api.hahow.in/api/courses/" + ClassId; //組成API網址

  customFetch(HahowClassUrl, async (data) => {
    ClassTitle = data.title.customReplace();

    createFolder(ClassTitle, 0);

    customFetch(HahowClassUrl + `/modules/items`, async (data) => {
      for (let k = 0; k < data.length; k++) {
        const chapterTitle =
          "[第" + (k + 1) + "章]" + data[k].title.customReplace();
        createFolder(chapterTitle, 1);
        await downloadChapterItems(data[k], chapterTitle);
      }
      console.log("Hahow課程:「" + ClassTitle + "」已經全數下載完畢！");
    });
  });
}

// 新增功能:瀏覽所有課程
// 新增功能:挑選章節下載

// 直接下載方式:先修改classId然後執行下面這行
// MainProcess();

//-------------------------------------------------------------------------
ClassList = "https://api.hahow.in/api/users/me/boughtCourses";

let testword = `
hhhhhhh                              hhhhhhh
h:::::h                              h:::::h
h:::::h                              h:::::h
h:::::h                              h:::::h
h::::h hhhhh         aaaaaaaaaaaaa   h::::h hhhhh          ooooooooooo wwwwwww           wwwww           wwwwwww
h::::hh:::::hhh      a::::::::::::a  h::::hh:::::hhh     oo:::::::::::oow:::::w         w:::::w         w:::::w
h::::::::::::::hh    aaaaaaaaa:::::a h::::::::::::::hh  o:::::::::::::::ow:::::w       w:::::::w       w:::::w
h:::::::hhh::::::h            a::::a h:::::::hhh::::::h o:::::ooooo:::::o w:::::w     w:::::::::w     w:::::w
h::::::h   h::::::h    aaaaaaa:::::a h::::::h   h::::::ho::::o     o::::o  w:::::w   w:::::w:::::w   w:::::w
h:::::h     h:::::h  aa::::::::::::a h:::::h     h:::::ho::::o     o::::o   w:::::w w:::::w w:::::w w:::::w
h:::::h     h:::::h a::::aaaa::::::a h:::::h     h:::::ho::::o     o::::o    w:::::w:::::w   w:::::w:::::w
h:::::h     h:::::ha::::a    a:::::a h:::::h     h:::::ho::::o     o::::o     w:::::::::w     w:::::::::w
h:::::h     h:::::ha::::a    a:::::a h:::::h     h:::::ho:::::ooooo:::::o      w:::::::w       w:::::::w
h:::::h     h:::::ha:::::aaaa::::::a h:::::h     h:::::ho:::::::::::::::o       w:::::w         w:::::w
h:::::h     h:::::h a::::::::::aa:::ah:::::h     h:::::h oo:::::::::::oo         w:::w           w:::w
hhhhhhh     hhhhhhh  aaaaaaaaaa  aaaahhhhhhh     hhhhhhh   ooooooooooo            www             www
`.trim();

customFetch(ClassList, async (data) => {
  length = data.length;
  console.log("\n\n");
  console.log(testword, "\n\n 歡迎使用hahow課程下載器");
  console.log(" 這個帳號總共有" + length + "堂課程", "，課程列表↓");
  console.log(
    " ------------------------------------------------------------------------------------------------------------"
  );
  for (i = 0; i < length; i++) {
    console.log(i + 1, data[i].title);
  }
  let q1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  askQuestion(length);

  function formatChapterTitle(index, title) {
    return `[第${index}章]${title.customReplace()}`;
  }

  async function processSingleChapter(data, index) {
    const chapterTitle = formatChapterTitle(index + 1, data[index].title);
    createFolder(chapterTitle, 1);
    await downloadChapterItems(data[index], chapterTitle);
    console.log(`${chapterTitle}已經全數下載完畢！`);
  }

  async function processRangeOfChapters(data, start, end) {
    console.log(`即將下載第${start}章到第${end}章。`);
    for (let i = start - 1; i < end; i++) {
      await processSingleChapter(data, i);
    }
    console.log(`第${start}章到第${end}章已經全數下載完畢！`);
  }

  function askQuestion(Classlength) {
    let dataLength;
    q1.question("請問要下載哪一堂課程？", function (answer) {
      if (answer == 0 || answer > Classlength || isNaN(answer)) {
        console.log("無效編號！請輸入正確數字。");
      } else {
        console.log(
          "------------------------------------------------------------------------------------------------------------"
        );

        console.log(`你下載的是" ${data[answer - 1].title}"`);
        ClassId = data[answer - 1]._id;
        let AllClassUrl =
          "https://api.hahow.in/api/courses/" + ClassId + `/modules/items`; //組成API網址

        ClassTitle = data[answer - 1].title.customReplace();

        createFolder(ClassTitle, 0);

        customFetch(AllClassUrl, async (data) => {
          for (let k = 0; k < data.length; k++) {
            const chapterTitle =
              "[第" + (k + 1) + "章]" + data[k].title.customReplace();
            dataLength = data.length;
            console.log(chapterTitle);
          }
        }).then((data) => {
          let input = prompt(
            "請輸入選擇下載的章節(範例1-9)，全部下載輸入all："
          );
          if (input.toLowerCase() === "all") {
            MainProcess(); // 直接執行下載程序
          } else {
            if (!isNaN(input) && input != 0 && input < dataLength) {
              console.log("輸入一個數字");
              customFetch(AllClassUrl, async (data) => {
                input = parseInt(input);
                await processSingleChapter(data, input - 1);
              });
            } else {
              const match = input.match(/^(\d+)-(\d+)$/);
              if (match) {
                const [start, end] = match.slice(1).map(Number);
                customFetch(AllClassUrl, async (data) => {
                  processRangeOfChapters(data, start, end);
                });
              } else {
                console.log("格式錯誤！請輸入有效章節編號。");
              }
            }
          }
        });

        //
      }
      q1.close();
    });
  }
});
