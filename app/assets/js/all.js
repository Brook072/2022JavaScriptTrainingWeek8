//index js below
const apiCustomerUrl = 'https://livejs-api.hexschool.io/api/livejs/v1/customer/brook072'
const goodsListNode = document.querySelector('#goodsList')
const cartsListNode = document.querySelector('#cartsList')
const noGoodsTextNode = document.querySelector('#noGoodsText')
const listWrapperNode = document.querySelector('#listWrapper')
const goodsCategoryNode = document.querySelector('#goodsCategory')
const orderFormNode = document.forms['orderForm']
const formWarningNode = document.querySelectorAll('#formWarning')
let goodsList,showedList,cartsList = [];
let totalPrice = 0;

if(goodsCategoryNode){
    goodsCategoryNode.addEventListener('change',()=>{
        goodsListFilter();
    })
} 

function getGoodsList(){
  axios(
    {
      method: 'get',
      url: `${apiCustomerUrl}/products`
    }
  ).then((res)=>{
    goodsList = res.data.products
    goodsListRender();
  })
}

function getCartList(){
  axios(
    {
      method: 'get',
      url: `${apiCustomerUrl}/carts`
    }
  ).then((res)=>{
    cartsList = res.data.carts
    totalPrice = res.data.finalTotal
    cartsListRender();
  })
}

function goodsListFilter(){
  let category = goodsCategoryNode.value;
  showedList = goodsList.filter((item)=>{
    if(item.category == category) return true;
    else return false
  })
  goodsListRender();
}

function goodsListRender(){
  if(goodsListNode.innerHTML != '') goodsListNode.innerHTML = ''
  if(goodsCategoryNode.value == '') showedList = goodsList;
  showedList.forEach((item, index)=>{
    goodsListNode.innerHTML += `
    <div class="relative w-1/4 px-2">
      <span class="absolute bg-black text-white text-xl top-3 -right-1 py-2 px-6">新品</span>
      <div class="bg-cover bg-no-repeat bg-center w-full h-75.5" id='goods${index}'></div>
      <span class="block bg-black text-white text-xl text-center py-3 cursor-pointer hover:bg-dark-purple" onclick="addToCarts('${item.id}')">加入購物車</span>
      <div>
          <p class="text-xl mb-2">${item.title}</p>
          <p class="text-xl line-through">NT$${item.origin_price}</p>
          <p class="text-2xl">NT$${item.price}</p>
      </div>
    </div>
    `
    document.querySelector(`#goods${index}`).style.backgroundImage = `url('${item.images}')`
  })
}

function cartsListRender(){
  if(cartsList.length == 0){
    noGoodsTextNode.className = "pt-8 text-7 text-center"
    listWrapperNode.className = "hidden"
  }else{
    noGoodsTextNode.className = "pt-8 text-7 text-center hidden"
    listWrapperNode.className =  "block"
  }
  if(cartsListNode.innerHTML != '') cartsListNode.innerHTML = '';
  cartsList.forEach((item, index)=>{
    cartsListNode.innerHTML += `
    <div class="w-full flex items-center border-b border-grey py-5">
      <div class="w-30% flex items-center">
          <div class="bg-goods-1 bg-cover bg-no-repeat bg-center w-20 h-20 mr-4" id='cartsItem${index}'></div>
          <p class="w-40 text-xl">${item.product.title}</p>
      </div>
      <p class="w-1/5 text-xl">NT$${item.product.origin_price}</p>
      <p class="w-1/5 text-xl">1</p>
      <p class="w-1/5 text-xl">NT$${item.product.price}</p>
      <div class="w-auto flex items-center justify-center">
          <span class="mdi mdi-close text-xl cursor-pointer" onclick="deleteFromCarts('${item.id}')"></span>
      </div>
    </div>
    `
    document.querySelector(`#cartsItem${index}`).style.backgroundImage = `url('${item.product.images}')`
    document.querySelector('#totalPrice').innerHTML = `NT$${totalPrice}`
  })
}

function addToCarts(goodsID){
  axios(
    {
      method: 'post',
      url: `${apiCustomerUrl}/carts`,
      data:{
        'data': {
          "productId": `${goodsID}`,
          "quantity": 1
        }
      }
    }
  ).then((res)=>{
    cartsList = res.data.carts
    totalPrice = res.data.finalTotal
    cartsListRender();
  })
}

function deleteFromCarts(goodsID){
  if(goodsID == undefined){
    axios(
      {
        method: 'delete',
        url: `${apiCustomerUrl}/carts`
      }
    ).then((res)=>{
      alert(res.data.message);
      cartsList = res.data.carts
      cartsListRender();
    })
  }else{
    axios(
      {
        method: 'delete',
        url: `${apiCustomerUrl}/carts/${goodsID}`
      }
    ).then((res)=>{
      cartsList = res.data.carts
      totalPrice = res.data.finalTotal
      cartsListRender();
    })
  }
}

function formValidation(){
  let count = 0
  for( let i = 0; i< orderFormNode.length; i += 1){
    if(orderFormNode[i].value == '' && orderFormNode[i].nodeName == 'SELECT'){
      formWarningNode[i].innerHTML = `請選擇${orderFormNode[i].labels[0].innerHTML}!`
    }else if(orderFormNode[i].value == '' && orderFormNode[i].nodeName == 'INPUT'){
      formWarningNode[i].innerHTML = `請輸入${orderFormNode[i].labels[0].innerHTML}!`
    }else{
      count += 1;
    }
  }
  if(count == orderFormNode.length && cartsList.length != 0){
    orderSubmit();
  }else if(count == orderFormNode.length && cartsList.length == 0){
    alert('購物車沒有商品！')
    return;
  }
}

