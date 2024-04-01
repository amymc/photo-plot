// const express = require("express");
// const port = process.env.PORT || 3000;
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const fs = require("node:fs");
// const PNG = require("pngjs").PNG;
// const crypto = require("crypto");

// const { pipeline } = require("node:stream/promises");

// const app = express();
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.text({ limit: "50mb" }));

// const hash = crypto.createHash("sha1");
// hash.setEncoding("hex");

// const prepareImage = async (imageData) => {
//   console.log("prepare");
//   fs.writeFile("./image.txt", imageData, (err) => {
//     if (err) {
//       console.error(err);
//     } else {
//       // file written successfully
//     }
//   });

//   require("child_process").exec(
//     `convert inline:image.txt result1.png
//            convert result1.png -colorspace Gray result.png
//            convert result.png -background black -alpha remove -alpha off result.png
//            convert result.png -threshold 41% result.png
//            magick result.png -bordercolor Snow -border 5x5 -density 144 -background black -gravity center  -set caption "RC 2024"  -polaroid 10 result.png
//            convert result.png -bordercolor white -border 10x10 -density 144 result.png
//            convert result.png -rotate 90 -trim result.jpg
//       `,
//     {
//       stdio: "inherit",
//     }
//   );

//   let colorArray = [];

//   const hash = crypto.createHash("sha1");
//   hash.setEncoding("hex");

//   async function run() {
//     await pipeline(
//       fs
//         .createReadStream("result.png")
//         .pipe(
//           new PNG({
//             filterType: 4,
//           })
//         )
//         .on("parsed", function () {
//           for (var y = 0; y < this.height; y++) {
//             colorArray.push([]);
//             for (var x = 0; x < this.width; x++) {
//               var idx = (this.width * y + x) << 2;

//               // invert color
//               this.data[idx] = 255 - this.data[idx];
//               this.data[idx + 1] = 255 - this.data[idx + 1];
//               this.data[idx + 2] = 255 - this.data[idx + 2];

//               colorArray[y].push([
//                 this.data[idx],
//                 this.data[idx + 1],
//                 this.data[idx + 2],
//               ]);

//               // and reduce opacity
//               this.data[idx + 3] = this.data[idx + 3] >> 1;
//             }
//           }
//           generateHPGL();
//         }),
//       hash
//     );
//   }

//   const generateHPGL = () => {
//     console.log("generate");

//     let hpglString = "IN;\nSP2;\n";
//     // let penOffsets = [
//     //   [0, 0],
//     //   [50, 50],
//     //   [-70, -70],
//     // ];

//     // for (let penNum = 0; penNum < penOffsets.length; penNum++) {
//     rowCount = 0;

//     for (let i = 0; i < colorArray.length; i++) {
//       let x = i * 12;

//       let inking = false;

//       for (let j = 0; j < colorArray[0].length; j++) {
//         Y =
//           0.2126 * colorArray[i][j][0] +
//           0.7152 * colorArray[i][j][1] +
//           0.0722 * colorArray[i][j][2];

//         const isBlack = Y < 128;
//         let y = j * 12;

//         if (!isBlack && !inking) {
//           // pen down
//           hpglString += `PA${x},${y};\n`;
//           hpglString += "PD;\n";
//           inking = true;
//         } else if (isBlack && inking) {
//           // draw all the way here and lift
//           hpglString += `PA${x},${y};\n`;
//           hpglString += "PU;\n";
//           inking = false;
//         }
//         //   else if (j === colorArray[0].length - 1) {
//         //     hpglString += "PU;\n";
//         //     inking = false;
//         //   }
//       }
//     }
//     // }

//     fs.writeFile("./image.hpgl", hpglString, (err) => {
//       if (err) {
//         console.error(err);
//       } else {
//         // file written successfully

//         console.log("plot");
//         const { spawn } = require("child_process");

//         var sp = spawn("./plotter-tools/chunker/target/debug/chunker", [
//           "./image.hpgl",
//         ]);

//         sp.stdout.on("data", (data) => {
//           console.log(`stdout: ${data}`);
//         });

//         sp.stderr.on("data", (data) => {
//           console.error(`stderr: ${data}`);
//         });
//       }
//     });
//   };
//   run().catch("err", console.error);
// };

// app.post("/generate", async (req, res) => {
//   console.log("generate url");
//   await prepareImage(req.body);
// });

// app.get("/generate", function () {
//   console.log("generate page!");
// });

// app.get("/", function () {
//   console.log("root page!");
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

// module.exports = app;

const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type("html").send(html));

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>`;
