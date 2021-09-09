let Product = require('../models/product');
let mongoose = require('mongoose');

//connect the database
mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true});

let products = [
    new Product({
        imagePath: 'http://placehold.it/300x400/EEE',
        title: 'All Products',
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere, soluta, eligendi doloribus sunt minus amet sit debitis repellat. Consectetur",
        price: 140000

    }),
    new Product({
        imagePath: 'http://placehold.it/300x400/EEE',
        title: 'Game',
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere, soluta, eligendi doloribus sunt minus amet sit debitis repellat. Consectetur",
        price: 250

    }),
    new Product({
        imagePath: 'http://placehold.it/300x400/EEE',
        title: 'Sports',
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facere, soluta, eligendi doloribus sunt minus amet sit debitis repellat. Consectetur",
        price: 100

    })
];

let done = 0;

for (let i = 0; i<products.length;i++){
    products[i].save(function (err , result) {
        done++;
        if (done === products.length)
        {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
