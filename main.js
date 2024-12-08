
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

async function AgeByVaccinationCharts() {
    const mainDiv = d3.select("#Age-by-Vaccination");
    const svgVacByReInfection = d3.select("#Age-by-Vaccination-by-ReInfection");
    const svgVacByInfection = d3.select("#Age-by-Vaccination-by-Infection");
    const legendDataVacByInfection = [
        {color: "#5c1907", label: "UnVaccinated Cases"},
        {color: "#b25812", label: "Primary Vaccination Cases"},
        {color: "#ffa600", label: "Boosted Vaccination Cases"},
        {color: "#234455", label: "Non - Boosted Cases"},
        {color: "#444444", label: "Boosted Vaccination Cases"},
    ];
    
    async function vacByInfection() {
        const svgWidth = Number(svgVacByInfection.attr("width"));
        const svgHeight = Number(svgVacByInfection.attr("height"));
        const padding = { top: 30, right: 30, bottom: 30, left:100 };
        const chartWidth = svgWidth - (padding.left + padding.right);
        const chartHeight = svgHeight - (padding.top + padding.bottom);
        
        var mouseover = function(d) {
            var subgroupName = d3.select(this)._groups[0][0].__data__.key;
            var subgroupStatus = findStatusByColor(legendDataVacByInfection, d3.select(this).attr("fill"));
            console.log(subgroupName);
            console.log(subgroupStatus);
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
            //d3.selectAll(`.${subgroupName}`).style("opacity", 1)
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
        
            // Define scales for the x and y axes
            const xScale = d3.scaleBand()
                .domain(formattedData.map(d => d.key))  
                .range([0, chartWidth])
                .padding(0.1);  
        
            const yScale = d3.scaleLinear()
                .domain([0, roundToHighestPlaceVal(maxPopulation)])
                .range([chartHeight, 0]);
        
            console.log('xScale domain:', xScale.domain());
            console.log('yScale domain:', yScale.domain());
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);
        
            // Append the axes to the SVG
            svgVacByInfection.append("g")
                .attr("transform", `translate(${padding.left}, ${svgHeight - padding.bottom})`) // Position x-axis
                .call(xAxis);
        
            svgVacByInfection.append("g")
                .attr("transform", `translate(${padding.left}, ${padding.top})`)  // Position y-axis
                .call(yAxis);
        
            // You can now add the bars or other visual elements to the chart
            const bWidth = xScale.bandwidth()/3;

            formattedData.forEach((ageGroup, i) => {
                // Boosted cases
                svgVacByInfection.selectAll(`.unBoostedCases`)
                    .data([ageGroup])
                    .enter().append("rect")
                    .attr("x", padding.left + xScale(ageGroup.key))
                    .attr("y", d => yScale(d.crude_unvax_ir))
                    .attr("width", bWidth)
                    .attr("height", d => chartHeight + padding.bottom - yScale(d.crude_unvax_ir))
                    .attr("fill", legendDataVacByInfection[0].color )
                    .on("mouseover", mouseover)
                    .on("mouseleave", mouseleave);
        
                // Vaccine cases
                svgVacByInfection.selectAll(`.unBoostedCases`)
                    .data([ageGroup])
                    .enter().append("rect")
                    .attr("x", padding.left + xScale(ageGroup.key) + bWidth)
                    .attr("y", d => yScale(d.crude_primary_series_only_ir))
                    .attr("width", bWidth)
                    .attr("height", d => chartHeight + padding.bottom  - yScale(d.crude_primary_series_only_ir))
                    .attr("fill", legendDataVacByInfection[1].color)
                    .on("mouseover", mouseover)
                    .on("mouseleave", mouseleave);
        
                // Unvaccinated cases
                svgVacByInfection.selectAll(`.boostedCases`)
                    .data([ageGroup])
                    .enter().append("rect")
                    .attr("x", padding.left + xScale(ageGroup.key) + 2 * bWidth)
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

            var formattedData = [ageGroup1, ageGroup2, ageGroup3];//, AllAges];

            var maxPopulation = Math.max(ageGroup1.max, ageGroup2.max, ageGroup3.max, AllAges.max);

            // Define scales for the x and y axes
            const xScale = d3.scaleBand()
                .domain(formattedData.map(d => d.key))  // Set the domain to be the unique age values
                .range([0, chartWidth])
                .padding(0.1);  // Adds padding between bars (if you're plotting bars)

            const yScale = d3.scaleLinear()
                .domain([0, roundToHighestPlaceVal(maxPopulation)])  // Set the domain to be the max case count
                .range([chartHeight, padding.top]);  // Flip the range so the higher values are at the top

            // Create the axes using d3.axisBottom for the x-axis and d3.axisLeft for the y-axis
            console.log('xScale domain:', xScale.domain());
            console.log('yScale domain:', yScale.domain());
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);

            // Append the axes to the SVG
            svgVacByReInfection.append("g")
                .attr("transform", `translate(${padding.left}, ${svgHeight - padding.bottom})`) // Position x-axis
                .call(xAxis);

            svgVacByReInfection.append("g")
                .attr("transform", `translate(${padding.left}, ${padding.top})`)  // Position y-axis
                .call(yAxis);

            // You can now add the bars or other visual elements to the chart
            const bWidth = xScale.bandwidth() / 2;
            formattedData.forEach((ageGroup, i) => {
                // Boosted cases
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

                // Vaccine cases
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
                console.log("MouseEntered "+this.getAttribute("class") );
                svgVacByInfection.selectAll("rect").style("opacity", 0.2);
                svgVacByReInfection.selectAll("rect").style("opacity", 0.2);
                const rectClass = this.getAttribute("class");
                // Restore opacity for corresponding elements in both SVGs
                svgVacByInfection.selectAll(`.${rectClass}`).style("opacity", 1);
                svgVacByReInfection.selectAll(`.${rectClass}`).style("opacity", 1);
            })
            .on("mouseout", function () {
                console.log("MouseExit "+this.getAttribute("class") );
                // Reset opacity to full for both SVGs
                const rectClass = this.getAttribute("class");
                // Restore opacity for corresponding elements in both SVGs
                svgVacByInfection.selectAll(`.${rectClass}`).style("opacity", 1);
                svgVacByReInfection.selectAll(`.${rectClass}`).style("opacity", 1);
            });
        

        const data = await d3.csv("Cases-by-Age-by-Vaccination-Status.csv");
        populateInfectionChart(data);
        populateReInfectionChart(data);
    }
    await vacByInfection();    
}
await AgeByVaccinationCharts();