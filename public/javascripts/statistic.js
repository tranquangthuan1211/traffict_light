var colors = [
    '#4dc9f6',
    '#f67019',
    '#f53794',
    '#537bc4',
    '#acc236',
    '#166a8f',
    '#00a950',
    '#58595b',
    '#8549ba'
];

var config = {
    type: 'line',
    data: {
        datasets: []
    },
    options: {
        title: {
            display: true,
            text: 'Mật độ giao thông tại ' + intersectionName.toUpperCase(),
            fontSize: 20,
            fontColor: '#333',
        },
        tooltips: {
            mode: 'nearest',
            intersect: true,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'hour',
                    parser: 'HH:mm:ss',
                    tooltipFormat: 'HH:mm:ss'
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Giờ'
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Tỉ lệ'
                }
            }]
        }
    }
}

function processData() {
    let preDate = '';
    let index = -1;
    for (let item of trafficDensity) {
        let dateTime = item.date.split(' ');
        if (dateTime[0] !== preDate) {
            index++;
            var itemData = {
                label: dateTime[0],
                backgroundColor: colors[index],
                borderColor: colors[index],
                fill: false,
                data: [{
                    x: dateTime[1],
                    y: item.rate
                }]
            };
            
            config.data.datasets.push(itemData);
        }
        else {
            config.data.datasets[index].data.push({
                x: dateTime[1],
                y: item.rate
            })
        };
        preDate = dateTime[0];
    }    
}

processData();

var ctx = document.getElementById('intersection').getContext('2d');
new Chart(ctx, config);