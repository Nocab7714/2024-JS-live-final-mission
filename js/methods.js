// 數字加入千分比符號：1000 → 1,000
// 方法一：使用正規表達式
function formatNumber(number) {
  let parts = number.toString().split('.'); // 分割整數和小數部分
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 格式化整數部分
  return parts.length > 1 ? parts.join('.') : parts[0]; // 拼接小數部分
}

// 方法二：使用 split 和 join 語法
// function formatNumber(number) {
//   let numberArr = number.toString().split('.'); // 分割整數和小數部分
//   let integerArray = numberArr[0].split(''); // 將整數部分轉為字元陣列
//   let result = [];

//   // 從後往前處理，插入逗號
//   let count = 0;
//   while (integerArray.length > 0) {
//     result.unshift(integerArray.pop()); // 每次從陣列尾部取出數字並加到結果前面
//     count++;
//     if (count % 3 === 0 && integerArray.length > 0) {
//       result.unshift(','); // 每三位插入逗號
//     }
//   }

//   // 合併小數部分（如果有的話）
//   return decimal[1] ? result.join('') + '.' + decimal : result.join('');
// }

// 時間格式化
function formatTime(timestamp) {
  const time = new Date(timestamp * 1000);
  const formatTime = time.toLocaleString('zh-TW', {
    hour12: false, // 使用 24 小時制
  });
  return formatTime;
}
export default { formatNumber, formatTime };
