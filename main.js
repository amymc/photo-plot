let base64String;
const context = canvas.getContext("2d");

(function () {
  let width = 320;
  let height = 0;

  let streaming = false;
  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;
  let plotbutton = null;

  function startup() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");
    plotbutton = document.getElementById("plotbutton");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });

    video.addEventListener(
      "canplay",
      function (ev) {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false
    );

    startbutton.addEventListener(
      "click",
      function (ev) {
        takepicture();
        ev.preventDefault();
      },
      false
    );

    plotbutton.addEventListener(
      "click",
      function (ev) {
        console.log("click!!");
        convertPhoto();
        ev.preventDefault();
      },
      false
    );

    clearphoto();
  }

  const convertPhoto = async () => {
    fetch("http://127.0.0.1:3000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: base64String,
    });
  };

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    // let context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      base64String = canvas.toDataURL("image/png");
      console.log("canvas", base64String);
      photo.setAttribute("src", base64String);
    } else {
      clearphoto();
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  // window.addEventListener("load", startup, false);
  startup();
})();
