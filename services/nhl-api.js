import * as FileSystem from 'expo-file-system';
import * as Papa from 'papaparse';

const emptyStats = { goals: 'Na', assists: 'Na' };

export async function GetPlayerStats(id, year) {
    console.log(`fetching in GetPlayerStats! id = ${id}, year = ${year}`);
    if ((id === "") || (isNaN(id))) {
        console.log('return empty stats');
        return emptyStats;
    }

    try {
        const response = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=statsSingleSeason&season=${year}`);
        const statObj = await response.json();
        if ((typeof statObj === 'object') && (statObj.hasOwnProperty('stats'))) {
            // if a player hasn't played this season, length(splits) == 0
            if (statObj.stats[0].splits.length == 0) {
                return { goals: NaN, assists: NaN };
            } else {
                return statObj.stats[0].splits[0].stat;
            }
        } else {
            return emptyStats;
        }
    } catch (error) {
        console.error(error)
    }
};

async function writePlayerIds(players, playerIdsFilePath) {
    console.log('writing player IDs csv!')
    const csvString = players.map(p => `${p.id},${p.name},${p.position},${p.teamName},${p.teamAbr},${p.number}\n`).join('');
    await FileSystem.writeAsStringAsync(playerIdsFilePath, csvString);
    return 0;
};

export async function GetPlayerIds(forceRefresh=false) {
    
    const playerIdsFilePath = `${FileSystem.documentDirectory}players.csv`
    const fileInfo = await FileSystem.getInfoAsync(playerIdsFilePath);
    const fileSeconds = fileInfo.modificationTime;
    const fileExists = fileInfo.exists;

    const d = new Date();
    const currentSeconds = Math.round(d.getTime() / 1000); // current seconds since epoch
    const fileAge = currentSeconds - fileSeconds;
    const monthSeconds = 86400 * 31; // seconds in day * days in month

    // if the file exists, is less than a month old, and force refresh is not true, load the IDs from file.
    if (fileExists && (fileAge < monthSeconds) && !forceRefresh) {
        console.log('loading player IDs from file!')
        const idsString = await FileSystem.readAsStringAsync(playerIdsFilePath);
        const results = Papa.parse(idsString);
        const ps = results.data.map(arr => {
            return {
                id: arr[0], 
                name: arr[1], 
                position: arr[2], 
                teamName: arr[3], 
                teamAbr: arr[4],
                number: arr[5],
            };
        });
        if (ps[ps.length-1].name === undefined) {
            return ps.slice(0, ps.length-1);
        } else {
            return ps;
        }
    } else { // if an IDs file does not exist or force refresh is true, query the API and save to file.

        try {
            console.log('fetching player IDs from NHL API!')
            const ps = []
            for (const id in teamIds) {
                const response = await fetch(`https://statsapi.web.nhl.com/api/v1/teams/${id}/roster`);
                const team = await response.json();
                const players = team.roster
                for (const player of players) {
                    const person = player.person;
                    const position = player.position.abbreviation;
                    ps.push({
                        'id': person.id,
                        'name': person.fullName,
                        'position': position,
                        'teamName': teamIds[id]['name'],
                        'teamAbr': teamIds[id]['abr'],
                        'number': player.jerseyNumber,
                    });
                };
            };

            // write these player ids to the device so we don't have to fetch every time
            writePlayerIds(ps, playerIdsFilePath);
            return ps
        } catch (error) {
            console.error(error)
        };
    };
};

export async function GetPlayerGameStats(id) {
    console.log(`fetching in GetPlayerGameStats for current year! id = ${id}`);
    if ((id === "") || (isNaN(id))) {
        console.log('return empty stats');
        return [];
    }

    try {
        const response = await fetch(`https://statsapi.web.nhl.com/api/v1/people/${id}/stats?stats=playoffGameLog&stats=gameLog`);
        const statObj = await response.json();
        if ((typeof statObj === 'object') && (statObj.hasOwnProperty('stats'))) {
            // if a player hasn't played this season return nothing
            // stats[0] is playoff games, stats[1] is regular season games
            if ((statObj.stats[0].splits.length === 0) && (statObj.stats[1].splits.length === 0)) {
                return [];
            } else {
                let playoffGames = [];
                let seasonGames = [];

                // if there are playoff game logs
                if (statObj.stats[0].splits.length !== 0) {
                    playoffGames = statObj.stats[0].splits.map((item) => {
                        item.opponent.abr = teamIds[item.opponent.id].abr;
                        item.isPlayoffs = true;
                        return item;
                    });
                };

                // if there are regular season game logs
                if (statObj.stats[1].splits.length !== 0) {
                    seasonGames = statObj.stats[1].splits.map((item) => {
                        item.opponent.abr = teamIds[item.opponent.id].abr;
                        item.isPlayoffs = false;
                        return item;
                    });
                };

                return playoffGames.concat(seasonGames);
            }
        } else {
            return [];
        }
    } catch (error) {
        console.error(error);
    }
};

