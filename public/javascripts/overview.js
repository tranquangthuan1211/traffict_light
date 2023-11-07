var ctx = document.getElementById('trafficState').getContext('2d');
var pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        datasets: [{
            data: state,
            backgroundColor: ['#00c88b', '#66c5f4', '#fead34', '#e66b4c', '#e04e29']
        }],
        labels : [
            'Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'
        ]
    },
    options: {
        title: {
            display: true,
            text: 'Mật độ giao thông',
            fontSize: 15,
            fontColor: '#555',
        }
    }
})