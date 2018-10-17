export class Token {
    Precision: number;
    Name: string;
    Category: string;
    Amount: number;
    CoinbaseAddress: string;
    Email: string;
    Network: string;
}

export class CreateTokenResponse {
    Address: string;
    BchAmount: number;
}