#!/usr/bin/env node

var http = require('http');
var https = require('https');


var retreiveDatas = function (url) {
  return new Promise((resolve, reject) => {
    var proto = https;
    if (url.indexOf("http://") == 0)
      proto = http;

    var request = proto.get(url, function (response) {
      response.setEncoding('utf8');

      var body = '';
      response.on('data', function (d) {
        body += d;
      });

      response.on('end', function () {
        var parsed = JSON.parse(body);
        resolve(parsed);
      });
    });
  })
}

const prog = require('caporal');
prog
  .version('1.0.0')
  .description('Simple program to display city weather and some Breaking Bad quotes')
  .command('weather', 'Get weather')
  .argument('<city>', 'Search query')
  .option('--humidity', 'Allow to prints humidity value')
  .option('--wind', 'Allow to prints wind speed')
  .action(function (args, options, logger) {

    // Récupération des données via l'API OpenWeatherMap
    retreiveDatas('http://api.openweathermap.org/data/2.5/weather?APPID=9ffc8e8d9b6cdf53f8bf6b2168b7d7b5&q=' + args.city + '&mode=json&units=metric').then(function (datas) {

      var weather = {
        city: datas.name,
        temp: datas.main.temp + '°C',
        humidity: datas.main.humidity + '%',
        wind_speed: datas.wind.speed + ' km/h'
      };

      var content = "\n";
      content += "City: " + weather.city + "\n";
      content += "Temperature: " + weather.temp + "\n";

      if (options.humidity)
        content += "Humidity: " + weather.humidity + "\n";

      if (options.wind)
        content += "Wind: " + weather.wind_speed + "\n";

      logger.info(content);

    })

  })

  .command('breaking-bad', 'Get Breaking Bad quotes')
  .option('--nb <num>', 'Number of quotes', prog.INT, 1)
  .action(function (args, options, logger) {

    // Récupération des citations via https://github.com/shevabam/breaking-bad-quotes
    retreiveDatas('https://breaking-bad-quotes.herokuapp.com/v1/quotes/' + options.nb).then(function (datas) {

      var content = "\n";

      for (var i = 0; i < datas.length; i++) {
        content += '"' + datas[i].quote + '"';
        content += "\n";
        content += "- " + datas[i].author;
        content += "\n\n";
      }

      logger.info(content);

    })

  });
prog.parse(process.argv);