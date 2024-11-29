console.clear();
import config from './config.js';
import methods from './methods.js';
const { baseUrl, apiPath, customerApi, Toast } = config;
const { formatNumber } = methods;

let productData = []; // 存放全部產品資料
let cartData = []; // 存放購物車資料
let finalTotalPrice = 0;

// 取得全部產品資料
function getProducts() {
  axios
    .get(`${customerApi}/products`)
    .then((res) => {
      productData = res.data.products;
      renderProduct(productData);
    })
    .catch((err) => {
      console.log(err.message);
    });
}

// 產品列表渲染
const productList = document.querySelector('.productWrap');
function renderProduct(data) {
  productList.innerHTML = data
    .map(
      (product) =>
        `<li class="productCard">
    <h4 class="productType">新品</h4>
      <img
        src="${product.images}"
        alt="${product.title}"
      />
      <a href="#" class="addCardBtn" data-id="${product.id}">加入購物車</a>
      <h3>${product.title}</h3>
      <del class="originPrice">NT$${formatNumber(product.origin_price)}</del>
      <p class="nowPrice">NT$${formatNumber(product.price)}</p>
  </li>`
    )
    .join(' ');
}

// 產品篩選
const productSelect = document.querySelector('.productSelect');
function productFilter(value) {
  const result = [];
  productData.forEach((product) => {
    if (product.category === value) {
      result.push(product);
    }
  });
  renderProduct(result);
}

productSelect.addEventListener('change', (event) => {
  event.target.value === '全部'
    ? renderProduct(productData)
    : productFilter(productSelect.value);
});

// 取得購物車資料
function getCart() {
  axios
    .get(`${customerApi}/carts`)
    .then((res) => {
      cartData = res.data.carts;
      finalTotalPrice = res.data.finalTotal;
      renderCart();
    })
    .catch((err) => {
      console.log(err.message);
    });
}

// 渲染購物車資料
const shoppingCartTableBody = document.querySelector(
  '.shoppingCart-table tbody'
);
const cartTotal = document.querySelector('.cartTotal');
const shoppingCartTableFooter = document.querySelector(
  '.shoppingCart-table tfoot'
);
function renderCart() {
  if (cartData.length === 0) {
    shoppingCartTableBody.innerHTML = `<tr><td colspan="5">您的購物車中沒有任何產品喔！</td></tr>`;
    shoppingCartTableFooter.classList.add('hidden');
    return;
  }
  shoppingCartTableBody.innerHTML = cartData
    .map(
      (item) => `<tr data-id="${item.id}">
          <td>
            <div class="cardItem-title">
              <img src="${item.product.images}" alt="" />
              <p>${item.product.title}</p>
            </div>
          </td>
          <td>NT$${formatNumber(item.product.price)}</td>
          <td><button type="button" class="minusBtn">-</button>${
            item.quantity
          }<button type="button" class="addBtn">+</button></td>
          <td>${formatNumber(item.product.price * item.quantity)}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons"> clear </a>
          </td>
        </tr>`
    )
    .join(' ');

  cartTotal.innerHTML = `NT$${formatNumber(finalTotalPrice)}`;
  shoppingCartTableFooter.classList.remove('hidden');
}

// 加入購物車
function addCard(id, btnTarget) {
  // 檢查購物車是否已經有這個商品
  // 如果商品已存在，數量就要加 1
  const existingItem = cartData.find((item) => item.product.id === id);
  const quantity = existingItem ? existingItem.quantity + 1 : 1;

  const data = {
    data: {
      productId: id,
      quantity: quantity,
    },
  };
  axios
    .post(`${customerApi}/carts`, data)
    .then((res) => {
      Toast.fire({
        icon: 'success',
        title: '成功加入購物車！',
      });
      getCart();
      btnTarget.classList.remove('disabled');
    })
    .catch((err) => {
      Toast.fire({
        icon: 'error',
        title: '加入購物車失敗!',
      });
      btnTarget.classList.remove('disabled');
    });
}

// 綁定監聽傳入產品 id ，將選定產品加入購物車
productList.addEventListener('click', (event) => {
  event.preventDefault();
  if (event.target.matches('.addCardBtn')) {
    addCard(event.target.dataset.id, event.target);
    event.target.classList.add('disabled');
  }
});

// 刪除所有購物車項目
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', (event) => {
  event.preventDefault();
  deleteAllCart();
});

