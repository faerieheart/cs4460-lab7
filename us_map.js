var svg = d3.select('#map');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

console.log(svgWidth, svgHeight);

var padding = {t: 40, r: 40, b: 40, l: 40};
var cellPadding = 10;

// Create a group element for appending chart elements
var mapG = svg.append('g');

// Global size scale for state vaccination rate
const circleRadius = d3.scaleLinear([.5, 1.0], [5, 40]);
// global color scale for state covid death rate
var color = d3.scaleSequential([0, 2200], d3.interpolateBlues);

var legendColor = d3.legendColor()
    .scale(color).cells(10)
    .ascending(true).shapeWidth(20).shapeHeight(20)
    .title("Covid Death Rate per 1M Population")
    .titleWidth(svgWidth * 0.15);

var legendSize = d3.legendSize()
    .scale(circleRadius).cells(10)
    .shape("circle").shapePadding(20).orient('horizontal')
    .labelFormat(d3.format(".0%"))
    .title("Vaccination Rate")

mapG.append("g")
    .attr("transform", "translate(10,"+svgHeight/6+")")
    .attr("class", "legend")
    .call(legendColor);

mapG.append("g")
    .attr("transform", "translate(300,"+3*svgHeight/4+")")
    .call(legendSize);


// show specific info about state
var toolTip = d3.tip()
.attr("class", "d3-tip")
.offset([-12, 0])
.html(function(event, d) {
    // Inject html, when creating your html I recommend editing the html within your index.html first
    return "<h5>"+d.properties.NAME+"</h5><table><thead><tr><td>Vaccination Rate</td><td>Covid Death Rate (per 1M population)</td></tr></thead>"
                    + "<tbody><tr><td>"+d.properties.vaccination+"</td><td>"+d.properties.coviddeath+"</td></tr></tbody>"
});
svg.call(toolTip);



// ********* Your event listener functions go here *********//

function dataPreprocessor(row) {
    return {
        'state': row['State'],
        'deaths': +row['covid_death_rate'],
    };
}

epsilon = 1e-6

function multiplex(streams) {
  const n = streams.length;
  return {
    point(x, y) { for (const s of streams) s.point(x, y); },
    sphere() { for (const s of streams) s.sphere(); },
    lineStart() { for (const s of streams) s.lineStart(); },
    lineEnd() { for (const s of streams) s.lineEnd(); },
    polygonStart() { for (const s of streams) s.polygonStart(); },
    polygonEnd() { for (const s of streams) s.polygonEnd(); }
  };
}

function geoAlbersUsaPr() {
  var cache,
      cacheStream,
      lower48 = d3.geoAlbers(), lower48Point,
      alaska = d3.geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]),
      alaskaPoint,
      hawaii = d3.geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]),
      hawaiiPoint,
      puertoRico = d3.geoConicEqualArea().rotate([66, 0]).center([0, 18]).parallels([8, 18]),
      puertoRicoPoint,
      point,
      pointStream = {point: function(x, y) { point = [x, y]; }};

  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    return point = null,
        (lower48Point.point(x, y), point)
        || (alaskaPoint.point(x, y), point)
        || (hawaiiPoint.point(x, y), point)
        || (puertoRicoPoint.point(x, y), point);
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : y >= 0.204 && y < 0.234 && x >= 0.320 && x < 0.380 ? puertoRico
        : lower48).invert(coordinates);
  };

  albersUsa.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream), puertoRico.stream(stream)]);
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_), puertoRico.precision(_);
    return reset();
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_), puertoRico.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream);

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.212 * k])
        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    puertoRicoPoint = puertoRico
        .translate([x + 0.350 * k, y + 0.224 * k])
        .clipExtent([[x + 0.320 * k, y + 0.204 * k], [x + 0.380 * k, y + 0.234 * k]])
        .stream(pointStream).point;

    return reset();
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  return albersUsa.scale(1070);
}

function area(poly){
    var s = 0.0;
    var ring = poly.coordinates[0];
    for(i= 0; i < (ring.length-1); i++) {
      s += (ring[i][0] * ring[i+1][1] - ring[i+1][0] * ring[i][1]);
    }
    return 0.5 *s;
}

function centroid(poly){
    var c = [0,0];
    var ring = poly.coordinates[0];
    for(i= 0; i < (ring.length-1); i++) {
        c[0] += (ring[i][0] + ring[i+1][0]) * (ring[i][0]*ring[i+1][1] - ring[i+1][0]*ring[i][1]);
        c[1] += (ring[i][1] + ring[i+1][1]) * (ring[i][0]*ring[i+1][1] - ring[i+1][0]*ring[i][1]);
    }
    var a = area(poly);
    c[0] /= a *6;
    c[1] /= a*6;
    return c;
}

const newShade = (hexColor, magnitude) => {
    hexColor = hexColor.replace(`#`, ``);
    if (hexColor.length === 6) {
        const decimalColor = parseInt(hexColor, 16);
        let r = (decimalColor >> 16);
        let g = (decimalColor & 0x0000ff);
        let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
        b > 255 && (b = 255);
        b < 0 && (b = 0);
        return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    } else {
        return hexColor;
    }
};

const myProjection = geoAlbersUsaPr().scale(svgWidth/1.2).translate([svgWidth/2, svgHeight/3.2]);

d3.json("us_states_2.json").then(function(data){ 

    // Draw the map
    mapG.selectAll("path")
        .data(data.features)
        .enter()
            .append('g')
            .attr("class", function(d) {
                return d.properties.NAME;
            })
            .append("path")
            .attr("fill", function(d) {
                return color(d.properties.coviddeath);
            })
            .attr("d", d3.geoPath()
                .projection(myProjection)
            )
            .attr("class", "state")
            .attr('fill-opacity', 0.5)
            .attr("stroke", "#000");

    console.log(data.features);
    mapG.selectAll('circle.state')
        .data(data.features)
        .enter()
            .append('circle')
            .attr('cx', function(d) { return d3.geoPath().projection(myProjection).centroid(d.geometry)[0];})
            .attr('cy', function(d) { return d3.geoPath().projection(myProjection).centroid(d.geometry)[1];})
            .attr('r', function(d) {return circleRadius(d.properties.vaccination/100); })
            .attr('fill', function(d) {return newShade(color(d.properties.coviddeath), -100);})
            .attr('fill-opacity', 0.6)
            .attr('pointer-events', 'none')
            .attr("class", "state");

    //mapG.selectAll("circle.state").style({"pointer-events": "none"});


/*   mapG.selectAll('rect')
        .data(data.features)
        .enter()
            .data(function(d) {
                return d3.range(squares(d.properties.vaccination));
            })
            .enter()
                .append('rect')
                .attr('width', squareDim)
                .attr('height', squareDim)
                .attr('x', function(d,i){
                return (i % 5) * (squareDim + 2);
                }) // determine the x position
                .attr('y', function(d, i){
                return (squareDim + 2) * (Math.floor(i / 5));  // and y
                })
                .style('fill', '#c62828');*/

    mapG.selectAll("path.state").on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);


}).catch(e => {
    console.log(e);
});