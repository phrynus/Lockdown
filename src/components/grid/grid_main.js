// 监听延迟
const DELAY = 200;
var GRID;
var GRIDtimerId = null;
var GRIDMonitor = null;
var GRIDElength = null;
// 定时刷新
var GRIDRefreshTime = 15 * 60 * 1000; // 30分钟
var GRIDRefresh = null;
// 
function debounce(fn, wait) {
    let timeout;
    return function() {
      let that = this;
      let arg = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function(){
        timeout = null;
        fn.apply(that,arg)//使用apply改变this指向
      }, wait);
    }
  }
//
function resetTimer() {
    clearTimeout(GRIDRefresh);
    GRIDRefresh = setTimeout(function () {
        location.reload();
    }, GRIDRefreshTime);
}
class LocalStorageManager {
    // 构造函数，接受一个前缀，以防止不同应用之间的键名冲突
    constructor(prefix = "") {
        this.prefix = prefix;
    }

    // 添加对象到本地存储
    add(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serializedValue);
        } catch (error) {
            console.error("存储对象时出错：", error);
        }
    }

    // 从本地存储获取对象，如果获取失败则返回空对象
    get(key) {
        try {
            const serializedValue = localStorage.getItem(this.prefix + key);
            if (serializedValue === null) {
                return false;
            }
            return JSON.parse(serializedValue);
        } catch (error) {
            console.error("检索对象时出错：", error);
            return false;
        }
    }

    // 从本地存储中删除对象
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
        } catch (error) {
            console.error("删除对象时出错：", error);
        }
    }

    // 获取以指定前缀开头的所有数据项
    getAll() {
        const allKeys = Object.keys(localStorage);
        const matchingKeys = allKeys.filter((key) => key.startsWith(this.prefix));
        const items = {};

        for (const key of matchingKeys) {
            const item = this.get(key.replace(this.prefix, ""));
            items[key.replace(this.prefix, "")] = item;
        }

        return items == {} ? false : items;
    }
}
var Local = new LocalStorageManager("GRID__");
//
// 网格主要方法
class gridMain {
    constructor() {
        // 数据记录
        this.gridDom = [];
        //销毁
        this.destruction = false;
        // 网格初始化
        this.initializeSystem();
    }
    // 网格初始化
    initializeSystem() {
        let _this = this;
        GRIDMonitor = null;
        _this.initializeDate(_.drop(document.querySelectorAll("tbody>tr")));
    }
    // 数据初始化
    initializeDate(elements) {
        let _this = this;
        Object.keys(elements).forEach((i) => {
            let gridId = elements[i].dataset.rowKey;
            let LocalGrid = Local.get(gridId);
            // console.log(LocalGrid);
            let grid = {
                id: gridId,
                // 止损
                loss: LocalGrid ? LocalGrid.loss : -1,
                lossWitch: LocalGrid ? LocalGrid.lossWitch : true,
                // 止盈
                profit: LocalGrid ? LocalGrid.profit : 20,
                profitWitch: LocalGrid ? LocalGrid.profitWitch : false,
                // 回撤点位
                profitLoss: LocalGrid ? LocalGrid.profitLoss : 1,
                profitLossWitch: LocalGrid ? LocalGrid.profitLossWitch : true,
                // 开始追踪回撤
                profitLossGo: LocalGrid ? LocalGrid.profitLossGo : false,
                // 开始追踪回撤值
                profitLossGoValue: LocalGrid ? LocalGrid.profitLossGoValue : 3,
                // 最高值
                profitLossTopValue: LocalGrid ? LocalGrid.profitLossTopValue : 0,
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
            Local.add(grid.id, grid);
            // 开始时间
            Object.defineProperty(grid, "time", {
                get: function () {
                    let e = document.querySelector(`.bn-table tr[data-row-key="${this.id}"] .css-vurnku`);
                    if (e && !this.destruction) {
                        return e.innerText.replace(/\n/g, " ");
                    } else {
                        // 销毁
                        this.destruction = true;
                        // reset();
                        return "数据有误";
                    }
                }
            });
            // 合约
            Object.defineProperty(grid, "symbol", {
                get: function () {
                    let e = document.querySelector(`.bn-table tr[data-row-key="${this.id}"] .symbol-shrink .symbol-full-name`);
                    if (e && !this.destruction) {
                        return e.innerText;
                    } else {
                        // 销毁
                        this.destruction = true;
                        // 重置
                        // reset();
                        return "数据有误";
                    }
                }
            });
            // 方向
            Object.defineProperty(grid, "direction", {
                get: function () {
                    let e = document.querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[3];
                    if (e && !this.destruction) {
                        return e.innerText;
                    } else {
                        // 销毁
                        this.destruction = true;
                        // 重置
                        // reset();
                        return "数据有误";
                    }
                }
            });
            // 总收益
            Object.defineProperty(grid, "totalProfit", {
                get: function () {
                    let e = document.querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[5];
                    if (e && !this.destruction) {
                        return [e.querySelectorAll("span")[0].innerText, e.querySelectorAll("span")[1].innerText];
                    } else {
                        // 销毁
                        this.destruction = true;
                        // 重置
                        // reset();
                        return "数据有误";
                    }
                }
            });
            // 已匹配利润
            Object.defineProperty(grid, "matchedProfit", {
                get: function () {
                    let e = document.querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[6];

                    if (e && !this.destruction) {
                        return [e.querySelectorAll("span")[0].innerText, e.querySelectorAll("span")[1].innerText];
                    } else {
                        // 销毁
                        this.destruction = true;
                        // 重置
                        // reset();
                        return "数据有误";
                    }
                }
            });
            // 未匹配利润
            Object.defineProperty(grid, "unmatchedProfit", {
                get: function () {
                    let e = document.querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[7];

                    if (e && !this.destruction) {
                        return [e.querySelectorAll("span")[0].innerText, e.querySelectorAll("span")[1].innerText];
                    } else {
                        // 销毁
                        this.destruction = true;
                        // 重置
                        // reset();
                        return "数据有误";
                    }
                }
            });
            // 配对次数
            Object.defineProperty(grid, "totalMatchedTrades", {
                get: function () {
                    let e = document.querySelectorAll(`.bn-table tr[data-row-key="${this.id}"] td`)[8];
                    if (e && !this.destruction) {
                        return e.innerText;
                    } else {
                        // 销毁
                        this.destruction = true;
                        // 重置
                        // reset();
                        return "数据有误";
                    }
                }
            });
            _this.gridDom.push(grid);
            //
            let td = document.querySelector(`tbody>tr[data-row-key="${grid.id}"]`).querySelector("td:last-child");
            _this.addHtmlTag(
                "div",
                td,
                `
                <div class="shell">
                    <div class="tabs loss">
                        <input type="checkbox" ${grid.lossWitch ? "checked" : ""}  style="--name: '止损'" name="" id="" />
                        <input type="text" name="" id="" value="${grid.loss}" placeholder="0.00" />
                    </div>
                    <div class="tabs profit">
                        <input type="checkbox"${grid.profitWitch ? "checked" : ""} style="--name: '止盈'" name="" id="" />
                        <input type="text" name="" id="" value="${grid.profit}" placeholder="0.00" />
                    </div>
                    <div class="tabs profitLoss" style="width: 160px;">
                        <input type="checkbox" ${grid.profitLossWitch ? "checked" : ""} style="--name: '回撤'" name="" id="" />
                        <input type="text" name="" id="" value="${grid.profitLoss}" placeholder="0.00" style="width: 60px;" />
                        <input type="text" name="" id="" value="${grid.profitLossGoValue}" placeholder="0.00" style="width: 60px;" />
                    </div>
                   
                </div>
            `,
                { class: "Lockdown_grid_menu" },
                (element) => {
                    element.querySelector('.loss input[type="checkbox"]').addEventListener("change", (e) => {
                        grid.lossWitch = e.target.checked;
                        Local.add(grid.id, grid);
                        // console.log(grid);
                    });
                    element.querySelector('.loss input[type="text"]').addEventListener("input", (e) => {
                        grid.loss = parseFloat(e.target.value);
                        Local.add(grid.id, grid);
                        // console.log(grid);
                    });
                    //
                    element.querySelector('.profit input[type="checkbox"]').addEventListener("change", (e) => {
                        grid.profitWitch = e.target.checked;
                        Local.add(grid.id, grid);
                        // console.log(grid);
                    });
                    element.querySelector('.profit input[type="text"]').addEventListener("input", (e) => {
                        grid.profit = parseFloat(e.target.value);
                        Local.add(grid.id, grid);
                        // console.log(grid);
                    });
                    //
                    element.querySelector('.profitLoss input[type="checkbox"]').addEventListener("change", (e) => {
                        grid.profitLossWitch = e.target.checked;
                        Local.add(grid.id, grid);
                        // console.log(grid);
                    });
                    element.querySelectorAll('.profitLoss input[type="text"]')[0].addEventListener("input", (e) => {
                        grid.profitLoss = parseFloat(e.target.value);
                        Local.add(grid.id, grid);
                        // console.log(grid);
                    });
                    element.querySelectorAll('.profitLoss input[type="text"]')[1].addEventListener("input", (e) => {
                        grid.profitLossGoValue = parseFloat(e.target.value);
                        Local.add(grid.id, grid);
                        // console.log(grid);
                    });
                }
            );
            //
            // _this.addCustomAttributeToDescendants(elements[i], "data-row-key", grid.id);
            // 第一次判断
            _this.decisionMaking(grid);
        });
        // 
        let LocalGetAll = Local.getAll()
        
        let gridDomIDAll = [];
        Object.keys(_this.gridDom).forEach((i)=>{
            gridDomIDAll.push(_this.gridDom[i].id);
        })
        Object.keys(LocalGetAll).forEach((e)=>{
            let a = true
           
            for (let j = 0; j < gridDomIDAll.length; j++) {
                // console.log(e,gridDomIDAll[j])
                if(e == gridDomIDAll[j]){
                    a=false
                }
            }
            if(a) {
                Local.remove(e)
            }
            
        })
        // console.log(LocalGetAll,gridDomIDAll)
        
        console.log(
            `%c Lockdown - Grid %c 初始化成功 `,
            "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
            "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
        );
        GRIDMonitor = setInterval(function () {
            let e = document.querySelectorAll(".bn-table-tbody>tr");
            if (GRIDElength != e.length) {
                clearInterval(GRIDMonitor); // 停止定时器
                GRIDMonitor = null;
                console.log(
                    `%c Lockdown - Grid %c 重新加载中 `,
                    "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
                    "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
                );
                GRIDtimerId = setInterval(function () {
                    let e = document.querySelector(".bn-table-tbody>tr");
                    if (e) {
                        clearInterval(GRIDtimerId); // 停止定时器
                        GRIDtimerId = null;
                        GRIDElength = document.querySelectorAll(".bn-table-tbody>tr").length;
                        GRID = new gridMain();
                    }
                }, 1000);
            }
        }, 2000);
        // console.log(_this.gridDom);
        _this.initializeMonitoring();
    }
    // 初始化数据监听
    initializeMonitoring() {
        let _this = this;
        Object.keys(_this.gridDom).forEach((i) => {
            let previousData = _this.gridDom[i].totalProfit[1];
            let intervalId = null;
            intervalId = setInterval(() => {
                let grid = _this.gridDom[i];
                if (`${previousData}` != `${grid.totalProfit[1]}`) {
                    previousData = `${grid.totalProfit[1]}`;
                    _this.decisionMaking(grid);
                    grid = null;
                }
                if (_this.destruction) {
                    clearInterval(intervalId);
                    intervalId = null;
                    previousData = null;
                }
            }, DELAY);
        });
    }
    // 数据判断
    decisionMaking(grid) {
        let _this = this;
        if (_this.destruction) return;
        let value = parseFloat(grid.totalProfit[1].replace("%", ""));
        if (value > 0) {
            if (grid.profit <= value && grid.profitWitch) {
                _this.stoporderForm("止盈", grid);
            } else if ((value >= grid.profitLossGoValue && grid.profitLossWitch) || grid.profitLossGo) {
                grid.profitLossGo = true;
                grid.profitLossTopValue = grid.profitLossTopValue = 0 || grid.profitLossTopValue < value ? value : grid.profitLossTopValue;
                if (grid.profitLossTopValue - value >= grid.profitLoss) {
                    _this.stoporderForm("追踪止盈", grid);
                }
            }
        } else {
            if (grid.loss >= value && grid.lossWitch) {
                _this.stoporderForm("止损", grid);
            }
        }
    }
    // 结束订单
    stoporderForm(name, grid) {
        let _this = this;
        let timerId = null;
        let timerId1 = null;
        let timerId2 = null;
        _this.destruction = false;
        timerId = setInterval(function () {
            let btn = document.querySelector(`tbody>tr[data-row-key="${grid.id}"]`);
            if (btn) {
                btn.querySelector(".bn-table-cell-fix-right-first .action-btn div").click();
                timerId1 = setInterval(function () {
                    let e = document.querySelectorAll(".terminate-button-group button")[1];
                    if (e) {
                        e.click();
                        timerId2 = setInterval(function () {
                            if (!e) {
                                clearInterval(timerId2);
                                timerId2 = null;
                                GRID = null;
                            } else {
                                e.click();
                            }
                        }, 20);
                        clearInterval(timerId1);
                        timerId1 = null;
                    }
                }, 10);
                clearInterval(timerId);
                timerId = null;
            }
        }, 10);
        console.log(
            `%c Lockdown - Grid %c ${name}: ${grid.totalProfit[0]}% : ${grid.totalProfit[1]} `,
            "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
            "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
        );
    }
    // 动态添加标签
    addHtmlTag(Element, dad, html = "", set = {}, callback) {
        // 创建指定类型的HTML元素
        let create = document.createElement(Element);
        // 将HTML内容添加到元素中
        create.innerHTML = html;
        // 添加元素的属性和属性值
        for (let key in set) create.setAttribute(key, set[key]);
        // 判断父元素类型是DOM节点还是CSS选择器
        if (typeof dad == "object") {
            // 如果是DOM节点，则直接将创建的元素添加到该节点中
            dad.appendChild(create);
        } else if (typeof dad == "string") {
            // 如果是CSS选择器，则先获取匹配的第一个DOM节点，再将元素添加到该节点中
            document.querySelector(dad).appendChild(create);
        }
        // 返回创建的元素
        callback(create);
        return create;
    }
}
// 添加
// Local.add('userData', {name:"12"});
// // 获取
// Local.get('userData');
// // 删除对象
// Local.remove('userData');
// // 取全部
// Local.getAll();
//
// GRID = new gridMain();
GRIDtimerId = setInterval(function () {
    let e = document.querySelector(".bn-table-tbody>tr");
    if (e) {
        clearInterval(GRIDtimerId);
        GRIDtimerId = null;
        GRIDElength = document.querySelectorAll(".bn-table-tbody>tr").length;
        GRID = new gridMain();
        // 定时刷新
        document.addEventListener("mousemove", debounce(resetTimer,1000));
        document.addEventListener("keypress", debounce(resetTimer,1000));
        resetTimer();
    }
}, 1000);

// initializeMonitoring() {
//     let _this = this;
//     Object.keys(_this.gridDom).forEach((i) => {
//         let previousData = _this.gridDom[i].totalProfit[1];
//         let intervalId = null;
//         let grid = _this.gridDom[i];
//         intervalId = new ContentChangeMonitor(
//             document.querySelector(`tbody>tr[data-row-key="${grid.id}"]`),
//             "",
//             (changedContent) => {
//                 console.log("内容发生变化:", changedContent);
//                 if (_this.destruction) {
//                     intervalId.stopMonitoring();
//                     previousData = null;
//                 } else if (`${previousData}` != `${grid.totalProfit[1]}`) {
//                     previousData = `${grid.totalProfit[1]}`;
//                     _this.decisionMaking(grid);
//                     grid = null;
//                 }
//             }
//         );
//         console.log(intervalId);
//     });
// }
// initializeMonitoring() {
//     let _this = this;
//     Object.keys(_this.gridDom).forEach((i) => {
//         let previousData = _this.gridDom[i].totalProfit[1];
//         let intervalId = null;
//         intervalId = setInterval(() => {
//             let grid = _this.gridDom[i];
//             if (`${previousData}` != `${grid.totalProfit[1]}`) {
//                 previousData = `${grid.totalProfit[1]}`;
//                 _this.decisionMaking(grid);
//                 grid = null;
//             }
//             if (_this.destruction) {
//                 clearInterval(intervalId);
//                 intervalId = null;
//                 previousData = null;
//             }
//         }, DELAY);
//     });
// }
// =================
// GRIDMonitor = new ContentChangeMonitor(document.querySelector(".bn-table-tbody"), "TBODY", () => {
//     // console.log("内容发生变化:", changedContent);
//     console.log(
//         `%c Lockdown - Grid %c 重新加载中 `,
//         "background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;",
//         "background: #41b883; padding: 4px; border-radius: 0 3px 3px 0; color: #fff; font-weight: bold;"
//     );
//     GRIDtimerId = setInterval(function () {
//         let e = document.querySelector(".bn-table-tbody>tr");
//         if (e) {
//             clearInterval(GRIDtimerId); // 停止定时器
//             GRIDtimerId = null;
//             GRID = new gridMain();
//         }
//     }, 500);
//     // 在这里执行你的自定义操作
// });
