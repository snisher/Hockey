import * as firebase from 'firebase';
import 'firebase/firestore';

export const firebaseConfig = {
    
};

export async function saveContract(playerId, salary, years, teamId) {
    console.log(`Writing contract: playerId=${playerId}, salary=${salary}, years=${years}, teamId=${teamId}`);
    if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig); // initialize if not yet initialized
    const db = await firebase.firestore();

    // first check if a contract for this player / team exists so we can store the details that will be overwritten
    const contractRef = db.doc(`teams/${teamId}/contracts/${playerId}`);
    const contract = await contractRef.get();
    
    writeLog(playerId, teamId, false, contract.data() ?? null); // log (and write overwritten contract to storage if it existed)
    contractRef.set({
        salary: salary,
        years: years,
        lost: false
    }).catch(err => console.error(err));
}

export async function updateContractLost(playerId, teamId, lost) {
    console.log(`Updating contract: playerId=${playerId}, teamId=${teamId}, lost=${lost}`);
    if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig); // initialize if not yet initialized
    const db = await firebase.firestore();
    writeLog(playerId, teamId, false); // log the delete, write deleted contract to storage
    db.doc(`teams/${teamId}/contracts/${playerId}`).update({
        lost: lost
    }).catch(err => console.error(err));
}

export async function deleteContract(playerId, teamId) {
    console.log(`Deleting contract: playerId=${playerId}, teamId=${teamId}`);
    if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig); // initialize if not yet initialized
    const db = await firebase.firestore();

    // first check if a contract for this player / team exists so we can store the details that will be deleted
    const contractRef = db.doc(`teams/${teamId}/contracts/${playerId}`);
    const contract = await contractRef.get();
    if (contract.exists) {
        writeLog(playerId, teamId, true, contract.data()); // log the delete, write deleted contract to storage
        contractRef.delete().catch(err => console.error(err));
    }
}

// writes a log entry
// optionally, include an old contract to store it in a teams old contracts collection
async function writeLog(playerId, teamId, del=false, contract=null) {
    if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig); // initialize if not yet initialized
    const db = await firebase.firestore();
    const d = new Date();
    db.doc(`logs/${d.toISOString()}`).set({
        date: d,
        playerId: playerId,
        teamId: teamId,
        deleted: del
    }).catch(err => console.error(err));
    if (contract != null) {
        db.doc(`teams/${teamId}/old_contracts/${playerId}-${d.toISOString()}`).set(contract).catch(err => console.error(err));
    }
}