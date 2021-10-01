import React from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';

  ////////////////
 // GAME STATS //
////////////////

function Sep() { 
    return (
        <View style={{
            height: .1,
            borderBottomColor: 'white',
            borderBottomWidth: StyleSheet.hairlineWidth,
        }}/>
    );
};

function GameRowTop(stats) {
    const winStr = (stats.isWin ? 'W' : 'L');
    //const winCol = (stats.isWin ? 'darkgreen' : 'darkred');
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(stats.date));
    const day = new Date(stats.date).getDate() + 1;
    const atStr = (stats.isHome ? '' : '@');
    const otStr = (stats.isOT ? 'OT' : '');
    const playoffStr = (stats.isPlayoffs ? '👑' : '');
    const col = '#9e9e9e'
    return(
        <View style={styles.rowTop}>
            <Text style={{ color: col, marginRight: 20 }}>
                {`${month} ${day}`}
            </Text>
            <Text style={{ color: col, marginRight: 20 }}>
                {`${atStr}${stats.opponent.abr}`}
            </Text>
            <Text style={{ color: col, marginRight: 20 }}>
                {`${otStr}${winStr}`}
            </Text>
            <View style={{ 'flexGrow': 1 }} />
            <Text style={{ color: col, marginRight: 10 }}>
                {playoffStr}
            </Text>
        </View>
    );
};

function GameRowCell(val, bold) {
    const boldStr = (bold ? '900' : 'normal');
    return (
        <View style={styles.gameRowCell}>
            <Text style={{ color: 'white', fontWeight: boldStr }}>
                {val}
            </Text>
        </View>
    );
};

// forward + defensemen stats
function GameRowHeaderFD() {
    return (
        <>
            <View style={styles.row}>
                {GameRowCell('TOI', true)}
                {GameRowCell('G', true)}
                {GameRowCell('A', true)}
                {GameRowCell('+/-', true)}
                {GameRowCell('PPP', true)}
                {GameRowCell('SOG', true)}
                {GameRowCell('HIT', true)}
                {GameRowCell('BLK', true)}
            </View>
            <Sep/>
        </>
    );
};

function GameRowFD(stats) {
    return (
        <View style={{ height: gameRowHeight, justifyContent: 'space-around' }}>
            {GameRowTop(stats)}
            <View style={styles.row}>
                {GameRowCell(stats.stat.timeOnIce, false)}
                {GameRowCell(stats.stat.goals, false)}
                {GameRowCell(stats.stat.assists, false)}
                {GameRowCell(stats.stat.plusMinus, false)}
                {GameRowCell(stats.stat.powerPlayPoints, false)}
                {GameRowCell(stats.stat.shots, false)}
                {GameRowCell(stats.stat.hits, false)}
                {GameRowCell(stats.stat.blocked, false)}
            </View>
        </View>
    );
};

// goalie stats
function GameRowHeaderG() {
    return (
        <>
            <View style={styles.row}>
                {GameRowCell('W/L', true)}
                {GameRowCell('S', true)}
                {GameRowCell('SA', true)}
                {GameRowCell('SV%', true)}
                
            </View>
            <Sep/>
        </>
    );
};

function GameRowG(stats) {
    return (
        <View style={{ height: gameRowHeight, justifyContent: 'space-around' }}>
            {GameRowTop(stats)}
            <View style={styles.row}>
                {GameRowCell(stats.stat.decision, false)}
                {GameRowCell(stats.stat.saves, false)}
                {GameRowCell(stats.stat.shotsAgainst, false)}
                {GameRowCell(stats.stat.savePercentage, false)}
            </View>
        </View>
    );
};

export function GameStats({stats, goalieVariant}) {
    const header = (goalieVariant ? GameRowHeaderG : GameRowHeaderFD);
    const row = (goalieVariant ? GameRowG : GameRowFD)
    return (
        <>
            {header()}
            <FlatList
                style={styles.gamesList}
                data={stats}
                keyExtractor={(item, index) => `game${index}`}
                renderItem={({idx, item, seps}) => row(item)}
                getItemLayout={(data, index) => (
                    {length: gameRowHeight, offset: gameRowHeight * index, index}
                )}
                ItemSeparatorComponent={Sep}
            />
        </>
    );
};


// use variable so it's easy to use in multiple places
const gameRowHeight = 50;
const listWidth = 350;
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginBottom: 2,
        paddingLeft: 3,
        justifyContent: 'space-between'
    },
    rowTop: {
        width: listWidth,
        flexDirection: 'row',
        paddingLeft: 3,
        marginTop: 2,
    },
    gamesList: {
        width: listWidth,
        flexGrow: 0,
        height: 500,
    },
    gameRowCell: { 
        alignItems: 'center',
        justifyContent: 'center',
        width: 39,
    },
});