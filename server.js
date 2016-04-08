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
    user: "stagitnina@gmail.com",
    pass: "ns_GM2016"
  }
}));

var adminData = {name: 'admin', password: 'admin1518'};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, catalogPath)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
var upload = multer({
  storage : storage,
  fileFilter: function (req, file, cb) {
    if (!verifyImageName(file.originalname)) {
      console.log(file.originalname + ' -> goes wrong on the image name');
      return cb(null, false, new Error('goes wrong on the image name'));
    }
    cb(null, true);
  }

});

app.use(express.static(__dirname + '/public'));
app.use('/components',  express.static(__dirname + '/components'));
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

  for (var catalog_key in getProduction(order.imageNames).catalog) {
      var products = getProduction(order.imageNames).catalog[catalog_key];
      for (var product_key in products) {
        var product = products[product_key];
        productOrderText += "<br>" + product.productName + " - " + product.title + " - " + product.price;
      }
  }

  var generalMailText = "<div><b>Имя заказчика: </b>" + order.userName +"<br>" +
      "<b>Телефон заказчика: </b>" + order.userPhone + "<br><br>" +
      "<b>Заказ:</b>" + productOrderText + "</div>";


  var mail = {
    from: "stagitnina@gmail.com",
    to: "stagitnina@gmail.com",
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
    res.json({'production': getProduction(list), 'filesInfo' : list});
  });
});

var verifyImageName = function(imgName) {
  var options = null;
  var imageNameOpts = imgName.split("_");

  var panelName = imageNameOpts[0] ? imageNameOpts[0] : '';
  var productName = imageNameOpts[1] ? imageNameOpts[1] : '';
  var title = imageNameOpts[2] ? imageNameOpts[2].split('-').join(' ') : '';
  var price = imageNameOpts[3] && parseInt(imageNameOpts[3].split('.')[0]) ? imageNameOpts[3].split('.')[0] + ' грн' : '';

  if (imageNameOpts.length == 4 && !!panelName && !!productName && !!title && !!price) {
    options = {
      panelName: panelName,
      productName: productName,
      title: title,
      price: price
    }
  }

  return options;
};

var getProduction = function(list) {
  var production = {
    catalog: {},
    productsCount: 0
  };
  var panelNames = [];
  var productInfo = null;

  for (var i = 0; i < list.length; i++) {
    var imgName = list[i];
    var imageNameOpts = verifyImageName(imgName);

    if (imageNameOpts) {
      productInfo = {
        'path': 'app/images/catalog/',
        'imageName': imgName,
        'productName': imageNameOpts.productName,
        'title': imageNameOpts.title,
        'price': imageNameOpts.price,
        'rem_selected': false,
        'in_order': false
      };

      if (panelNames.indexOf(imageNameOpts.panelName) == -1) {
        production.catalog[imageNameOpts.panelName] = [];
        panelNames.push(imageNameOpts.panelName);
      }

      production.catalog[imageNameOpts.panelName].push(productInfo);
    }
  }

  for (var key in production.catalog) {
    production.productsCount+=production.catalog[key].length;
  }

  return production;
};

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var server = app.listen(port, ipaddress, function () {

  //var host = server.address().address;
  //var port = server.address().port;

  console.log('Ceramics app listening at http://%s:%s', ipaddress, port);

});
