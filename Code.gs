function doGet(request) {
  return HtmlService.createTemplateFromFile('index').evaluate()
      .addMetaTag('viewport','width=device-width , initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function globalVariables(){ 
  var varArray = {
    spreadsheetId   : 'googleSheetId',
    dataRage        : 'sheetName!A2:J',
    idRange         : 'sheetName!A2:A',
    lastCol         : 'J',
    insertRange     : 'sheetName!A1:J1',
    sheetID         : '0' //number after gid=... at url google sheet 
  };
  return varArray;
}

function processForm(formObject){  
  if(formObject.RecId && checkID(formObject.RecId)){
    updateData(getFormValues(formObject),globalVariables().spreadsheetId,getRangeByID(formObject.RecId));
  }else{ 
    appendData(getFormValues(formObject),globalVariables().spreadsheetId,globalVariables().insertRange); 
  }
  return getLastTenRows();
}

function getFormValues(formObject){
  if(formObject.RecId && checkID(formObject.RecId)){
    var values = [[formObject.RecId.toString(),
                  formObject.subject,
                  formObject.name,
                  formObject.lastname,
                  formObject.gender,
                  formObject.hospitalNumber,
                  formObject.phone,
                  formObject.dob,
                  formObject.address,
                  formObject.parentName]];
  }else{
    var values = [[new Date().getTime().toString(),
                  formObject.subject,
                  formObject.name,
                  formObject.lastname,
                  formObject.gender,
                  formObject.hospitalNumber,
                  formObject.phone,
                  formObject.dob,
                  formObject.address,
                  formObject.parentName]];
  }
  return values;
}

function appendData(values, spreadsheetId,range){
  var valueRange = Sheets.newRowData();
  valueRange.values = values;
  var appendRequest = Sheets.newAppendCellsRequest();
  appendRequest.sheetID = spreadsheetId;
  appendRequest.rows = valueRange;
  var results = Sheets.Spreadsheets.Values.append(valueRange, spreadsheetId, range,{valueInputOption: "RAW"});
}

function readData(spreadsheetId,range){
  var result = Sheets.Spreadsheets.Values.get(spreadsheetId, range);
  return result.values;
}

function updateData(values,spreadsheetId,range){
  var valueRange = Sheets.newValueRange();
  valueRange.values = values;
  var result = Sheets.Spreadsheets.Values.update(valueRange, spreadsheetId, range, {
  valueInputOption: "RAW"});
}

function deleteData(ID){ 
  var startIndex = getRowIndexByID(ID);
  
  var deleteRange = {
                      "sheetId"     : globalVariables().sheetID,
                      "dimension"   : "ROWS",
                      "startIndex"  : startIndex,
                      "endIndex"    : startIndex+1
                    }
  
  var deleteRequest= [{"deleteDimension":{"range":deleteRange}}];
  Sheets.Spreadsheets.batchUpdate({"requests": deleteRequest}, globalVariables().spreadsheetId);
  
  return getLastTenRows();
}

function checkID(ID){
  var idList = readData(globalVariables()
  .spreadsheetId,globalVariables().idRange,)
  .reduce(function(a,b){
    return a.concat(b);
    });
  return idList.includes(ID);
}

function getRangeByID(id){
  if(id){
    var idList = readData(globalVariables().spreadsheetId,globalVariables().idRange);
    for(var i=0;i<idList.length;i++){
      if(id==idList[i][0]){
        return 'project-0!A'+(i+2)+':'+globalVariables().lastCol+(i+2);
      }
    }
  }
}

function getRecordById(id){
  if(id && checkID(id)){
    var result = readData(globalVariables().spreadsheetId,getRangeByID(id));
    return result;
  }
}

function getRowIndexByID(id){
  if(id){
    var idList = readData(globalVariables().spreadsheetId,globalVariables().idRange);
    for(var i=0;i<idList.length;i++){
      if(id==idList[i][0]){
        var rowIndex = parseInt(i+1);
        return rowIndex;
      }
    }
  }
}

function getLastTenRows(){
  var lastRow = readData(globalVariables().spreadsheetId,globalVariables().dataRage).length+1;
  if(lastRow<=11){
    var range = globalVariables().dataRage;
  }else{
    var range = 'project-0!A'+(lastRow-9)+':'+globalVariables().lastCol;
  }
  var lastTenRows = readData(globalVariables().spreadsheetId,range);
  return lastTenRows;
}

function getAllData(){
  var data = readData(globalVariables().spreadsheetId,globalVariables().dataRage);
  return data;
}

function processFormSearch(formObject){  
  var result = "";
  if(formObject.searchtext){ 
      result = search(formObject.searchtext);
  }
  return result;
}
 
function search(searchtext){
  var spreadsheetId   = globalVariables().spreadsheetId;
  var dataRage        = globalVariables().dataRage;
  var data = Sheets.Spreadsheets.Values.get(spreadsheetId, dataRage).values;
  var ar = [];
   
  data.forEach(function(f) {
    if (~f.indexOf(searchtext)) {
      ar.push(f);
    }
  });
  return ar;
}
