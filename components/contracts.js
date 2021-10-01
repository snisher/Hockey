import React, { useEffect, useState } from 'react';
import { 
    FlatList,
    ScrollView,
    View,
    Text,
    Pressable,
    StyleSheet,
    Modal,
    Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { capitalize } from '../utils';
import NumberPlease from 'react-native-number-please';
import { PlayerSearch } from './playerIdList';
import * as Haptics from 'expo-haptics';
import { saveContract, updateContractLost, deleteContract } from '../services/contracts-api';
import {Picker} from '@react-native-picker/picker';

const styles = StyleSheet.create({
    flatList: {
        width: '95%',
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: '#2c3435',
        flexGrow: 0,
        flexShrink: 1,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 2
    },
    contractRowCell: {
        fontSize: 18,
        color: 'white',
    },
    contractRowCellHeader: {
        fontSize: 18,
        color: 'white',
        fontWeight: '700',
    },
    teamChip: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        marginHorizontal: 5,
        color: 'white',
        fontSize: 16,
        borderRadius: 2,
        overflow: 'hidden',
    },
    modalView: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: 20,
        marginTop: 40,
        height: '90%',
        backgroundColor: '#0dd100',
        borderRadius: 12,
        padding: 15,
        paddingBottom: 15,
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
    modalViewConfirm: {
        display: 'flex',
        justifyContent: 'space-around',
        margin: 20,
        marginTop: 40,
        height: '90%',
        backgroundColor: '#0dd100',
        borderRadius: 12,
        padding: 15,
        paddingBottom: 15,
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
    modalRow: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 10
    },
    save: {
        marginHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'white',
        borderRadius: 2,
        alignItems: 'center',
        flexGrow: 1
    }
});

function TeamsSelector({allTeams, showTeams, setShowTeams}) {
    return (
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
                color: 'white',
                marginHorizontal: 14,
                flexShrink: 0,
            }}>
                {'Filter\nTeams'}:
            </Text>
            <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {allTeams.map(team => {
                    const teamSelected = showTeams.includes(team);
                    const bgColor = teamSelected ? '#cc3900' : '#2c5b87';
                    return (
                        <Pressable key={team} onPress={() => {
                            if (teamSelected) { // remove team
                                const idx = showTeams.indexOf(team);
                                setShowTeams([...showTeams.slice(0,idx), ...showTeams.slice(idx+1)])
                            } else setShowTeams([...showTeams, team]); // add the team
                        }}>
                            <Text style={{...styles.teamChip, backgroundColor: bgColor}}>{capitalize(team)}</Text>
                        </Pressable>
                    );
                })}
                {<Pressable 
                    key={'clear-show-teams-button'}
                    style={{ marginLeft: 8, marginRight: 20 }}
                    onPress={() => setShowTeams([])}
                >
                    <Ionicons name='close' size={24} color='white' />
                </Pressable>}
            </ScrollView>
        </View>
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
            No contracts found...
        </Text>
    </Pressable>
);

const ListHeaderComponent = (
    <>
        <View style={{ height: 60, alignItems: 'center', flexDirection: 'row', backgroundColor: '#2c3435' }}>
            <Text style={{...styles.contractRowCellHeader, width: '35%', paddingLeft: 5}}>
                Player
            </Text>
            <Text style={{...styles.contractRowCellHeader, width: '28%'}}>
                Team
            </Text>
            <Text style={{...styles.contractRowCellHeader, width: '22%'}}>
                Contract Length
            </Text>
            <Text style={{...styles.contractRowCellHeader, width: '15%'}}>
                Salary
            </Text>
        </View>
        <View style={{
            height: .1,
            borderBottomColor: 'grey',
            borderBottomWidth: 2
        }}/>
    </>
);