function orderSubmit(){
    if(confirm('您確認要送出訂單?')){
        axios(
            {
            method: 'post',
            url: `${apiCustomerUrl}/orders`,
            data:{
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
      }).then((res)=>{
        if(res.status == 200) alert('你的訂單已成功送出！')
        orderFormNode.reset();
        getCartList();
      })
    }else{
        return;
    }
}


//backstage js below

const apiAdminUrl = 'https://livejs-api.hexschool.io/api/livejs/v1/admin/brook072'
const orderListNode = document.querySelector('#orderList')
const orderListWrapperNode = document.querySelector('#orderListWrapper')
const noOrderTextNode = document.querySelector('#noOrderText')
const token = 'YC5Aa0MQzNeSGSpcjUuVVk2QMWs1'
let soldNum = {}
let orderList,orderProductsList, soldNumData = []

function getOrderList(){
    axios(
        {
        method: 'get',
        url: `${apiAdminUrl}/orders`,
        headers:{
            authorization: token,
        }
    }).then((res)=>{
        orderList = res.data.orders
        console.log(orderList)
        orderListRender();
        orderAnalysisChartRender();
    })
}

function orderListRender(){
    if(orderList.length == 0){
        noOrderTextNode.className = "text-4xl text-center"
        orderListWrapperNode.className = "hidden"
      }else{
        noOrderTextNode.className = "hidden text-4xl text-center"
        orderListWrapperNode.className =  "block"
      }
    if(orderListNode.innerHTML != '') orderListNode.innerHTML = ''
    orderListNode.innerHTML += `
        <thead>
            <tr>
                <th class="border border-black">訂單編號</th>
                <th class="border border-black">聯絡人</th>
                <th class="border border-black">聯絡地址</th>
                <th class="border border-black">電子郵件</th>
                <th class="border border-black">訂單品項</th>
                <th class="border border-black">訂單日期</th>
                <th class="border border-black">訂單狀態</th>
                <th class="border border-black">操作</th>
            </tr>
        </thead>
    `
    orderList.forEach((item, index)=>{
        let orderDate = new Date(item.createdAt)
        let orderProduct = ''
        let count = 0
        item.products.forEach((product)=>{
          orderProduct = orderProduct + product.title
          if(count != item.products.length)orderProduct = orderProduct + '</br>'
          count ++ 
        })
        orderListNode.innerHTML += `
        <tr>
            <td class="border border-black text-center">10088377474</td>
            <td class="border border-black text-center">
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td class="border border-black text-center">
            <td class="border border-black text-center">${item.user.address}</td>
            <td class="border border-black text-center">${item.user.email}</td>
            <td class="border border-black text-center">
                <p>${orderProduct}</p>
            </td>
            <td class="border border-black text-center">${orderDate.getFullYear()}/${orderDate.getMonth()+1}/${orderDate.getDate()}</td>
            <td class="border border-black text-center">
                <a class='cursor-pointer' onclick=putPaidStatus('${item.id}',${!item.paid}) >${item.paid ? '已處理' : '未處理' }</a>
            </td>
            <td class="border border-black text-center">
                <input type="button" class="bg-dark-red text-white px-3 py-0.75 mx-auto" value='刪除' onclick=deleteOrder('${item.id}')>
            </td>
        </tr>
        `
    })
}

function deleteOrder(orderID){
    if(orderID == undefined){
        axios(
            {
            method: 'delete',
            url: `${apiAdminUrl}/orders`,
            headers:{
                authorization: token,
            }
            }
        ).then((res)=>{
            orderList = res.data.orders;
            orderListRender();
            orderAnalysisChartRender();
        })
    }else{
        axios(
            {
            method: 'delete',
            url: `${apiAdminUrl}/orders/${orderID}`,
            headers:{
                authorization: token,
            }
            }
        ).then((res)=>{
            orderList = res.data.orders;
            orderListRender();
            orderAnalysisChartRender();
        })
    }
}

function orderAnalysisChartRender(){
    soldNum = {}
    soldNumData = []
    orderList.forEach((item)=>{
        item.products.forEach((product)=>{
            soldNum[product.title] =  !soldNum[product.title] ? product.quantity : (soldNum[product.title]+product.quantity)
        })
    })
    Object.keys(soldNum).forEach((item)=>{
        soldNumData.push([item, soldNum[item]])
    })
    soldNumData.sort((a,b)=>{
        return b[1]-a[1]
    })
    if(soldNumData.length > 3){
        for(let i = 3; i< soldNumData.length; i+=1){
            if( i == 3 ) soldNumData[i][0] = '其他'
            soldNumData[3][1] =  soldNumData[3][1] + soldNumData[i][1]
        }
        soldNumData = soldNumData.slice(0, 4)
    }
    c3.generate({
        bindto: '#allItemSellRatio',
        data: {
          columns: soldNumData,
          type : 'pie',
        },
        size:{
            height: 404
        }
    })
}

function putPaidStatus(orderID, paymentStatus){
    axios(
        {
        method: 'put',
        url: `${apiAdminUrl}/orders`,
        headers:{
            authorization: token,
        },
        data:{
            'data':{
                'id': orderID,
                'paid': paymentStatus
            }
        }
        }
    ).then((res)=>{
        orderList = res.data.orders;
        console.log(res)
        orderListRender();
    })
}

function init(){
    if(goodsListNode){
        getGoodsList();
        getCartList();
    }else if(orderListNode){
        getOrderList();
    }
}

init();