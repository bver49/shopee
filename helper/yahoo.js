var Promise = require("bluebird");
var request = require('request');
var crypto = require('crypto');
var emojiRegex = require('emoji-regex');
var emojiReg = emojiRegex();
var config = require('../config');
var enums = require('../enum');
var imageField = "ImageFile";
var yahooAPIkey = config.yahoo.apikey;
var yahooAPISecret = config.yahoo.apisecret;

function callAPI(url, data){
    return new Promise(function(resolve, reject){
        var hasImg = false;
        var formData = {};
        var QueryString = "";
        if (typeof data !== "undefined" && Object.keys(data).length > 0) {
            for (var i in data){
                if ( i != "ImageFile") {
                    if (Array.isArray(data[i])) {
                        for (var j in data[i]) {
                            QueryString += `&${i}=${data[i][j]}`;
                        }
                    } else {
                        QueryString += `&${i}=${data[i]}`;
                    }
                } else {
                    hasImg = true;
                }
            }
        }
        if (hasImg) {
            for (var i in data[imageField]) {
                var index = parseInt(i)+1;
                formData[imageField + index] = request.get(data[imageField][i]);
            }
        }
        var ts = Math.floor(new Date().getTime() / 1000);
        var RequestContent = `ApiKey=${yahooAPIkey}&TimeStamp=${ts}&Format=json${QueryString}`;
        var Signature = crypto.createHmac('sha1', yahooAPISecret).update(RequestContent).digest('hex');
        RequestContent = encodeURI(RequestContent)
                        .replace(/\#/g, "%23")
                        .replace(/\\/g, "%5C")
                        .replace(/\?/g, "%3F")
                        .replace(/\+/g, "%2B")
                        .replace(/\:/g, "%3A")
                        .replace(/\n/g, "%0A");
        url = url + "?" + RequestContent + "&Signature=" + Signature;
        request({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            formData: formData,
            url: url
        }, function (e, r, b) {
            try {
                var res = JSON.parse(b).Response;
                if (res['@Status'] != 'fail') {
                    resolve(res);
                } else {
                    reject(res);
                }
            } catch (err) {
                reject(err);
            }
        });
    });
}

function getCategory(name) {
    var categoryId = enums.category.mancloth;
    for (var i in enums.keyword) {
        if (enums.keyword[i].indexOf(name) != -1) {
            categoryId = enums.category[i];
            break;
        }
    }
    return categoryId;
}

function cutShort(str, limit) {
    limit = Math.floor(limit / 3);
    str = str.replace(emojiReg, "");
    var len = str.length;
    if (len > limit) {
        str = str.split(" ");
        for (var i = 0; len > limit; i++) {
            str.splice(str.length - 1, 1);
            len = str.join(" ").length;
        }
        return str.join(" ");
    } else {
        return str;
    }
}

function submitVerifyMain(data){
    return new Promise(function(resolve,reject){
        var url = "https://tw.ews.mall.yahooapis.com/stauth/v2/Product/SubmitVerifyMain";
        callAPI(url, data).then(function (res) {
            resolve(res);
        }).catch(function(err){
            err["FailAt"] = "submitVerifyMain";
            reject(err);
        });
    });
}

function submitMain(data) {
    return new Promise(function (resolve, reject) {
        var url = "https://tw.ews.mall.yahooapis.com/stauth/v2/Product/SubmitMain";
        callAPI(url, data).then(function (res) {
            resolve(res);
        }).catch(function (err) {
            err["FailAt"] = "submitMain";
            reject(err);
        });
    });
}

function uploadImage(data) {
    return new Promise(function (resolve, reject) {
        var url = "https://tw.ews.mall.yahooapis.com/stauth/v1/Product/UploadImage";
        callAPI(url, data).then(function (res) {
            resolve(res);
        }).catch(function (err) {
            err["FailAt"] = "uploadImage";
            reject(err);
        });
    });
}

function updateStock(data, action){
    return new Promise(function (resolve, reject) {
        data["Spec.1.Action"] = action;
        var url = "https://tw.ews.mall.yahooapis.com/stauth/v1/Product/UpdateStock";
        callAPI(url, data).then(function (res) {
            resolve(res);
        }).catch(function (err) {
            err["FailAt"] = "updateStock-"+action;
            reject(err);
        });
    });
}

function productOnline(data){
    return new Promise(function (resolve, reject) {
        var product = {
            "ProductId": data.productId
        }
        var url = "http://tw.ews.mall.yahooapis.com/stauth/v1/Product/Online";
        callAPI(url, product).then(function (res) {
            resolve({
                '@Status': 'Success',
                'Action': 'productOnline',
                'shopeeItemId': data.shopeeItemId,
                'productId': data.productId
            });
        }).catch(function (err) {
            resolve({
                '@Status': 'Fail',
                'FailAt': 'productOnline',
                'shopeeItemId': data.shopeeItemId,
                'productId': data.productId
            });
        });
    });
}

function productOffline(data) {
    return new Promise(function (resolve, reject) {
        var product = {
            "ProductId": data.productId
        }
        var url = "http://tw.ews.mall.yahooapis.com/stauth/v1/Product/Offline";
        callAPI(url, product).then(function (res) {
            resolve({
                '@Status': 'Success',
                'Action': 'productOffline',
                'shopeeItemId': data.shopeeItemId,
                'productId': data.productId
            });
        }).catch(function (err) {
            resolve({
                '@Status': 'Fail',
                'FailAt': 'productOffline',
                'shopeeItemId': data.shopeeItemId,
                'productId': data.productId
            });
        });
    });
}

function delItem(data) {
    return new Promise(function (resolve, reject) {
        var product = {
            "ProductId": data.productId
        }
        var url = "http://tw.ews.mall.yahooapis.com/stauth/v1/Product/Delete";
        callAPI(url, product).then(function (res) {
            resolve({
                '@Status': 'Success',
                'Action': 'delItem',
                'shopeeItemId': data.shopeeItemId,
                'productId': data.productId
            });
        }).catch(function (err) {
            resolve({
                '@Status': 'Fail',
                'FailAt': 'delItem',
                'shopeeItemId': data.shopeeItemId,
                'productId': data.productId
            });
        });
    });
}

function addItem(data) {
    var shopeeData = data;
    var itemId = shopeeData.item_id;
    var productId = "";
    return new Promise(function (resolve, reject) {
        var data = {
            "SaleType": "Normal",
            "ProductName": cutShort(shopeeData.name,130),
            "SalePrice": shopeeData.price,
            "CostPrice": shopeeData.price,
            "CustomizedMainProductId": shopeeData.item_sku,
            "MallCategoryId": getCategory(shopeeData.name),
            "ShortDescription": cutShort(shopeeData.name,50),
            "LongDescription": cutShort(shopeeData.description,5000),
            "PayTypeId": enums.paytype.atm,
            "ShippingId": enums.shiptype.mail
        }
        if (shopeeData.attributes.length > 0) {
            var index = 1;
            for (var i in shopeeData.attributes) {
                data[`Attribute${index}Name`] = shopeeData.attributes[i].attribute_name.replace(/\(/g, "").replace(/\)/g, "");
                data[`Attribute${index}Value`] = shopeeData.attributes[i].attribute_value.replace(/\(/g, "").replace(/\)/g, "").replace(/\./g, "");
            }
        }
        if (shopeeData.has_variation == true) {
            data["SpecTypeDimension"] = 1;
            data[`SpecDimension1`] = "尺寸";
            data[`SpecDimension1Description`] = shopeeData.variations.map(function(ele){
                return ele.name;
            });
        } else {
            data["SpecTypeDimension"] = 0;
            data["Stock"] = shopeeData.stock;
            data["SaftyStock"] = 10;
        }
        console.log("Upload Item" + data["ProductName"]);
        console.log("Shopee data");
        console.log(JSON.stringify(shopeeData, null, 4));
        console.log("Yahoo data");
        console.log(JSON.stringify(data, null, 4));
        submitVerifyMain(data).then(function(res) {
            return submitMain(data);
        }).then(function (res) {
            productId = res.ProductId;
            var image = {
                "ImageFile": shopeeData.images,
                "ProductId": productId,
                "MainImage": "ImageFile1",
                "Purge": true
            }
            data["ImageFile"] = shopeeData.images;
            return uploadImage(image);
        }).then(function (res) {
            if (shopeeData.has_variation == true) {
                var index = 1;
                var updateItemStock = Promise.all(shopeeData.variations.map(function(ele){
                    var data = {
                        "ProductId": productId,
                        "Spec.1.Id": index,
                        "Spec.1.Stock": ele.stock
                    }
                    index++;
                    return updateStock(data,"add");
                }));
                return updateItemStock;
            } else {
                console.log("Upload Item Done");
                resolve({
                    '@Status': 'Success',
                    'Action': 'addItem',
                    'shopeeItemId' : itemId,
                    'productId': productId
                });
            }
        }).then(function (res) {
            console.log("Upload Item Done");
            resolve({
                '@Status': 'Success',
                'Action': 'addItem',
                'shopeeItemId': itemId,
                'productId': productId
            });
        }).catch(function (err) {
            console.log("Upload Item Fail");
            err["shopeeItemId"] = itemId;
            err["productId"] = productId;
            err["submitData"] = data;
            if (err.ErrorList) {
                err.ErrorList = err.ErrorList.Error.map(function(ele){
                    return ele.Parameter + " -> " + ele.Message;
                });
            }
            resolve(err);
        });
    });
}

module.exports = {
    "addItem": addItem,
    "delItem": delItem,
    "productOnline": productOnline,
    "productOffline": productOffline,
    "updateStock": updateStock
}