// [1] 버전 명시
// (따옴표 오류 수정함. 배포 때마다 이 숫자를 바꾸면, 사용자가 새로고침 시 최신을 받아옵니다.)
const CACHE_NAME = 'llg-v1_9_20'; 

const FILES = [
    './', 
    './index.html', 
    './css/style.css',
    './js/app.js', 
    './js/data.js', 
    './js/game_data.js', // game_data.js가 있다면 추가
    './js/battle.js',
    './js/achievement.js', // achievement.js가 있다면 추가
    'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser-arcade-physics.min.js',
    'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
];

// [2] 설치 (Install)
self.addEventListener('install', (e) => {
    console.log('[Service Worker] 설치 및 캐싱 시작:', CACHE_NAME);
    self.skipWaiting(); // 대기 없이 즉시 설치
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES);
        })
    );
});

// [3] 활성화 (Activate) - 구버전 캐시 삭제
self.addEventListener('activate', (e) => {
    console.log('[Service Worker] 활성화 - 구버전 정리');
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] 삭제됨:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim(); // 즉시 제어권 가져오기
});

// [4] 요청 (Fetch) - ★ 여기가 핵심 수정됨! ★
// 전략: "네트워크 우선, 실패하면 캐시" (Network First, falling back to Cache)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // 1. 네트워크에서 잘 가져왔으면?
                // -> 최신 버전을 캐시에 복사해두고(다음 오프라인 대비), 브라우저에게 줌
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, resClone);
                });
                return res;
            })
            .catch(() => {
                // 2. 인터넷이 끊겼거나 실패했으면?
                // -> 그때서야 캐시(옛날 거라도)를 뒤져서 줌
                return caches.match(e.request);
            })
    );
});
