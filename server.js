const express = require("express");
const port = process.env.PORT || 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("node:fs");
const PNG = require("pngjs").PNG;
const crypto = require("crypto");
const shell = require("shelljs");
const { exec } = require("child_process");

const { pipeline } = require("node:stream/promises");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ limit: "50mb" }));

shell.exec(
  `git submodule init
   git submodule update
   git submodule status`,
  {
    stdio: "inherit",
  }
);

const hash = crypto.createHash("sha1");
hash.setEncoding("hex");

const generateHPGL = (colorArray) => {
  let hpglString = "IN;\nSP2;\n";
  // let penOffsets = [
  //   [0, 0],
  //   [50, 50],
  //   [-70, -70],
  // ];

  // for (let penNum = 0; penNum < penOffsets.length; penNum++) {
  rowCount = 0;

  for (let i = 0; i < colorArray.length; i++) {
    let x = i * 12;

    let inking = false;

    for (let j = 0; j < colorArray[0].length; j++) {
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
  // }

  fs.writeFile("./image.hpgl", hpglString, (err) => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
      console.log("plot");
      shell.exec(`ls`);
      process.chdir("./plotter-tools/chunker/");
      // require("child_process").exec(`cd plotter-tools/chunker/`);
      // shell.exec(
      //   `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path`
      // );

      // shell.exec(
      //   `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --no-modify-path -y`
      // );
      // shell.exec(`. "$HOME/.cargo/env"`);
      // shell.exec('echo "$HOME"');
      // shell.exec(`curl https://sh.rustup.rs -sSf | sh -s -- --no-modify-path -y
      // shell.exec(`curl https://sh.rustup.rs -sSf | sh -s -- -y`);
      // shell.exec(`export PATH="$HOME/.cargo/bin:$PATH"`);
      // shell.exec(`echo $PATH`);
      // source $HOME/.cargo/env
      // source ~/.profile`);

      // shell.exec(`source $HOME/.cargo/env
      // source ~/.profile`);
      shell.exec(`ls`);
      // shell.exec(`mkdir -p /opt/render/.cargo/bin`);
      // shell.exec(`mv ./cargo-binstall /opt/render/.cargo/bin`);
      // shell.exec(`cargo build`);
      // shell.exec(`./cargo-binstall`);

      shell.exec(
        "./cargo-binstall ../image.hpgl",
        function (code, stdout, stderr) {
          console.log("Exit code:", code);
          console.log("Program output:", stdout);
          console.log("Program stderr:", stderr);
        }
      );

      // const { spawn } = require("child_process");
      // process.chdir("./target/debug/");
      // shell.exec(
      //   "./target/debug/chunker ../image.hpgl",
      //   function (code, stdout, stderr) {
      //     console.log("Exit code:", code);
      //     console.log("Program output:", stdout);
      //     console.log("Program stderr:", stderr);
      //   }
      // );
      // sp.on("error", (err) => {
      //   console.log(`Error: ${err}`);
      // });
      // sp.stdout.on("data", (data) => {
      //   console.log(`stdout: ${data}`);
      // });
      // sp.stderr.on("data", (data) => {
      //   console.error(`stderr: ${data}`);
      // });
      // var sp = spawn("/target/debug/chunker", ["image.hpgl"]);
      // sp.on("error", (err) => {
      //   console.log(`Error: ${err}`);
      // });
      // sp.stdout.on("data", (data) => {
      //   console.log(`stdout: ${data}`);
      // });
      // sp.stderr.on("data", (data) => {
      //   console.error(`stderr: ${data}`);
      // });
    }
  });
};

async function run() {
  let colorArray = [];

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
        generateHPGL(colorArray);
      }),
    hash
  );
}

const prepareImage = async (imageData) => {
  console.log("prepare");
  fs.writeFile("./image.txt", imageData, (err) => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully

      const child = require("child_process").exec(
        `convert inline:image.txt result1.png
               convert result1.png -colorspace Gray result.png
               convert result.png -background black -alpha remove -alpha off result.png
               convert result.png -threshold 41% result.png
               magick result.png -bordercolor Snow -border 5x5 -density 144 -background black -gravity center  -set caption "RC 2024"  -polaroid 10 result.png
               convert result.png -bordercolor white -border 10x10 -density 144 result.png
          `,
        {
          stdio: "inherit",
        }
      );

      // const child = require("child_process").exec(
      //   `convert inline:image.txt result1.png
      //          convert result1.png -colorspace Gray result.png
      //          convert result.png -background black -alpha remove -alpha off result.png
      //          convert result.png -threshold 41% result.png
      //          magick result.png -bordercolor Snow -border 5x5 -density 144 -background black -gravity center  -set caption "RC 2024"  -polaroid 10 result.png
      //          convert result.png -bordercolor white -border 10x10 -density 144 result.png
      //     `,
      //   {
      //     stdio: "inherit",
      //   }
      // );
      child.on("exit", function () {
        run().catch("err", console.error);
      });
    }
  });
};

app.post("/generate", async (req, res) => {
  console.log("generate url");
  prepareImage(req.body);
});

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
