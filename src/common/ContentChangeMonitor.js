/**
 * 创建一个 ContentChangeMonitor 实例来监控 DOM 元素的变化。
 * @param {HTMLElement} ulElement - 要监控的父级 DOM 元素。
 * @param {string} childSelector - 填写要监控元素的父元素，为空都监控。
 * @param {function} callback - 变化发生时的回调函数。
 */
class ContentChangeMonitor {
    constructor(ulElement, childSelector, callback) {
        this.ulElement = ulElement;
        this.callback = callback;
        this.childSelector = childSelector;

        this.observer = new MutationObserver(function (mutationsList) {
            console.log(mutationsList);
            for (const mutation of mutationsList) {
                // if (mutation.type === "childList" || mutation.type === "characterData") {
                // 获取变化的 <span> 元素
                const changedSpan = mutation.target.nodeName;
                // this.callback(mutation.target)
                if (changedSpan == this.childSelector || this.childSelector == "") {
                    this.callback(mutation.target);
                }
                // }
            }
        });
        this.observer.observe(this.ulElement, { childList: true, characterData: true, subtree: true });
    }
    stopMonitoring() {
        // 停止监听
        this.observer.disconnect();
    }
}
