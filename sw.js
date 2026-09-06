/* 크롬이 '앱 설치'를 제안하려면 서비스워커가 하나 있어야 한다.
   캐시는 두지 않는다. 파일을 갱신할 때마다 옛 화면이 남으면 곤란하다. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
