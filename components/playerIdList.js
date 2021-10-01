import React, {useState} from 'react';
import {
    View, TextInput, Text, Pressable, StyleSheet, FlatList
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { Ionicons } from '@expo/vector-icons'; 

function PlayerIdItem(item, onItemPress) {
    return (
        <Pressable 
            style={styles.pressable} 
            onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            onPress={() => onItemPress(item)}> 
            <Text style={{ paddingLeft: 6, color: 'white' }}>
                {item.name}
            </Text>
        </Pressable>
    );
};

const ListEmptyComponent = (
    <Pressable 
        style={{
            flex: 1,
            flexDirection: 'column',
            alignSelf: 'stretch',
            height: 30,
        }}
        onPress={() => null}>
        <Text style={{ color: 'pink', marginTop: 7, paddingLeft: 6 }}>
            No results found...
        </Text>
    </Pressable>
);

function Dropdown({id, playersToShow, onItemPress}) {
    if (id !== '') {
        return (
            <FlatList
                style={styles.flatList}
                data={playersToShow}
                keyExtractor={(item, index) => item.id.toString()}
                renderItem={({idx, item, seps}) => PlayerIdItem(item, onItemPress)}
                getItemLayout={(data, index) => (
                    {length: 36.1, offset: 36.1 * index, index} // 36 specified in playerIdList style (TODO)
                )}
                ItemSeparatorComponent={() => {
                    return ( 
                        <View style={{
                            height: .1,
                            borderBottomColor: 'grey',
                            borderBottomWidth: StyleSheet.hairlineWidth
                        }}/>
                    );
                }}
                ListEmptyComponent={ListEmptyComponent}
            />
        );
    } else return <></>;
};

function PlayerSearchInput({value, setValue, onChangeText}) {
    let style = (value == '' ?
        styles.emptyIconAndInput :
        {...styles.emptyIconAndInput, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
    );
    return (
        <View style={style}>
            <Ionicons name='search' size={24} color='white' style={{ marginHorizontal: 3 }} />
            <TextInput
                style={styles.input}
                returnKeyType='done'
                onChangeText={text => onChangeText && onChangeText(text)}
                value={value}
                autoCorrect={false}
                keyboardAppearance='dark'
            />
            {value != '' &&
                <Pressable  marginRight={4} onPress={() => setValue('')}>
                    <Ionicons name='close' size={24} color='white' />
                </Pressable>
            }
        </View>
    );
};

function searchPlayers(players, str) {
    // only return players when at least 3 search letters have been entered
    if (str.length === 0) {
        return [];
    }
    return players.filter(obj => (obj.name.toLowerCase()).includes(str.toLowerCase()));
}

export function PlayerSearch({playerIds, onItemPress, fillOnPress }) {
    const [id, setId] = useState(''); // 8477934
    const [playersToShow, setPlayersToShow] = useState([]);
    const [playerSelected, setPlayerSelected] = useState(false);

    const searchOnChangeText = (text) => {
        setPlayersToShow(searchPlayers(playerIds, text));
        setId(text);
        if (typeof playerSelected === 'boolean' && playerSelected) {
            setPlayerSelected(false);
        }
    };
    let onPress = onItemPress;
    if (typeof fillOnPress === 'boolean' && fillOnPress) {
        onPress = (item) => {
            // fill the name and empty the dropdown (shows an item was selected)
            setId(item.name);
            setPlayersToShow([]);
            setPlayerSelected(true);
            onItemPress(item);
        }
    }

    return (
        <View style={{ display: 'flex', width: '100%'}}>
            <PlayerSearchInput value={id} setValue={setId} onChangeText={searchOnChangeText} />
            {/* hide dropdown if a player is selected */
                !playerSelected
                &&
                <View style={{ flexShrink: 1}}>
                    <Dropdown id={id} playersToShow={playersToShow} onItemPress={onPress} />
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    pressable: {
        flex: 1,
        flexDirection: 'column',
        alignSelf: 'stretch',
        height: 36,
        justifyContent: 'center'
    },
    emptyIconAndInput: {
        height: 35,
        borderRadius: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1.5,
        borderColor: 'white',
    },
    input: {
        height: 50,
        fontSize: 14,
        marginRight: 12,
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        color: 'white'
    },
    flatList: {
        display: 'flex',
        alignContent: 'stretch',
        marginTop: 0,
        marginBottom: 20,
        backgroundColor: '#2c3435',
        flexGrow: 0,
        borderWidth: 1,
        borderColor: 'white',
        borderTopWidth: 0,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
    },
});