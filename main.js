// Get the container element by its ID
const container = document.getElementById("imageContainer");

// Create and configure the image
const image = document.createElement("img");
image.src = "SilohuetteOfSick.png";
image.alt = "5 silhouettes of people who are sick.";
image.style.width = "3000px"; // Example styling
image.style.height = "2000px";
// Append the image to the container
console.log(image);
container.appendChild(image);
console.log('hi');


function addSymptoms() {
//Data  
d3.csv('Long Covid Symptoms.csv').then(function(dataset) {
    console.log(dataset); 
    
    var commonSymptoms = d3.select('#symptoms').selectAll('p')
    .data(dataset)
    .enter()
    .append('p')
    .text(function(d, i) {
        // console.log(d.Symptom);
        // console.log(d.Percentage);
        return (d.Symptom + ": " + d.Percentage ); 
    })
    .style('color', 'black')
    .style('font-size', '0.9em');
    });

}

document.addEventListener("DOMContentLoaded", function() {
    addSymptoms();
});




