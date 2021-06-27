let part1 = `
<div style="display: flex;justify-content: center;align-items: center;">
<div id="main" style="width: 600px;height:400px;"></div>

<script type="text/javascript">
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));
`;

 let part2 = `
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
</script>
</div>
`;