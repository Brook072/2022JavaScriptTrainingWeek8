"use strict";

//index js below
var apiCustomerUrl = 'https://livejs-api.hexschool.io/api/livejs/v1/customer/brook072';
var goodsListNode = document.querySelector('#goodsList');
var cartsListNode = document.querySelector('#cartsList');
var noGoodsTextNode = document.querySelector('#noGoodsText');
var listWrapperNode = document.querySelector('#listWrapper');
var goodsCategoryNode = document.querySelector('#goodsCategory');
var orderFormNode = document.forms['orderForm'];
var formWarningNode = document.querySelectorAll('#formWarning');
var goodsList,
    showedList,
    cartsList = [];
var totalPrice = 0;

if (goodsCategoryNode) {
  goodsCategoryNode.addEventListener('change', function () {
    goodsListFilter();
  });
}

function getGoodsList() {
  axios({
    method: 'get',
    url: "".concat(apiCustomerUrl, "/products")
  }).then(function (res) {
    goodsList = res.data.products;
    goodsListRender();
  });
}

function getCartList() {
  axios({
    method: 'get',
    url: "".concat(apiCustomerUrl, "/carts")
  }).then(function (res) {
    cartsList = res.data.carts;
    totalPrice = res.data.finalTotal;
    cartsListRender();
  });
}

function goodsListFilter() {
  var category = goodsCategoryNode.value;
  showedList = goodsList.filter(function (item) {
    if (item.category == category) return true;else return false;
  });
  goodsListRender();
}

function goodsListRender() {
  if (goodsListNode.innerHTML != '') goodsListNode.innerHTML = '';
  if (goodsCategoryNode.value == '') showedList = goodsList;
  showedList.forEach(function (item, index) {
    goodsListNode.innerHTML += "\n    <div class=\"relative w-1/4 px-2\">\n      <span class=\"absolute bg-black text-white text-xl top-3 -right-1 py-2 px-6\">\u65B0\u54C1</span>\n      <div class=\"bg-cover bg-no-repeat bg-center w-full h-75.5\" id='goods".concat(index, "'></div>\n      <span class=\"block bg-black text-white text-xl text-center py-3 cursor-pointer hover:bg-dark-purple\" onclick=\"addToCarts('").concat(item.id, "')\">\u52A0\u5165\u8CFC\u7269\u8ECA</span>\n      <div>\n          <p class=\"text-xl mb-2\">").concat(item.title, "</p>\n          <p class=\"text-xl line-through\">NT$").concat(item.origin_price, "</p>\n          <p class=\"text-2xl\">NT$").concat(item.price, "</p>\n      </div>\n    </div>\n    ");
    document.querySelector("#goods".concat(index)).style.backgroundImage = "url('".concat(item.images, "')");
  });
}

function cartsListRender() {
  if (cartsList.length == 0) {
    noGoodsTextNode.className = "pt-8 text-7 text-center";
    listWrapperNode.className = "hidden";
  } else {
    noGoodsTextNode.className = "pt-8 text-7 text-center hidden";
    listWrapperNode.className = "block";
  }

  if (cartsListNode.innerHTML != '') cartsListNode.innerHTML = '';
  cartsList.forEach(function (item, index) {
    cartsListNode.innerHTML += "\n    <div class=\"w-full flex items-center border-b border-grey py-5\">\n      <div class=\"w-30% flex items-center\">\n          <div class=\"bg-goods-1 bg-cover bg-no-repeat bg-center w-20 h-20 mr-4\" id='cartsItem".concat(index, "'></div>\n          <p class=\"w-40 text-xl\">").concat(item.product.title, "</p>\n      </div>\n      <p class=\"w-1/5 text-xl\">NT$").concat(item.product.origin_price, "</p>\n      <p class=\"w-1/5 text-xl\">1</p>\n      <p class=\"w-1/5 text-xl\">NT$").concat(item.product.price, "</p>\n      <div class=\"w-auto flex items-center justify-center\">\n          <span class=\"mdi mdi-close text-xl cursor-pointer\" onclick=\"deleteFromCarts('").concat(item.id, "')\"></span>\n      </div>\n    </div>\n    ");
    document.querySelector("#cartsItem".concat(index)).style.backgroundImage = "url('".concat(item.product.images, "')");
    document.querySelector('#totalPrice').innerHTML = "NT$".concat(totalPrice);
  });
}

