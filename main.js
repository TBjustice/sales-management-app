(function () {

  // Add event listener to navigation menu
  function initNavigation() {
    const mainItems = document.querySelectorAll('body>main');
    const navItems = document.querySelectorAll('nav.main-nav>div');
    for (const navItem of navItems) {
      navItem.addEventListener('click', (e) => {
        for (const navItem of navItems) {
          navItem.classList.remove('active');
        }
        const clicked = e.currentTarget;
        clicked.classList.add('active');
        const target = clicked.dataset.target;
        for (const mainItem of mainItems) {
          if (mainItem.id == target) mainItem.hidden = false;
          else mainItem.hidden = true;
        }
      })
    }
  }
  initNavigation();


  // Save / Load Data

  function saveState() {
    const text = JSON.stringify(Store.getData());
    localStorage.setItem('storeData', text);
  }
  function loadState(){
    let data = localStorage.getItem('storeData');
    if(!data || data.length == 0){
      data={
        'storeId':0,
        'stores':[{
          'name':'きらら',
          'items': [new Item('ごちうさ', 'ココ×チノ', 400),
          new Item('ぼざろ', 'ぼっち総受け', 200),
          new Item('New Game', '小悪魔青葉', 600)],
          'history': []
        }]
      }
    }
    else{
      data = JSON.parse(data);
    }
    Store.setData(data);
  }

  // Class defenitions

  class Item {
    constructor(name, detail, price) {
      this.name = name;
      this.detail = detail;
      this.price = price;
    }
  }

  class Store {
    static #storeId = -1;
    static #stores = [];
    static getData() {
      const data = {
        storeId: this.#storeId,
        stores: []
      }
      this.#stores.forEach(element => {
        data.stores.push(element.data);
      });
      return data;
    }
    static setData(data) {
      if ('storeId' in data) this.#storeId = data.storeId;
      if ('stores' in data) {
        data.stores.forEach(element => {
          this.#stores.push(new Store(element));
        });
      }
    }
    static createStore(data) {
      this.#storeId = this.#stores.length;
      this.#stores.push(new Store(data));
      saveState();
    }
    static get storeId(){
      return this.#storeId;
    }
    static set storeId(value){
      if (value < 0 || value >= this.#stores.length) return;
      this.#storeId = value;
    }
    static set name(value) {
      if (this.#storeId < 0) return;
      this.#stores[this.#storeId].name = value;
      saveState();
    }
    static get name() {
      if (this.#storeId < 0) return '';
      return this.#stores[this.#storeId].name;
    }
    static get names() {
      let names = [];
      this.#stores.forEach(store => {
        names.push(store.name);
      });
      return names;
    }
    static get items() {
      if (this.#storeId < 0) return [];
      return this.#stores[this.#storeId].items;
    }
    static get history(){
      if (this.#storeId < 0) return [];
      return this.#stores[this.#storeId].history;
    }
    static assignHistory(data){
      if (this.#storeId >= 0){
        this.#stores[this.#storeId].pushHistory(data);
        saveState();
      }
    }
    static editHistory(index, data){
      if (this.#storeId >= 0){
        this.#stores[this.#storeId].setHistory(index, data);
        saveState();
      }
    }
    static deleteHistory(index){
      if (this.#storeId >= 0){
        this.#stores[this.#storeId].eraseHistory(index);
        saveState();
      }
    }

    #name = '無題';
    #items = [];
    #history = [];
    constructor(data) {
      if ('name' in data) this.#name = data.name;
      if ('items' in data) this.#items = data.items;
      if ('history' in data) this.#history = data.history;
    }
    get data(){
      return {
        'name': this.#name,
        'items': this.#items,
        'history': this.#history
      }
    }
    get name() {
      return this.#name;
    }
    set name(value) {
      console.log(value);
      this.#name = value;
    }
    get items() {
      return this.#items;
    }
    get history() {
      return this.#history;
    }
    pushHistory(data){
      this.#history.push(data);
    }
    setHistory(index, data){
      if(index < this.#history.length){
        this.#history[index] = data;
      }
    }
    eraseHistory(index){
      if(index < this.#history.length){
        this.#history[index].splice(index, 1);
      }
    }
  }

  // Item card UI creation

  function createItemCardElement(id, name, detail, price) {
    const nameElement = document.createElement('header');
    nameElement.innerText = name;
    const detailElement = document.createElement('p');
    detailElement.classList.add('detail');
    detailElement.innerText = detail;
    const priceElement = document.createElement('div');
    priceElement.classList.add('price');
    priceElement.innerHTML = '&yen;' + price + ' &times <span class="buy-count">0</span>';
    const card = document.createElement('div');
    card.classList.add('item-card');
    card.setAttribute('data-id', id);
    card.appendChild(nameElement);
    card.appendChild(detailElement);
    card.appendChild(priceElement);
    return card;
  }

  // Home

  const Home = {
    sum: 0,
    itemCounts: [],
    itemList:null,
    okBtn:null,
    onCardClicked:function(e){
      const card = e.currentTarget;
      card.classList.add('active');
      const id = parseInt(card.dataset.id);
      const items = Store.items;
      Home.sum += items[id].price;
      Home.itemCounts[id]++;
      const sum = document.querySelector('#main-home .home-sum-money-number');
      sum.innerText = Home.sum;
      const counter = card.querySelector('span.buy-count');
      counter.innerText = '' + Home.itemCounts[id];
      Home.okBtn.classList.remove('disable');
    },
    addItemElement: function (id, name, detail, price) {
      const testItem = createItemCardElement(id, name, detail, price);
      testItem.addEventListener('click', Home.onCardClicked);
      Home.itemList.appendChild(testItem);
    },
    reset: function () {
      Home.sum = 0;
      Home.itemCounts = [];
      const sum = document.querySelector('#main-home .home-sum-money-number');
      sum.innerText = '0';
      Home.okBtn.classList.add('disable');
      Home.itemList.innerHTML = '';
      const items = Store.items;
      items.forEach((item, id) => {
        Home.itemCounts.push(0);
        Home.addItemElement(id, item.name, item.detail, item.price);
      });
    },
    init: function () {
      Home.itemList = document.querySelector('#main-home .item-list');
      Home.okBtn = document.querySelector('.home.price-check');
      Home.reset();

      document.querySelector('.home.reset-button').addEventListener('click', (e) => {
        Home.reset();
      });
      Home.okBtn.addEventListener('click', (e) => {
        if(Home.okBtn.classList.contains('disable'))return;
        Store.assignHistory({
          time: Date.now(),
          sum: Home.sum,
          detail: Home.itemCounts
        });
        Home.reset();
        History.reset();
      });
    }
  }

  const History = {
    targetId:-1,
    editor:null,
    editingInputs:[],
    onEditClicked:function(e){
      const clicked = e.currentTarget;
      History.setEditor(parseInt(clicked.dataset.id));
    },
    setEditor:function(id){
      History.targetId = id;
      History.editingInputs=[];
      const record = Store.history[id];
      const items = Store.items;
      const listElement = History.editor.querySelector('ul');
      listElement.innerHTML = '';
      items.forEach((item, i)=>{
        const num = i < record.detail.length ? record.detail[i] : 0;
        const row = document.createElement('li');
        const span1 = document.createElement('span');
        span1.innerText = item.name + '：';
        row.appendChild(span1);
        const input = document.createElement('input');
        input.setAttribute('type', 'number');
        input.setAttribute('min', 0);
        input.setAttribute('value', num);
        History.editingInputs.push(input);
        row.appendChild(input);
        const span2 = document.createElement('span');
        span2.innerText = '点';
        row.appendChild(span2);
        listElement.appendChild(row);
      });
      History.editor.classList.add('active');
    },
    addHistoryElement:function(dst, record, id){
      const items = Store.items;
      const time = new Date(record.time);
      let inputElement = document.createElement('input');
      inputElement.classList.add('history-item');
      inputElement.setAttribute('type', 'checkbox');
      inputElement.setAttribute('id', 'history-item-check-'+id);
      dst.appendChild(inputElement);
      let lebelElement = document.createElement('label');
      lebelElement.classList.add('history-item');
      lebelElement.setAttribute('for', 'history-item-check-'+id);
      let labelText = '<div>';
      labelText += '時刻：'+time.getDate()+'月'+time.getDay()+'日';
      labelText += ''+time.getHours()+'時'+time.getMinutes()+'分';
      labelText += '</div><div>';
      labelText += '金額：&yen' + record.sum;
      labelText += '</div>';
      lebelElement.innerHTML = labelText;
      dst.appendChild(lebelElement);
      let divElement = document.createElement('div');
      divElement.classList.add('history-item');
      let ulElement = document.createElement('ul');
      let ulText = '';
      items.forEach((item, i)=>{
        ulText+='<li>'+item.name+'：';
        let num = i < record.detail.length ? record.detail[i] : 0;
        ulText+=''+num+'点</li>';
      });
      ulElement.innerHTML = ulText;
      let editButton = document.createElement('div');
      editButton.classList.add('edit-button');
      editButton.setAttribute('data-id', id);
      editButton.innerHTML = '<span class="material-symbols-outlined">edit</span>編集'
      divElement.appendChild(ulElement);
      divElement.appendChild(editButton);
      dst.appendChild(divElement);
      editButton.addEventListener('click', History.onEditClicked);
    },
    reset: function(){
      targetId = -1;
      History.editor.classList.remove('active');
      History.editingInputs=[];
      
      const history = Store.history;
      historyList = document.querySelector('.history.history-list');
      historyList.innerHTML = '';
      for(let id = history.length - 1; id >= 0; id--){
        History.addHistoryElement(historyList, history[id], id);
      }
    },
    init: function(){
      History.editor = document.querySelector('div.history.history-edit');
      const okBtn = History.editor.querySelector('.ok-btn');
      okBtn.addEventListener('click', (e)=>{
        const items = Store.items;
        let data = {
          time: Store.history[History.targetId].time,
          sum: 0,
          detail: []
        }
        items.forEach((item, i)=>{
          const num = parseInt(History.editingInputs[i].value);
          data.sum += item.price * num;
          data.detail.push(num);
        });
        Store.editHistory(History.targetId, data);
        History.targetId = -1;
        History.editor.classList.remove('active');
        History.reset();
      });
      const cancelBtn = History.editor.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', (e)=>{
        History.targetId = -1;
        History.editor.classList.remove('active');
      });
      History.reset();
    }
  }

  // Settings

  const Settings = {
    storeListElement:null,
    storeNameInput:null,
    itemListElement:null,
    reset:function(){
      const names = Store.names;
      Settings.storelistElement.innerHTML = '';
      names.forEach((name, id)=>{
        const input = document.createElement('input');
        input.setAttribute('type', 'radio');
        input.setAttribute('name', 'storelist-radio');
        input.setAttribute('id', 'storelist-radio-'+id);
        input.setAttribute('data-id', id);
        input.checked = (id == Store.storeId);
        input.addEventListener('click', ()=>{
          Store.storeId = id;
          Home.reset();
          History.reset();
          Settings.reset();
        });
        Settings.storelistElement.appendChild(input);
        const label = document.createElement('label');
        label.setAttribute('for', 'storelist-radio-'+id);
        label.innerText = name;
        Settings.storelistElement.appendChild(label);
      })
      Settings.storeNameInput.value = Store.name;
    },
    init: function(){
      Settings.storelistElement = document.getElementById('settings-storelist');
      document.getElementById('settings-createstore').addEventListener('click', (e)=>{
        const reply = prompt('新規ストア名を入力');
        if(!reply || reply.length == 0)return;
        Store.createStore({
          'name': reply,
          'items': [],
          'history': []
        });
        Home.reset();
        History.reset();
        Settings.reset();
      });
      Settings.storeNameInput = document.getElementById('settings-storename');
      Settings.storeNameInput.addEventListener('change', (e)=>{
        Store.name = Settings.storeNameInput.value;
        Settings.reset();
      })
      Settings.itemListElement = document.getElementById('settings-itemlist');
      Settings.reset();
    }
  }

  loadState();
  Home.init();
  History.init();
  Settings.init();

})();