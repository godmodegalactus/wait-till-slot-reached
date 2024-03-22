
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
    let connection = new Connection("https://mango.rpcpool.com/7ea66877e68a97698f654b5e7a0f");

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
            let next_leader_slot  = beginning_slot + value;
            console.log("next leader slot is " + next_leader_slot);
            while (next_leader_slot != undefined && (await connection.getSlot() < next_leader_slot - 100)) {
                await delay(10 * 1000);
                console.log("still waiting");
            }

            exec('tcpdump -i wlan0  \
            dst port 80 \
            -w ' + next_leader_slot + '.pcap', (err: String, stdout: String, stderr: String) => {
                // your callback
                console.error(err);
                console.log(stdout);
                console.error(stderr);
              });
        }
    }

}

main().then(x => {
    console.log('finished sucessfully')
}).catch(e => {
    console.log('caught an error : ' + e)
})