function addToCarts(goodsID) {
  axios({
    method: 'post',
    url: "".concat(apiCustomerUrl, "/carts"),
    data: {
      'data': {
        "productId": "".concat(goodsID),
        "quantity": 1
      }
    }
  }).then(function (res) {
    cartsList = res.data.carts;
    totalPrice = res.data.finalTotal;
    cartsListRender();
  });
}

function deleteFromCarts(goodsID) {
  if (goodsID == undefined) {
    axios({
      method: 'delete',
      url: "".concat(apiCustomerUrl, "/carts")
    }).then(function (res) {
      alert(res.data.message);
      cartsList = res.data.carts;
      cartsListRender();
    });
  } else {
    axios({
      method: 'delete',
      url: "".concat(apiCustomerUrl, "/carts/").concat(goodsID)
    }).then(function (res) {
      cartsList = res.data.carts;
      totalPrice = res.data.finalTotal;
      cartsListRender();
    });
  }
}

function formValidation() {
  var count = 0;

  for (var i = 0; i < orderFormNode.length; i += 1) {
    if (orderFormNode[i].value == '' && orderFormNode[i].nodeName == 'SELECT') {
      formWarningNode[i].innerHTML = "\u8ACB\u9078\u64C7".concat(orderFormNode[i].labels[0].innerHTML, "!");
    } else if (orderFormNode[i].value == '' && orderFormNode[i].nodeName == 'INPUT') {
      formWarningNode[i].innerHTML = "\u8ACB\u8F38\u5165".concat(orderFormNode[i].labels[0].innerHTML, "!");
    } else {
      count += 1;
    }
  }

  if (count == orderFormNode.length && cartsList.length != 0) {
    orderSubmit();
  } else if (count == orderFormNode.length && cartsList.length == 0) {
    alert('購物車沒有商品！');
    return;
  }
}

function orderSubmit() {
  if (confirm('您確認要送出訂單?')) {
    axios({
      method: 'post',
      url: "".concat(apiCustomerUrl, "/orders"),
      data: {
        "data": {
          "user": {
            "name": orderFormNode['userName'].value,
            "tel": orderFormNode['userPhone'].value,
            "email": orderFormNode['userEmail'].value,
            "address": orderFormNode['userAddress'].value,
            "payment": orderFormNode['paymentMethod'].value
          }
        }
      }
    }).then(function (res) {
      if (res.status == 200) alert('你的訂單已成功送出！');
      orderFormNode.reset();
      getCartList();
    });
  } else {
    return;
  }
} //backstage js below


var apiAdminUrl = 'https://livejs-api.hexschool.io/api/livejs/v1/admin/brook072';
var orderListNode = document.querySelector('#orderList');
var orderListWrapperNode = document.querySelector('#orderListWrapper');
var noOrderTextNode = document.querySelector('#noOrderText');
var token = 'YC5Aa0MQzNeSGSpcjUuVVk2QMWs1';
var soldNum = {};
var orderList,
    orderProductsList,
    soldNumData = [];

function getOrderList() {
  axios({
    method: 'get',
    url: "".concat(apiAdminUrl, "/orders"),
    headers: {
      authorization: token
    }
  }).then(function (res) {
    orderList = res.data.orders;
    console.log(orderList);
    orderListRender();
    orderAnalysisChartRender();
  });
}

