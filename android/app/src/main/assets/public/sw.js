/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-21a80088'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "index.html",
    "revision": "5aecf6f524e9c074c89a914c07e790f2"
  }, {
    "url": "assets/workbox-window.prod.es5-BIl4cyR9.js",
    "revision": null
  }, {
    "url": "assets/vendor-CwJisgnu.js",
    "revision": null
  }, {
    "url": "assets/users-CL9alM2N.js",
    "revision": null
  }, {
    "url": "assets/trophy-CEb9pKVb.js",
    "revision": null
  }, {
    "url": "assets/trash-2-D_S9HYG6.js",
    "revision": null
  }, {
    "url": "assets/shield-check-CZCP8OJH.js",
    "revision": null
  }, {
    "url": "assets/refresh-cw-DhWqSVtI.js",
    "revision": null
  }, {
    "url": "assets/react-uYQCb-St.js",
    "revision": null
  }, {
    "url": "assets/react-DlQMfdTm.js",
    "revision": null
  }, {
    "url": "assets/react-DeeJllAS.js",
    "revision": null
  }, {
    "url": "assets/react-CISc5c9B.js",
    "revision": null
  }, {
    "url": "assets/react-BtPwutzt.js",
    "revision": null
  }, {
    "url": "assets/react-Bqjguskl.js",
    "revision": null
  }, {
    "url": "assets/react-BRBTVEFl.js",
    "revision": null
  }, {
    "url": "assets/react-BLTkGQVk.js",
    "revision": null
  }, {
    "url": "assets/play-BESDN0N-.js",
    "revision": null
  }, {
    "url": "assets/pen-tool-B599hbe3.js",
    "revision": null
  }, {
    "url": "assets/navigation-B0l-NQSv.js",
    "revision": null
  }, {
    "url": "assets/motion-BynLanvx.js",
    "revision": null
  }, {
    "url": "assets/mixin-DIQKSja0.js",
    "revision": null
  }, {
    "url": "assets/loader-circle-L5pd60zE.js",
    "revision": null
  }, {
    "url": "assets/info-CJ8DSCuM.js",
    "revision": null
  }, {
    "url": "assets/index-I06tFtTB.css",
    "revision": null
  }, {
    "url": "assets/index-DYypFaaZ.js",
    "revision": null
  }, {
    "url": "assets/index-B6_3PTYU.js",
    "revision": null
  }, {
    "url": "assets/index-B2yVkNiu.js",
    "revision": null
  }, {
    "url": "assets/hls-MmTFPL5i.js",
    "revision": null
  }, {
    "url": "assets/gemini-C3p321wu.js",
    "revision": null
  }, {
    "url": "assets/firebase-Cwwg_lgP.js",
    "revision": null
  }, {
    "url": "assets/firebase-Bu2TaaPQ.js",
    "revision": null
  }, {
    "url": "assets/dash.all.min-B7SfqX9N.js",
    "revision": null
  }, {
    "url": "assets/copy-DlID5MQV.js",
    "revision": null
  }, {
    "url": "assets/cloud-rain-B_gaRZ7S.js",
    "revision": null
  }, {
    "url": "assets/circle-x-DhiEy2LK.js",
    "revision": null
  }, {
    "url": "assets/ZakatCalculator-Bnuhv7Qb.js",
    "revision": null
  }, {
    "url": "assets/WorshipTracker-CeJQ7Zu8.js",
    "revision": null
  }, {
    "url": "assets/SupportApp-bfSXGhyd.js",
    "revision": null
  }, {
    "url": "assets/SocialChallenges-C3jF7xpQ.js",
    "revision": null
  }, {
    "url": "assets/SelfAccounting-Bb_mfdlH.js",
    "revision": null
  }, {
    "url": "assets/Sakina-C74eS-GL.js",
    "revision": null
  }, {
    "url": "assets/Ruqyah-ZO0-adbQ.js",
    "revision": null
  }, {
    "url": "assets/Radio-DrxRDR7H.js",
    "revision": null
  }, {
    "url": "assets/QuranReflection-BE1HuhVa.js",
    "revision": null
  }, {
    "url": "assets/QuranPlan-CseqrvY_.js",
    "revision": null
  }, {
    "url": "assets/Qibla-FJrEw3un.js",
    "revision": null
  }, {
    "url": "assets/QazaTracker-Dj5HPZN0.js",
    "revision": null
  }, {
    "url": "assets/ProphetStories-B6_QpStc.js",
    "revision": null
  }, {
    "url": "assets/Preview-Cv2OZhTX.js",
    "revision": null
  }, {
    "url": "assets/PrayerGuide-BQiUhnzt.js",
    "revision": null
  }, {
    "url": "assets/NotificationsPage-kCuJmLuN.js",
    "revision": null
  }, {
    "url": "assets/NamesOfAllah-BDryOdW9.js",
    "revision": null
  }, {
    "url": "assets/MuslimGarden-DP3gynI4.js",
    "revision": null
  }, {
    "url": "assets/MuslimAI-DNTkLbFr.js",
    "revision": null
  }, {
    "url": "assets/MoodTracker-DOI6NCVx.js",
    "revision": null
  }, {
    "url": "assets/IslamicTimeline-BZcw-ICZ.js",
    "revision": null
  }, {
    "url": "assets/IslamicQuiz-BbevPCYb.js",
    "revision": null
  }, {
    "url": "assets/IslamicNames-DjLU6d14.js",
    "revision": null
  }, {
    "url": "assets/IslamicLibrary-CNStz3su.js",
    "revision": null
  }, {
    "url": "assets/IslamicEvents-HrvGlt-8.js",
    "revision": null
  }, {
    "url": "assets/InheritanceCalculator-BQShJ8sV.js",
    "revision": null
  }, {
    "url": "assets/HalalChecker-CHWqWo6K.js",
    "revision": null
  }, {
    "url": "assets/HajjUmrahGuide-CmZhxdAS.js",
    "revision": null
  }, {
    "url": "assets/Hadith-DTRyQaqd.js",
    "revision": null
  }, {
    "url": "assets/Games-CJbIiMf2.js",
    "revision": null
  }, {
    "url": "assets/EidAdhaSpecial-DNnnRr8D.js",
    "revision": null
  }, {
    "url": "assets/Duas-gtx3SFPP.js",
    "revision": null
  }, {
    "url": "assets/DuaWall-_VNQPcgo.js",
    "revision": null
  }, {
    "url": "assets/DreamInterpretation-DNSTvIG-.js",
    "revision": null
  }, {
    "url": "assets/Downloads-xvBpFIqV.js",
    "revision": null
  }, {
    "url": "assets/DawahGenerator-D5vVQ4w7.js",
    "revision": null
  }, {
    "url": "assets/Calendar-BOZqRikZ.js",
    "revision": null
  }, {
    "url": "assets/Auth-BfxlvAtF.js",
    "revision": null
  }, {
    "url": "icon.svg",
    "revision": "677000170f3f592ac4bb82d24236d6cd"
  }, {
    "url": "manifest.webmanifest",
    "revision": "e0578a5b29a09d915e7e5eb29106c478"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/api\.alquran\.cloud\/.*/i, new workbox.CacheFirst({
    "cacheName": "quran-api-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/api\.aladhan\.com\/.*/i, new workbox.NetworkFirst({
    "cacheName": "aladhan-api-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 604800
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/.*\.mp3quran\.net\/.*/i, new workbox.CacheFirst({
    "cacheName": "quran-audio-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 604800
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
