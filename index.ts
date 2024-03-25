
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import * as openbook from '@openbook-dex/openbook-v2';
import { Program, BN, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import * as splToken from "@solana/spl-token";
const { exec } = require('child_process');

import * as fs from 'fs';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export async function main() {
    let connection = new Connection("http://202.8.8.12:8899");

    let leader_schedule = await connection.getLeaderSchedule();
    
    while(true) {
        let slot = await connection.getSlot();
        console.log("current slot is : " + slot);
        let next_leader_schedule_slot = leader_schedule["B4dn3WWS95M4qNXaR5NTdkNzhzvTZVqC13E3eLrWhXLa"];
        console.log("leader schedule is " + next_leader_schedule_slot.toString());
        let current_epoch_info = await connection.getEpochInfo();
        let beginning_slot = current_epoch_info.epoch * current_epoch_info.slotsInEpoch;
        let value  = next_leader_schedule_slot.find(x => beginning_slot + x > slot)
        if (value) {
            console.log(beginning_slot)
            const next_leader_slot  = beginning_slot + value;
            console.log("next leader slot is " + next_leader_slot);
            const wait_till_slot = next_leader_slot - 100;
            while (await connection.getSlot() < wait_till_slot) {
                await delay(1000);
            }
            console.log("Current break slot " + await connection.getSlot());

            exec('tcpdump -G 50 -W 1 \
            dst port 8009 \
            -w ' + next_leader_slot + '.pcap', (err: String, stdout: String, stderr: String) => {
                // your callback
                console.error(err);
                console.log(stdout);
                console.error(stderr);
              });
            await delay(60 * 1000);
        }
    }

}

main().then(x => {
    console.log('finished sucessfully')
}).catch(e => {
    console.log('caught an error : ' + e)
})