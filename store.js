var result;
function getProducts(data = []){
    const itemsListContainer = document.getElementById('items-list')
    var itemsList;

    data.forEach((element, index) => {
        if(element !== undefined){
            itemsList += `<div class='shop-item col-sm-4'>
            <span class='shop-item-title'>${element.name}</span>
            <img class='shop-item-image' src='${element.imageURL}'>
            <div class='shop-item-details'>
                <span class="currency">Rs </span><span class='shop-item-price'>${element.price}</span>
                <button class='btn btn-primary shop-item-button' type='button' onclick="addToCartClicked(event, ${index})">ADD TO CART</button>
            </div>
        </div>`;
        }    
    });

    itemsListContainer.innerHTML += itemsList;
}

let filtersChecked = [];
function handleClick(event){
    //console.log('handleClick: ', event.name);
    //filtersChecked = [];
    if(event.checked) filtersChecked.push(event.name);
    if(!event.checked) {
        const index = filtersChecked.indexOf(event.name);
        if(index > -1){
            filtersChecked.splice(index, 1);
        }
    }
    console.log('filtersChecked', filtersChecked);
    getFilteredRecordsBySearch(searchText ,filtersChecked);
}
function _getFiltersValues(filterValues){
    let list;
    filterValues.forEach(item => {
        list += `<label class="form-check">
        <input class="form-check-input" type="checkbox"  onclick="handleClick(this)" name="${item}" value="${item}">
        <span class="form-check-label">
            ${item}
        </span>
    </label>`;
    });
    return list;
}

function getFilters(data = []){
    const tobeFiltered = ['color', 'gender', 'price', 'type'];
    const filtersObj = {};
    let tempArr = [];
    //var parsedData = JSON.parse(data);
    data.forEach((item, index, self) => {
        if(index === tobeFiltered.length) return;
        self.forEach((val, indx) => {
            if(tobeFiltered[index] in item){
                if(!tempArr.includes(val[tobeFiltered[index]])) {
                    tempArr.push(val[tobeFiltered[index]])
                }
            }
        })
        filtersObj[tobeFiltered[index]] = tempArr;
        tempArr = [];
    })
    //console.log('filtersObj', filtersObj);
    
    const sidebarFiltersContainer = document.getElementById('filters');
    var filtersList;
    
    for(key in filtersObj){
        //console.log('for in: ', key, filtersObj[key]);
        filtersList += `
        <div class="card">
            <article class="card-group-item">
                <header class="card-header">
                    <h6 class="title">${key}</h6>
                </header>
                <div class="filter-content">
                    <div class="card-body">
                        <form>
                            ${_getFiltersValues(filtersObj[key])}
                        </form>
                    </div>
                </div>
	        </article>
        </div>`;
    }
    //console.log('filtersList: ', filtersList);
    sidebarFiltersContainer.innerHTML += filtersList;
}

function getRecords(searchText = ''){
    fetch(' https://geektrust.s3.ap-southeast-1.amazonaws.com/coding-problems/shopping-cart/catalogue.json').then(r=>r.json()).then(data => 
    {
        console.log('old data: ', data);
        const filterUndefinedData = data.filter(item => item !== undefined);
        //console.log('test: ', typeof filterUndefinedData, filterUndefinedData.length);
        // data = JSON.parse(data);
        result = [...data];
        /* to get products */
        getProducts([...data]);
        /** to get filters */
        getFilters([...data]);
    });
}

function getLoaders(){
    let loader = document.createElement('div');
    loader.innerHTML = `<div class="spinner-border" id="loading" role="status">
    <span class="sr-only">Loading...</span>
    </div>`;
    document.getElementById('body').appendChild(loader);
}

window.onload = () => {
    getLoaders();
    getRecords('');
    /** for removing loading icon once DOM is created */
    var element = document.getElementById("loading");
    element.parentNode.removeChild(element);
    /**End for removing loading icon once DOM is created */
    //getFilters('');
};

function checkSidebarFilteredProducts(val, item){
        return val.toLowerCase() === (item.color.toLowerCase()
         || item.type.toLowerCase() 
         || item.gender.toLowerCase() 
         || item.price.toLowerCase())
}

let oldSearch;
let searchFilterResult;
let searchFilterResultCache;
function getFilteredRecordsBySearch(text = '', filtersChecked = []){
    
    //console.log('getFilteredRecordsBySearch', result);
    if(text && text !== oldSearch){
        searchFilterResult = (searchFilterResult || result).filter(item => item.name.toLowerCase().includes(text.toLowerCase()));
        searchFilterResultCache = searchFilterResult;
    }
    oldSearch = text;
    if(filtersChecked.length !== 0){
        const sidebarResult = (searchFilterResultCache || result).filter((item, index) => {
            /** needs improvement in below filter */
            return filtersChecked.some(val => checkSidebarFilteredProducts(val, item))
        });
        //console.log('sidebarResult', sidebarResult);
        searchFilterResult = sidebarResult;
    }
    console.log('searchFilterResult', searchFilterResult);
    getProducts(searchFilterResult);
}

// let counter = 1;
let searchText;
const makeAPI = () => {
  searchText = document.getElementById('search').value;
  console.log("trigerring API with value: ", searchText, "and API triggered ");
  getFilteredRecordsBySearch(searchText, filtersChecked);
  //getFilters()
}

// getResults returns a function for maintaining instances
const getResults = (fn, timer) => {
  let timeOutFunction;
  return () => {
    // we clear current settimeout if new interval initiated
    clearTimeout(timeOutFunction);
    // setTimeout only triggers if timeinterval is greater than 300 ms
    timeOutFunction = setTimeout(() => {
      fn();
    }, timer);
  }
}

// passing 2 params., API callign function & timer for settimeout
const searchStore = getResults(makeAPI, 300);

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

function purchaseClicked() {
    alert('Thank you for your purchase')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    while (cartItems.hasChildNodes()) {
        cartItems.removeChild(cartItems.firstChild)
    }
    updateCartTotal()
}

function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal()
}

function addToCartClicked(event, index) {
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    addItemToCart(title, price, imageSrc, index)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc, index) {
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart')
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1" max="${result[index].quantity}">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}

function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}