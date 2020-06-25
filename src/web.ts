const express = require('express');
const app = express();
app.set('view engine', 'pug');

function web(data) {
    console.log("web web web");
    app.get("/", function (req, res) {
        res.render('list',
        {
            dataString: JSON.stringify(data, null, 2),
            data: data
        })
    });

    app.get("/:event_id", function (req, res) {
        res.render('chart',
            {
                event_id: req.params.event_id,
                dataString: JSON.stringify(data, null, 2),
                data: data
            })
    });

    app.get("/scripts/chartscript.js?:event_id", function (req, res) {
        // let path = __dirname + "/views/" + req.params.script_name;
        // console.log(path);
        // res.sendFile(path);
        res.type('.js');
        let event = data[req.params.event_id];
        res.send(chartScript(event.question, event.votes));
    });

    app.listen(8091, function () {
        console.log('pollvis listing on :8091');
    });
}

function chartScript(question, votes) {
    //{"🌊":{"name":"option 2","count":1},"❤":{"name":"️ option 1","count":1}}
    let labels = Object.values(votes).map(function(v:any) {return v.name});
    let counts = Object.values(votes).map(function(v:any) {return v.count});
    
    return `var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
            label: '${question}',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: ${JSON.stringify(counts)}
        }]
    },
    options: {}
});`;
}


export default web;