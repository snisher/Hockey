import React from 'react';
import { Text, View, StyleSheet, Pressable, FlatList } from 'react-native';

  //////////////////
 // SEASON STATS //
//////////////////
function seasonRow(label, value) {
    return (
        <View style={styles.seasonRow}>
            <View style={{width: 150}}>
                <Text style={{ color: 'white', fontWeight: '900' }}>
                    {label}
                </Text>
            </View>
            <View style={{width: 100}}>
                <Text style={{ color: 'white' }}>
                    {value}
                </Text>
            </View>
        </View>
    );
};

function sep() { 
    return (
        <View style={{
            height: .1,
            borderBottomColor: 'white',
            borderBottomWidth: StyleSheet.hairlineWidth,
        }}/>
    );
};

function FDStats({stats}) {
    return ( 
        <View style={styles.statsTable}>
            {seasonRow('Goals:', `${stats.goals ?? 'NaN'}   (${stats.powerPlayGoals ?? 'NaN'} PP)`)}
            {sep()}
            {seasonRow('Assists:', `${stats.assists ?? 'NaN'}   (${stats.powerPlayPoints-stats.powerPlayGoals ?? 'NaN'} PP)`)}
            {sep()}
            {seasonRow('Points:', `${stats.points ?? 'NaN'}   (${stats.powerPlayPoints ?? 'NaN'} PP)`)}
            {sep()}
            {seasonRow('PPG Avg:', `${(stats.points / stats.games).toFixed(2) ?? 'NaN'}`)}
            {sep()}
            {seasonRow('+/-:', `${stats.plusMinus ?? 'NaN'}`)}
            {sep()}
            {seasonRow('Shots:', `${stats.shots ?? 'NaN'}`)}
            {sep()}
            {seasonRow('Shooting Pct:', `${stats.shotPct ?? 'NaN'}`)}
            {sep()}
            {seasonRow('Hits:', `${stats.hits ?? 'NaN'}`)}
            {sep()}
            {seasonRow('Blocked Shots:', `${stats.blocked ?? 'NaN'}`)}
            {sep()}
            {seasonRow('Games Played:', `${stats.games ?? 'NaN'}`)}
            {sep()}
            {seasonRow('Average TOI:', `${stats.timeOnIcePerGame ?? 'NaN'}`)}
        </View>
    );
};

function GStats({stats}) {
    return ( 
        <View style={styles.statsTable}>
            {seasonRow('Wins:', `${stats.wins}`)}
            {sep()}
            {seasonRow('Losses:', `${stats.losses}`)}
            {sep()}
            {seasonRow('OT Wins:', `${stats.ot}`)}
            {sep()}
            {seasonRow('Save Pct:', `${stats.savePercentage}`)}
            {sep()}
            {seasonRow('GAA:', `${stats.goalAgainstAverage}`)}
            {sep()}
            {seasonRow('Shutouts:', `${stats.shutouts}`)}
            {sep()}
            {seasonRow('Shots Against:', `${stats.shotsAgainst}`)}
        </View>
    );
};

export function SeasonStats({stats, goalieVariant}) {
    JSX = (goalieVariant ? GStats : FDStats);
    return (
        <JSX stats={stats} />
    );
};

const styles = StyleSheet.create({
    seasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 25,
        marginBottom: 2,
        marginTop: 2,
        paddingRight: 10,
        paddingLeft: 10,
    },
    statsTable: {
        width: 350,
        marginTop: 10,
        paddingBottom: 2,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#3d3d3d',
        height: 30,
        borderBottomColor: 'white',
        borderBottomWidth: 1,
    },
    tabButtonHighlightStyleLeft: {
        borderRightColor: 'white',
        borderRightWidth: 1,
        borderBottomWidth: 0,
        backgroundColor: '#5d5d5d'
    },
    tabButtonHighlightStyleRight: {
        borderLeftColor: 'white',
        borderLeftWidth: 1,
        borderBottomWidth: 0,
        backgroundColor: '#5d5d5d'
    },
    modalView: {
        margin: 20,
        marginTop: 40,
        paddingBottom: 0,
        height: '90%',
        backgroundColor: '#3d3d3d',
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
});