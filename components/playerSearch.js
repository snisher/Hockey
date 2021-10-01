import React, { useState } from 'react';
import { 
    Text,
    View,
    Modal,
} from 'react-native';
import { PlayerSearch } from './playerIdList';
import { PlayerStats } from './playerStats';

export function PlayerSearchPage({playerIds, contractMap}) {
    const [year, setYear] = useState('20212022');
    const [player, setPlayer] = useState({});
    const [modalVisible, setModalVisible] = useState(false);

    const onSearchItemPress = (item) => {
        setPlayer(item);
        setModalVisible(true);
    }

    return (
        <View style={{ height: 600, width: '70%', alignItems: 'center' }}>
            <Text style={{fontSize: 30, marginTop: 20, marginBottom: 40, color: 'white', alignSelf: 'center' }}>
                Player Search
            </Text>
            <View style={{display: 'flex', width: '100%'}}>
                <PlayerSearch playerIds={playerIds} onItemPress={onSearchItemPress} />
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <PlayerStats 
                    player={player}
                    contractMap={contractMap}
                    year={year}
                    setModalVisible={setModalVisible}
                />
            </Modal>
        </View>
    );
};