function ContractRow(contract, nameMap, setEditContractModalOpen, setSelectedContract) {
    const yrStr = contract.years == '1' ? 'yr' : 'yrs'; // plural if not 1
    let name = nameMap.current[contract.playerId];
    if (name) {
        name = name.split(' ').slice(1).join(' ');
    } else name = contract.playerId;
    const salaryColor = (contract.lost === true) ? '#ce1100' : 'white';
    return (
        <Pressable 
            style={{ height: 40, alignItems: 'center', flexDirection: 'row' }}
            onPress={() => {
                setSelectedContract({...contract, playerName: name});
                setEditContractModalOpen(true);
            }}
        >
            <Text style={{...styles.contractRowCell, width: '35%', paddingLeft: 5}} numberOfLines={1}>
                {name}
            </Text>
            <Text style={{...styles.contractRowCell, width: '28%'}}>
                {capitalize(contract.team)}
            </Text>
            <Text style={{...styles.contractRowCell, width: '22%'}}>
                {contract.years} {yrStr}
            </Text>
            <Text style={{...styles.contractRowCell, color: salaryColor, width: '15%'}}>
                {`$${contract.salary}`}
            </Text>
        </Pressable>
    );
};

function AddContractButton({setAddContractModalOpen}) {
    return (
        <Pressable
            onPress={() => setAddContractModalOpen(true)}
            style={{ 
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-end',
                marginVertical: 20,
                padding: 6,
                paddingHorizontal: 12,
                backgroundColor: 'white',
                borderRadius: 2
            }}
        >
            <Text style={{ color: 'green', fontWeight: '800' }}>New Contract</Text>
            <MaterialCommunityIcons name='pen' size={24} color='grey' />
        </Pressable>
    );
}

function ContractDetail({field, value, prefix}) {
    return (
        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
            <Text style={{color: 'white', fontSize: 18, width: '20%'}}>{field}:</Text>
            <Text style={{color: 'white', fontSize: 30, width: '80%'}} numberOfLines={1}>{prefix ?? prefix}{value}</Text>
        </View>
    );
}

function ConfirmContract({setShowConfirm, setShowModal, setPlayerId, setPlayerName, contract}) {
    return (
        <View style={styles.modalViewConfirm}>
            <Text style={{fontSize: 40, fontWeight: '800', color: 'white'}}>Confirm Contract</Text>
            <View >
                <ContractDetail field='team' value={contract.team} />
                <ContractDetail field='player' value={contract.playerName} />
                <ContractDetail field='salary' value={contract.salary} prefix='$'/>
                <ContractDetail field='years' value={contract.years} />
            </View>

            <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', }}>
                <Pressable key='cancel-save' style={styles.save} onPress={() => {
                    setShowConfirm(false);
                    setPlayerId('');
                    setPlayerName('');
                }} >
                    <Text style={{color: 'red', fontSize: 25, paddingHorizontal: 4}}>Cancel</Text>
                </Pressable>
                <Pressable key='confirm-save' style={styles.save} onPress={() => {
                    saveContract(contract.playerId, contract.salary, contract.years, contract.team, contract.lost);
                    setShowConfirm(false);
                    setShowModal(false);
                    // reset player and lost state; other state (team, years, cost) useful to 'remember'
                    setPlayerId('');
                    setPlayerName('');
                }}>
                    <Text style={{color: 'green', fontSize: 25, paddingHorizontal: 4}}>Save</Text>
                </Pressable>
            </View>
        </View>
    );
}

