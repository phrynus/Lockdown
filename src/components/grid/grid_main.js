console.log(
    `%c Lockdown - Grid %c 0.1.2 `,
    "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
    "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
);
class gridMain {
    constructor() {
        // 数据记录
        this.gridDom = [];
        // 网格初始化
        this.initializeSystem();
    }
    // 网格初始化
    initializeSystem = () => {
        let _this = this;
        let timerId = null;
        let elapsedSeconds = 0;
        function checkDOMLengthAndInitialize(e) {
            const elements = document.querySelectorAll("tbody>tr"); // 替换为您的选择器
            if (elements.length >= 1) {
                clearInterval(timerId); // 停止定时器
                _this.initializeDate(_.drop(document.querySelectorAll("tbody>tr")));
            }
            elapsedSeconds += 0.1;
            if (elapsedSeconds >= 10) {
                clearInterval(timerId); // 如果超过10秒，停止定时器
            }
        }
        timerId = setInterval(checkDOMLengthAndInitialize, 100);
    };
    // 数据初始化
    initializeDate = (elements) => {
        let _this = this;
        Object.keys(elements).forEach((i) => {
            let grid = {
                id: null
                // time,
                // symbol,
                // direction,
                // totalProfit,
                // matchedProfit,
                // unmatchedProfit,
                // totalMatchedTrades
            };
            grid.id = elements[i].dataset.rowKey;
            // 开始时间
            Object.defineProperty(grid, "time", {
                get: function () {
                    return document
                        .querySelector(`.bn-table tr[data-row-key="${this.id}"] .css-vurnku`)
                        .innerText.replace(/\n/g, " ");
                }
            });
            // 合约
            Object.defineProperty(grid, "symbol", {
                get: function () {
                    return document.querySelector(
                        `.bn-table tr[data-row-key="${this.id}"] .symbol-shrink .symbol-full-name`
                    ).innerText;
                }
            });
            // 方向
            Object.defineProperty(grid, "direction", {
                get: function () {
                    return document.querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[3].innerText;
                }
            });
            // 总收益
            Object.defineProperty(grid, "totalProfit", {
                get: function () {
                    return [
                        document
                            .querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[5]
                            .querySelectorAll("span")[0].innerText,
                        document
                            .querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[5]
                            .querySelectorAll("span")[1].innerText
                    ];
                }
            });
            // 已匹配利润
            Object.defineProperty(grid, "matchedProfit", {
                get: function () {
                    return [
                        document
                            .querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[6]
                            .querySelectorAll("span")[0].innerText,
                        document
                            .querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[6]
                            .querySelectorAll("span")[1].innerText
                    ];
                }
            });
            // 未匹配利润
            Object.defineProperty(grid, "unmatchedProfit", {
                get: function () {
                    return [
                        document
                            .querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[6]
                            .querySelectorAll("span")[0].innerText,
                        document
                            .querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[6]
                            .querySelectorAll("span")[1].innerText
                    ];
                }
            });
            // 配对次数
            Object.defineProperty(grid, "totalMatchedTrades", {
                get: function () {
                    return document.querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[8].innerText;
                }
            });
            _this.gridDom.push(grid);
            //
            _this.addCustomAttributeToDescendants(elements[i], "data-row-key", grid.id);
        });
        // console.log(_this.gridDom);
        _this.initializeMonitoring();
    };
    // 数据监听
    initializeMonitoring = () => {
        let _this = this;
        Object.keys(_this.gridDom).forEach((i) => {
            let e = document
                .querySelectorAll(`.bn-table tr[data-row-key="${_this.gridDom[i].id}"] td`)[5]
                .querySelectorAll("span");
            //
            new CustomObserver(e, (element) => {
                let grid = _this.gridDom.find((item) => item.id == element.dataset.rowKey);
                let json = JSON.stringify({
                    ID: grid.id,
                    开始时间: grid.time,
                    合约: grid.symbol,
                    方向: grid.direction,
                    总收益: grid.totalProfit,
                    已匹配利润: grid.matchedProfit,
                    未匹配利润: grid.unmatchedProfit,
                    配对次数: grid.totalMatchedTrades
                });
                console.log(`ID：${element.dataset.rowKey} 收益发生变化\nJSON：${json}`);
            });
            //
        });
    };
    // 后代元素添加属性
    addCustomAttributeToDescendants = (element, name, data) => {
        // 检查是否有子元素
        if (element.children.length === 0) {
            // 没有子元素，不需要递归
            return;
        }
        // 遍历子元素并添加自定义属性
        for (let i = 0; i < element.children.length; i++) {
            const childElement = element.children[i];

            // 添加自定义属性 date="0" 到子元素
            childElement.setAttribute(name, data);

            // 递归调用函数，处理子元素的后代元素
            this.addCustomAttributeToDescendants(childElement, name, data);
        }
    };
}
new gridMain();
