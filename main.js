const svg = d3.select("#CasexAge");
const svgWidth = Number(svg.attr("width"));
const svgHeight = Number(svg.attr("height"));
const padding = { top: 30, right: 30, bottom: 30, left:100 };
const chartWidth = svgWidth - padding.left - padding.right;
const chartHeight = svgHeight - padding.top - padding.bottom;

function calculateTotals(data, ageGroup){
    data.forEach(d => {
        if(d["age_group"] === ageGroup.key) {
            ageGroup.caseCount ++;
            ageGroup.crude_booster_ir += +d["crude_booster_ir"];
            ageGroup.crude_primary_series_only_ir += +d["crude_primary_series_only_ir"];
            ageGroup.crude_unvax_ir += +d["crude_unvax_ir"];
        }

    });
    ageGroup.crude_booster_ir /= ageGroup.caseCount;
    ageGroup.crude_primary_series_only_ir /= ageGroup.caseCount;
    ageGroup.crude_unvax_ir /= ageGroup.caseCount;
    ageGroup.max = Math.max(ageGroup.crude_booster_ir, ageGroup.crude_primary_series_only_ir, ageGroup.crude_unvax_ir);
}

// Function to populate the chart
function populateChart(data) {

    var ageGroup1 = {
        key: "18-49",
        caseCount: 0,
        crude_booster_ir: 0,
        crude_primary_series_only_ir: 0,
        crude_unvax_ir: 0,
        max: 0, 
    };
    var ageGroup2 = {        
        key:"50-64",
        caseCount: 0,
        crude_booster_ir: 0,
        crude_primary_series_only_ir: 0,
        crude_unvax_ir: 0,
        max: 0, 
    };
    var ageGroup3 = {
        key:"65+",
        caseCount: 0,
        crude_booster_ir: 0,
        crude_primary_series_only_ir: 0,
        crude_unvax_ir: 0,
        max: 0, 
    };
    var AllAges = {
        key:"all_ages",
        caseCount: 0,
        crude_booster_ir: 0,
        crude_primary_series_only_ir: 0,
        crude_unvax_ir: 0,
        max: 0, 
    }

    calculateTotals(data, ageGroup1);
    calculateTotals(data, ageGroup2);
    calculateTotals(data, ageGroup3);
    calculateTotals(data, AllAges);
    console.log(ageGroup1, ageGroup2, ageGroup3, AllAges);

    var formattedData = [ageGroup1, ageGroup2, ageGroup3];//, AllAges];

   
    var maxPopulation = Math.max(ageGroup1.max,ageGroup2.max,ageGroup3.max); //AllAges.max);

    // Define scales for the x and y axes
    const xScale = d3.scaleBand()
        .domain(formattedData.map(d => d.key))  // Set the domain to be the unique age values
        .range([0, chartWidth])
        .padding(0.1);  // Adds padding between bars (if you're plotting bars)

    const yScale = d3.scaleLinear()
        .domain([0, maxPopulation])  // Set the domain to be the max case count
        .range([chartHeight, 0]);  // Flip the range so the higher values are at the top

    // Create the axes using d3.axisBottom for the x-axis and d3.axisLeft for the y-axis
    console.log('xScale domain:', xScale.domain());
    console.log('yScale domain:', yScale.domain());
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append the axes to the SVG
    svg.append("g")
        .attr("transform", `translate(${padding.left}, ${svgHeight - padding.bottom})`) // Position x-axis
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${padding.left}, ${padding.top})`)  // Position y-axis
        .call(yAxis);

    // You can now add the bars or other visual elements to the chart
    const bWidth = xScale.bandwidth()/3;
    formattedData.forEach((ageGroup, i) => {
        // Boosted cases
        svg.selectAll(`.boostedCases-${i}`)
            .data([ageGroup])
            .enter().append("rect")
            .attr("x", padding.left + xScale(ageGroup.key))
            .attr("y", d => yScale(d.crude_unvax_ir))
            .attr("width", bWidth)
            .attr("height", d => chartHeight + padding.top  - yScale(d.crude_unvax_ir))
            .attr("fill", "#5c1907");

        // Vaccine cases
        svg.selectAll(`.vaxCases-${i}`)
            .data([ageGroup])
            .enter().append("rect")
            .attr("x", padding.left + xScale(ageGroup.key) + bWidth)
            .attr("y", d => yScale(d.crude_primary_series_only_ir))
            .attr("width", bWidth)
            .attr("height", d => chartHeight + padding.top  - yScale(d.crude_primary_series_only_ir))
            .attr("fill", "#b25812");

        // Unvaccinated cases
        svg.selectAll(`.unvaxCases-${i}`)
            .data([ageGroup])
            .enter().append("rect")
            .attr("x", padding.left + xScale(ageGroup.key) + 2 * bWidth)
            .attr("y", d => yScale(d.crude_booster_ir))
            .attr("width", bWidth)
            .attr("height", d => chartHeight + padding.top - yScale(d.crude_booster_ir))
            .attr("fill", "#ffa600");
    });
}

// Load the data and populate the chart
async function loadData() {
    const data = await d3.csv("Cases-by-Age-by-Vaccination-Status.csv");
    populateChart(data);
}

await loadData();