function AddContractModal({playerIds, teamIds, modalVisible, setModalVisible}) {
    // player
    const [playerId, setPlayerId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [team, setTeam] = useState('fisher');
    // contract salary
    const [salary, setSalary] = useState([{ id: "salary", value: 5 }]);
    const salaryNumbers = [{ id: "salary", min: 1, max: 200 }];
    // contract years
    const [years, setYears] = useState([{ id: "years", value: 1 }]);
    const yearsNumbers = [{ id: "years", min: 1, max: 3 }];

    // show save confirmation
    const [showConfirm, setShowConfirm] = useState(false);

    const isSaveDisabled = () => typeof playerId === 'undefined' || playerId === '';
    
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            {showConfirm ? 
            <ConfirmContract 
                setShowConfirm={setShowConfirm}
                setShowModal={setModalVisible}
                setPlayerId={setPlayerId}
                setPlayerName={setPlayerName}
                contract={{
                    playerId: playerId,
                    playerName: playerName,
                    team: team,
                    salary: salary[0].value,
                    years: years[0].value,
                }}
            />
            :
            <View style={styles.modalView}>
                {/* close button */}
                <View style={{alignSelf: 'flex-end', marginBottom: 30}}>
                    <Pressable onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setModalVisible(false);
                        }}>
                            <Ionicons name='close' size={24} color='red' />
                    </Pressable>
                </View>

                {/* player search */}
                <View style={{...styles.modalRow, height: '20%', alignItems: 'flex-start'}}>
                    <View style={{display: 'flex', width: '80%', alignItems: 'center'}}>
                        <PlayerSearch playerIds={playerIds} fillOnPress onItemPress={(item) => {
                            setPlayerId(item.id);
                            setPlayerName(item.name);
                        }}/>
                    </View>
                </View>

                {/* team selector dropdown */}
                <View style={{width: 200, height: '20%'}}>
                    <Picker
                        selectedValue={team}
                        onValueChange={(itemValue, itemIndex) => setTeam(itemValue)}
                    >
                        {Array.from(teamIds.current).map(id => <Picker.Item key={id} label={id} value={id} />)}
                            
                    </Picker>
                </View>
                
                <View style={styles.modalRow}>
                    {/* contract length selector */}
                    <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Text style={{color: '#ff0291'}}>Length</Text>
                        <NumberPlease
                            digits={yearsNumbers}
                            values={years}
                            onChange={(value) => setYears(value)}
                        />
                    </View>
                    {/* contract salary selector */}
                    <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Text style={{color: '#ff0291'}}>Salary</Text>
                        <NumberPlease
                            digits={salaryNumbers}
                            values={salary}
                            onChange={(item) => setSalary(item)}
                        />
                    </View>
                </View>

                {/* save button on last row */}
                <View style={{width: '100%', height: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    {!isSaveDisabled() && // only show when a player has been selected
                    <Pressable
                        onPress={() => setShowConfirm(true)}
                        style={styles.save}
                    >
                        <Text style={{fontSize: 20, color: '#ff0291', paddingHorizontal: 5}}>Save</Text>
                    </Pressable>
                    }
                </View>
            </View>}
        </Modal>
    );
}

function EditContractModal({contract, modalVisible, setModalVisible}) {
    const [lost, setLost] = useState(contract.lost ?? false); // lost contract

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const lostSwitch = (
        <View style={{justifyContent: 'flex-end', marginHorizontal: 5}}>
            <Switch
                trackColor={{ false: 'grey', true: '#ffdd00' }}
                onValueChange={() => setLost(!lost)}
                value={lost}
            />
        </View>
    );

    // reset the lost state when modal opened
    useEffect(() => {
        if (modalVisible) setLost(contract.lost ?? false);
    }, [modalVisible])
    
    return (
        <Modal
            animationType='slide'
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <View style={styles.modalView}>
                {/* close button */}
                <View style={{alignSelf: 'flex-end', marginBottom: 30}}>
                    <Pressable onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setModalVisible(false);
                        }}>
                            <Ionicons name='close' size={24} color='red' />
                    </Pressable>
                </View>

                <View >
                    <ContractDetail field='team' value={contract.team} />
                    <ContractDetail field='player' value={contract.playerName} />
                    <ContractDetail field='salary' value={contract.salary} prefix='$'/>
                    <ContractDetail field='years' value={contract.years} />
                    <ContractDetail field='lost' value={lostSwitch} />
                </View>

                {showConfirmDelete ? 
                    <View alignItems='center'>
                        <Text style={{color: 'white', fontSize: 30, fontWeight: '600', marginBottom: 20}}>
                            Confirm Delete!
                        </Text>
                        <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', }}>
                            <Pressable key='cancel-delete' style={styles.save} onPress={() => {
                                setShowConfirmDelete(false);
                            }} >
                                <Text style={{color: 'green', fontSize: 25, paddingHorizontal: 4}}>Cancel</Text>
                            </Pressable>
                            <Pressable key='confirm-delete' style={styles.save} onPress={() => {
                                deleteContract(contract.playerId, contract.team);
                                setShowConfirmDelete(false);
                                setModalVisible(false);
                            }}>
                                <Text style={{color: 'red', fontSize: 25, paddingHorizontal: 4}}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                    :
                    <View style={{height: '5%', flexDirection: 'row'}}>
                        {/* save updated contract */}
                        {contract.lost !== lost && // only show when contract has been edited (local state doesn't match)
                            <Pressable
                                onPress={() => {
                                    updateContractLost(contract.playerId, contract.team, lost);
                                    setModalVisible(false);
                                }}
                                style={styles.save}
                            >
                                <Text style={{fontSize: 25, color: '#ffdd00', paddingHorizontal: 5}}>Save</Text>
                            </Pressable>
                        }

                        {/* delete contract */}
                        <Pressable
                            onPress={() => setShowConfirmDelete(true)}
                            style={styles.save}
                        >
                            <Text style={{fontSize: 25, color: 'red', paddingHorizontal: 5}}>Delete</Text>
                        </Pressable>
                    </View>
                }
            </View>
        </Modal>
    );
}

