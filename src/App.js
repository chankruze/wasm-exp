import { useState, useEffect } from "react";
// import ffmpeg functions
// eslint-disable-next-line
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useInputFloat } from "./hooks/useGeekofia";
import styles from "./App.module.css";

const ffmpeg = createFFmpeg({ log: true });

function App() {
  // eslint-disable-next-line
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [duraton, bindDuration] = useInputFloat(5);
  const [fps, bindFps] = useInputFloat(10);
  const [width, bindWidth] = useInputFloat(0);
  const [loop, bindLoop] = useInputFloat(0);
  // const [duraton, setDuration] = useState(5);
  // const [fps, setFps] = useState(10);
  // const [width, setWidth] = useState(null);
  // const [loop, setLoop] = useState(0);

  // console.log(video);

  // fn to load ffmpeg asyncronously
  const loadFfmpeg = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  useEffect(() => {
    loadFfmpeg();
  }, []);

  // fn to convert video to gif
  const convertToGif = async () => {
    const inFileName = video.name;
    const outFileName = `${video.name.split(".").slice(0, -1).join(".")}.gif`;
    // settings
    const settings = `fps=${fps},${
      width !== 0 ? `scale=${width}:-1:flags=lanczos,` : ""
    }split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

    // write the file to memory
    ffmpeg.FS("writeFile", inFileName, await fetchFile(video));

    // run the ffmpeg command
    await ffmpeg.run(
      "-t",
      `${duraton}`,
      "-i",
      `${inFileName}`,
      "-vf",
      settings,
      "-loop",
      `${loop}`,
      outFileName
    );

    // access the output gif
    const data = ffmpeg.FS("readFile", outFileName);

    // create object URL for gif
    const gifUrl = URL.createObjectURL(
      new Blob([data.buffer], { type: "image/gif" })
    );
    setGif(gifUrl);
  };

  return (
    <div className={styles.app_root}>
      {ready ? (
        <>
          <div className={styles.toolbar}>
            {/* file uplaod */}
            <div className={styles.file_upload_wrapper}>
              <div className={styles.file_input_wrapper}>
                <span>select video</span>
                <input
                  type="file"
                  onChange={(e) => setVideo(e.target.files?.item(0))}
                />
              </div>
              {video && <p>{video.name}</p>}
            </div>

            <div className={styles.settings_wrapper}>
              {/* duration */}
              <div>
                <p>Duration</p>
                <input type="number" {...bindDuration} />
              </div>
              {/* width */}
              <div>
                <p>Width</p>
                <input type="number" {...bindWidth} />
              </div>
              {/* fps */}
              <div>
                <p>FPS</p>
                <input type="number" {...bindFps} />
              </div>
              {/* loop */}
              <div>
                <p>Loop</p>
                <input type="number" {...bindLoop} />
              </div>
            </div>

            {/* convert button */}
            <button className={styles.btn_convert} onClick={convertToGif}>
              convert
            </button>
          </div>
          <>
            <div className={styles.body}>
              {/* uploaded video */}
              {video && (
                <video
                  controls
                  className={styles.input_video}
                  src={URL.createObjectURL(video)} // assign a file to an URLs
                ></video>
              )}

              {gif && (
                <div className={styles.separater}>
                  {">>"} Booyah! {">>"}
                </div>
              )}

              {/* render the gif */}
              {gif && (
                <div className={styles.result_wrapper}>
                  <img src={gif} className={styles.gif} alt="converted gif" />
                  <a
                    href={gif}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.btn_download}
                  >
                    download
                  </a>
                </div>
              )}
            </div>
          </>
        </>
      ) : (
        <p className={styles.loading}>Loading ffmpeg...</p>
      )}
    </div>
  );
}

export default App;
