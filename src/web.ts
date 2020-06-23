const express = require('express');
const app = express();
app.set('view engine', 'pug');

function web(data) {
    console.log("web web web");
    app.get("/", function (req, res) {
        res.render('list',
        {
            dataString: JSON.stringify(data),
            data: data
        })
    });

    app.get("/:event_id", function (req, res) {
        res.render('chart',
            {
                event_id: req.params.event_id,
                dataString: JSON.stringify(data),
                data: data
            })
    });

    app.listen(8091, function () {
        console.log('pollvis listing on :8091');
    });
}


export default web;