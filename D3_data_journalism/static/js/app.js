var data = []

d3.csv('./static/data/data.csv').then(function loadData(incoming){
    data = incoming
    console.log(data)
})