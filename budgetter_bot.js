function telegram(method, params) {
  var token = "876873395:AAGOhp4sl-TYE44euvcfRr2Rap2LxLaging"
  var url = "https://api.telegram.org/bot" + token + "/" + method;
  return UrlFetchApp.fetch(url, {'method': 'post', 'payload': params});
}
function setWebHook () {
  var resp = telegram("setWebhook", {"url": "https://script.google.com/macros/s/AKfycbyg0My05Zw5xyzVRZEIu7iRqM6INWFFhy7-V9ZZrA/exec"});
  Logger.log(resp);
}
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Telegram')
  .addItem('Уведомдение', 'sendNotify')
  .addToUi();
}
function sendNotify(e) {
  // можно вписать несколько номеров. Например
  // var chatList = ['123456789', '987654321'];
  // тут номера обязательно с кавычками
  var chatList = ['528494103','465081843','813446377'];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var val = sheet.getRange("Y1").getDisplayValue();
  var text = 'Бюджет на сегодня: <b>' + val + '</b>р.'
  if (sheet.getRange("Y1").getValue() < sheet.getRange("Y2").getValue()) {
    text += '\nСреднее до конца месяца: <b>' + sheet.getRange("Y2").getDisplayValue() + '</b>р.';
  }
  for (var i = 0; i < chatList.length; i++) {
    telegram('sendMessage', {
      'chat_id': chatList[i],
      'parse_mode': 'HTML',
      'text': text
    });
  }
}
function post(e) {
  // можно вписать несколько номеров. Например
  // var chatList = [123456789, 987654321];
  // тут номера обязательно без кавычек
  var chatList = [528494103,465081843,813446377];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var msg = JSON.parse(e.postData.contents);
  if (chatList.indexOf(msg.message.chat.id) == -1) {
    telegram('sendMessage', {'chat_id': msg.message.chat.id, 'text': msg.message.chat.id});
    return;
  }
  var now = new Date();
  var curDate = sheet.getRange("A1").getDisplayValue().split('-');
  if (curDate.length != 3) {
    telegram('sendMessage', {'chat_id': msg.message.chat.id, 'text': 'Лист не найден 1'});
    return;
  }
  if (now.getMonth() != (curDate[1]-1) || now.getYear() != curDate[0]) {
    telegram('sendMessage', {'chat_id': msg.message.chat.id, 'text': 'Лист не найден 2'});
    return;
  }
// ################################# Telegram command part #################################
var isCmd = false;
if (msg.message.entities != undefined) {
  for (var i = 0; i < msg.message.entities.length; i++) {
    if (msg.message.entities[i].type == "bot_command") {
      var cmd = msg.message.text.replace('/', '');
      if (cmd == "info") {
        var url = "https://docs.google.com/spreadsheets/d/" + ss.getId();
        var sum = sheet.getRange(now.getDate() + 1, 9).getDisplayValue();
        if (sum == "") {
          sum = "0";
        }
        var text = '<b>Сегодня</b>\n'
        text += 'Сальдо       : ' + sheet.getRange("Y1").getDisplayValue() + '\n';
        text += 'Средние     : ' + sheet.getRange("Y2").getDisplayValue() + '\n';
        text += 'Потрачено : ' + sum + '\n';
        text += '<code>' + sheet.getRange(now.getDate() + 1, 9).getFormula() + '</code>\n';
        text += '\n<b>Завтра</b>\n'
        text += 'Сальдо   : ' + sheet.getRange("Y6").getDisplayValue() + '\n';
        text += 'Средние : ' + sheet.getRange("Y3").getDisplayValue() + '\n';
        text += '\n<b>Общий остаток</b>\n'
        text += sheet.getRange("Y4").getDisplayValue() + 'грн.' + ' / ' + sheet.getRange("Y5").getDisplayValue() + 'дн.\n';
        text += '\n<b>Баланс</b>\n'
        text += '<code>' + sheet.getRange("Y7").getDisplayValue() + '</code>';
        text += '\n\n<a href="' + url + '">Открыть таблицу</a>' + '\n';
        telegram('sendMessage', {
          'chat_id': msg.message.chat.id,
          'parse_mode': 'HTML',
          'text': text
        });
      }
      else if (cmd == "start") {
        telegram('sendMessage', {'chat_id': msg.message.chat.id, 'text': '🗿 Шалом шлимазлам'});
      }
      else {
        telegram('sendMessage', {'chat_id': msg.message.chat.id, 'text': '🗿 шо-шо-шо ?'});
      } 
      isCmd = true;
    }
  }
}
if (isCmd == true) return;
// ################################# Telegram command part end #################################
var val = sheet.getRange(now.getDate() + 1, 9).getFormula();
var newVal;
if (msg.message.text[0] == '=') {
  newVal = msg.message.text;
} else {
  var symb = (msg.message.text[0] == '-') ? '' : '+';
  newVal = ((val == "") ? "=" : (val + symb)) + msg.message.text.split(' ')[0];
}
sheet.getRange(now.getDate() + 1, 9).setFormula(newVal);
if (sheet.getRange(now.getDate() + 1, 9).getDisplayValue()[0] == "#") {
  sheet.getRange(now.getDate() + 1, 9).setFormula(val);
  telegram('sendMessage', {'chat_id': msg.message.chat.id, 'text': '🗿 шо - шо ?'});
  return;
}
for (var i = 0; i < chatList.length; i++) {
  if (chatList[i] == msg.message.chat.id) {
    telegram('sendMessage', {'chat_id': ''+chatList[i], 'text': getOkMessage()});
  }
  else {
    var lMsg = msg.message.text.split(' ');
    var sText = lMsg[0];
    if (lMsg.length > 1) {
      sText += '\n\n' + '<b>Комментарий:</b>\n' + lMsg.slice(1).join(' ');
    }
    telegram('sendMessage', {
      'chat_id': ''+chatList[i],
      'parse_mode': 'HTML',
      'text': sText
    });
  }
}
}
function getOkMessage() {
  l_ok_messages = ['камплит', 'есть','олрайт', 'добавил', 'записал', 'ок', 'готово', 'гуд', 'ага', 'хорошо', 'лады','принял','услышал'];
  var index = (Math.random() * 10) | 0;
  return '🗿 '+l_ok_messages[index];
}

