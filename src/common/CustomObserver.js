class CustomObserver {
    constructor(selector, callback) {
      this.elements = selector;
      this.callback = callback;
      this.observer = new MutationObserver(this.handleMutation.bind(this));
      
      this.observeElements();
    }
  
    observeElements() {
      this.elements.forEach(element => {
        this.observer.observe(element, { attributes: true, childList: true, subtree: true });
      });
    }
  
    handleMutation(mutationsList) {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || (mutation.type === 'attributes' && mutation.attributeName === this.innerText)) {
          // 处理发生变化的情况
          if (mutation.type === 'attributes') {
            // 如果是属性变化，传递新的属性值
            this.callback(mutation.target.getAttribute(this.innerText));
          } else {
            // 否则传递 innerText 值
            this.callback(mutation.target);
          }
        }
      }
    }
  
    disconnect() {
      this.observer.disconnect();
    }
  }