// returns games object with 'live', 'scheduled', and 'concluded' keys holding arrays of games.
export async function GetGames(date) {
    console.log('fetching in GetGames!');
    const dt = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    try {
        const response = await fetch(`https://statsapi.web.nhl.com/api/v1/schedule?date=${dt}&expand=schedule.linescore`);
        const gamesObj = await response.json();
        const gamesByStatus = { live: [], upcoming: [], concluded: [] }; // obj to hold games by status

        // if the response has games, format them and return
        if (
            (typeof gamesObj === 'object')
            && (gamesObj.hasOwnProperty('dates'))
            && (gamesObj.dates.length > 0)
            && (gamesObj.dates[0].hasOwnProperty('games'))
        ) {
            // get just the games, and add team abbreviations
            const games = gamesObj.dates[0].games.map((game) => {
                game.teams.away.team.abr = teamIds[game.teams.away.team.id].abr;
                game.teams.home.team.abr = teamIds[game.teams.home.team.id].abr;
                return game;
            });
            gamesByStatus.live = games.filter(game => (game.status.abstractGameState === 'Live'));
            gamesByStatus.upcoming = games.filter(game => (game.status.abstractGameState === 'Preview'));
            gamesByStatus.concluded = games.filter(game => (game.status.abstractGameState === 'Final'));
            return gamesByStatus;
        } else {
            return gamesByStatus;
        };
    } catch (error) {
        console.error(error);
    }
};

// NHL.com API IDs for each team
const teamIds = {
    1: { name: 'New Jersey Devils', abr: 'NJD' },
    2: { name: 'New York Islanders', abr: 'NYI' },
    3: { name: 'New York Rangers', abr: 'NYR' },
    4: { name: 'Philadelphia Flyers', abr: 'PHI' },
    5: { name: 'Pittsburgh Penguins', abr: 'PIT' },
    6: { name: 'Boston Bruins', abr: 'BOS' },
    7: { name: 'Buffalo Sabres', abr: 'BUF' },
    8: { name: 'Montréal Canadiens', abr: 'MTL' },
    9: { name: 'Ottawa Senators', abr: 'OTT' },
    10: { name: 'Toronto Maple Leafs', abr: 'TOR' },
    12: { name: 'Carolina Hurricanes', abr: 'CAR' },
    13: { name: 'Florida Panthers', abr: 'FLA' },
    14: { name: 'Tampa Bay Lightning', abr: 'TBL' },
    15: { name: 'Washington Capitals', abr: 'WSH' },
    16: { name: 'Chicago Blackhawks', abr: 'CHI' },
    17: { name: 'Detroit Red Wings', abr: 'DET' },
    18: { name: 'Nashville Predators', abr: 'NSH' },
    19: { name: 'St. Louis Blues', abr: 'STL' },
    20: { name: 'Calgary Flames', abr: 'CGY' },
    21: { name: 'Colorado Avalanche', abr: 'COL' },
    22: { name: 'Edmonton Oilers', abr: 'EDM' },
    23: { name: 'Vancouver Canucks', abr: 'VAN' },
    24: { name: 'Anaheim Ducks', abr: 'ANA' },
    25: { name: 'Dallas Stars', abr: 'DAL' },
    26: { name: 'Los Angeles Kings', abr: 'LAK' },
    28: { name: 'San Jose Sharks', abr: 'SJS' },
    29: { name: 'Columbus Blue Jackets', abr: 'CBJ' },
    30: { name: 'Minnesota Wild', abr: 'MIN' },
    52: { name: 'Winnipeg Jets', abr: 'WPG' },
    53: { name: 'Arizona Coyotes', abr: 'ARI' },
    54: { name: 'Vegas Golden Knights', abr: 'VGK' },
    55: { name: 'Seattle Kraken', abr: 'SEA' },
}