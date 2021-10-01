import React, { View, useState } from 'react';
import {
    Modal
} from 'react-native';
import NumberPlease from 'react-native-number-please';
import { PlayerSearchInput } from './playerSearchInput';

export function AddContract({modalVisible, setModalVisible}) {
    // player
    const [playerId, setPlayerId] = useState(-1);

    // contract cost
    const initCost = [{ id: "cost", value: 5 }];
    const [cost, setCost] = useState(initCost);
    const costNumbers = [{ id: "cost", min: 1, max: 200 }];

    // contract years
    const initYears = [{ id: "years", value: 1 }];
    const [years, setYears] = useState(initYears);
    const yearsNumbers = [{ id: "years", min: 1, max: 3 }];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <View style={{ marginTop: 50 }}>
                <PlayerSearchInput value={playerId} setValue={setPlayerId} />
                <NumberPlease
                    digits={yearsNumbers}
                    values={years}
                    onChange={(value) => setYears(value)}
                />
                <NumberPlease
                    digits={costNumbers}
                    values={cost}
                    onChange={(value) => setCost(value)}
                />
            </View>
        </Modal>
    );
}