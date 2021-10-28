//TODO:
//ADD FORM INPUT FOR LEAGUE ID
//CHANGE TABLE RANKINGS WHEN RESPECTIVE BUTTON IS CLICKED
//  CREATE METHOD FOR EACH SORTING TYPE
//  OR
//  CREATE ONE METHOD AND PASS IN SORTING TYPE

//getting league id from variety of input links:
//find indext of "leagueId="
//get substring at indexOf + 9
//add numbers to id string, stop at end of string OR character is not a number
//try catch or something to see if id is valid
//could be invalid at 2 steps:
//  1. link does not include a league id
//  2. given league id returns some sort of error

//set cooldown on button

class Team{
  static standings = []
  constructor(fullName, id, scores, wins, draws, losses){
    this.fullName = fullName
    this.id = id
    this.scores = scores
    this.wins = wins
    this.draws = draws
    this.losses = losses
    this.cumWins = 0
    this.cumDraws = 0
    this.cumLosses = 0
    this.percentDiff = 0
  }
  calculateCumRecord(teams){
    for(let i = 0; i < currentWeek - 1; i++){
      for(let j = 0; j < teams.length; j++){
        if(this.id != teams[j].id){
          if(this.scores[i] > teams[j].scores[i])
            this.cumWins++
          else if(this.scores[i] < teams[j].scores[i])
            this.cumLosses++
          else{
            console.log(this.scores[i] + " " + teams[j].scores[i])
            this.cumDraws++
          }
        }
      }
    }
  }
  //printing cumulative record
  printRecord(rank){
    console.log((rank + 1) + ". " + this.fullName + ": " + this.cumWins + "-" + this.cumDraws + "-" + this.cumLosses)
  }
  //printing standard win% - cumulative win%
  printFraudScore(rank){
    console.log((rank + 1) + ". " + this.fullName + ": " + this.percentDiff.toFixed(3))
  }

  calculatePercentDiff(){
  const winPercent = this.wins / (this.wins + this.draws + this.losses)
  const cumWinPercent = this.cumWins / (this.cumWins + this.cumDraws + this.cumLosses)
  this.percentDiff = winPercent - cumWinPercent
  }
}
  //GETTING POINTS FOR FROM API
  async function getMatchupData(apiURL1, apiURL2)
  {
    const response = await fetch(apiURL1)
    const matchupData = await response.json()

    const response2 = await fetch(apiURL2);
    const leagueData = await response2.json();
    const leagueName = leagueData.settings.name;

    document.getElementById('header').innerText = leagueName;
    //hash table with "espn id": "default id"
    let idKeys = []

    //initializing hash table of ids
    for(let i = 0; i < matchupData.teams.length; i++)
      idKeys[matchupData.teams[i].id] = i

    currentWeek = matchupData.scoringPeriodId

    //declaring 2d array of scores
    //i = numTeams, j = num regular season weeks
    let scores = createArray(matchupData.teams.length, matchupData.schedule.length / (matchupData.teams.length / 2))

    //initializing scores array
    for(let i = 0; i < matchupData.schedule.length; i++){
      scores[idKeys[matchupData.schedule[i].away.teamId]][matchupData.schedule[i].matchupPeriodId - 1] = matchupData.schedule[i].away.totalPoints
      scores[idKeys[matchupData.schedule[i].home.teamId]][matchupData.schedule[i].matchupPeriodId - 1] = matchupData.schedule[i].home.totalPoints
    }

    //resetting teams array
    teams = new Array();
    //initializing array of Team objects
    for(let i = 0; i < scores.length; i++)
      teams[i] = new Team(matchupData.teams[i].location + " " + matchupData.teams[i].nickname, matchupData.teams[i].id, scores[i], matchupData.teams[i].record.overall.wins, matchupData.teams[i].record.overall.ties, matchupData.teams[i].record.overall.losses)

    console.log(teams)
    for(let i = 0; i < teams.length; i++){
      teams[i].calculateCumRecord(teams, i)
      teams[i].calculatePercentDiff()
    }

    //ranking teams based on cumulative record
    teams = createCumRankings(teams)
    var table = document.getElementById('table')

    //adding rankings to html table
    for(let i = 0; i < teams.length; i++){
      var row = table.insertRow(i + 1)
      var record = teams[i].wins + "-" + teams[i].draws + "-" + teams[i].losses;
      var cumRecord = teams[i].cumWins + "-" + teams[i].cumDraws + "-" + teams[i].cumLosses;

      row.insertCell(0).innerText = i + 1;
      row.insertCell(1).innerText = teams[i].fullName;
      row.insertCell(2).innerText = cumRecord;
      row.insertCell(3).innerText = record;
      row.insertCell(4).innerText = teams[i].percentDiff.toFixed(3)
    }

    //removing excess rows
    let tableLength = table.rows.length;
    console.log(tableLength + " " + teams.length)
    let excessRows = tableLength - (teams.length + 1);

    if(excessRows > 0){
      for(let i = 0; i < excessRows; i++)
        table.deleteRow(teams.length + 1);
    }
    console.log("cumulative standings")

    for(let i = 0; i < teams.length; i++)
      teams[i].printRecord(i)

    //ranking teams based on win% difference
    teams = createFraudRankings(teams)
    console.log("\nfraudulence ranking(win% - cumulative win%, lower is better)")
    for(let i = 0; i < teams.length; i++)
      teams[i].printFraudScore(i)

  }
  //thing copied from stackoverflow idk what it does
  function createArray(length) {
    var arr = new Array(length || 0),
        i = length

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1)
        while(i--) arr[length-1 - i] = createArray.apply(this, args)
    }

    return arr
  }

  //ranking based on cumulative record
  function createCumRankings(teams){
    for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length - 1 - i; j++) {
            if (teams[j].cumWins < teams[j + 1].cumWins) {
              let temp = teams[j]
              teams[j] = teams[j + 1]
              teams[j + 1] = temp
            }
        }
    }
    return teams
  }

  //ranking based on win% - cumulative win%
  function createFraudRankings(teams){
    for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length - 1 - i; j++) {
            if (teams[j].percentDiff < teams[j + 1].percentDiff) {
              let temp = teams[j]
              teams[j] = teams[j + 1]
              teams[j + 1] = temp
            }
        }
    }
    return teams
  }

  async function isValidURL(URL){
    //test if url returns valid api call
  }

  function sortByName(){
    console.log("sorted by name")
  }
  function sortByCumRecord(){
    console.log("sorted by cumulative record")
  }
  function sortByRecord(){
    console.log("sorted by record")
  }
  function sortByFraudScore(){
    console.log("sorted by fraud score")
  }

  function getLeagueId(){
    let leagueId = document.getElementById('leagueInput').value;
    if(leagueId != null){
      //url for scores
      let apiURL1 = "https://fantasy.espn.com/apis/v3/games/ffl/seasons/2021/segments/0/leagues/" + leagueId + "?view=mBoxscore"
      //url for league name
      let apiURL2 = "https://fantasy.espn.com/apis/v3/games/ffl/seasons/2021/segments/0/leagues/" + leagueId + "?view=player_wl"
      getMatchupData(apiURL1, apiURL2);
    }
  }

//array of Team objects
let teams = []
let currentWeek = 0
