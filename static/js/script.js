const LANGUAGES = {
    "_": {defaultLanguage: "cn", defaultVOLanguage: "cn"},
//TODO:语言支持
    "cn": {
        audioList: [
            "audio/cn/nana-1.aac",
            "audio/cn/nana-2.aac",
            "audio/cn/yy/手牵手~.ogg",
            "audio/cn/yy/全都看见咯。.ogg",
            "audio/cn/yy/变聪明啦~.ogg",
            "audio/cn/yy/嘿！.ogg",
            "audio/cn/yy/手牵手~.ogg",
            "audio/cn/yy/蔓延吧。.ogg",
            "audio/cn/yy/记住你了.ogg",
        ],
        texts: {
            "page-title": "欢迎来到纳西妲的「玩具箱」",
            "doc-title": "Na♪~ Na♪~",
            "page-descriptions": "给纳西妲酱写的小网站，对，就是那个《原神》中最可爱的尘世七执政！",
            "counter-descriptions": ["纳西妲已经踩了", "纳西妲已经跳了"],
            "counter-unit": ["次~~", "次格子~"],
            "counter-button": ["踩格子", "行相~!"],
            "express-gratitude-text": "鸣谢",
            "express-gratitude-repository-text-1": "感谢Seseren创作并提供的纳西妲GIF图片 - bilibili",
            "express-gratitude-repository-text-2": "感谢duiqt和他的网站提供灵感",
            "express-gratitude-repository-text-3": "感谢duiqt为本网站提供源代码 - GitHub 仓库",
            "express-gratitude-repository-text-4": "感谢KawaiiShadowii和他的网站提供灵感 - tannhauser.moe",
            "repository-desc": "本项目GitHub 仓库",
            "options-txt-vo-lang": "语音语言",
            "options-txt-lang": "界面语言",
            "dialogs-close": "关闭",
        },
        cardImage: "img/card_cn.webp"
    },
};

