import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { GameStats } from './gameStatsTab';
import { SeasonStats } from './seasonStatsTab';

import { GetPlayerGameStats, GetPlayerStats } from '../services/nhl-api';

import { capitalize } from '../utils';

  /////////////////////
 // HEADER AND TABS //
/////////////////////
function TabBarButton(text, tabId, setTab, tab, highlightStyle) {
    let style;
    if (tab === tabId) { // highlighted tab
        style = { ...styles.tabButton, ...highlightStyle }
    } else {
        style = styles.tabButton
    }

    return (
        <Pressable
            key={text}
            style={style}
            onPress={() => {
                setTab(tabId);
            }}
        >
            <Text style={{ fontSize: 20, color: 'white'}}>
                {text}
            </Text>
        </Pressable>
    )
};

function TabBar({ tab, setTab }) {
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 30,
        }}>
            {TabBarButton('Season', 'season', setTab, tab, styles.tabButtonHighlightStyleLeft)}
            {TabBarButton('Games', 'games', setTab, tab, styles.tabButtonHighlightStyleRight)}
        </View>
    )
}

export function PlayerInfo({player, contractMap}) {
    const contract = contractMap.current[player.id];
    const contractRow = contract ? 
        (<View>
            <Text style={{ fontSize: 14, color: 'white'}}>
                {capitalize(contract.team)}  -  {contract.years} {contract.years == 1 ? 'yr' : 'yrs'}  -  ${contract.salary}
            </Text>
        </View>)
        :
        null
    return (
        <>
        <Image
            style={{ width: 75, height: 75, marginRight: 10, borderRadius: 5, alignSelf: 'center' }}
            source={{ uri: `http://nhl.bamcontent.com/images/headshots/current/168x168/${player.id}.jpg` }}
            defaultSource={require('./../assets/headshot_blank.jpg')}
        />
        <View style={{ width: '70%'  }}>
            <View>
                <Text style={{ fontSize: 30, color: 'white' }}>
                    {player.name}
                </Text>
            </View>
            <View>
                <Text style={{ fontSize: 14, color: 'white'}}>
                    {player.teamAbr}  -  {player.position}  -  {`#${player.number}`}  {/*- {`NHL ID = ${player.id}`}*/}
                </Text>
            </View>
            {contractRow}
        </View>
        </>
    );
}

function StatsHeader({player, contractMap, setModalVisible}) {
    return (
        <View style={styles.statsHeader}>
            <PlayerInfo player={player} contractMap={contractMap} />

            <View style={{flexGrow: 1}}></View>

            <View>
                <Pressable onPress={()=>{
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setModalVisible(false)
                }}>
                    <Ionicons name='close' size={24} color='red' />
                </Pressable>
            </View>
        </View>
    );
};

export function PlayerStats({player, contractMap, year, setModalVisible}) {
    const [tab, setTab] = useState('season');
    const [seasonStats, setSeasonStats] = useState({});
    const [gameStats, setGameStats] =  useState({});

    // load season stats on render
    useEffect(() => {
        (GetPlayerStats(player.id, year, false)).then(s => setSeasonStats(s));
    }, []);

    // load game stats on render
    useEffect(() => {
        (GetPlayerGameStats(player.id, false)).then(s => setGameStats(s));
    }, []);

    if (Object.keys(player).length === 0) {
        return (
            <View></View>
        )
    };

    const Footer = (tab === 'season'
        ?
        <Text style={{ color: 'grey', alignSelf: 'flex-start', marginTop: 10 }}>
            Regular season stat totals
        </Text>
        :
        <Text style={{ color: 'grey', alignSelf: 'flex-start', marginTop: 10 }}>
            👑 = Playoff Game
        </Text>
    )

    const isGoalie = (player.position === 'G');
    let StatsTab;
    let stats;

    if (tab === 'season') {
        stats = seasonStats;
        StatsTab = SeasonStats;
    } else {
        stats = gameStats;
        StatsTab = GameStats;
    }
    
    return (
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <StatsHeader player={player} contractMap={contractMap} setModalVisible={setModalVisible} />
                <View style={styles.statsAndTabBar}>
                    <TabBar tab={tab} setTab={setTab} />
                    <StatsTab stats={stats} goalieVariant={isGoalie} />
                </View>
                {Footer}
            </View>
        </View>
    );
};

export const modalBgColor = '#2f3435';
const listBgColor = '#332d29';
const styles = StyleSheet.create({
    statsAndTabBar: {
        backgroundColor: listBgColor,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'white',
        marginTop: 15,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: modalBgColor,
        height: 30,
        borderBottomColor: 'white',
        borderBottomWidth: 1,
    },
    tabButtonHighlightStyleLeft: {
        borderRightColor: 'white',
        borderRightWidth: 1,
        borderBottomWidth: 0,
        backgroundColor: listBgColor,
    },
    tabButtonHighlightStyleRight: {
        borderLeftColor: 'white',
        borderLeftWidth: 1,
        borderBottomWidth: 0,
        backgroundColor: listBgColor,
    },
    modalView: {
        margin: 20,
        marginTop: 40,
        paddingBottom: 0,
        height: '90%',
        backgroundColor: modalBgColor,
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 0
    },
    statsHeader: {
        flexDirection: 'row',
        marginBottom: 2
    },
});