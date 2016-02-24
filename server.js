var express = require('express');
var app = express();
var url = require('url');
var http = require('http');
var args = require('optimist').argv;
var fs = require('fs');
var bodyParser = require('body-parser');
var multer  = require('multer');
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var catalogPath = 'public/app/images/catalog';

var smtpTransport = nodemailer.createTransport(smtpTransport({
  host: "smtp.gmail.com",
  secureConnection : false,
  port: 587,
  auth : {
    user: "vadstagit@gmail.com",
    pass: ""
  }
}));

var adminData = {name: 'admin', password: '123'};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, catalogPath)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({ storage: storage });

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.sendfile(__dirname + '/public/app/index.html');
});

app.post('/upload', upload.array('img'), function (req, res, next) {
  res.redirect('back');
});

app.post('/admin', function (req, res, next) {
  var adminMode = false;
  var adminObj = req.body.admin;
  if (adminObj.name == adminData.name &&
      adminObj.password == adminData.password) {
    adminMode = true;
  }
  res.json({'isAdmin': adminMode});
});

app.post('/order', function(req, res) {
  console.log("Going to order");
  var order = req.body.order;
  var productOrderText = "";
  var generalMailText = "";

  for (var catalog_key in getCatalog(order.imageNames)) {
      var products = getCatalog(order.imageNames)[catalog_key];
      for (var product_key in products) {
        var product = products[product_key];
        productOrderText += "<br>" + product.productName + " - " + product.title + " - " + product.price;
      }
  }

  var generalMailText = "<div><b>Имя заказчика: </b>" + order.userName +"<br>" +
      "<b>Телефон заказчика: </b>" + order.userPhone + "<br><br>" +
      "<b>Заказ:</b>" + productOrderText + "</div>";


  var mail = {
    from: "vadstagit@gmail.com",
    to: "vadstagit@gmail.com",
    subject: "У вас новый заказ!!!",
    text: "У вас новый заказ!!!",
    html: generalMailText
  };

  smtpTransport.sendMail(mail, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message sent: " + response.message);
    }

    smtpTransport.close();
  });
});

app.post('/remove', function(req, res) {
  console.log("Going to delete an existing file");

  var images = req.body.imageNames;
  for (var key in images) {
    var image = catalogPath + '/' +  images[key];
    fs.unlink(image, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("File deleted successfully!");
    });
  }
  res.end();
});

app.get('/product/catalog', function(req, res, next) {
  fs.readdir(catalogPath, function (err, list) {
    res.json({'catalog': getCatalog(list)});
  });
});

var getCatalog = function(list) {
  var catalog = {};
  var panelNames = [];
  for (var i = 0; i < list.length; i++) {
    var imageNameOpts = list[i].split("_");

    var panelName = imageNameOpts[0] ? imageNameOpts[0] : 'empty';
    var productName = imageNameOpts[1] ? imageNameOpts[1] : 'empty';
    var title = imageNameOpts[2] ? imageNameOpts[2].split('-').join(' ') : 'empty';
    var price = imageNameOpts[3] ? imageNameOpts[3].split('.')[0] + ' грн' : 'empty';

    var productInfo = {
      'path':'app/images/catalog/',
      'imageName':list[i],
      'productName': productName,
      'title':title,
      'price':price,
      'rem_selected': false,
      'in_order': false
    };

    if (panelNames.indexOf(panelName) == -1) {
      catalog[panelName] = [];
      panelNames.push(panelName);
    }

    catalog[panelName].push(productInfo);
  }

  return catalog;
};

var port = args.p || args.port || 8010;
var server = app.listen(port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Ceramics app listening at http://%s:%s', host, port);

});
