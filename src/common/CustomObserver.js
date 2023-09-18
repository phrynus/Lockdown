class CustomObserver {
    constructor(t, e) {
        (this.elements = t),
            (this.callback = e),
            (this.observer = new MutationObserver(this.handleMutation.bind(this))),
            this.observeElements();
    }
    observeElements() {
        this.elements.forEach((t) => {
            this.observer.observe(t, { attributes: !0, childList: !0, subtree: !0 });
        });
    }
    handleMutation(t) {
        for (let e of t)
            ("childList" === e.type || ("attributes" === e.type && e.attributeName === this.innerText)) &&
                ("attributes" === e.type
                    ? this.callback(e.target.getAttribute(this.innerText))
                    : this.callback(e.target));
    }
    disconnect() {
        this.observer.disconnect();
    }
}
function