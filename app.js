require('dotenv').config()
const axios = require('axios')
const https = require("https");
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());


//TELEGRAM_Token, Url:
const token = process.env.TOKEN;
const url = process.env.SERVER_URL;
const TELEGRAM_API = 'https://api.telegram.org/bot' + token;
const URI = '/webhook/' + token;
const WEBHOOK_URL = url + URI


const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data)
}

//WIKIPEDIA_API URL:
const start =
'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=';

const end = '&utf8=&format=json'

//Receives messages and replies after fetching data from Wikipedia's API:
app.post(URI, (req, res) => {
    console.log(req.body)
    const chatId = req.body.message.chat.id
    let text = req.body.message.text
    const randomUrl = start + text + end;
    https.get(randomUrl, function(response){
        console.log(response.statusCode);
        response.on("data", function(data){
            const wikiData = JSON.parse(data);
            const summary = wikiData.query.search[0].snippet;
            text = summary;
            text = stripTag(text);
            axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: text
            })
            return res.send()
        })
    })
})

//Get rid of HTML tags if present in the message to be send:
function stripTag(text){
    let str = "";
    let found = false;
    for(var i = 0; i<text.length;i++){
        let x = text[i];
        if(x === "<")
            found = true;
        else if(found && x === ">")
            found = false;
        else if(!found)
            str += x;
    }
    console.log(":::::::::::::::");
    console.log(str);
    return str;
}


// app.get("/", function(req, res){
//     res.sendFile(__dirname + "/index.html");
// });

// app.post("/", function(req, res){
//     const randomUrl = start + req.body.searchItem + end;
//     https.get(randomUrl, function(response){
//         console.log(response.statusCode);
//         response.on("data", function(data){
//             const wikiData = JSON.parse(data);
//             const summary = wikiData.query.search[0].snippet;
//             res.send(summary);
//         })
//     }) 
// });


app.listen(process.env.PORT || 3000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 3000)
    await init()
})