(() => {
    const $ = mdui.$;
    // 初始化cachedObjects变量以存储缓存的对象URL
    const cachedObjects = {};
    const progress = [0, 1];

    //是否是第一次播放
    let firstNana = true;

    // 从localStorage检索保存的语言。如果未找到或其值为null，则默认为“cn”。
    let current_language = localStorage.getItem("lang") || LANGUAGES._.defaultLanguage;
    let current_vo_language = localStorage.getItem("volang") || LANGUAGES._.defaultVOLanguage;

    // 获取全局计数器元素并初始化其相应的计数。
    const localCounter = document.querySelector('#local-counter');
    const terminalLogo = document.querySelector('#terminal-logo');
    let localCount = localStorage.getItem('count-nahida') || 0;
    let lastCount = 0;
    let tempCount = 0;
    let akashaTerminalCount = 0;
    let akashaTerminalRun = false;
    let akashaTerminalOnline = false;
    //初始化计数器
    initCounter();
    // 初始化计时器变量并为计数器按钮元素添加事件监听器。
    const counterButton = document.querySelector('#counter-button');

    function addBtnEvent() {
        counterButton.addEventListener('click', (e) => {
            localCount++;
            lastCount++;
            updateCounter();
            triggerRipple(e);
            playNana();
            animateNahida();
            refreshDynamicTexts();
        });
    }


    multiLangMutation() // 页面加载时，初始化语言
    //缓存连通状态图片
    cacheStaticObj(`img/terminal-logo-0.webp`);
    cacheStaticObj(`img/terminal-logo-1.webp`);
    // 缓存gif
    for (let i = 2; i <= 7; i++) {
        cacheStaticObj(`img/nahida-${i}.gif`);
    }
    // 缓存音频
    convertAudioFilesToBase64()
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
            refreshDynamicTexts();
            addBtnEvent();
        });

    // 缓存对象URL，缓存中存在则返回缓存，如果不存在则获取并缓存它
    function cacheStaticObj(origUrl) {
        if (cachedObjects[origUrl]) {
            return cachedObjects[origUrl];
        } else {
            const finalOrigUrl = "static/" + origUrl;
            setTimeout(() => {
                fetch(finalOrigUrl)
                    .then((response) => response.blob())
                    .then((blob) => {
                        cachedObjects[origUrl] = URL.createObjectURL(blob);
                    })
                    .catch((error) => {
                        console.error(`Error caching object from ${origUrl}: ${error}`);
                    }).finally(() =>upadteProgress());
            }, 1);
            return finalOrigUrl;
        }
    }
    async function convertAudioFilesToBase64() {
        const dict = LANGUAGES;
        const promises = [];
        for (const lang in dict) {
            if (dict.hasOwnProperty(lang)) {
                const audioList = dict[lang].audioList;
                if (Array.isArray(audioList)) {
                    for (let i = 0; i < audioList.length; i++) {
                        const url = audioList[i];
                        if (typeof url === "string" && (url.endsWith(".aac") ||  url.endsWith(".ogg"))) {
                            promises.push(loadAndEncode("static/" + url).then(result => dict[lang].audioList[i] = result));
                        }
                    }
                }
            }
        }
        progress[1] = promises.length + 8
        await Promise.all(promises);
        return dict;
    }

    function upadteProgress() {
        progress[0] += 1
        counterButton.innerText = `${((progress[0] / progress[1]) * 100) | 0}%`
    }

    function loadAndEncode(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
                upadteProgress()
                if (xhr.status === 200) {
                    const buffer = xhr.response;
                    const blob = new Blob([buffer], { type: url.endsWith(".ogg")? "audio/ogg" : "audio/mpeg" });
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        const base64data = reader.result;
                        resolve(base64data);
                    }
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = function () {
                upadteProgress()
                reject(xhr.statusText);
            };
            xhr.send();
        });
    }
    /**
     * 获取指定范围内的随机整数
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {number} 随机整数
     */
    function randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min; // 生成随机整数并返回
    }

    /**
     * 获取是否是移动端
     * @returns {boolean} 移动端-true；非移动端-false
     */
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    /**
     * 初始化计数器（尝试从本地存储中加载历史计数）
     */
    function initCounter() {
        // 数字使用美式英语格式，重新格式化计数器
        localCounter.textContent = Math.floor(localCount).toLocaleString('en-US');
    }

    /**
     * 更新计数器
     */
    function updateCounter() {
        // 数字使用美式英语格式，重新格式化计数器
        localCounter.textContent = (akashaTerminalCount+lastCount+tempCount).toLocaleString('en-US');
    }

    // function that takes a textId, optional language and whether to use fallback/ default language for translation. It returns the translated text in the given language or if it cannot find the translation, in the default fallback language.
    //一个函数，接收textId、可选的语言和是否使用回退/默认语言进行翻译作为参数。它返回给定语言下的翻译文本，如果找不到翻译，则返回默认回退语言下的翻译文本。
    function getLocalText(textId, language = null, fallback = true) {
        let curLang = LANGUAGES[language || current_language];
        let localTexts = curLang.texts;
        if (localTexts[textId]) {
            let value = localTexts[textId];
            if (value instanceof Array) {
                return randomChoice(value); // 如果该文本ID有多个可用的翻译，则随机选择其中一个并返回。
            } else {
                return value;
            }
        }
        if (fallback) return getLocalText(textId, language = "cn", fallback = false);
        else return null;
    }

    // 切换语言时更新相关文本元素
    function multiLangMutation() {
        let curLang = LANGUAGES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (!(value instanceof Array))
                if (document.getElementById(textId))
                    document.getElementById(textId).innerHTML = value; // 将元素的innerHTML替换为给定的textId及其翻译版本。
        });
        refreshDynamicTexts();
        document.getElementById("nahida-card").src = "static/" + curLang.cardImage; // 将具有id "nahida-card"的元素的图像设置为所选语言中的翻译版本
    }

    // 获取所选语言对应的音频地址
    function getLocalAudioList() {
        return LANGUAGES[current_vo_language].audioList;
    }

    // 接收一个数组作为参数并返回该数组中的随机元素
    function randomChoice(myArr) {
        const randomIndex = randomNum(0, myArr.length-1);
        return myArr[randomIndex];
    }

    function getRandomAudioUrl() {
        return randomChoice(getLocalAudioList());
    }

    function playNana() {
        let audioUrl;
        if (firstNana) {
            firstNana = false;
            audioUrl = getLocalAudioList()[0];
        } else {
            audioUrl = getRandomAudioUrl();
        }
        // let audio = new Audio(cacheStaticObj(audioUrl));
        // audio.load();
        let audio = new Audio();
        audio.src = audioUrl;
        audio.load();
        audio.play();
        audio.addEventListener("ended", function () {
            this.remove();
        });
    }

    function animateNahida() {
        let id = null;
        const random = randomNum(2,7);
        const elem = document.createElement("img");
        elem.src = cacheStaticObj(`img/nahida-${random}.gif`);
        const screenWidth = window.innerWidth;
        console.log(screenWidth, (counterButton.getClientRects()[0].bottom + scrollY), isMobile())
        if (isMobile()) {
            elem.style.position = "absolute";
            elem.style.right = "-200px";
            elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 150 + "px"
            elem.style.zIndex = "-10";
            elem.style.width = "200px"; // 设置宽度为 200px
            elem.style.height = "auto"; // 自动计算高度，保持纵横比
            document.body.appendChild(elem);

            let pos = -200;
            const limit = window.innerWidth + 200;
            clearInterval(id);
            id = setInterval(() => {
                if (pos >= limit) {
                    clearInterval(id);
                    elem.remove()
                } else {
                    pos += 10;
                    elem.style.right = pos + 'px';
                }
            }, 12);
        }else {
            elem.style.position = "absolute";
            elem.style.right = "-500px";
            elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 230 + "px"
            elem.style.zIndex = "-10";
            elem.style.width = "500px";
            elem.style.height = "auto";
            document.body.appendChild(elem);

            let pos = -500;
            const limit = window.innerWidth + 500;
            clearInterval(id);
            id = setInterval(() => {
                if (pos >= limit) {
                    clearInterval(id);
                    elem.remove()
                } else {
                    pos += 20;
                    elem.style.right = pos + 'px';
                }
            }, 12);
        }

    }

    // This function creates ripples on a button click and removes it after 300ms.
    function triggerRipple(e) {
        let ripple = document.createElement("span");

        ripple.classList.add("ripple");

        const counter_button = document.getElementById("counter-button");
        counter_button.appendChild(ripple);

        let x = e.clientX - e.target.offsetLeft;
        let y = e.clientY - e.target.offsetTop;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        setTimeout(() => {
            ripple.remove();
        }, 300);
    }

    // 随机从列表中替换一个元素
    function refreshDynamicTexts() {
        let curLang = LANGUAGES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (value instanceof Array)
                if (document.getElementById(textId))
                    document.getElementById(textId).innerHTML = randomChoice(value);
        });
    }

    function fromAkashaTerminal(){
        if(akashaTerminalRun){
           return;
        }
        const start = new Date().getTime();
        akashaTerminalRun = true;
        tempCount = lastCount;
        lastCount = 0;
        $.ajax({
            method: 'GET',
            url: 'https://akasha.lv6.fun/terminal/nahida/toy/box/count',
            data: {
                num: tempCount
            },
            success: function (data) {
                const nums = JSON.parse(data);
                akashaTerminalCount = nums.n;
                tempCount = 0;
                updateCounter();
                akashaTerminalOnline = true;
            },
            error: function () {
                lastCount+=tempCount;
                tempCount = 0;
                akashaTerminalOnline = false;
            },
            complete: function () {
                console.log("time: " + new Date() + " " + (new Date().getTime() - start));
                akashaTerminalRun = false;
                if(akashaTerminalOnline){
                    terminalLogo.src=cacheStaticObj(`img/terminal-logo-1.webp`);
                }else{
                    terminalLogo.src=cacheStaticObj(`img/terminal-logo-0.webp`);
                }
            }
        });
    }

    window.onload = () => {
        setInterval(() => {
            localStorage.setItem('count-nahida', localCount);
        }, 500);
        setInterval(() => {
            fromAkashaTerminal();
        }, 5000);
    };
})();