export function Contracts({playerIds, contracts, teamIds, nameMap}) {
    const [showContracts, setShowContracts] = useState([]);
    const [showTeams, setShowTeams] = useState([]);

    const [addContractModalOpen, setAddContractModalOpen] = useState(false);
    const [editContractModalOpen, setEditContractModalOpen] = useState(false);

    const [selectedContract, setSelectedContract] = useState({});

    // when someone selects a team, filter the contracts by the selected teams
    useEffect(() => {
        if (showTeams.length === 0) { // show all contracts if no teams selected
            setShowContracts(contracts);
        } else { // only show contracts from the selected teams
            const filtered = contracts.filter(c => showTeams.includes(c.team));
            setShowContracts(filtered);
        }
    }, [showTeams]);

    // when the contracts change, re-add all contracts to showContracts state, then re-set
    // the showTeams filter so the filtered contracts include the changes to the contracts
    useEffect(() => {
        setShowContracts(contracts); // 
        setShowTeams(Array.from(showTeams));
    }, [contracts])

    // set teams and contracts to show 
    useEffect(() => {
        setShowContracts(contracts);
    }, []);

    return (
        <View style={{ 
            display: 'flex',
            alignItems: 'center',
            marginTop: 20,
            justifyContent: 'space-between'
        }}>
            <Text style={{ fontSize: 30, color: 'white' }}>Contracts</Text>
            <View style={{ flex: 1 }}>
                <FlatList
                    ListHeaderComponent={ListHeaderComponent}
                    stickyHeaderIndices={[0]}
                    style={styles.flatList}
                    data={showContracts}
                    keyExtractor={(item, index) => `${item.playerId.toString()}-${item.team}`}
                    renderItem={({idx, item, seps}) => ContractRow(item, nameMap, setEditContractModalOpen, setSelectedContract)}
                    getItemLayout={(data, index) => (
                        {length: 40.1, offset: 40.1 * index, index}
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
            </View>
            <View style={{ display: 'flex', width: '80%' }}>
                <TeamsSelector allTeams={Array.from(teamIds.current)} showTeams={showTeams} setShowTeams={setShowTeams} />
                <AddContractButton setAddContractModalOpen={setAddContractModalOpen} />
            </View>
            {/* add contract modal */}
            <View style={{ display: 'flex', justifyContent: 'center' }}>
                <AddContractModal
                    playerIds={playerIds}
                    teamIds={teamIds}
                    modalVisible={addContractModalOpen}
                    setModalVisible={setAddContractModalOpen}
                />
            </View>
            {/* edit contract modal */}
            <View style={{ display: 'flex', justifyContent: 'center' }}>
                <EditContractModal
                    modalVisible={editContractModalOpen}
                    setModalVisible={setEditContractModalOpen}
                    contract={selectedContract}
                />
            </View>
        </View>
    );
}