var token = <your token>; 
var telegramUrl = "https://api.telegram.org/bot" + token;
var webAppUrl = <your webAppUrl>; 

function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  
}

function sendText(chatId, text, keyBoard) {
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chatId),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyBoard)
    }
  };
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}


function flatten(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays); 
}

function doPost(e) {
//parse user data
var contents = JSON.parse(e.postData.contents);
//set spreadsheet 
var ssId = <your SpreadsheetID>;
var expenseSheet =  SpreadsheetApp.openById(ssId).getSheetByName("bot");

  
  var keyBoard = {
        "inline_keyboard": [
          [{
            "text": "Budget",
            'callback_data': 'budget'
          }],
           [{
            "text": "Total",
            'callback_data': 'total'
          }],
           [{
            "text": "Balance",
            'callback_data': 'balance'
          }],
          [{
            "text": "Expenses",
            'callback_data': 'expenses'
          }]
          ]
  };
  
  if (contents.callback_query) {
    var id_callback = contents.callback_query.from.id;
     var data = contents.callback_query.data;
    
    if (data == 'budget') {
      var budget = expenseSheet.getRange(1, 2).getValue();
      sendText(id_callback,"P" + budget + " is your allocated budget for the week" );
    } else if (data == 'total') {
      var total = expenseSheet.getRange(2, 2).getValue();
      sendText(id_callback,"P" + total + " is your total spent so far" );
    } else if (data == 'balance') {
      var balance = expenseSheet.getRange(3, 2).getValue();
      sendText(id_callback,"P" + balance + " is your money left" );
    } else if (data == 'expenses') {
      var expenses = [];
      var lr = expenseSheet.getDataRange().getLastRow();
      
      for(var i = 6; i <=lr; i++) {
        var date = expenseSheet.getRange(i,1).getValue();
        var newDate = date.getMonth()+1+'/'+date.getDate(); 
        var item = expenseSheet.getRange(i,2).getValue();
        var price = expenseSheet.getRange(i,3).getValue();
        
        expenses.push("\n" + newDate + "  " + item + "  " + price );
        var expenseList = expenses.join("\n");
      }
      sendText(id_callback, decodeURI( "Here are your expenses: %0A " + expenseList ));
    }
    
  } else if (contents.message) {
    var id_message = contents.message.from.id; 
    var text = contents.message.text; 
    var item = text.split("=");
    var firstName = contents.message.from.first_name;
    
      if (text.indexOf("=") !== -1 ) { 
    //get date
     var nowDate = new Date(); 
     var date = nowDate.getMonth()+1+'/'+nowDate.getDate(); 
   expenseSheet.appendRow([date, item[0], item[1]]);
    sendText(id_message,"Ok. Added to your expense sheet"); 
  } else {
    sendText(id_message, "Hi " + firstName +  ", you may send me your expenses with format: 'item = price'. You may also pull your expense reports:",keyBoard)
  }
  
}
  
}
