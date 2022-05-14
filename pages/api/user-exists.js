import { config } from "dotenv";
import { MongoClient } from "mongodb";

export default function handler(req, res) {

    const username = req.body.formInput.username;
    console.log('username is', username)

    findOne(username).then((loginResult) => {
    
        if(loginResult!=null){
            console.log('user exists')
            res.status(409).send('username exists');
        }else{
            console.log("user doesn't exists")
            res.status(200).send("username doesn't exist");
        }

    });
}


async function findOne(username) {
    const url = process.env.DB_URI;
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("galacticDb");
        let collection = db.collection('Users');
        let res = await collection.findOne({'username': username});
        console.log('found usernames: ', res)
        return res;
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }

}