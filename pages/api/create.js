import { config } from "dotenv";
import { MongoClient } from "mongodb";

export default function handler(req, res) {

    const username = req.body.formInput.username;
    const email = req.body.formInput.email;
    const password = req.body.formInput.password;
    const createdAt = new Date();

    const user = {username, email, password, createdAt}
    console.log('user object is ', user)

    signUp(user);
    
    res.status(201);
    res.json({ user: {username, email, password, createdAt} })

  }

  /*
  async function connectToCluster(uri) {
    let mongoClient;

    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');

        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
}
*/

async function signUp(user) {
    /*
    const uri = process.env.DB_URI;
    let mongoClient;

    try {
        mongoClient = await connectToCluster(uri);

        const result = await mongoClient.collection("users").insertOne({user}, function(err, res) {
            if (err) throw err;
            console.log("User inserted");
          });

    } finally {
        await mongoClient.close();
    }
    */
    const uri = process.env.DB_URI;
    const bcrypt = require('bcrypt');
    
    const salt = await bcrypt.genSaltSync(10);
    user.password = await bcrypt.hashSync(user.password, salt);

    console.log('user object after bcrypt is ', user)
    
    MongoClient.connect(uri, function(err, client) {
        if (err) throw err;

        var db = client.db('galacticDb');

        db.collection("Users").insertOne(user, function(err, res) {
            if (err) throw err;
            console.log("1 user inserted");
            client.close();
        });
      });
}