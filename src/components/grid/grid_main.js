console.log("gridMain");
//document.querySelector('tbody>tr[data-row-key="353340677"]').querySelector('.action-btn div').click()
//_.drop(document.querySelectorAll('tbody>tr'));

class grid {
    constructor(originalDom) {
        this.gridDom = [];
        //
        this.initializeSystem(originalDom);
    }
    initializeSystem = (elements) => {
        let grid = {
            id:'',
            // 开始时间
            time:'',
            // 合约
            symbol:'',
            // 方向
            direction:'',
            // 总收益
            totalProfit:['',''],
            // 已匹配利润
            matchedProfit:['',''],
            // 未匹配利润
            unmatchedProfit:['',''],
            // 配对次数
            totalMatchedTrades:'',
        }
    };
}

const grid = new grid(_.drop(document.querySelectorAll("tbody>tr")));
