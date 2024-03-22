import * as splToken from "@solana/spl-token";
import {
    PublicKey,
    Connection,
    Keypair,
} from "@solana/web3.js";

export interface TokenData {
    mint : PublicKey,
    startingPrice : number,
    nbDecimals: number,
    priceOracle: Keypair,
}

export class MintUtils {

    private conn: Connection;
    private authority: Keypair;

    private recentBlockhash: string;


    constructor(conn: Connection, authority: Keypair) {
        this.conn = conn;
        this.authority = authority;
        this.recentBlockhash = "";
    }

    async createMint(nb_decimals = 6) : Promise<PublicKey> {
        const kp = Keypair.generate();
        return await splToken.createMint(this.conn, 
            this.authority, 
            this.authority.publicKey, 
            this.authority.publicKey, 
            nb_decimals,
            kp)
    }

    public async createTokenAccount(mint: PublicKey, payer: Keypair, owner: PublicKey) {
        const account = Keypair.generate();
        return splToken.createAccount(
            this.conn,
            payer,
            mint,
            owner,
            account
        )
    }
}