import { config } from "dotenv";
import { MongoClient } from "mongodb";

export default function handler(req, res) {

    const userAddress = req.body.userAddress;
    const username = req.body.username;
    const nftName = req.body.nftName;
    const cost = req.body.cost;
    const string = req.body.string;
    const createdAt = new Date();

    const transaction = {username, userAddress, string, nftName, cost, createdAt}
    createHistory(transaction)

    res.status(201);
    res.json({ transaction: {username, userAddress, string, nftName, cost, createdAt} })
}

async function createHistory(transaction) {

    const uri = process.env.DB_URI;
    MongoClient.connect(uri, function(err, client) {
        if (err) throw err;

        var db = client.db('galacticDb');

        db.collection("Transactions").insertOne(transaction, function(err, res) {
            if (err) throw err;
            console.log("1 transaction inserted");
            client.close();
        });
      });
}