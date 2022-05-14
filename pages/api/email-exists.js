import { config } from "dotenv";
import { MongoClient } from "mongodb";

export default function handler(req, res) {

    const email = req.body.formInput.email;
    console.log('email is', email)

    findOne(email).then((loginResult) => {
    
        if(loginResult!=null){
            console.log('email exists')
            res.status(409).send('email exists');
        }else{
            console.log("email doesn't exists")
            res.status(200).send("email doesn't exist");
        }

    });
}


async function findOne(email) {
    const url = process.env.DB_URI;
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("galacticDb");
        let collection = db.collection('Users');
        let res = await collection.findOne({'email': email});
        console.log('found usernames: ', res)
        return res;
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }

}