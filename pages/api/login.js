import { config } from "dotenv";
import { MongoClient } from "mongodb";

export default function handler(req, res) {

    const email = req.body.formInput.email;
    const password = req.body.formInput.password;

    const user = {email, password}
    console.log('user object is ', user)

    findOne(user).then((loginResult) => {
    
        if(loginResult!=null){
            console.log('logged in')
            res.status(200).json({user: loginResult})
        }else{
            console.log("couldn't log in")
            res.status(204).json({user: null});
        }

    });

    /*
    const loginRes = logIn(user);
    console.log('login returns:',loginRes);
    
    if(loginResult.length!=0){
        res.status(200).send('logged in');
    }else{
        res.status(204).send("couldn't log in");
    }


  }

    async function logIn(user) {

    const uri = process.env.DB_URI;
    MongoClient.connect(uri, function(err, client) {
        if (err) throw err;

        var db = client.db('galacticDb');
        var email2 = user.email;
        var pass2 = user.password;
        console.log(email2 , pass2)
        let l = db.collection("Users").find({ email: email2, password: pass2 }).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            console.log('result length: ',result.length);
            client.close();
            //return result.length;
          });
          
      });
          */
}


async function findOne(user) {
    const url = process.env.DB_URI;
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const email = user.email;
        const pass = user.password;
        const db = client.db("galacticDb");
        let collection = db.collection('Users');
        let res = await collection.findOne({email});
        const bcrypt = require('bcrypt');
        if(bcrypt.compareSync(user.password, res.password)){
        console.log('password is',res.password);
        console.log('password comparing result is',bcrypt.compareSync(pass, res.password));
        return res;
        }
        return null;
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }

}