var LANGUAGES = {
    "_": { defaultLanguage: "cn", defaultVOLanguage: "cn" },
//TODO:语言支持
    "cn": {
        audioList: [
            "static/audio/cn/nana-1.aac",
            "static/audio/cn/nana-2.aac",
        ],
        texts: {
            "page-title": "欢迎来到纳西妲的「玩具箱」",
            "doc-title": "Na♪~ Na♪~",
            "page-descriptions": "给纳西妲酱写的小网站，对，就是那个《原神》中最可爱的尘世七执政！",
            "counter-descriptions": ["纳西妲已经踩了", "纳西妲已经跳了"],
            "counter-unit": ["次~~", "次格子~"],
            "counter-button": ["踩格子", "行相~!"],
            "access-via-pages": "您目前是通过 GitHub Pages 访问。</a>。",
            "access-via-mirror": "镜像网站正在筹划中",
            "show-credits-text": "查看感谢页",
            "express-gratitude-text": "鸣谢",
            "express-gratitude-repository-text-1": "感谢duiqt和他的网站提供灵感 - herta.onrender.com",
            "express-gratitude-repository-text-2": "感谢duiqt为本网站提供源代码 - GitHub 仓库",
            "express-gratitude-repository-text-3": "感谢KawaiiShadowii和他的网站提供灵感 - tannhauser.moe",
            "repository-desc": "本项目GitHub 仓库",
            "options-txt-vo-lang": "语音语言",
            "options-txt-lang": "界面语言",
            "dialogs-close": "关闭",
            "dialogs-credits-title": "制作人员名单",

            "CREDITS:main-dev": "主要开发者",
            "CREDITS:code-contributor": "代码贡献者",
            "CREDITS:artist": "艺术家",
            "CREDITS:localization": "本地化贡献者",
            "CREDITS:localization:Korean": "韩国本地化贡献者",
            "CREDITS:localization:Japanese": "日本本地化贡献者",
            "CREDITS:localization:Indonesian": "印度尼西亚本地化贡献者",
            "CREDITS:inspiration": "灵感来源"

        },
        cardImage: "img/card_cn.jpg"
    },
};

