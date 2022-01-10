require("dotenv").config({ path: __dirname + "/.env" });
const { response } = require("express");
const express = require("express");

//config aws dynamoDB
const AWS = require("aws-sdk");
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "SanPham";

const multer = require("multer");
const { Discovery } = require("aws-sdk");
const upload = multer();

//middleware
const convertFormToJson = multer;
const app = express();

//config sever side render mvc
app.use(express.json({ extended: false }));
app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

//Lay du lieu tu db
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

app.post("/", upload.fields([]), (req, res) => {
    //lay data use gui len
    const { maSanPham, tenSanPham, hangSanXuat, namSanXuat, giaNiemYet } =
        req.body;

    const params = {
        TableName: tableName,
        Item: {
            maSanPham: maSanPham,
            tenSanPham: tenSanPham,
            hangSanXuat: hangSanXuat,
            namSanXuat: namSanXuat,
            giaNiemYet: giaNiemYet,
        },
    };

    docClient.put(params, (err, data) => {
        if (err) {
            return res.send("Them du lieu khong thanh cong");
        } else {
            console.log("data = ", JSON.stringify(data));
            console.log(req.body);
            return res.redirect("/");
        }
    });
});
//xoa
app.post("/delete", upload.fields([]), (req, res) => {
    const listItem = Object.keys(req.body);

    if (listItem.length == 0) {
        return res.redirect("/");
    }

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                maSanPham: listItem[index],
            },
        };

        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send("Xoa du lieu khong thanh cong");
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
    console.log("Server chay tren port 3000!");
});
