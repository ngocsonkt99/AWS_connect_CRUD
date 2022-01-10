require("dotenv").config({ path: __dirname + "/.env" });
const { response } = require("express");
const express = require("express");

// config aws dynamoDB
const AWS = require("aws-sdk");
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.PROCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
// const config = new AWS.Config({
//     accessKeyId: "AKIAXDDT5YP2X5JXAJHR",
//     secretAccessKey: "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",
//     region: "us-west-2",
// });
// AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "Paper";

const multer = require("multer");
const upload = multer();

//middleware
const convertFormToJson = multer;
const app = express();

// config sever side render mvc
app.use(express.json({ extended: false }));
app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

//****GET POST DELETE PUT ...*****
//lay du lieu sp
app.get("/", (request, response) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            response.send("lay du lieu khong thanh cong");
        } else {
            console.log("data = ", JSON.stringify(data));
            return response.render("index", { data: data.Items });
        }
    });
});

//them sp
app.post("/", upload.fields([]), (req, res) => {
    // lấy data đc ng dùng gửi lên

    const { stt, isbn, namXuatban, soTrang, tenBaibao, tenTacgia } = req.body;

    const params = {
        TableName: tableName,
        Item: {
            stt: stt,
            tenBaibao: tenBaibao,
            tenTacgia: tenTacgia,
            isbn: isbn,
            soTrang: soTrang,
            namXuatban: namXuatban,
        },
    };

    docClient.put(params, (err, data) => {
        if (err) {
            res.send("them bai bao khong thanh cong");
        } else {
            console.log("data = ", JSON.stringify(data));
            console.log(req.body);
            return res.redirect("/");
        }
    });
    // console.log(req.body);
    // return res.redirect("/");
});

//xoa san pham
app.post("/delete", upload.fields([]), (req, res) => {
    const listItem = Object.keys(req.body);

    if (listItem.length === 0) {
        return res.redirect("/");
    }

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                stt: listItem[index],
            },
        };

        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send("xoa khong thanh cong");
            } else {
                if (index > 0) {
                    onDeleteItem(index - 1);
                } else {
                    return res.redirect("/");
                }
            }
        });
    }
    onDeleteItem(listItem.length - 1);
});

app.listen(3000, () => {
    console.log("Server is chay tren port 3000!");
});
