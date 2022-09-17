class Team{
    constructor(fullName, id, scores, wins, draws, losses){
        this.fullName = fullName;
        this.id = id;
        this.scores = scores;
        this.wins = wins;
        this.draws = draws;
        this.losses = losses;
        this.cumWins = 0;
        this.cumDraws = 0;
        this.cumLosses = 0;
        this.percentDiff = 0;
  }

  //calculates cumulative record for Team calling object
    calculateCumRecord(teams){
        for(let i = 0; i < currentWeek - 1; i++){
            for(let j = 0; j < teams.length; j++){
                if(this.id != teams[j].id){
                    if(this.scores[i] > teams[j].scores[i])
                        this.cumWins++;
                    else if(this.scores[i] < teams[j].scores[i])
                        this.cumLosses++;
                    else{
                        this.cumDraws++;
                    }
                }
            }
        }
    }
    //printing cumulative record in console
    printRecord(rank){
        console.log((rank + 1) + ". " + this.fullName + ": " + this.cumWins + "-" + this.cumDraws + "-" + this.cumLosses);
    }
    //printing standard win% - cumulative win% in console
    printFraudScore(rank){
        console.log((rank + 1) + ". " + this.fullName + ": " + this.percentDiff.toFixed(3));
    }

    //calculating fraud score
    calculatePercentDiff(){
        const winPercent = this.wins / (this.wins + this.draws + this.losses);
        const cumWinPercent = this.cumWins / (this.cumWins + this.cumDraws + this.cumLosses);
        this.percentDiff = winPercent - cumWinPercent;
    }
}//end Team class

//GETTING POINTS FOR FROM API
async function getMatchupData(leagueDataURL, leagueNameURL){
    const response = await fetch(leagueDataURL);
    const matchupData = await response.json();
    console.log(leagueDataURL);
    const response2 = await fetch(leagueNameURL);
    const leagueData = await response2.json();
    const leagueName = leagueData.settings.name;

    document.getElementById('header').innerText = leagueName;
    
    //hash table with "espn id": "default id"
    let idKeys = [];

    //initializing hash table of ids
    for(let i = 0; i < matchupData.teams.length; i++)
        idKeys[matchupData.teams[i].id] = i;

    currentWeek = matchupData.scoringPeriodId;

    //declaring 2d array of scores
    //i = numTeams, j = num regular season weeks
    let scores = createArray(matchupData.teams.length, matchupData.schedule.length / (matchupData.teams.length / 2));

    //initializing scores array
    for(let i = 0; i < matchupData.schedule.length; i++){
        scores[idKeys[matchupData.schedule[i].away.teamId]][matchupData.schedule[i].matchupPeriodId - 1] = matchupData.schedule[i].away.totalPoints;
        scores[idKeys[matchupData.schedule[i].home.teamId]][matchupData.schedule[i].matchupPeriodId - 1] = matchupData.schedule[i].home.totalPoints;
    }

    //resetting teams array
    teams = new Array();

    //initializing array of Team objects
    for(let i = 0; i < scores.length; i++){
        teams[i] = new Team(matchupData.teams[i].location + " " + matchupData.teams[i].nickname, matchupData.teams[i].id, scores[i], matchupData.teams[i].record.overall.wins, matchupData.teams[i].record.overall.ties, matchupData.teams[i].record.overall.losses);
    }
    for(let i = 0; i < teams.length; i++){
        teams[i].calculateCumRecord(teams, i);
        teams[i].calculatePercentDiff();
    }

    //ranking teams based on cumulative record
    teams = createCumRankings(teams);
    var table = document.getElementById('table');

    //ranking teams by default(cumulative record) and inserting into table
    for(let i = 0; i < teams.length; i++){
        var row = table.insertRow(i + 1);
        var record = teams[i].wins + "-" + teams[i].draws + "-" + teams[i].losses;
        var cumRecord = teams[i].cumWins + "-" + teams[i].cumDraws + "-" + teams[i].cumLosses;

        row.insertCell(0).innerText = i + 1;
        row.insertCell(1).innerText = teams[i].fullName;
        table.rows[i + 1].cells[1].style.textAlign = "left";
        row.insertCell(2).innerText = cumRecord;
        row.insertCell(3).innerText = record;
        row.insertCell(4).innerText = teams[i].percentDiff.toFixed(3);
    }

    //removing excess rows
    removeExcessRows(teams, table);
    console.log("cumulative standings")

    for(let i = 0; i < teams.length; i++)
        teams[i].printRecord(i);

    //ranking teams based on win% difference
    teams = createFraudRankings(teams);
    console.log("\nfraudulence ranking(win% - cumulative win%, lower is better)");
    for(let i = 0; i < teams.length; i++)
        teams[i].printFraudScore(i)

}
  
