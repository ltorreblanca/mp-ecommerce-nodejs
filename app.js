var express = require('express');
var exphbs  = require('express-handlebars');
var mercadopago = require('mercadopago');
var bodyParser = require('body-parser');
 
var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.render('home');
});

mercadopago.configure({
    access_token: "APP_USR-1159009372558727-072921-8d0b9980c7494985a5abd19fbe921a3d-617633181",
    integrator_id: "dev_24c65fb163bf11ea96500242ac130004"
});

app.get('/detail', function (req, res) {
    let preference = {
        items:[
            {
                id: "1234", 
                title: req.query.title,
                description: "Dispositivo móvil de Tienda e-commerce",
                picture_url: req.query.img,
                category_id: "1234", 
                quantity: Number(req.query.unit),
                currency_id: "MXN",
                unit_price: Number(req.query.price)
            }
        ],
        external_reference: "cybervideocenter@gmail.com", 
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: "test_user_58295862@testuser.com",
            phone: {
                area_code: "52",
                number: Number(5549737300)
            },
                
            address: {
                street_name: "Insurgentes Sur",
                street_number: Number(1602),
                zip_code: "03940"
            }
        },
        payment_methods:{
            excluded_payment_methods: [{id: "amex"}],
            excluded_payment_types:[{id: "atm"}],
            installments: 6, 
            default_installments: 6 
        },
        back_urls:{
            success:"https://ltorreblanca-mp-commerce-nodej.herokuapp.com/success",
            pending:"https://ltorreblanca-mp-commerce-nodej.herokuapp.com/pending",
            failure:"https://ltorreblanca-mp-commerce-nodej.herokuapp.com/failed"
        },
        notification_url: "https://ltorreblanca-mp-commerce-nodej.herokuapp.com/webhooks", 
        auto_return: "approved" 
    };

    mercadopago.preferences.create(preference)
    .then(function(response){
        console.log(response);
        // Este valor reemplazará el string "<%= global.id %>" en tu HTML
        req.query.globalID = response.body.id;
        req.query.init_point = response.body.init_point;
        res.render('detail', req.query);
    }).catch(function(error){
        console.log(error);
        req.query.message = error.message;
        req.query.cause = {};
        req.query.cause = error.cause;
        res.render('failed', req.query);
    });


});

app.get('/success', function (req, res) {
    let success ={
        collection_id: req.query.collection_id,
        payment_type: req.query.payment_type,
        external_reference:req.query.external_reference
    }
    console.log(req.query);
    res.render('success', success);
});

app.get('/pending', function (req, res) {
    console.log(req.query);
    res.render('pending', req.query);
});

app.get('/failed', function (req, res) {
    console.log(req.query);
    res.render('failed', req.query);
});

app.post('/webhook', function (req, res) {
    res.status(200).send();
});

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));
 
app.listen(3000);