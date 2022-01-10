require("dotenv").config({ path: __dirname + "/.env" });
const { response, request } = require("express");
const express = require("express");

//config aws dynamoDB
const AWS = require("aws-sdk");
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "Demo";

const multer = require("multer");
const upload = multer();

//middleware
const convertFormToJson = multer;
const app = express();

//config sever side render mvc
app.use(express.json({ extended: false }));
app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

//GET POST PUT DELETE
//Lay du lieu tu bang
app.get("/", (request, response) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            response.send("Lay du lieu khong thanh cong");
        } else {
            console.log("data = ", JSON.stringify(data));
            return response.render("index", { data: data.Items });
        }
    });
});

//Them du lieu vao bang
app.post("/", upload.fields([]), (req, res) => {
    //lay daata nguoi dung gui len

    const { maSach, isbn, namXB, soTrang, tenSach, tacGia } = req.body;

    const params = {
        TableName: tableName,
        Item: {
            maSach: maSach,
            tenSach: tenSach,
            tacGia: tacGia,
            isbn: isbn,
            soTrang: soTrang,
            namXB: namXB,
        },
    };

    docClient.put(params, (err, data) => {
        if (err) {
            res.send("Them du lieu khong thanh cong");
        } else {
            console.log("data = ", JSON.stringify(data));
            console.log(req.body);
            return res.redirect("/");
        }
    });
});

//Xoa du lieu
app.post("/delete", upload.fields([]), (req, res) => {
    const listItem = Object.keys(req.body);

    if (listItem.length === 0) {
        return res.redirect("/");
    }

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                maSach: listItem[index],
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
    console.log("Server is chay tren port 3000! ");
});
