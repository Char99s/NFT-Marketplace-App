import { config } from "dotenv";
import { MongoClient } from "mongodb";

export default function handler(req, res) {

    const u1 = req.body.userToFetch;
    console.log("u1 is", u1)
    find(u1).then((TransactionResults) => {
    
        if(TransactionResults!=null){
            console.log('Transactions found', TransactionResults)
            res.status(200).json({transactions: TransactionResults})
        }else{
            console.log("Transactions not found")
            res.status(204).send('no transactions');
        }

    });

  }

async function find(u1) {
    const url = process.env.DB_URI;
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db("galacticDb");
        let collection = db.collection('Transactions');
        console.log('query is ', u1)
        let history = await collection.find({username : u1}).toArray();
        console.log("history is", history)
        return history;
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }

}