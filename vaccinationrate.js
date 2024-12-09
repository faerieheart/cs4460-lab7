
function roundToHighestPlaceVal(value){
    if(value === 0){
        return 0;
    }

    var magnitude = Math.floor(Math.log10(Math.abs(value)));
    var factor = Math.pow(10, magnitude);
    return Math.ceil(value/factor) * factor;
}
function calculateInfectionTotals(data, ageGroup){
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
function calculateReInfectionTotals(data, ageGroup) {
    data.forEach(d => {
        if (d["age_group"] === ageGroup.key) {
            ageGroup.caseCount++;
            ageGroup.crude_irr += +d["crude_irr"];
            ageGroup.crude_booster_irr += +d["crude_booster_irr"];
        }

    });
    ageGroup.crude_irr /= ageGroup.caseCount;
    ageGroup.crude_booster_irr /= ageGroup.caseCount;
    ageGroup.max = Math.max(ageGroup.crude_booster_irr, ageGroup.crude_irr);
}
function findStatusByColor(legend, color){
    var index = legend.findIndex(d => d.color === color);
    if(index === 2){
        return "Boosted";
    }else if( index===4){
        return "Boosted";
    }else {
        return "Non-Boosted";
    }
}
function createLegend(svg, legendData) {
    const legendWidth = Number(svg.attr("width"));
    const legendHeight = Number(svg.attr("height"));
    const colorGroup = svg.append("g");
    const textGroup = svg.append("g");
    const padding = {left:20, top: 30, bottom: 30 };
    const scale = d3.scaleLinear()
        .domain([0,legendData.length-1])
        .range([padding.top, legendHeight - padding.bottom]);    
    
    colorGroup.selectAll("circle")
        .data(legendData)
        .enter()
        .append("circle")
        .attr("cx", padding.left)  // Set the x position of the circle
        .attr("cy", (d, i) => scale(i))  // Set the y position based on scale
        .attr("r", 4)  // Set the radius of each circle
        .attr("fill", d => d.color);  // Set the fill color from legendData
    textGroup.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", padding.left * 2)  // Position text horizontally
        .attr("y", (d, i) => scale(i))  // Position text vertically based on scale
        .attr("dy", 5)  // Adjust vertical alignment of the text
        .text(d => d.label);  // Set the text content from legendData
    console.log(colorGroup);
    console.log(textGroup);
}
async function AgeByVaccinationCharts() {
    const mainDiv = d3.select("#Age-by-Vaccination");
    const svgVacByReInfection = d3.select("#Age-by-Vaccination-by-ReInfection");
    const svgLegendInfections = d3.select("#Infection-Legend");
    const svgLegendReInfections = d3.select("#ReInfection-Legend");
    const svgVacByInfection = d3.select("#Age-by-Vaccination-by-Infection");

    const legendDataVacByInfection = [
        {color: "#ffa600", label: "UnVaccinated Cases"},
        {color: "#ff6361", label: "Primary Vaccination Cases"},
        {color: "#58508d", label: "Boosted Vaccination Cases"},
        {color: "#bc5090", label: "Non - Boosted Cases"},
        {color: "#003f5c", label: "Boosted Vaccination Cases"},
    ];
    
    createLegend(svgLegendInfections, legendDataVacByInfection.slice(0,3));
    createLegend(svgLegendReInfections, legendDataVacByInfection.slice(3,5));

    async function vacByInfection() {
        const svgWidth = Number(svgVacByInfection.attr("width"));
        const svgHeight = Number(svgVacByInfection.attr("height"));
        const padding = { top: 30, right: 30, bottom: 30, left:100 };
        const chartWidth = svgWidth - (padding.left + padding.right);
        const chartHeight = svgHeight - (padding.top + padding.bottom);
        
        var mouseover = function(d) {
            var subgroupName = d3.select(this)._groups[0][0].__data__.key;
            var subgroupStatus = findStatusByColor(legendDataVacByInfection, d3.select(this).attr("fill"));
            d3.selectAll("rect")
                .style("opacity", function(d) {
                    var currFill = d3.select(this).attr("fill");
                    var currStatus = findStatusByColor(legendDataVacByInfection, currFill);
                    if(d.key === subgroupName){
                        if(currStatus === subgroupStatus){
                            return 1.0;
                        }else{
                            return 0.4;
                        }
                    }else{
                        return 0.1;
                    }
                });
        }

        var mouseleave = function(d) {
            d3.selectAll("rect")
                .style("opacity", 1.0);
        }


        function populateInfectionChart(data) {
    
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
        
            calculateInfectionTotals(data, ageGroup1);
            calculateInfectionTotals(data, ageGroup2);
            calculateInfectionTotals(data, ageGroup3);
            calculateInfectionTotals(data, AllAges);
            console.log(ageGroup1, ageGroup2, ageGroup3, AllAges);
        
            var formattedData = [ageGroup1, ageGroup2, ageGroup3];
        
           
            var maxPopulation = Math.max(ageGroup1.max,ageGroup2.max,ageGroup3.max);
            const xScale = d3.scaleBand()
                .domain(formattedData.map(d => d.key))  
                .range([0, chartWidth])
                .padding(0.1);  
            const yScale = d3.scaleLinear()
                .domain([0, roundToHighestPlaceVal(maxPopulation)])
                .range([chartHeight + padding.bottom, 0]);
        
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);
            svgVacByInfection.append("g")
                .attr("transform", `translate(${padding.left}, ${padding.top + chartHeight})`)
                .call(xAxis);
            svgVacByInfection.append("g")
                .attr("transform", `translate(${padding.left}, ${0})`)
                .call(yAxis);
            svgVacByInfection.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -(chartHeight - padding.top -20) ) 
                .attr("y", padding.left*2/3) 
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text("Infections Per 100,000 People");
            svgVacByInfection.append("text")
                .attr("x", chartWidth - padding.left)
                .attr("y", chartHeight + padding.bottom*1.9 )
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text("Age Group");
            const bWidth = xScale.bandwidth()/3;

            formattedData.forEach((ageGroup, i) => {
                svgVacByInfection.selectAll(`.unBoostedCases`)
                    .data([ageGroup])
                    .enter().append("rect")
                    .attr("x", padding.left + xScale(ageGroup.key) + 2 * bWidth)
                    .attr("y", d => yScale(d.crude_unvax_ir))
                    .attr("width", bWidth)
                    .attr("height", d => chartHeight + padding.bottom - yScale(d.crude_unvax_ir))
                    .attr("fill", legendDataVacByInfection[0].color )
                    .on("mouseover", mouseover)
                    .on("mouseleave", mouseleave);        
                svgVacByInfection.selectAll(`.unBoostedCases`)
                    .data([ageGroup])
                    .enter().append("rect")
                    .attr("x", padding.left + xScale(ageGroup.key) + bWidth)
                    .attr("y", d => yScale(d.crude_primary_series_only_ir))
                    .attr("width", bWidth)
                    .attr("height", d => chartHeight + padding.bottom - yScale(d.crude_primary_series_only_ir))
                    .attr("fill", legendDataVacByInfection[1].color)
                    .on("mouseover", mouseover)
                    .on("mouseleave", mouseleave);
                svgVacByInfection.selectAll(`.boostedCases`)
                    .data([ageGroup])
                    .enter().append("rect")
                    .attr("x", padding.left + xScale(ageGroup.key))
                    .attr("y", d => yScale(d.crude_booster_ir))
                    .attr("width", bWidth)
                    .attr("height", d => chartHeight + padding.bottom - yScale(d.crude_booster_ir))
                    .attr("fill", legendDataVacByInfection[2].color)
                    .on("mouseover", mouseover)
                    .on("mouseleave", mouseleave);
            });

        }


        function populateReInfectionChart(data) {

            var ageGroup1 = {
                key: "18-49",
                caseCount: 0,
                crude_booster_irr: 0,
                crude_irr: 0,
                max: 0,
            };
            var ageGroup2 = {
                key: "50-64",
                caseCount: 0,
                crude_booster_irr: 0,
                crude_irr: 0,
                max: 0,
            };
            var ageGroup3 = {
                key: "65+",
                caseCount: 0,
                crude_booster_irr: 0,
                crude_irr: 0,
                max: 0,
            };
            var AllAges = {
                key: "all_ages",
                caseCount: 0,
                crude_booster_irr: 0,
                crude_irr: 0,
                max: 0,
            }

            calculateReInfectionTotals(data, ageGroup1);
            calculateReInfectionTotals(data, ageGroup2);
            calculateReInfectionTotals(data, ageGroup3);
            calculateReInfectionTotals(data, AllAges);
            console.log(ageGroup1, ageGroup2, ageGroup3, AllAges);

            var formattedData = [ageGroup1, ageGroup2, ageGroup3];

            var maxPopulation = Math.max(ageGroup1.max, ageGroup2.max, ageGroup3.max, AllAges.max);

            const xScale = d3.scaleBand()
                .domain(formattedData.map(d => d.key))
                .range([0, chartWidth])
                .padding(0.1);  
            const yScale = d3.scaleLinear()
                .domain([0, roundToHighestPlaceVal(maxPopulation)])  
                .range([chartHeight + padding.bottom, 0]);
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);

            svgVacByReInfection.append("g")
                .attr("transform", `translate(${padding.left}, ${padding.top + chartHeight})`)
                .call(xAxis);
            svgVacByReInfection.append("g")
                .attr("transform", `translate(${padding.left}, ${0})`) 
                .call(yAxis);
            svgVacByReInfection.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -svgHeight*7/12) 
                .attr("y", padding.left*2/3)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text("ReInfections Per 100,000 People");
            svgVacByReInfection.append("text")
                .attr("x", chartWidth - padding.left)
                .attr("y", chartHeight + padding.bottom*1.9 )
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .text("Age Groups");
            const bWidth = xScale.bandwidth() / 2;
            
            formattedData.forEach((ageGroup, i) => {
                svgVacByReInfection.selectAll(`.boostedCases`)
                    .data([ageGroup])
                    .enter().append("rect")
                    .attr("x", padding.left + xScale(ageGroup.key) + bWidth)
                    .attr("y", d => yScale(d.crude_booster_irr))
                    .attr("width", bWidth)
                    .attr("height", d => chartHeight + padding.bottom - yScale(d.crude_booster_irr))
                    .attr("fill", legendDataVacByInfection[3].color)                    
                    .on("mouseover", mouseover)
                    .on("mouseleave", mouseleave);
                svgVacByReInfection.selectAll(`.unBoostedCases`)
                    .data([ageGroup])
                    .enter().append("rect")
                    .attr("x", padding.left + xScale(ageGroup.key))
                    .attr("y", d => yScale(d.crude_irr))
                    .attr("width", bWidth)
                    .attr("height", d => chartHeight + padding.bottom - yScale(d.crude_irr))
                    .attr("fill", legendDataVacByInfection[4].color)
                    .on("mouseover", mouseover)
                    .on("mouseleave", mouseleave);
            });
        }
        mainDiv.selectAll("rect")
            .on("mouseover", function (event, d) {
                svgVacByInfection.selectAll("rect").style("opacity", 0.2);
                svgVacByReInfection.selectAll("rect").style("opacity", 0.2);
                const rectClass = this.getAttribute("class");
                svgVacByInfection.selectAll(`.${rectClass}`).style("opacity", 1);
                svgVacByReInfection.selectAll(`.${rectClass}`).style("opacity", 1);
            })
            .on("mouseout", function () {
                const rectClass = this.getAttribute("class");
                svgVacByInfection.selectAll(`.${rectClass}`).style("opacity", 1);
                svgVacByReInfection.selectAll(`.${rectClass}`).style("opacity", 1);
            });
        const data = await d3.csv("Cases-by-Age-by-Vaccination-Status.csv");
        populateInfectionChart(data);
        populateReInfectionChart(data);
    }
    await vacByInfection();    
}
 AgeByVaccinationCharts();