//thing copied from stackoverflow idk what it does
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if(arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    return arr;
}

//ranking based on cumulative record
function createCumRankings(teams){
    for (let i = 0; i < teams.length; i++){
        for (let j = 0; j < teams.length - 1 - i; j++){
            if (teams[j].cumWins < teams[j + 1].cumWins){
                let temp = teams[j];
                teams[j] = teams[j + 1];
                teams[j + 1] = temp;
            }
        }
    }
    return teams;
}

//ranking based on win% - cumulative win%
function createFraudRankings(teams){
    for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length - 1 - i; j++) {
            if (teams[j].percentDiff < teams[j + 1].percentDiff) {
                let temp = teams[j];
                teams[j] = teams[j + 1];
                teams[j + 1] = temp;
            }
        }
    }
    return teams;
}

//ranking based on team name (alphabetical)
function createNameRankings(teams){
    for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length - 1 - i; j++) {
            if (teams[j].fullName > teams[j + 1].fullName) {
                let temp = teams[j];
                teams[j] = teams[j + 1];
                teams[j + 1] = temp;
            }
        }
    }
    return teams;
}

//ranking based on standing record
function createRecordRankings(teams){
    for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length - 1 - i; j++) {
            if (teams[j].wins + teams[j].draws < teams[j + 1].wins + teams[j + 1].draws){
                let temp = teams[j];
                teams[j] = teams[j + 1];
                teams[j + 1] = temp;
            }
        }
    }
    return teams;
}

function sortByName(){
    let table = document.getElementById('table');
    teams = createNameRankings(teams);
    editTable(teams, table);
}
  
function sortByCumRecord(){
    let table = document.getElementById('table');
    teams = createCumRankings(teams);
    editTable(teams, table);
}
  
function sortByRecord(){
    let table = document.getElementById('table');
    teams = createRecordRankings(teams);
    editTable(teams, table);
}
  
function sortByFraudScore(){
    let table = document.getElementById('table');
    teams = createFraudRankings(teams);
    editTable(teams, table);
}

//called on every submit button click
function getLeagueId(){
    //so season needs to be a variable, same way as leagueId is  
    let leagueId = document.getElementById('leagueInput').value;
    let seasonId = document.getElementById('leagueInput').value;
    //getting id from entire url
    if(leagueId != null){
        let startIndex = leagueId.indexOf("?leagueId=");
        if(startIndex == -1){
            alert("invalid link. please try again");
            return;
        }
    startIndex += 10;
    let endIndex = startIndex;
    while(endIndex < leagueId.length && isNum(leagueId.charAt(endIndex)))
        endIndex++;
    leagueId = leagueId.substring(startIndex, endIndex);
    }
    
    if(seasonId != null){
        let startIndex = seasonId.indexOf("&seasonId=");
        if(startIndex == -1){
            alert("invalid link. please try again");
            return;
        }
        startIndex += 10;
        let endIndex = startIndex;
        while(endIndex < seasonId.length && isNum(seasonId.charAt(endIndex)))
            endIndex++;
        seasonId = seasonId.substring(startIndex, endIndex);
        console.log(seasonId);
    }
    //url for scores
    let leagueDataURL = "https://fantasy.espn.com/apis/v3/games/ffl/seasons/" + seasonId + "/segments/0/leagues/" + leagueId + "?view=mBoxscore"
    //url for league name
    let leagueNameURL = "https://fantasy.espn.com/apis/v3/games/ffl/seasons/" + seasonId + "/segments/0/leagues/" + leagueId + "?view=player_wl"
    getMatchupData(leagueDataURL, leagueNameURL);
}
  
//adding rankings to html table
function editTable(teams, table){
    for(let i = 1; i <= teams.length; i++){
        var record = teams[i - 1].wins + "-" + teams[i - 1].draws + "-" + teams[i - 1].losses;
        var cumRecord = teams[i - 1].cumWins + "-" + teams[i - 1].cumDraws + "-" + teams[i - 1].cumLosses;

        table.rows[i].cells[0].innerText = i;
        table.rows[i].cells[1].innerText = teams[i - 1].fullName;
        table.rows[i].cells[2].innerText = cumRecord;
        table.rows[i].cells[3].innerText = record;
        table.rows[i].cells[4].innerText = teams[i - 1].percentDiff.toFixed(3)
    }
}

function removeExcessRows(teams, table){
    let tableLength = table.rows.length;
    let excessRows = tableLength - (teams.length + 1);

    if(excessRows > 0){
        for(let i = 0; i < excessRows; i++)
            table.deleteRow(teams.length + 1);
    }
}
  
//checking if specified single character string is a number (taken from stackoverflow)
function isNum(str){
    return /^\d$/.test(str);
}

//main execution
//array of Team objects
let teams = [];
let currentWeek = 0;
