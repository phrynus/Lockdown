/**
 * 创建一个 ContentChangeMonitor 实例来监控 DOM 元素的变化。
 * @param {HTMLElement} ulElement - 要监控的父级 DOM 元素。
 * @param {string} childSelector - 填写要监控元素的父元素，为空都监控。
 * @param {function} callback - 变化发生时的回调函数。
 */
class ContentChangeMonitor {
    constructor(ulElement = null, childSelector = "", callback = {}) {
        this.ulElement = ulElement;
        this.callback = callback;
        this.childSelector = childSelector;

        this.observer = new MutationObserver(this.handleMutation.bind(this));
        const config = { childList: true, characterData: true, subtree: true };
        this.observer.observe(this.ulElement, config);
    }

    handleMutation(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList" || mutation.type === "characterData") {
                // 获取变化的 <span> 元素
                const changedSpan = mutation.target.nodeName;
                // this.callback(mutation.target)
                if (changedSpan == this.childSelector && this.childSelector == "") {
                    this.callback(mutation.target);
                }
            }
        }
    }

    stopMonitoring() {
        // 停止监听
        this.observer.disconnect();
    }
}

// // 用法示例
// //
// const monitor = new ContentChangeMonitor(document.querySelector("UL"), "UL", (changedContent) => {
//     console.log("内容发生变化:", changedContent);

//     // 在这里执行你的自定义操作
// });

// // 停止监听（如果需要）
// // monitor.stopMonitoring();
