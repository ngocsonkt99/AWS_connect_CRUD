const { response } = require("express");
const express = require("express");
//middleware
const app = express();

// config sever side render mvc

app.use(express.json({ extended: false }));
app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

// config aws dynamoDB
const AWS = require("aws-sdk");
const config = new AWS.Config({
    accessKeyId: "AKIAXDDT5YP2X5JXAJHR",
    secretAccessKey: "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",
    region: "us-west-2",
});
AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "SanPham";

const multer = require("multer");

const upload = multer();

//GET POST DELETE PUT ...
//lay sp
app.get("/", (request, response) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            response.send("Internal Sever Error");
        } else {
            return response.render("index", { data: data.Items });
        }
    });
});

//them sp
app.post("/", upload.fields([]), (req, res) => {
    // lấy data đc ng dùng gửi lên

    const { maSP, tenSP, soLuong } = req.body;

    const params = {
        TableName: tableName,
        Item: {
            maSP: maSP,
            tenSP: tenSP,
            soLuong: soLuong,
        },
    };

    docClient.put(params, (err, data) => {
        if (err) {
            return res.send("them san phan khong duoc");
        } else {
            // console.log("data = ", JSON.stringify(data));
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
                maSP: listItem[index],
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
