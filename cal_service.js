const db = require('./dbhandler');
const config = require('../configs/config')

const gasFactorsCol = db.GasFactors;
const airFactorsCol = db.AirTravelFactors;
const electricityFactorsCol = db.ElectricityFactors;
const transportFactorsCol = db.TransportFactors;

const calculateDirectGasEmission = (quantity, gasConversionFactors) => {
    var cngEnergyContentFactor = gasConversionFactors[0];
    var cngCarbonEmissionFactor = gasConversionFactors[1];
    var cngMethaneEmissionFactor = gasConversionFactors[2];
    var cngNitrousEmissionFactor = gasConversionFactors[3];

    var carbonEmission = (quantity * cngEnergyContentFactor * cngCarbonEmissionFactor) / 1000;
    var methaneEmission = (quantity * cngEnergyContentFactor * cngMethaneEmissionFactor) / 1000;
    var nitrousEmission = (quantity * cngEnergyContentFactor * cngNitrousEmissionFactor) / 1000;

    var totalEmissions = carbonEmission + methaneEmission + nitrousEmission;
    return totalEmissions;
}

const calculateDetailedGasEmission = (
    quantity,
    unit,
    fuelType,
    gasConversionFactors
) => {
    var cngEnergyContentFactor = gasConversionFactors[0];
    var cngCarbonEmissionFactor = gasConversionFactors[1];
    var cngMethaneEmissionFactor = gasConversionFactors[2];
    var cngNitrousEmissionFactor = gasConversionFactors[3];
    var lpgEnergyContentFactor = gasConversionFactors[4];
    var lpgCarbonEmissionFactor = gasConversionFactors[5];
    var lpgMethaneEmissionFactor = gasConversionFactors[6];
    var lpgNitrousEmissionFactor = gasConversionFactors[7];

    var carbonEmission;
    var methaneEmission;
    var nitrousEmission;

    if (unit == "kWh")
        quantity *= 3.6;

    if (fuelType == "CNG") {
        carbonEmission = (quantity * cngEnergyContentFactor * cngCarbonEmissionFactor) / 1000;
        methaneEmission = (quantity * cngEnergyContentFactor * cngMethaneEmissionFactor) / 1000;
        nitrousEmission = (quantity * cngEnergyContentFactor * cngNitrousEmissionFactor) / 1000;
    } else {
        carbonEmission = (quantity * lpgEnergyContentFactor * lpgCarbonEmissionFactor) / 1000;
        methaneEmission = (quantity * lpgEnergyContentFactor * lpgMethaneEmissionFactor) / 1000;
        nitrousEmission = (quantity * lpgEnergyContentFactor * lpgNitrousEmissionFactor) / 1000;
    }

    var totalEmissions = carbonEmission + methaneEmission + nitrousEmission;
    return totalEmissions;
}

const calculateDirectElectricityEmissions = (
    consumptionUnits,
    electricityConversionFactor
) => {
    var electricityEmissions;

    electricityEmissions = electricityConversionFactor[0] * consumptionUnits;

    return electricityEmissions;
}

const calculateDetailedElectricityEmissions = (
    electricProducts,
    electricityConversionFactor
) => {
    var bulbTotal = electricProducts[0];
    var bulbHours = electricProducts[1];
    var bulbDays = electricProducts[2];
    var refrigeratorTotal = electricProducts[3];
    var refrigeratorHours = electricProducts[4];
    var refrigeratorDays = electricProducts[5];
    var microwaveTotal = electricProducts[6];
    var microwaveHours = electricProducts[7];
    var microwaveDays = electricProducts[8];
    var computerTotal = electricProducts[9];
    var computerHours = electricProducts[10];
    var computerDays = electricProducts[11];
    var tvTotal = electricProducts[12];
    var tvHours = electricProducts[13];
    var tvDays = electricProducts[14];

    var bulbSum = (bulbTotal * bulbHours * (bulbDays * 52) * 50) / 1000;
    var refrigeratorSum = (refrigeratorTotal * refrigeratorHours * (refrigeratorDays * 52) * 50) / 1000;
    var microwaveSum = (microwaveTotal * microwaveHours * (microwaveDays * 52) * 50) / 1000;
    var computerSum = (computerTotal * computerHours * (computerDays * 52) * 50) / 1000;
    var tvSum = (tvTotal * tvHours * (tvDays * 52) * 50) / 1000;

    var electricityEmissions = (bulbSum + refrigeratorSum + microwaveSum + computerSum + tvSum) * electricityConversionFactor[0];
    return electricityEmissions;
}

