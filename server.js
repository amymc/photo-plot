const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("node:fs");
const PNG = require("pngjs").PNG;
const crypto = require("crypto");

const { pipeline } = require("node:stream/promises");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ limit: "50mb" }));

const hash = crypto.createHash("sha1");
hash.setEncoding("hex");

const prepareImage = async (imageData) => {
  fs.writeFile("./image.txt", imageData, (err) => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });

  require("child_process").exec(
    `convert inline:image.txt result1.png
           convert result1.png -colorspace Gray result.png
           convert result.png -background black -alpha remove -alpha off result.png
           convert result.png -threshold 41% result.png
           magick result.png -bordercolor Snow -border 5x5 -density 144 -background black -gravity center  -set caption "RC 2024"  -polaroid 10 result.png
           convert result.png -bordercolor white -border 10x10 -density 144 result.png
           convert result.png -rotate 90 -trim result.jpg
      `,
    {
      stdio: "inherit",
    }
  );

  let colorArray = [];

  const hash = crypto.createHash("sha1");
  hash.setEncoding("hex");

  async function run() {
    await pipeline(
      fs
        .createReadStream("result.png")
        .pipe(
          new PNG({
            filterType: 4,
          })
        )
        .on("parsed", function () {
          for (var y = 0; y < this.height; y++) {
            colorArray.push([]);
            for (var x = 0; x < this.width; x++) {
              //   console.log("inner loop");
              var idx = (this.width * y + x) << 2;

              // invert color
              this.data[idx] = 255 - this.data[idx];
              this.data[idx + 1] = 255 - this.data[idx + 1];
              this.data[idx + 2] = 255 - this.data[idx + 2];

              colorArray[y].push([
                this.data[idx],
                this.data[idx + 1],
                this.data[idx + 2],
              ]);

              // and reduce opacity
              this.data[idx + 3] = this.data[idx + 3] >> 1;
            }
          }
          generateHPGL();
        }),
      hash
    );
  }

  const generateHPGL = () => {
    let hpglString = "IN;\nSP2;\n";
    let penOffsets = [
      [0, 0],
      [50, 50],
      [-70, -70],
    ];

    for (let penNum = 0; penNum < penOffsets.length; penNum++) {
      rowCount = 0;

      for (let i = 0; i < colorArray.length; i++) {
        let x = i * 12;

        let inking = false;

        for (let j = 0; j < colorArray[0].length; j++) {
          colorValue = colorArray[i][j];
          Y =
            0.2126 * colorArray[i][j][0] +
            0.7152 * colorArray[i][j][1] +
            0.0722 * colorArray[i][j][2];

          const isBlack = Y < 128;
          let y = j * 12;

          if (!isBlack && !inking) {
            // pen down
            hpglString += `PA${x},${y};\n`;
            hpglString += "PD;\n";
            inking = true;
          } else if (isBlack && inking) {
            // draw all the way here and lift
            hpglString += `PA${x},${y};\n`;
            hpglString += "PU;\n";
            inking = false;
          }
          //   else if (j === colorArray[0].length - 1) {
          //     hpglString += "PU;\n";
          //     inking = false;
          //   }
        }
      }
    }

    fs.writeFile("./image.hpgl", hpglString, (err) => {
      if (err) {
        console.error(err);
      } else {
        // file written successfully
      }
    });
  };
  run().catch(console.error);

  require("child_process").exec(
    `./chunker ./image.hpgl
      `,
    {
      stdio: "inherit",
    }
  );
};

app.post("/generate", async (req, res) => {
  await prepareImage(req.body);
});

app.listen(3000, "127.0.0.1", function () {
  console.log("listening");
});