function deleteAllCart() {
  discardAllBtn.classList.add('disabled');
  Swal.fire({
    title: '清空購物車',
    text: '你確定要清空購物車內的所有產品嗎?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定',
    cancelButtonText: '取消',
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${customerApi}/carts`)
        .then((res) => {
          Toast.fire({
            icon: 'success',
            title: `${res.data.message}`,
          });
          getCart();
          // 設定 setTimeout 1.5 秒延遲，避免畫面未成功渲染就移除 disabled
          setTimeout(() => {
            discardAllBtn.classList.remove('disabled');
          }, 1500);
        })
        .catch((err) => {
          Toast.fire({
            icon: 'error',
            title: '清空購物車失敗!',
          });
          // 設定 setTimeout 1.5 秒延遲，避免畫面未成功渲染就移除 disabled
          setTimeout(() => {
            discardAllBtn.classList.remove('disabled');
          }, 1500);
        });
    }
  });
}

// 刪除單一購物車項目 & 更新購物車產品數量
shoppingCartTableBody.addEventListener('click', (event) => {
  event.preventDefault();
  const id = event.target.closest('tr').dataset.id;
  if (event.target.matches('.discardBtn a')) {
    event.target.classList.add('disabled');
    deleteCart(id);
  } else if (event.target.matches('.minusBtn')) {
    event.target.classList.add('disabled');
    let quantity = cartData.find((item) => item.id === id).quantity - 1;
    quantity <= 0 ? deleteCart(id) : updateCart(id, quantity, event.target);
  } else if (event.target.matches('.addBtn')) {
    event.target.classList.add('disabled');
    let quantity = cartData.find((item) => item.id === id).quantity + 1;
    updateCart(id, quantity, event.target);
  }
});
function deleteCart(id) {
  axios
    .delete(`${customerApi}/carts/${id}`)
    .then((res) => {
      Toast.fire({
        icon: 'success',
        title: '成功從購物車移除該項產品!',
      });
      getCart();
    })
    .catch((err) => {
      Toast.fire({
        icon: 'error',
        title: '從購物車移除產品失敗!',
      });
    });
}

// 更新購物車產品數量
function updateCart(id, quantity, btnTarget) {
  const data = {
    data: {
      id,
      quantity: quantity,
    },
  };
  axios
    .patch(`${customerApi}/carts/`, data)
    .then((res) => {
      Toast.fire({
        icon: 'success',
        title: '成功更新購物車內的產品數量!',
      });
      getCart();
      setTimeout(() => {
        btnTarget.classList.remove('disabled');
      }, 1500);
    })
    .catch((err) => {
      Toast.fire({
        icon: 'error',
        title: '更新購物車內的產品數量失敗!',
      });
      setTimeout(() => {
        btnTarget.classList.remove('disabled');
      }, 1500);
    });
}

// 送出訂單
function sendOrder() {
  const orderInfoBtn = document.querySelector('.orderInfo-btn');
  let data = {
    data: {
      user: {
        name: document.querySelector('#customerName').value.trim(),
        tel: document.querySelector('#customerPhone').value.trim(),
        email: document.querySelector('#customerEmail').value.trim(),
        address: document.querySelector('#customerAddress').value.trim(),
        payment: document.querySelector('#tradeWay').value,
      },
    },
  };

  if (cartData.length === 0) {
    Swal.fire({
      title: '想結帳?',
      text: '可是您的購物車內還沒有任何商品喔！',
      icon: 'question',
      confirmButtonText: '繼續逛逛',
    });
    return;
  }

  orderInfoBtn.classList.add('disabled');
  axios
    .post(`${customerApi}/orders`, data)
    .then((res) => {
      Toast.fire({
        icon: 'success',
        title: '訂單建立成功!',
      });
      orderInfoForm.reset();
      getCart();
      setTimeout(() => {
        orderInfoBtn.classList.remove('disabled');
      }, 1500);
    })
    .catch((err) => {
      Toast.fire({
        icon: 'error',
        title: '訂單建立失敗!',
      });
      setTimeout(() => {
        orderInfoBtn.classList.remove('disabled');
      }, 1500);
    });
}

// validate 驗證
// 驗證規則
const constraints = {
  姓名: {
    presence: {
      message: '為必填欄位',
    },
  },
  電話: {
    presence: {
      message: '為必填欄位',
    },
    length: {
      minimum: 8,
      message: '號碼需超 8 碼',
    },
  },
  Email: {
    presence: {
      message: '為必填欄位',
    },
    email: {
      message: '格式有誤',
    },
  },
  寄送地址: {
    presence: {
      message: '為必填欄位',
    },
  },
};
const orderInfoForm = document.querySelector('.orderInfo-form');
const inputs = document.querySelectorAll(
  'input[type=text], input[type=tel], input[type=email]'
);
const messages = document.querySelectorAll('[data-message]');

orderInfoForm.addEventListener('submit', verification);

function verification(event) {
  event.preventDefault();
  let errors = validate(orderInfoForm, constraints);
  if (errors) {
    showErrors(errors);
    Swal.fire({
      title: '您的訂單尚未送出',
      text: '請輸入必填欄位！',
      icon: 'error',
      confirmButtonText: '確認',
    });
  } else {
    sendOrder();
  }
}

function showErrors(errors) {
  messages.forEach((item) => {
    item.textContent = '';
    item.textContent = errors[item.dataset.message];
  });
}

inputs.forEach((item) => {
  item.addEventListener('change', () => {
    validateField(item);
  });
});

function validateField(item) {
  let errors = validate(orderInfoForm, constraints);
  let targetMsg = document.querySelector(`[data-message=${item.name}]`);
  if (errors) {
    targetMsg.textContent = errors[item.name];
  } else {
    targetMsg.textContent = '';
  }
}

// 初始化函式
function init() {
  getProducts();
  getCart();
}

init();

// 預設 JS，請同學不要修改此處
document.addEventListener('DOMContentLoaded', function () {
  const ele = document.querySelector('.recommendation-wall');
  ele.style.cursor = 'grab';
  let pos = { top: 0, left: 0, x: 0, y: 0 };
  const mouseDownHandler = function (e) {
    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';

    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };
  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };
  const mouseUpHandler = function () {
    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };
  // Attach the handler
  ele.addEventListener('mousedown', mouseDownHandler);
});
// menu 切換
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
