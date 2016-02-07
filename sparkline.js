// Built to closely follow reusable charts best practices doc: http://bost.ocks.org/mike/chart/

function sparkline() {
  // defaults
  var width = 175;
  var height = 56;
  var csvFilePath = '';
  var selector = 'body';
  var gradientColors = ['green', 'orange', 'red'];

  // setters and getters
  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  chart.csvFilePath = function(value) {
    if (!arguments.length) return csvFilePath;
    csvFilePath = value;
    return chart;
  };

  chart.selector = function(value) {
    if (!arguments.length) return selector;
    selector = value;
    return chart;
  };

  chart.gradientColors = function(value) {
    if (!arguments.length) return gradientColors;
    gradientColors = value;
    return chart;
  };

  function chart() {
    var margin = {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5
    };

    var width = chart.width();
    var height = chart.height();
    var gradient;

    // date parser
    var parseDate = d3.time.format('%d-%b-%y').parse;

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the line
    var valueline = d3.svg.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.close); });

    // Adds the svg canvas to the selector - 'body' by default
    var svg = d3.select(chart.selector())
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    if (chart.gradientColors() && chart.gradientColors().length) {
      // this defines the gradient used
      gradient = svg.append("defs")
        .append("linearGradient")
          .attr("id", "gradient")
          .attr("x1", "0%")   // starting x point
          .attr("y1", "0%")   // starting y point
          .attr("x2", "0%")   // ending x point
          .attr("y2", "100%") // ending y point
          .attr("spreadMethod", "pad");

      chart.gradientColors().forEach(function (color, index) {
        gradient.append("stop")
          .attr("offset", ((index * 100) / chart.gradientColors().length) + '%')
          .attr("stop-color", color)
          .attr("stop-opacity", 0.7);
      })
    }

    // load CSV file - defaults to ryanair stock prices on the Irish stock exchange from Feb 2015 - Feb 2016
    d3.csv(chart.csvFilePath(), function onCsvFileLoaded(error, data) {
      data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.close = +d.close;
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function (d) { return d.date; }));
      y.domain([0, d3.max(data, function (d) { return d.close; })]);

      // Add the valueline path.
      svg.append('path')
        .attr('class', 'line')
        .attr('stroke', function () {
          if (gradient) {
            return 'url(#gradient)';
          }
          return '#444444';
        })
        .attr('d', valueline(data));
    });
  }

  return chart;
}