(() => {
    multiLangMutation() // 页面加载时，初始化语言
    // 缓存gif
    cacheStaticObj("img/nahida-2.gif");
    cacheStaticObj("img/nahida-3.gif");
    cacheStaticObj("img/nahida-4.gif");
    cacheStaticObj("img/nahida-5.gif");

    // 获取全局计数器元素并初始化其相应的计数。
    const localCounter = document.querySelector('#local-counter');
    let localCount = localStorage.getItem('count-v2') || 0;

    // 数字使用美式英语格式，重新格式化计数器
    localCounter.textContent = localCount.toLocaleString('en-US');

    // 初始化计时器变量并为计数器按钮元素添加事件监听器。
    const counterButton = document.querySelector('#counter-button');
    counterButton.addEventListener('click', (e) => {
        localCount++;
        localCounter.textContent = localCount.toLocaleString('en-US');
        triggerRipple(e);
        playNana();
        animateHerta();
        refreshDynamicTexts();
    });

    const $ = mdui.$;

    // 初始化cachedObjects变量以存储缓存的对象URL
    var cachedObjects = {};

    // 缓存对象URL，缓存中存在则返回缓存，如果不存在则获取并缓存它
    function cacheStaticObj(origUrl) {
        if (cachedObjects[origUrl]) {
            return cachedObjects[origUrl];
        } else {
            setTimeout(() => {
                fetch("static/" + origUrl)
                    .then((response) => response.blob())
                    .then((blob) => {
                        const blobUrl = URL.createObjectURL(blob);
                        cachedObjects[origUrl] = blobUrl;
                    })
                    .catch((error) => {
                        console.error(`Error caching object from ${origUrl}: ${error}`);
                    });
            }, 1);
            return origUrl;
        }
    }

    //是否是第一次播放
    let firstNana = true;

    // 从localStorage检索保存的语言“lang”。如果未找到或其值为null，则默认为“cn”。
    let current_language = localStorage.getItem("lang") || LANGUAGES._.defaultLanguage;
    let current_vo_language = localStorage.getItem("volang") || LANGUAGES._.defaultVOLanguage;

    // function that takes a textId, optional language and whether to use fallback/ default language for translation. It returns the translated text in the given language or if it cannot find the translation, in the default fallback language.
    //一个函数，接收textId、可选的语言和是否使用回退/默认语言进行翻译作为参数。它返回给定语言下的翻译文本，如果找不到翻译，则返回默认回退语言下的翻译文本。
    function getLocalText(textId, language = null, fallback = true) {
        let curLang = LANGUAGES[language || current_language];
        let localTexts = curLang.texts;
        if (localTexts[textId] != undefined) {
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
                if (document.getElementById(textId) !== undefined)
                    document.getElementById(textId).innerHTML = value; // 将元素的innerHTML替换为给定的textId及其翻译版本。
        });
        refreshDynamicTexts()
        document.getElementById("herta-card").src = "static/" + curLang.cardImage; // 将具有id "herta-card"的元素的图像设置为所选语言中的翻译版本
    };

    // 获取所选语言对应的音频地址
    function getLocalAudioList() {
        return LANGUAGES[current_vo_language].audioList;
    }

    // 接收一个数组作为参数并返回该数组中的随机元素
    function randomChoice(myArr) {
        const randomIndex = Math.floor(Math.random() * myArr.length);
        const randomItem = myArr[randomIndex];
        return randomItem;
    }

    // 使用费雪耶茨算法(Fisher-Yates shuffle)随机洗牌数组中元素
    function randomShuffle(myArr) {
        for (let i = myArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [myArr[i], myArr[j]] = [myArr[j], myArr[i]];
        }
        return myArr;
    }

    function getRandomAudioUrl() {
        var localAudioList = getLocalAudioList();
        if (current_vo_language == "ja") {
            const randomIndex = Math.floor(Math.random() * 2) + 1;
            return localAudioList[randomIndex];
        }
        const randomIndex = Math.floor(Math.random() * localAudioList.length);
        return localAudioList[randomIndex];
    }

    function playNana() {
        let audioUrl;
        if (firstNana) {
            firstNana = false;
            audioUrl = getLocalAudioList()[0];
        } else {
            audioUrl = getRandomAudioUrl();
        }
        let audio = new Audio();//cacheStaticObj(audioUrl));
        audio.src = audioUrl;
        audio.play();
        audio.addEventListener("ended", function () {
            this.remove();
        });
    }

    function animateHerta() {
        let id = null;
        const random = randomNum(1,5);
        const elem = document.createElement("img");
        elem.src = cacheStaticObj(`img/nahida-${random}.gif`);
        elem.style.position = "absolute";
        elem.style.right = "-500px";
        elem.style.top = counterButton.getClientRects()[0].bottom + scrollY - 430 + "px"
        elem.style.zIndex = "-10";
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

    function randomNum(min, max){
        return Math.floor(Math.random()*(max-min+1))+min;
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
    };

    // This function retrieves localized dynamic text based on a given language code, and randomly replaces an element with one of the translations. 
    function refreshDynamicTexts() {
        let curLang = LANGUAGES[current_language];
        let localTexts = curLang.texts;
        Object.entries(localTexts).forEach(([textId, value]) => {
            if (value instanceof Array)
                if (document.getElementById(textId) != undefined)
                    document.getElementById(textId).innerHTML = randomChoice(value);
        });
    };

    // NOTE the deployment on Github pages is stopped and deprecated. This tip is not useful anymore.
    if (location.hostname.endsWith("duiqt.github.io")) {
        window.location.href = "https://herta.onrender.com";
    }

    // This function create bilibili icon in 2 cases: activated & inactivated
    function bilibiliIcon(color) {
        return `<i class="mdui-list-item-icon mdui-icon">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="fill: ${color};">
        <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M488.6 104.1C505.3 122.2 513 143.8 511.9 169.8V372.2C511.5 398.6 502.7 420.3 485.4 437.3C468.2 454.3 446.3 463.2 419.9 464H92.02C65.57 463.2 43.81 454.2 26.74 436.8C9.682 419.4 .7667 396.5 0 368.2V169.8C.7667 143.8 9.682 122.2 26.74 104.1C43.81 87.75 65.57 78.77 92.02 78H121.4L96.05 52.19C90.3 46.46 87.42 39.19 87.42 30.4C87.42 21.6 90.3 14.34 96.05 8.603C101.8 2.868 109.1 0 117.9 0C126.7 0 134 2.868 139.8 8.603L213.1 78H301.1L375.6 8.603C381.7 2.868 389.2 0 398 0C406.8 0 414.1 2.868 419.9 8.603C425.6 14.34 428.5 21.6 428.5 30.4C428.5 39.19 425.6 46.46 419.9 52.19L394.6 78L423.9 78C450.3 78.77 471.9 87.75 488.6 104.1H488.6zM449.8 173.8C449.4 164.2 446.1 156.4 439.1 150.3C433.9 144.2 425.1 140.9 416.4 140.5H96.05C86.46 140.9 78.6 144.2 72.47 150.3C66.33 156.4 63.07 164.2 62.69 173.8V368.2C62.69 377.4 65.95 385.2 72.47 391.7C78.99 398.2 86.85 401.5 96.05 401.5H416.4C425.6 401.5 433.4 398.2 439.7 391.7C446 385.2 449.4 377.4 449.8 368.2L449.8 173.8zM185.5 216.5C191.8 222.8 195.2 230.6 195.6 239.7V273C195.2 282.2 191.9 289.9 185.8 296.2C179.6 302.5 171.8 305.7 162.2 305.7C152.6 305.7 144.7 302.5 138.6 296.2C132.5 289.9 129.2 282.2 128.8 273V239.7C129.2 230.6 132.6 222.8 138.9 216.5C145.2 210.2 152.1 206.9 162.2 206.5C171.4 206.9 179.2 210.2 185.5 216.5H185.5zM377 216.5C383.3 222.8 386.7 230.6 387.1 239.7V273C386.7 282.2 383.4 289.9 377.3 296.2C371.2 302.5 363.3 305.7 353.7 305.7C344.1 305.7 336.3 302.5 330.1 296.2C323.1 289.9 320.7 282.2 320.4 273V239.7C320.7 230.6 324.1 222.8 330.4 216.5C336.7 210.2 344.5 206.9 353.7 206.5C362.9 206.9 370.7 210.2 377 216.5H377z"/>
        </svg>
        </i>`;
    }

    // This func adds avatars for credits and with href for those having social link
    function addAvatar(socialLink, currentIcon) {
        let avatar = `<img src="static/credits/${currentIcon}"/>`;
        if (socialLink == '') return avatar;
        return `<a href="${socialLink}" target="_blank">${avatar}</a>`;
    }

    // This function fetches data stored in a JSON file and displays it in a dialog box.
    function showCredits() {
        fetch("static/credits/list.json").then(response => response.json()).then((data) => {
            var contributors = data.contributors;
            contributors = randomShuffle(contributors);
            var creditsHtmlContent = `<p>in no specific order</p>`;
            creditsHtmlContent += `<ul class="mdui-list">`;
            for (let i = 0; i < contributors.length; i++) {
                var current = contributors[i];
                let renderedName = current.username;
                if (current.name != undefined) {
                    renderedName += " (" + current.name + ")";
                }
                var socialMediaIcons = bilibiliIcon('#999999');
                var socialLink = "";
                $.each(current.socialmedia, (key, value) => {
                    switch (key) {
                        case "bilibili":
                            let uid = value.uid;
                            let username = value.username;
                            socialMediaIcons = `<a href="https://space.bilibili.com/${uid}" title="${username}" target="_blank">`;
                            socialMediaIcons += bilibiliIcon('#00aeec');
                            socialMediaIcons += `</a>`;
                            break;

                        case "github":
                            socialLink = "https://github.com/" + value;
                            break;

                        case "twitter":
                            socialLink = "https://twitter.com/" + value;
                            break;
                    }
                });
                creditsHtmlContent += `<div class="mdui-collapse">
    <div class="mdui-collapse-item">
        <div class="mdui-collapse-item-header">
            <li class="mdui-list-item mdui-ripple">
                <div class="mdui-list-item-avatar mdlist-ava-fix">
                    ${addAvatar(socialLink, current.icon)}
                </div>
                <div class="mdui-list-item-content">
                    <div class="mdui-list-item-title">${renderedName}</div>
                    <div class="mdui-list-item-text mdui-list-item-one-line">
                        <span class="mdui-text-color-theme-text">${getLocalText("CREDITS:" + current.thing)}</span>
                    </div>
                </div>
                ${socialMediaIcons}
            </li>
        </div>
    </div>
</div>`;
            }
            creditsHtmlContent += `</ul>`;

            mdui.dialog({
                title: getLocalText("dialogs-credits-title"),
                content: creditsHtmlContent,
                buttons: [
                    {
                        text: getLocalText("dialogs-close")
                    }
                ],
                history: false
            });
        });
    }

    $("#show-credits-opt").on("click", () => showCredits())

    function showOptions() {
        mdui.dialog({
            title: 'Options',
            content: `<div style="min-height: 350px;" class="mdui-typo">
    <label id="options-txt-lang">Page Language</label>
    <select id="language-selector" class="mdui-select" mdui-select='{"position": "bottom"}'>
        <option value="en">English</option>
        <option value="cn">中文</option>
        <option value="ja">日本語</option>
        <option value="kr">한국어</option>
        <option value="id">Bahasa Indonesia</option>
        <option value="pt">Português-BR</option>
    </select>
    <br />
    <label id="options-txt-vo-lang">Voice-Over Language</label>
    <select id="vo-language-selector" class="mdui-select" mdui-select='{"position": "bottom"}'>
        <option value="ja">日本語</option>
        <option value="cn">中文</option>
        <option value="en">English</option>
        <option value="kr">한국어</option>
    </select>
</div>`,
            buttons: [
                {
                    text: getLocalText("dialogs-close")
                }
            ],
            history: false,
            onOpen: (_inst) => {
                $("#vo-language-selector").val(current_vo_language);
                $("#language-selector").val(current_language);

                $("#language-selector").on("change", (ev) => {
                    current_language = ev.target.value;
                    localStorage.setItem("lang", ev.target.value);
                    multiLangMutation();
                });

                $("#vo-language-selector").on("change", (ev) => {
                    current_vo_language = ev.target.value;
                    localStorage.setItem("volang", ev.target.value);
                });

                multiLangMutation();
                mdui.mutation();
            }
        });
    }

    $("#show-options-opt").on("click", () => showOptions())
})(); 
