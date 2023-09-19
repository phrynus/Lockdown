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
        // let elapsedSeconds = 0;
        function checkDOMLengthAndInitialize(e) {
            const elements = document.querySelectorAll("tbody>tr"); // 替换为您的选择器
            if (elements.length >= 1) {
                clearInterval(timerId); // 停止定时器
                console.log(
                    `%c Lockdown - Grid %c 0.1.2 `,
                    "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
                    "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
                );
                _this.initializeDate(_.drop(document.querySelectorAll("tbody>tr")));
            }
        }
        timerId = setInterval(checkDOMLengthAndInitialize, 500);
    };
    // 数据初始化
    initializeDate = (elements) => {
        let _this = this;
        Object.keys(elements).forEach((i) => {
            let grid = {
                id: null,
                // 止损
                loss: -3,
                lossWitch: true,
                // 止盈
                profit: 20,
                profitWitch: true,
                // 回撤点位
                profitLoss: 2,
                profitLossWitch: true,
                // 开始追踪回撤
                profitLossGo: false,
                // 开始追踪回撤值
                profitLossGoValue: 4,
                // 最高值
                profitLossTopValue: 0,
                // 历史点位
                historicalPoints: [],
                // json数据记录
                json: ""
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
                            .querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[7]
                            .querySelectorAll("span")[0].innerText,
                        document
                            .querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[7]
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
    // 初始化数据监听
    initializeMonitoring = () => {
        let _this = this;
        Object.keys(_this.gridDom).forEach((i) => {
            let previousData = _this.gridDom[i].totalProfit[1];
            let intervalId = null;
            intervalId = setInterval(() => {
                if (`${previousData}` != `${_this.gridDom[i].totalProfit[1]}`) {
                    let grid = _this.gridDom[i];
                    if (grid.historicalPoints.length > 99) grid.historicalPoints.pop();
                    let now = _.now();
                    grid.historicalPoints.push({
                        time: now,
                        usdt: grid.totalProfit[0],
                        state: grid.totalProfit[1]
                    });
                    grid.historicalPoints.sort((a, b) => b.time - a.time);
                    let json = JSON.stringify({
                        ID: grid.id,
                        开始时间: grid.time,
                        合约: grid.symbol,
                        方向: grid.direction,
                        总收益: grid.totalProfit,
                        已匹配利润: grid.matchedProfit,
                        未匹配利润: grid.unmatchedProfit,
                        配对次数: grid.totalMatchedTrades,
                        历史收益: grid.historicalPoints
                    });
                    grid.json = json;
                    console.log(
                        `ID：${grid.id} 收益发生变化 ${_this.percentStringToDecimal(
                            previousData
                        )} > ${_this.percentStringToDecimal(grid.totalProfit[1])}`
                    );
                    // console.log(`JSON：${grid.json}`);
                    previousData = `${grid.totalProfit[1]}`;
                    _this.decisionMaking(grid);
                }
            }, 200);
        });
    };
    // 数据判断、
    decisionMaking = (grid) => {
        let _this = this;
        let value = _this.percentStringToDecimal(grid.totalProfit[1]);
        if (value > 0) {
            if (grid.profit <= value && grid.profitWitch) {
                console.log(
                    `%c Lockdown - Grid %c 止盈: ${value}% : ${grid.totalProfit[0]} `,
                    "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
                    "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
                );
                _this.stoporderForm(grid.id, grid.json);
            } else if ((value >= grid.profitLossGoValue && grid.profitLossWitch) || grid.profitLossGo) {
                grid.profitLossGo = true;
                grid.profitLossTopValue = grid.profitLossTopValue =
                    0 || grid.profitLossTopValue < value ? value : grid.profitLossTopValue;
                console.log(
                    `ID：${grid.id} 正在追踪, 最高值: ${grid.profitLossTopValue} , 目前值: ${value} , 差值: ${
                        grid.profitLossTopValue - value
                    }`
                );
                if (grid.profitLossTopValue - value >= grid.profitLoss) {
                    console.log(
                        `%c Lockdown - Grid %c 追踪止盈: ${value}% : ${grid.totalProfit[0]} `,
                        "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
                        "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
                    );
                    _this.stoporderForm(grid.id, grid.json);
                }
            }
        } else {
            if (grid.loss >= value && grid.lossWitch) {
                console.log(
                    `%c Lockdown - Grid %c 止损: ${value}% : ${grid.totalProfit[0]}`,
                    "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
                    "background: #eb4d4b; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
                );
                _this.stoporderForm(grid.id, grid.json);
            }
        }
    };
    // stoporderForm
    stoporderForm = (id, json) => {
        document.querySelector(`tbody>tr[data-row-key="${id}"]`).querySelector(".action-btn div").click();
        let e = document.querySelectorAll(".terminate-button-group button")[1];
        setTimeout(() => {
            if (e) {
                e.click();
                localStorage.setItem(id, json);
                window.location.reload();
            } else {
                _this.stoporderForm(id);
            }
        }, 200);
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
    //
    percentStringToDecimal = (percentString) => {
        // 去掉百分号并转换为浮点数
        let decimal = parseFloat(percentString.replace("%", ""));
        // 修正类型
        decimal *= 1;
        return decimal;
    };
}
new gridMain();
