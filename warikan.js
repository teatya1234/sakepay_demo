const datasArray = [];
const text_id = document.getElementById("list");
const num_id = document.getElementById("coasterId");
const amount_id = document.getElementById("amountMoney");


// リストの作成
function makeList(listname, nameArray, originaldata) {
  const datas = [...originaldata];
  const table = document.getElementById("lists");

  // 名前の挿入
  datas.unshift(nameArray);

  // リスト名の変更
  text_id.innerHTML = "リスト : " + listname;

  // テーブルの初期化
  while (table.rows.length > 0) table.deleteRow(0);

  // テーブルヘッダーを作成 (配列の最初の行を使用)
  const headerRow = document.createElement("tr");
  datas[0].forEach(cell => {
    const th = document.createElement("th");
    th.textContent = cell;  // ヘッダーに配列の要素を設定
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // 残りのデータをテーブルに追加
  for (let i = 1; i < datas.length; i++) {
    const row = document.createElement("tr");
    datas[i].forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;  // セルに配列の要素を設定
      row.appendChild(td);
    });
    table.appendChild(row);
  }
}

// 取得したデータに異常がないかを確認
function checkData(datas) {
  for (let i = 0; i < datas.length; i++) {
    // NaNがある場合はその行を削除
    if(datas[i].every(value => isNaN(value))) datasArray.splice(i, 1);
  }
}

// データを取得して datasArrayに格納
function getData() {
  // 現在APIの制限が緩いので将来的にドメインやIPアドレスで制御する必要がある
  const API_Key = 'AIzaSyDhGD0jF36hmX0wOVFeEJcMSIBDlBAxG6M';
  const SPREAD_SHEETS_ID = '1N2lEp7iZMV8niehSSUOtxhnI63p49Nc7XI9baVmpV-w';
  const url = 'https://sheets.googleapis.com/v4/spreadsheets/' + SPREAD_SHEETS_ID + '/values/Sheet1?key=' + API_Key;

  // datasArrayを初期化
  datasArray.length = 0;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // データを取得
      const datas = data.values;
      datas.forEach(row => {
        datasArray.push(row);
      });

      // 文字列を数値に変換
      for (let i = 0; i < datasArray.length; i++) {
        for (let j = 1; j < datasArray[0].length; j++) {
          datasArray[i][j] = Number(datasArray[i][j]);
        }
      }

      // データの確認
      checkData(datasArray);

      // データを表示
      const namesArray = ["時刻", "id", "杯数", "重量", "判定"];
      const listname = "すべて";
      makeList(listname, namesArray, datasArray);
    })
    .catch(error => console.error('Error:', error));
}

// IDごとの杯数を取得
function countCups() {
  const cupsArray = [];
  const rangeId = datasArray.map(row => row[1]);
  const minId = Math.min(...rangeId); //idの最小値
  const maxId = Math.max(...rangeId); //idの最大値

  // cupsArrayにidをminID~maxIDまで挿入
  for (let i = minId; i <= maxId; i++) {
    const tmpArray = datasArray.filter(row => row[1] == i).map(row => row[2]);
    const maxCups = Math.max(...tmpArray);
    cupsArray.push([i, maxCups]);
  }
  return cupsArray;
}

// IDごとの抽出
function extraction() {
  // id(row[1])の抽出
  const filter_datasArray = datasArray.filter(row => row[1] == num_id.value);

  const namesArray = ["時刻", "id", "杯数", "重量", "判定"];
  makeList(num_id.value, namesArray, filter_datasArray);  // リストの作成

  num_id.value = '';
}

// WA RI KA N
function warikan() {
  const amount = amount_id.value;  //金額
  const ratio = 0;          // 飲んだ杯数の割合
  const resultWarikan = [];
  const cupsArray = countCups();  // IDごとに何杯飲んだか

  // 総数
  let sumCups = 0;
  for (let i = 0; i < cupsArray.length; i++) sumCups += cupsArray[i][1];

  // resultWarikanを作成
  // 杯数の総数が0の時処理を追加
  if(sumCups != 0)
    for (let i = 0; i < cupsArray.length; i++) resultWarikan.push([i, cupsArray[i][1], (cupsArray[i][1] / sumCups * 100).toFixed(2), (amount * (cupsArray[i][1] / sumCups)).toFixed(2)]);
  else
    for(let i = 0; i < cupsArray.length; i++) resultWarikan.push([i, 0, 0, 0]);

  // データの表示
  const listname = "割前勘定"
  const namesArray = ["id", "杯数", "割合(%)", "金額(円)"];
  makeList(listname, namesArray, resultWarikan);
}