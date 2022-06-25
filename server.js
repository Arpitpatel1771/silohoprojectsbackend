var http = require("http");
var fs = require("fs");
const { parse } = require("csv-parse");
var url = require('url');

//I have changed the html file a bit, take a look at it as well

const recordLimit = 50;
const dataset = "test.csv";
let currentquery = "aaa";
let previousquery = "aaa";

const rawdata = []; //extracted from csv and sorted with smallest string first
const indexes = {}; //nested objects that help in searching

const result = {
    //select2 results
    "results": [],
    "pagination": {
        "more": false
    }
};

const startsWith = (a, b) => {
    //does b start with a? 1: 0
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a.length > b.length) {
        return 0;
    }
    let score = 0;
    let i = 0;
    while (i < a.length && i < b.length) {
        if (a[i] === b[i]) {
            score++;
        } else {
            break;
        }
        i++;
    }
    if (score === a.length) {
        return 1;
    }

    return 0;
}


const calculateScore = (a, b) => {
    //score is proportional to length of substring starting from pos 0
    a = a.toLowerCase();
    b = b.toLowerCase();
    let score = 0;
    let i = 0;
    while (i < a.length && i < b.length) {
        if (a[i] === b[i]) {
            score++;
        } else {
            break;
        }
        i++;
    }
    score = parseFloat((2 * score / (a.length + b.length)) * 100).toFixed(2);

    return score;
};

const constructIndex = (data) => {
    data.forEach((el) => {
        let key1 = el.slice(0, 1).toLowerCase();
        let key2 = el.slice(1, 2).toLowerCase();
        let key3 = el.slice(2, 3).toLowerCase();
        if (indexes[key1] === undefined) {
            indexes[key1] = {};
            indexes[key1][key2] = {};
            indexes[key1][key2][key3] = [el];
        } else {
            if (indexes[key1][key2] === undefined) {
                indexes[key1][key2] = {};
                indexes[key1][key2][key3] = [el];
            } else {
                if (indexes[key1][key2][key3] === undefined) {
                    indexes[key1][key2][key3] = [el];
                } else {
                    indexes[key1][key2][key3].push(el);
                }
            }
        }
    });
};

const constructResult = (indexes, el, rawdata) => {
    if (previousquery === currentquery) return;

    let arr = [];
    let key1 = el.slice(0, 1).toLowerCase();
    let key2 = el.slice(1, 2).toLowerCase();
    let key3 = el.slice(2, 3).toLowerCase();

    if (arr.length < recordLimit) {
        if (indexes[key1] !== undefined) {
            if (indexes[key1][key2] !== undefined) {
                if (indexes[key1][key2][key3] !== undefined) {
                    indexes[key1][key2][key3].forEach((str) => {
                        if (startsWith(el, str) === 1) {
                            arr.push({
                                "text": str,
                                "score": calculateScore(el, str)
                            });
                        }
                    })
                }
            }
        }
    }
   
    if (arr.length < recordLimit) {
        let i = 0;
        while (arr.length < recordLimit) {
            if (startsWith(el, rawdata[i]) === 0) {
                arr.push({
                    "text": rawdata[i],
                    "score": calculateScore(el, rawdata[i])
                });
            }
            i++;
        }
        
    }


    arr.sort((a, b) => {
        let numa = parseFloat(a["score"]);
        let numb = parseFloat(b["score"]);

        if (startsWith(el, a["text"]) === 1 && startsWith(el, b["text"]) === 0) {
            //prioritize strings that start with query term
            return -1;
        } else if (startsWith(el, a["text"]) === 0 && startsWith(el, b["text"]) === 1) {
            return 1;
        } else if (a["text"].length === b["text"].length) {
            return numb - numa;
        } else {
            return a["text"].length - b["text"].length;
        }
    });

    arr = arr.splice(0, recordLimit);

    let temparr = [];
    arr.forEach((a, ind) => {
        if (a["score"] === -1) {
            a["score"] = 0;
        }
        temparr.push({
            "id": ind + 1, ...a
        });
    })
    result.results = temparr;

    previousquery = currentquery;
}

fs.createReadStream(dataset)
    .pipe(
        parse({
            delimiter: ",",
            from_line: 2,
            relax_column_count: true,
            ltrim: true,
            rtrim: true,
            skip_empty_lines: true,
            skip_records_with_empty_values: true,
        })
    )
    .on("data", function (row) {
        row = row.join(" ").trim();
        rawdata.push(row);
    })
    .on("end", function () {
        constructIndex(rawdata);
        console.log("Starting server...");
        http
            .createServer(function (req, res) {
                res.writeHead(200, {
                    "Content-Type": "text/html",
                    "Access-Control-Allow-Origin": "*",
                });
                var q = url.parse(req.url, true).query;
                if (q.term === undefined) {
                    q.term = "aaa";
                }
                currentquery = q.term;
                if(currentquery !== undefined && currentquery.trim().length >= 3){
                    constructResult(indexes, currentquery, rawdata);
                    res.write(JSON.stringify(result));
                }
                res.end();

            })
            .listen(3001);
    })
    .on("error", function (error) {
        console.log(error.message);
    });

