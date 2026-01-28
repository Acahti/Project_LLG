// [1] 버전 명시 (배포할 때마다 이 숫자를 꼭 올려야 합니다!)
const CACHE_NAME = 'llg-v1_2_4; 


const FILES = [
    './', 
    './index.html', 
    './css/style.css',
    './js/app.js', 
    './js/data.js', 
    './js/battle.js',
    'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser-arcade-physics.min.js',
    'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
];

// [2] 설치 (Install): 새 파일 캐싱
self.addEventListener('install', (e) => {
    console.log('[Service Worker] 설치 진행 중...');
    // 대기하지 않고 즉시 활성화 (Skip Waiting)
    self.skipWaiting(); 
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] 파일 캐싱 완료');
            return cache.addAll(FILES);
        })
    );
});

// [3] 활성화 (Activate): ★ 옛날 캐시 지우기 (가장 중요!)
self.addEventListener('activate', (e) => {
    console.log('[Service Worker] 활성화 및 구버전 정리');
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                // 현재 버전(llg-v4)과 다르면 싹 다 지운다
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] 구버전 캐시 삭제:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // 즉시 클라이언트 제어권 가져오기
    return self.clients.claim();
});

// [4] 요청 (Fetch): 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((res) => {
            return res || fetch(e.request);
        })
    );
});
