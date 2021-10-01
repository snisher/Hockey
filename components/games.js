import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';

import SvgUri from "expo-svg-uri";
import { AntDesign, Ionicons } from '@expo/vector-icons';
//import DateTimePicker from '@react-native-community/datetimepicker';

import { GetGames } from '../services/nhl-api';

const Sep = (
    <View style={{ width: '100%', borderColor: 'grey', borderTopWidth: 1 }} />
);

/** The sub row for a game which shows a single team. `team` = 'home' or 'away' */
function TeamSubRow({game, team}) {
    const isUpcoming = game.status.codedGameState < 3
    const shotsStr = isUpcoming ? '' : `${game.linescore.teams[team].shotsOnGoal} shots`;

    return (
        <View style={styles.teamSubRow}>
            <View style={{ flexDirection: 'row' }}>
                {/* team name and logo */}
                <View style={{ justifyContent: 'center' }}>
                    <Text style={{...styles.teamText, width: 70}}>
                        {game.teams[team].team.abr}
                    </Text>
                    <SvgUri
                        style={{ width: 60, height: 60, alignSelf: 'center' }}
                        source={{ uri: `http://www-league.nhlstatic.com/images/logos/teams-current-primary-light/${game.teams[team].team.id}.svg` }}
                    />
                </View>
                {/* PP, empty net  indicators */}
                <View style={{ marginTop: 6 }}>
                    {game.linescore.teams[team].powerPlay &&
                        <Text style={{ ...styles.teamTags, textAlign: 'center', width: 23 }}>
                            {' PP '}
                        </Text>
                    }
                    {game.linescore.teams[team].goaliePulled &&
                        <Text style={{ ...styles.teamTags, textAlign: 'center', width: 68 }}>
                            {' Empty Net '}
                        </Text>
                    }
                </View>
            </View>
            <View style={{ justifyContent: 'center' }}>
                <Text style={{ color: 'white', alignSelf: 'center' }}>
                    {shotsStr}
                </Text>
            </View>
            <Text style={styles.scoreText}>
                {isUpcoming ? '-' : game.teams[team].score}
            </Text>
        </View>
    );
};

function GameRow(game, idx) {
    const isUpcoming = game.status.codedGameState < 3;
    const isIntermission = game.linescore.intermissionInfo.inIntermission;
    const periodStr = isUpcoming ? '' : game.linescore.currentPeriodOrdinal;
    const gameStart = new Date(game.gameDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const isFinal = game.status.codedGameState == 7;
    const statusBGColor = isUpcoming ? 'yellow' : (isFinal ? 'red' : 'grey');
    
    return (
        <View style={styles.gameRow} key={`game${idx}`}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: listBorderColor }}>
                <Text style={{ color: 'black', fontWeight: '500', marginLeft: 3 }}>
                    {(isUpcoming || isFinal)
                        ?
                        null
                        :
                        (isIntermission ? `End ${periodStr}` : `${periodStr}`)
                    }
                </Text>
                <Text style={{ ...styles.statusText, backgroundColor: statusBGColor }}>
                    {isUpcoming
                        ? 
                        gameStart
                        : 
                        (isIntermission 
                            ?
                            `Intermission ${game.linescore.intermissionInfo.intermissionTimeRemaining}`
                            : 
                            (isFinal
                                ?
                                'Final'
                                :
                                game.linescore.currentPeriodTimeRemaining
                            )
                        )
                    }
                </Text>
            </View>
            <TeamSubRow game={game} team='away'/>
            {Sep}
            <TeamSubRow game={game} team='home'/>
        </View>
    );
};

function GamesHeader({ date, setDate }) {
    return (
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            marginVertical: 20,
            width: '100%'
        }}>
            <Pressable
                hitSlop={20}
                onPress={() => {
                    setDate(new Date(date.setDate(date.getDate() - 1)));
                }}
            >
                <AntDesign name='caretleft' size={15} color='white' />
            </Pressable>
            <Pressable
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
                onPress={() => setDate(new Date())} // reset with todays date
            >
                <Ionicons name='calendar' size={24} color='white' style={{ marginHorizontal: 6 }} />
                <Text style={{ fontSize: 30, color: 'white', textAlign: 'center' }}>
                    {date.toLocaleString([], { month: 'short', day: 'numeric' })}
                </Text>
            </Pressable>
            <Pressable
                hitSlop={20}
                onPress={() => {
                    setDate(new Date(date.setDate(date.getDate() + 1)));
                }}
            >
                <AntDesign name='caretright' size={15} color='white' />
            </Pressable>
        </View>
    );
};

export function Games({games, setGames, date, setDate}) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [triggerRefresh, setTriggerRefresh] = useState(false);

    // trigger fetching new games
    useEffect(() => {
        (GetGames(date))
        .then(gs => setGames(gs))
        .then(setRefreshing(false));

        if (loading) setLoading(false);
    }, [triggerRefresh, date]);

    if (loading) {
        return (
            <>
                <GamesHeader date={date} setDate={setDate} />
                <Text style={{ color: 'white', fontSize: 20 }}>
                    Loading...
                </Text>
            </>
        );
    }

    if (games.live.length === 0 && games.upcoming.length === 0 && games.concluded.length === 0) {
        return (
            <>
                <GamesHeader date={date} setDate={setDate} />
                <Text style={{
                    color: 'white',
                    fontSize: 20,
                    fontStyle: 'italic',
                }}>
                    No games on this day 😢
                </Text>
            </>
        );
    };

    return (
        <>
            <GamesHeader date={date} setDate={setDate} />
            <ScrollView 
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            setTriggerRefresh(true);
                        }}
                        tintColor={'white'}
                    />
                }
            >
                
                {games.live.length !== 0 && [
                    games.live.map((game, idx) => GameRow(game, idx))
                ]}
                {games.upcoming.length !== 0 && [
                    games.upcoming.map((game, idx) => GameRow(game, idx))
                ]}
                {games.concluded.length !== 0 && [
                    games.concluded.map((game, idx) => GameRow(game, idx))
                ]}
            </ScrollView>
        </>
    )
};

const listBorderColor = 'lightgrey';
const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        width: 350,
        marginTop: 20,
    },
    gameRow: {
        borderColor: listBorderColor,
        borderWidth: 1,
        borderTopWidth: 0,
        marginBottom: 5,
        borderRadius: 2,
        backgroundColor: '#2c3435'
    },
    teamSubRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    teamTags: {
        fontSize: 12,
        backgroundColor: '#ffd400',
        borderRadius: 7,
        overflow: 'hidden',
        marginBottom: 3,
    },
    teamText: {
        color: 'white', 
        width: 75,
        fontSize: 22,
        fontWeight: '500',
        textAlign: 'center',
        paddingTop: 5
    },
    scoreText: {
        color: 'white', 
        width: 60,
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        marginRight: 15,
    },
    statusText: { 
        color: 'black', 
        fontWeight: '500', 
        marginRight: 3, 
        overflow: 'hidden', 
        borderRadius: 2,
        marginVertical: 3,
        paddingHorizontal: 2,
    },
});