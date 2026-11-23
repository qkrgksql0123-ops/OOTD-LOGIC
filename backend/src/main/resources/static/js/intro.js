// 인트로(시작 화면): 처음 접속 시 한 번만, 모델 사진 슬라이드 후 메인으로 전환
(function () {
    // 사진 교체/추가는 이 배열만 수정하면 된다 (로컬 파일은 'images/intro/파일명.jpg' 형태)
    var SLIDES = [
        'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?auto=format&fit=crop&w=1920&q=80',
        'https://images.unsplash.com/photo-1624911104820-5316c700b907?auto=format&fit=crop&w=1920&q=80'
    ];
    var SLIDE_MS = 3000;
    var STORAGE_KEY = 'ootd_intro_seen';

    var root = document.getElementById('intro');
    if (!root || !document.documentElement.classList.contains('intro-on')) return;

    var slidesEl = root.querySelector('.intro-slides');
    var progressEl = root.querySelector('.intro-progress');
    var skipBtn = root.querySelector('.intro-skip');
    var timer = null;
    var finished = false;

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
        root.classList.add('is-leaving');
        document.removeEventListener('keydown', onKey);
        setTimeout(function () {
            document.documentElement.classList.remove('intro-on');
            root.remove();
        }, 850);
    }

    function onKey(e) {
        if (e.key === 'Escape' || e.key === 'Enter') finish();
    }

    skipBtn.addEventListener('click', finish);
    document.addEventListener('keydown', onKey);

    // 불러오기에 성공한 사진만 사용 (하나도 없으면 인트로 없이 바로 메인)
    function preload(url) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () { resolve(url); };
            img.onerror = function () { resolve(null); };
            img.src = url;
        });
    }

    // 첫 사진이 너무 늦게 오면 기다리지 않고 메인으로 넘어간다
    var giveUp = setTimeout(finish, 6000);

    Promise.all(SLIDES.map(preload)).then(function (urls) {
        clearTimeout(giveUp);
        if (finished) return;
        var ok = urls.filter(Boolean);
        if (ok.length === 0) { finish(); return; }

        root.style.setProperty('--intro-slide-ms', SLIDE_MS + 'ms');
        ok.forEach(function (url) {
            var s = document.createElement('div');
            s.className = 'intro-slide';
            s.style.backgroundImage = 'url("' + url + '")';
            slidesEl.appendChild(s);

            var bar = document.createElement('span');
            bar.appendChild(document.createElement('i'));
            progressEl.appendChild(bar);
        });

        var slides = slidesEl.children;
        var bars = progressEl.children;
        var index = 0;

        function show(i) {
            for (var k = 0; k < slides.length; k++) {
                slides[k].classList.toggle('is-active', k === i);
                bars[k].classList.toggle('is-done', k < i);
                bars[k].classList.remove('is-active');
            }
            // 막대 애니메이션을 다시 시작하기 위해 한 프레임 뒤에 활성화
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { bars[i].classList.add('is-active'); });
            });
        }

        function next() {
            index += 1;
            if (index >= slides.length) { finish(); return; }
            show(index);
            timer = setTimeout(next, SLIDE_MS);
        }

        show(0);
        timer = setTimeout(next, SLIDE_MS);
    });
})();
