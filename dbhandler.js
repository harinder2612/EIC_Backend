const config = require("../configs/config");

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI || config.connectionString, {
    useCreateIndex: true,
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;
const find = (collection_name, query, callback) => {
    mongoose.connection.db.collection(collection_name, function(err, collection) {
        if (err) {
            throw err;
        } else {
            collection.find(query).toArray(callback);
        }
    });
};
module.exports = {
    Find: find,
    Startup: require("../models/Startup"),
    GasFactors: require("../models/GasFactors"),
    ElectricityFactors: require("../models/ElectricityFactors"),
    AirTravelFactors: require("../models/AirTravelFactors"),
    TransportFactors: require("../models/TransportFactors"),
    Result: require("../models/Result")
};
