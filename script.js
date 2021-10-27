var table = document.getElementById('table')
var teams = ["jefes", "team drazga", "pa incorporated", "villa boys"];
var records = ["7-0", "6-1", "5-2", "4-3"];

for(let i = 0; i < teams.length; i++){
  var row = table.insertRow(i + 1)
  row.insertCell(0).innerText = i + 1;
  row.insertCell(1).innerText = teams[i];
  row.insertCell(2).innerText = records[i];
}