const calculateDirectAirTravelEmissions = (
    distance,
    directAirTravelConversionFactor
) => {
    var travelEmissions = distance * directAirTravelConversionFactor;
    return travelEmissions;
}

const calculateDetailedAirTravelEmissions = (melToLocDistArray, melToLocFlightsArray, melToLocClassArray, airTravelConversionFactorArray) => {
    var i;
    var totalEmission = 0;
    var CFavg = airTravelConversionFactorArray[0];
    var CFeco = airTravelConversionFactorArray[1];
    var CFpremium = airTravelConversionFactorArray[2];
    var CFbusiness = airTravelConversionFactorArray[3];
    var CFfirst = airTravelConversionFactorArray[4];
    var conversionFactor;

    for (i = 0; i < melToLocDistArray.length; i++) {
        if (melToLocClassArray[i] == 'Average')
            conversionFactor = CFavg;
        else if (melToLocClassArray[i] == 'Economy')
            conversionFactor = CFeco;
        else if (melToLocClassArray[i] == 'Premium Economy')
            conversionFactor = CFpremium;
        else if (melToLocClassArray[i] == 'Business')
            conversionFactor = CFbusiness;
        else
            conversionFactor = CFfirst;

        totalEmission += (melToLocDistArray[i] *2) * melToLocFlightsArray[i] * conversionFactor;
    }

    return totalEmission;
}

const calculateAirTravel = (trips, conversionFactors, distancesArray)=>{
  var i;
  var totalEmission = 0;
  var CFavg = conversionFactors[0];
  var CFeco = conversionFactors[1];
  var CFpremium = conversionFactors[2];
  var CFbusiness = conversionFactors[3];
  var CFfirst = conversionFactors[4];
  var conversionFactor;

  for (i = 0; i < trips.length; i++) {
      var flightClass = trips[i].classType;
      var flightDestination = trips[i].destiny;
      var flightQuantity = trips[i].quantity;
      var distance = 0;
      if(flightDestination == "Sydney"){
        distance = distancesArray[0];
      }else if(flightDestination == "Brisbane"){
        distance = distancesArray[1];
      }else if(flightDestination == "Adelaide"){
        distance = distancesArray[2];
      }else if(flightDestination == "Perth"){
        distance = distancesArray[3];
      }else if(flightDestination == "Darwin"){
        distance = distancesArray[4];
      }else {
        distance = distancesArray[5];
      }

      if (flightClass== 'Average')
          conversionFactor = CFavg;
      else if (flightClass == 'Economy')
          conversionFactor = CFeco;
      else if (flightClass == 'Premium Economy')
          conversionFactor = CFpremium;
      else if (flightClass == 'Business')
          conversionFactor = CFbusiness;
      else
          conversionFactor = CFfirst;

      totalEmission += (distance * 2) * flightQuantity * conversionFactor;
  }

  return totalEmission;
}

