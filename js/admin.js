import config from './config.js';
import methods from './methods.js';
const { token, baseUrl, apiPath, adminApi, Toast, adminInstance } = config;
const { formatTime } = methods;
let orderData = []; // 存放訂單資料

// 取得全部訂單資料
function getOrders() {
  adminInstance
    .get('/orders')
    .then((res) => {
      orderData = res.data.orders;
      orderData.sort((a, b) => b.createdAt - a.createdAt);
      orderData.length === 0
        ? discardAllBtn.classList.add('disabled')
        : discardAllBtn.classList.remove('disabled');
      renderOrder();
      calcProductCategory();
    })
    .catch((err) => {
      console.log(err.message);
    });
}

// 渲染全部訂單資料
const orderPageTableBody = document.querySelector('.orderPage-table tbody');
function renderOrder() {
  if (orderData.length === 0) {
    orderPageTableBody.innerHTML = `<tr><td colspan="8">目前沒有任何訂單喔！</td></tr>`;
    return;
  }

  let str = '';
  orderData.forEach((order) => {
    let productStr = '';
    // 第二層 forEach 迴圈用於渲染每個訂單的產品名稱與數量
    order.products.forEach((product) => {
      productStr += `<p>${product.title} x ${product.quantity}</p>`;
    });
    str += `<tr data-id="${order.id}">
              <td>${order.id}</td>
              <td>
                <p>${order.user.name}</p>
                <p>${order.user.tel}</p>
              </td>
              <td>${order.user.address}</td>
              <td>${order.user.email}</td>
              <td>
                ${productStr}
              </td>
              <td>${formatTime(order.createdAt)}</td>
              <td class="orderStatus">
                <a href="#">${
                  order.paid
                    ? `<span style="color: green">已處理</span>`
                    : `<span style="color: red">未處理</span>`
                }
              </a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" />
              </td>
            </tr>`;
  });
  orderPageTableBody.innerHTML = str;
}

// 刪除單筆訂單
function deleteSingleOrder(id) {
  adminInstance
    .delete(`/orders/${id}`)
    .then((res) => {
      Toast.fire({
        icon: 'success',
        title: '成功刪除訂單！',
      });
      getOrders();
    })
    .catch((err) => {
      Toast.fire({
        icon: 'error',
        title: '刪除訂單失敗!',
      });
      console.log(err.message);
    });
}
orderPageTableBody.addEventListener('click', (event) => {
  event.preventDefault();
  if (event.target.matches('.delSingleOrder-Btn')) {
    Swal.fire({
      title: '刪除訂單',
      text: '你確定要該筆訂單嗎?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消',
    }).then((result) => {
      if (result.isConfirmed) {
        const id = event.target.closest('tr').dataset.id;
        event.target.classList.add('disabled');
        deleteSingleOrder(id);
      }
    });
  } else if (event.target.matches('.orderStatus a span')) {
    const id = event.target.closest('tr').dataset.id;
    updateOrderStatus(id);
  }
});

// 刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
function deleteAllOrder() {
  adminInstance
    .delete('/orders')
    .then((res) => {
      Toast.fire({
        icon: 'success',
        title: '成功刪除全部訂單！',
      });
      getOrders();
    })
    .catch((err) => {
      Toast.fire({
        icon: 'error',
        title: '刪除全部訂單失敗!',
      });
      console.log(err.message);
    });
}
discardAllBtn.addEventListener('click', (event) => {
  event.preventDefault();
  Swal.fire({
    title: '刪除全部訂單',
    text: '你確定要全部的訂單嗎? 刪除後將無法回復訂單資料!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then((result) => {
    if (result.isConfirmed) {
      deleteAllOrder();
      discardAllBtn.classList.add('disabled');
    }
  });
});

// 修改訂單狀態
function updateOrderStatus(id) {
  let result = orderData.filter((order) => order.id === id)[0].paid;
  let data = {
    data: {
      id: id,
      paid: !result,
    },
  };

  adminInstance
    .put(`/orders/`, data)
    .then((res) => {
      Toast.fire({
        icon: 'success',
        title: '成功更新訂單狀態！',
      });
      getOrders();
    })
    .catch((err) => {
      Toast.fire({
        icon: 'error',
        title: '更新訂單狀態失敗！',
      });
      console.log(err);
    });
}

// 計算全產品類別營收比重
function calcProductCategory() {
  const resultObj = {};

  orderData.forEach((order) => {
    order.products.forEach((product) => {
      if (resultObj[product.category] === undefined) {
        resultObj[product.category] = product.price * product.quantity;
      } else {
        resultObj[product.category] += product.price * product.quantity;
      }
    });
  });
  renderCart(Object.entries(resultObj));
}

// 計算全品項營收比重
function calcProductTitle() {
  const resultObj = {};

  orderData.forEach((order) => {
    order.products.forEach((product) => {
      if (resultObj[product.title] === undefined) {
        resultObj[product.title] = product.price * product.quantity;
      } else {
        resultObj[product.title] += product.price * product.quantity;
      }
    });
  });
  const resultArr = Object.entries(resultObj);
  const sortResultArr = resultArr.sort((a, b) => b[1] - a[1]);
  const rankOfThree = [];
  let otherTotal = 0;
  sortResultArr.forEach((product, index) => {
    if (index <= 2) {
      rankOfThree.push(product);
    } else if (index > 2) {
      otherTotal += product[1];
    }
  });

  if (sortResultArr.length > 3) {
    rankOfThree.push(['其他', otherTotal]);
  }

  renderCart(rankOfThree);
}

// 渲染圖表
function renderCart(data) {
  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    color: {
      pattern: ['#DACBFF', '#9D7FEA', '#5434A7', '#301E5F'],
    },
    data: {
      type: 'pie',
      columns: data,
    },
  });
}

// 切換圖表類別
function toggleChart() {
  const sectionTitle = document.querySelector('.section-title');
  if (sectionTitle.textContent === '全產品類別營收比重') {
    sectionTitle.textContent = '全品項營收比重';
    calcProductTitle();
  } else if (sectionTitle.textContent === '全品項營收比重') {
    sectionTitle.textContent = '全產品類別營收比重';
    calcProductCategory();
  }
}

const chartToggleBtn = document.querySelector('.toggleChartBtn');
chartToggleBtn.addEventListener('click', (event) => {
  event.preventDefault();
  toggleChart();
});

// 初始化
function init() {
  getOrders();
}

init();

// 預設 JS，請同學不要修改此處
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
  item.addEventListener('click', closeMenu);
});

function menuToggle() {
  if (menu.classList.contains('openMenu')) {
    menu.classList.remove('openMenu');
  } else {
    menu.classList.add('openMenu');
  }
}
function closeMenu() {
  menu.classList.remove('openMenu');
}
