/* 클레머 서비스워커 — v233
   예전 방식(설치 시 파일을 캐시에 넣고 그 뒤로는 계속 그 캐시만 쓰는 방식)은
   깃허브에 새 버전을 올려도 폰에 설치된 앱이 계속 옛날 파일을 보여주는
   원인이 된다 — index.html을 v233으로 고쳐도 폰은 v212(혹은 그 전) 그대로
   캐시에서 읽어버린다.
   지금은 반대로 한다: 인터넷이 되면 항상 서버에서 최신 파일을 받아오고,
   그 응답을 캐시에 최신 것으로 덮어쓴다. 오프라인일 때만(요청이 실패할
   때만) 캐시에 있는 마지막 버전을 대신 보여준다 — "새 버전이 있는데 옛날
   걸 계속 보여주는" 문제가 구조적으로 없어진다. */
const CACHE_NAME = 'clamor-cache-v233';
const CORE_ASSETS = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (e) => {
  self.skipWaiting();   // 새 서비스워커가 나오자마자 대기하지 않고 바로 이어받는다
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(CORE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())   // 열려 있는 탭도 곧바로 새 서비스워커가 맡는다
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))   // 오프라인일 때만 캐시로 대신한다
  );
});