const calculatePublicTransEmissions = (
    distanceInEachTrans,
    publicTransConversionFactors
) => {
    var busCF = publicTransConversionFactors[0];
    var metroCF = publicTransConversionFactors[1];
    var vlineCF = publicTransConversionFactors[2];
    var tramCF = publicTransConversionFactors[3];
    var taxiCF = publicTransConversionFactors[4];

    var busDistance = distanceInEachTrans[0];
    var metroDistance = distanceInEachTrans[1];
    var vlineDistance = distanceInEachTrans[2];
    var tramDistance = distanceInEachTrans[3];
    var taxiDistance = distanceInEachTrans[4];

    var publicTransEmissions = (busCF * busDistance) + (metroCF * metroDistance) + (vlineCF * vlineDistance) + (tramCF * tramDistance) + (taxiDistance * taxiCF);
    return publicTransEmissions;
}

const calculatePrivateTransEmissions = (
    lpgUsage,
    lngUsage,
    dieselUsage,
    factors
) => {
    var lpgEC = factors[5];
    var lngEC = factors[6];
    var dieselEC = factors[7];

    var lpgEF = factors[8];
    var lngEF = factors[9];
    var dieselEF = factors[10];

    var privateTransEmissions = ((lpgUsage * lpgEC * lpgEF) / 1000) + ((lngUsage * lngEC * lngEF) / 1000) + ((dieselUsage * dieselEC * dieselEF) / 1000);
    return privateTransEmissions;
}

const getGasFactors = async() => {
    var gFac = await gasFactorsCol.findById(config.gasId).select('-_id -__v');
    var string = JSON.stringify(gFac);
    var objectValue = JSON.parse(string);
    return Object.values(objectValue);
}

const getAirFactors = async() => {
    var aFac = await airFactorsCol.findById(config.airId).select('-_id -__v');
    var string = JSON.stringify(aFac);
    var objectValue = JSON.parse(string);
    return Object.values(objectValue);
}

const getElectricityFactors = async() => {
    var eFac = await electricityFactorsCol.findById(config.electricityId).select('-_id -__v');
    var string = JSON.stringify(eFac);
    var objectValue = JSON.parse(string);
    return Object.values(objectValue);
}

const getTransportFactors = async() => {
    var tFac = await transportFactorsCol.findById(config.transportId).select('-_id -__v');
    var string = JSON.stringify(tFac);
    var objectValue = JSON.parse(string);
    return Object.values(objectValue);

}

const getAllfactors = async() => {
    var gFac = await gasFactorsCol.findById(config.gasId).select('-_id -__v');
    var string = JSON.stringify(gFac);
    var objectValue = JSON.parse(string);
    const gvalues = Object.values(objectValue);
    var aFac = await airFactorsCol.findById(config.airId).select('-_id -__v');
    string = JSON.stringify(aFac);
    objectValue = JSON.parse(string);
    const avalues = Object.values(objectValue);
    var eFac = await electricityFactorsCol.findById(config.electricityId).select('-_id -__v');
    string = JSON.stringify(eFac);
    objectValue = JSON.parse(string);
    const evalues = Object.values(objectValue);
    var tFac = await transportFactorsCol.findById(config.transportId).select('-_id -__v');
    string = JSON.stringify(tFac);
    objectValue = JSON.parse(string);
    const tvalues = Object.values(objectValue);

    var factors = {
        GasFactors: gvalues,
        AirFactors: avalues,
        ElectricityFactors: evalues,
        TransportFactors: tvalues
    };

    return factors;
}

module.exports = {
    calculateDirectGasEmission,
    calculateDetailedGasEmission,
    calculateDirectElectricityEmissions,
    calculateDetailedElectricityEmissions,
    calculateDirectAirTravelEmissions,
    calculateDetailedAirTravelEmissions,
    calculateAirTravel,
    calculatePublicTransEmissions,
    calculatePrivateTransEmissions,
    getGasFactors,
    getAirFactors,
    getElectricityFactors,
    getTransportFactors,
    getAllfactors
};

// var testingObject = new common();
// var gasConversionFactors = [0.12,0.13,0.14,0.15];
// var electricProducts = [5,5,5,6,6,6,7,7,7,8,8,8,9,9,9];
// console.log("output:"+testingObject.calculateDirectGasEmission(25,gasConversionFactors));
