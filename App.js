import React, { useState, useEffect, useRef } from 'react';
import { 
    View,
    Text,
    Pressable,
    StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Games } from './components/games'
import { PlayerSearchPage } from './components/playerSearch'
import { Contracts } from './components/contracts'
import { GetPlayerIds } from './services/nhl-api';
import { firebaseConfig } from './services/contracts-api';
import * as firebase from 'firebase';
import 'firebase/firestore';

function PageBarButton(pageId, setPage, page) {
    let color;
    if (page === pageId) { // highlighted page
        color = highlightColor;
    } else {
        color = pageBarbgColor;
    };

    let PageIcon;
    if (pageId === 'players') {
        PageIcon = <MaterialIcons name='person-outline' size={35} color={color} style={{ marginHorizontal: 6 }} />;
    } else if (pageId === 'contracts') {
        PageIcon = <MaterialIcons name='attach-money' size={32} color={color} style={{ marginHorizontal: 6 }} />;
    } else {
        PageIcon = (
            <Text style={{
                fontSize: 14,
                fontWeight: '800',
                color: color,
                borderWidth: 2.5,
                borderColor: color,
                overflow: 'hidden',
                borderRadius: 5,
                paddingHorizontal: 1,
                paddingTop: 1,
                textAlign: 'center',
            }}>
                VS
            </Text>
        );
    };
    return (
        <Pressable
            key={pageId}
            style={styles.pageButton}
            onPress={() => {
                setPage(pageId);
            }}
        >
            {PageIcon}
        </Pressable>
    );
};

function PageBar({page, setPage}) {
    return (
        <View style={styles.pageBar}>
            {PageBarButton('games', setPage, page)}
            {PageBarButton('players', setPage, page)}
            {PageBarButton('contracts', setPage, page)}
        </View>
    )
};

export default function App() {
    const [page, setPage] = useState('games');
    // games persistent state
    const [games, setGames] = useState({ live: [], upcoming: [], concluded: [] });
    const [date, setDate]  = useState(new Date());

    const [playerIds, setPlayerIds] = useState([]);
    const [forceRefreshPlayerIds, setForceRefreshPlayerIds] = useState(false);

    const [contracts, setContracts] = useState([]);

    const teamIds = useRef(new Set()); // set of team ids

    const contractMap = useRef({});
    const nameMap = useRef({});

    const unsubscribe = useRef(() => void 0); // will hold the firestore onSnapshot unsubscribe function

    // load all player IDs and contracts
    useEffect(() => {
        // get player IDs
        (GetPlayerIds(forceRefreshPlayerIds)).then(ids => {
            setPlayerIds(ids);
            for (const p of ids) nameMap.current[p.id] = p.name;
        });
        if (forceRefreshPlayerIds) setForceRefreshPlayerIds(false); // if true, reset to false after fetching

        // get contracts
        (async () => {
            if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig); // initialize if not yet initialized
            const db = await firebase.firestore();

            unsubscribe.current(); // unsub from any old listeners if any
            unsubscribe.current = db.collectionGroup('contracts').onSnapshot(
                (contractsSnaps) => { // successful query callback
                    const cs = contractsSnaps.docs.map(c => {
                        return ({
                            playerId: c.id,
                            team: c.ref.parent.parent.id,
                            lost: c.get('lost') ?? false,
                            years: c.get('years') ?? NaN,
                            salary: c.get('salary') ?? NaN,
                        });
                    });
                    console.log('fetched contracts');
                    setContracts(cs);
                    // also map the player ID to the player, and add team id to set of teams
                    for (const c of cs) {
                        contractMap.current[c.playerId] = c;
                        teamIds.current.add(c.team);
                    }
                },
                (err) => console.error(err) // error callback
            );
        })();
    }, []);

    function getPage(page) {
        switch (page) {
            case 'games':
                return (
                    <Games 
                        key={'gamesPage'}
                        games={games}
                        setGames={setGames}
                        date={date}
                        setDate={setDate}
                    />
                );
            case 'players':
                return <PlayerSearchPage key={'playersPage'} playerIds={playerIds} contractMap={contractMap} />;
            case 'contracts':
                return <Contracts 
                    key={'contractsPage'}
                    playerIds={playerIds}
                    contracts={contracts}
                    teamIds={teamIds}
                    nameMap={nameMap}
                />;
            default:
                return <Text>no page...</Text>;
        };
    };

    return (
        <View style={styles.container}>
            <View style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', flex: 1 }}>
                {getPage(page)}
            </View>
            <View>
                <PageBar page={page} setPage={setPage} />
            </View>
        </View>
    );
};

const bgColor = '#262c2d';
const pageBarbgColor = '#444d4f';
const highlightColor = '#e7f429';
const pageBarHeight = 90;
const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: '100%',
        backgroundColor: bgColor,
        alignItems: 'center',
        paddingTop: 50,
        justifyContent: 'space-between',
    },
    pageBar: {
        flexDirection: 'row',
        height: pageBarHeight,
        width: '100%',
        backgroundColor: pageBarbgColor,
        padding: 3,
        zIndex: -1,
    },
    pageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey',
        height: pageBarHeight-40,
        margin: 3,
        borderRadius: 2,
    },
});
    