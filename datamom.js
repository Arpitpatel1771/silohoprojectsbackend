//Mother of the dataset
//generates dataset
//will wipeout the original dataset, this will make the testcases provided in the html to not work.
const { uniqueNamesGenerator, names } = require('unique-names-generator');
var fs = require("fs");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

let dataset = "test.csv";
let toDelete = false;
if (fs.existsSync(dataset)) {
    toDelete = true;
}

const csvWriter = createCsvWriter({
    path: dataset,
    header: [
        { id: 'f', title: 'first_name' },
        { id: 'm', title: 'middle_name' },
        { id: 'l', title: 'last_name' }
    ]
});

const data = [];

while (data.length < 300000) {
    let str = uniqueNamesGenerator({
        dictionaries: [names, names, names],
        separator: ",",
        length: 3
    }).split(",");

    let obj = {
        f: str[0],
        m: str[1],
        l: str[2]
    }

    data.push(obj);
}

data.sort((a, b) => {
    let atext = a.f + " " + a.m + " " + a.l;
    let btext = b.f + " " + b.m + " " + b.l;

    return atext.length - btext.length;
});

if (toDelete) {
    fs.unlink(dataset, (err, data) => {
        if (err) console.log(err);
    });
}
csvWriter
    .writeRecords(data)
    .then(() => console.log('The CSV file was written successfully'));
