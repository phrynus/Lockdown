// 加密函数

function encrypt(key, data) {
    // 将密钥与数据合并
    const combinedData = key + data;

    // 第一层加密：简单的替换字符
    let encryptedData = combinedData
        .split("")
        .map((char) => String.fromCharCode(char.charCodeAt(0) + 1))
        .join("");

    // 第二层加密：使用XOR操作
    const keyBytes = key.split("").map((char) => char.charCodeAt(0));
    encryptedData = encryptedData
        .split("")
        .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ keyBytes[index % keyBytes.length]))
        .join("");

    // 第三层加密：逆序
    encryptedData = encryptedData.split("").reverse().join("");

    // Base64编码
    const base64Encoded = btoa(encryptedData);

    return base64Encoded;
}

// 解密函数
function decrypt(key, encryptedData) {
    // Base64解码
    const decodedData = atob(encryptedData);

    // 第三层解密：恢复原序
    let decryptedData = decodedData.split("").reverse().join("");

    // 第二层解密：使用XOR操作
    const keyBytes = key.split("").map((char) => char.charCodeAt(0));
    decryptedData = decryptedData
        .split("")
        .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ keyBytes[index % keyBytes.length]))
        .join("");

    // 第一层解密：还原字符
    decryptedData = decryptedData
        .split("")
        .map((char) => String.fromCharCode(char.charCodeAt(0) - 1))
        .join("");

    // 从解密后的数据中去除密钥
    decryptedData = decryptedData.substring(key.length);

    return decryptedData;
}

const key = "67b5c4ce7ebdeecd8a074a00ac782a9055e466a7d2326f10742f0978ac8ba9bf";
const data = "4070880000000";

const encrypted = encrypt(key, data);
console.log("授权码:", encrypted);

const decrypted = decrypt(key, encrypted);
console.log("时间戳:", decrypted);

// 获取当前时间戳
const currentTime = new Date().getTime();

// 检查数据是否过期
if (currentTime > decrypted) {
    console.log("数据已过期");
}
