import {
  createApp,
  ref,
  onMounted,
  watchEffect,
} from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";

import postscribe from "https://cdn.skypack.dev/postscribe";

import Hls from "https://cdn.skypack.dev/hls.js";

const useHls = (url) => {
  const el = ref(null);
  onMounted(() => {
    if (Hls.isSupported()) {
      const hls = new Hls({
        manifestLoadingRetryDelay: 5000,
        manifestLoadingMaxRetry: Infinity,
      });
      hls.attachMedia(el.value);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);
      });
    }
  });
  return el;
};

const App = {
  setup() {
    const videoStarted = ref(false);
    const startVideo = () => {
      videoStarted.value = !videoStarted.value;
    };

    // Chat

    onMounted(() =>
      postscribe(
        "#chat",
        `<script
    id="cid0020000246593815710"
    data-cfasync="false"
    async
    src="//st.chatango.com/js/gz/emb.js"
    style="width: 100%; height: 320px"
  >
    {
      "handle":"elektronlivetest",
      "arch":"js",
      "styles":{
        "a":"000000",
        "b":100,
        "c":"FFFFFF",
        "d":"000000",
        "e":"000000",
        "g": "ffffff",
        "h":"999999",
        "k":"222222",
        "l":"000000",
        "m":"aaaaaa",
        "n":"aaaaaa",
        "p":"12",
        "q":"000000",
        "r":100,
        "t":40,
        "usricon":0,
        "allowpm":0,
        "cnrs":"0"
      }
    }
  </script>`
      )
    );

    // Clients count

    const clientsCount = ref(false);

    const socket = new WebSocket("wss://ws-fggq5.ondigitalocean.app/");

    let interval = null;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "statsRequest" }));
      interval = setInterval(
        () => socket.send(JSON.stringify({ type: "statsRequest" })),
        8000
      );
    };

    socket.onmessage = ({ data }) => {
      const message = safeJsonParse(data);
      if (message && message.type === "statsResponse") {
        clientsCount.value = message.clientsCount;
      }
    };

    socket.onclose = () => clearInterval(interval);

    const testUrl = `https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8`;

    const mainUrl = `https://elektron-live.babahhcdn.com/bb1150-le/emp/index.m3u8`;
    const specUrl =
      "https://elektron-live.babahhcdn.com/bb1150-le/spectators/index.m3u8";

    // const videoEl = ref(null);
    // watchEffect(() => console.log(videoEl.value));

    const mainVideo = useHls(mainUrl);
    const specVideo = useHls(specUrl);

    // onMounted(() => {
    //   if (Hls.isSupported()) {
    //     const hls = new Hls({
    //       manifestLoadingRetryDelay: 5000,
    //       manifestLoadingMaxRetry: Infinity,
    //     });
    //     hls.attachMedia(videoEl.value);
    //     hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    //       hls.loadSource(v2);
    //     });
    //   }
    // });

    return { videoStarted, startVideo, clientsCount, mainVideo, specVideo };
  },
};

const app = createApp(App);
//app.component("test", Test);
app.mount("#app");

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
}