function orderListRender() {
  if (orderList.length == 0) {
    noOrderTextNode.className = "text-4xl text-center";
    orderListWrapperNode.className = "hidden";
  } else {
    noOrderTextNode.className = "hidden text-4xl text-center";
    orderListWrapperNode.className = "block";
  }

  if (orderListNode.innerHTML != '') orderListNode.innerHTML = '';
  orderListNode.innerHTML += "\n        <thead>\n            <tr>\n                <th class=\"border border-black\">\u8A02\u55AE\u7DE8\u865F</th>\n                <th class=\"border border-black\">\u806F\u7D61\u4EBA</th>\n                <th class=\"border border-black\">\u806F\u7D61\u5730\u5740</th>\n                <th class=\"border border-black\">\u96FB\u5B50\u90F5\u4EF6</th>\n                <th class=\"border border-black\">\u8A02\u55AE\u54C1\u9805</th>\n                <th class=\"border border-black\">\u8A02\u55AE\u65E5\u671F</th>\n                <th class=\"border border-black\">\u8A02\u55AE\u72C0\u614B</th>\n                <th class=\"border border-black\">\u64CD\u4F5C</th>\n            </tr>\n        </thead>\n    ";
  orderList.forEach(function (item, index) {
    var orderDate = new Date(item.createdAt);
    var orderProduct = '';
    var count = 0;
    item.products.forEach(function (product) {
      orderProduct = orderProduct + product.title;
      if (count != item.products.length) orderProduct = orderProduct + '</br>';
      count++;
    });
    orderListNode.innerHTML += "\n        <tr>\n            <td class=\"border border-black text-center\">10088377474</td>\n            <td class=\"border border-black text-center\">\n                <p>".concat(item.user.name, "</p>\n                <p>").concat(item.user.tel, "</p>\n            </td class=\"border border-black text-center\">\n            <td class=\"border border-black text-center\">").concat(item.user.address, "</td>\n            <td class=\"border border-black text-center\">").concat(item.user.email, "</td>\n            <td class=\"border border-black text-center\">\n                <p>").concat(orderProduct, "</p>\n            </td>\n            <td class=\"border border-black text-center\">").concat(orderDate.getFullYear(), "/").concat(orderDate.getMonth() + 1, "/").concat(orderDate.getDate(), "</td>\n            <td class=\"border border-black text-center\">\n                <a class='cursor-pointer' onclick=putPaidStatus('").concat(item.id, "',").concat(!item.paid, ") >").concat(item.paid ? '已處理' : '未處理', "</a>\n            </td>\n            <td class=\"border border-black text-center\">\n                <input type=\"button\" class=\"bg-dark-red text-white px-3 py-0.75 mx-auto\" value='\u522A\u9664' onclick=deleteOrder('").concat(item.id, "')>\n            </td>\n        </tr>\n        ");
  });
}

function deleteOrder(orderID) {
  if (orderID == undefined) {
    axios({
      method: 'delete',
      url: "".concat(apiAdminUrl, "/orders"),
      headers: {
        authorization: token
      }
    }).then(function (res) {
      orderList = res.data.orders;
      orderListRender();
      orderAnalysisChartRender();
    });
  } else {
    axios({
      method: 'delete',
      url: "".concat(apiAdminUrl, "/orders/").concat(orderID),
      headers: {
        authorization: token
      }
    }).then(function (res) {
      orderList = res.data.orders;
      orderListRender();
      orderAnalysisChartRender();
    });
  }
}

function orderAnalysisChartRender() {
  soldNum = {};
  soldNumData = [];
  orderList.forEach(function (item) {
    item.products.forEach(function (product) {
      soldNum[product.title] = !soldNum[product.title] ? product.quantity : soldNum[product.title] + product.quantity;
    });
  });
  Object.keys(soldNum).forEach(function (item) {
    soldNumData.push([item, soldNum[item]]);
  });
  soldNumData.sort(function (a, b) {
    return b[1] - a[1];
  });

  if (soldNumData.length > 3) {
    for (var i = 3; i < soldNumData.length; i += 1) {
      if (i == 3) soldNumData[i][0] = '其他';
      soldNumData[3][1] = soldNumData[3][1] + soldNumData[i][1];
    }

    soldNumData = soldNumData.slice(0, 4);
  }

  c3.generate({
    bindto: '#allItemSellRatio',
    data: {
      columns: soldNumData,
      type: 'pie'
    },
    size: {
      height: 404
    }
  });
}

function putPaidStatus(orderID, paymentStatus) {
  axios({
    method: 'put',
    url: "".concat(apiAdminUrl, "/orders"),
    headers: {
      authorization: token
    },
    data: {
      'data': {
        'id': orderID,
        'paid': paymentStatus
      }
    }
  }).then(function (res) {
    orderList = res.data.orders;
    console.log(res);
    orderListRender();
  });
}

function init() {
  if (goodsListNode) {
    getGoodsList();
    getCartList();
  } else if (orderListNode) {
    getOrderList();
  }
}

init();
//# sourceMappingURL=all.js.map
