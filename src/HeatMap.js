var selected_sensor = undefined
var selected_month = undefined
var selected_chemical = undefined
var init = 1
var max_value_map = {}

const month_key_map = { 4: '2016-04', 8: '2016-08', 12: '2016-12' }
const all_hours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
    '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
const month_to_days = {
    4: function () { var tmp = []; for (var i = 1; i <= 30; ++i) tmp.push(i); return tmp; },
    8: function () { var tmp = []; for (var i = 1; i <= 31; ++i) tmp.push(i); return tmp; },
    12: function () { var tmp = []; for (var i = 1; i <= 31; ++i) tmp.push(i); return tmp; }
}
const chemicals = ["Appluimonia", "Chlorodinine", "Methylosmolene", "AGOC-3A"]
const color_range_map = {
    "Appluimonia": colorbrewer.YlOrRd[5]
    , "Chlorodinine": colorbrewer.Purples[5],
    "Methylosmolene": colorbrewer.Blues[5],
    "AGOC-3A": colorbrewer.Greens[5]
}

function draw_heat_small() {
    if (init == 0) {
        d3.select("#heat").select("svg").remove();
    }
    var rect_attr = { "width": 20, "height": 10, "rx": 2, "ry": 2 };
    var width = 700;
    var height = 700;
    var cell_size = 12;
    var padding = { "left": 70, "right": 10, "top": 30, "bottom": 20 };
    var dataset = [];
    var legend = [];
    var month_key = month_key_map[selected_month];
    console.log(month_key);
    var selected_data = sensor_data[selected_sensor.toString()][selected_chemical];
    console.log(selected_data)
    for (key in selected_data) {
        this_day = selected_data[key]
        if (key.indexOf(month_key) >= 0) {
            var tmp_hours = []
            for (hour in this_day) {
                tmp_hours.push(hour)
                dataset.push({
                    "date": key,
                    "hour": hour,
                    "value": this_day[hour],
                    "row": parseInt(key.substr(8, 2))
                })
            }
            for (var i = 0; i < 24; ++i) {
                var flag = false
                for (ele in tmp_hours) {
                    if (i == tmp_hours[ele]) flag = true
                }
                if (!flag) {
                    dataset.push({
                        "date": key,
                        "hour": i,
                        "value": 0,
                        "row": parseInt(key.substr(8, 2)),
                        "is_empty": true
                    })
                }
            }
        }
    }
    console.log(dataset)
    var x_scale = d3.scaleLinear()
        .domain([0, 24])
        .range([0, width - padding.left - padding.right]);
    for (var i = 1; i <= 1000; ++i) {
        legend.push(i);
    }
    var color_range = color_range_map[selected_chemical]
    var color_scale = d3.scaleQuantile()
        .domain([0, max_value_map[selected_chemical]])
        .range(color_range);
    var svg = d3.select("#heat")
        .append("svg")          //添加一个svg元素
        .attr("width", width)       //设定宽度
        .attr("height", height)    //设定高度
        .style("margin-top", 10)
        .style("margin-left", 10)

    svg.selectAll('.heat-map-rect').data(dataset)
        .enter().append('rect')
        .attr('height', rect_attr.height)
        .attr('width', rect_attr.width)
        .attr('class', 'heat-map-rect bordered')
        .attr('x', function (d) { return 25 + x_scale(parseInt(d.hour)); })
        .attr('y', function (d) { return padding.top + (d.row - 1) * cell_size; })
        .attr('rx', rect_attr.rx)
        .attr('ry', rect_attr.ry)
        .style("fill", function (d, i) {
            if (d.is_empty) {
                console.log("there is an empty data!")
                return "#000000";
            }
            else {
                return color_scale(d.value);
            }
        })
    svg.selectAll('row-label').data(month_to_days[selected_month]())
        .enter().append('text')
        .attr('x', 5)
        .attr('y', function (d, i) { return padding.top + (i + 1) * cell_size - 2; })
        .text(function (d) { if (d < 10) tmp = '0'; else tmp = ''; return tmp + d.toString(); })
        .attr("font-size", 10);
    svg.selectAll('col-label').data(all_hours)
        .enter().append('text')
        .attr('x', function (d, i) { return 35 + x_scale(i) })
        .attr('y', padding.top - 2)
        .text(function (d) { return d; })
        .style("text-anchor", "middle")
        .attr("font-size", 10);
    // console.log(legend)
    svg.selectAll('.legend').data(legend)
        .enter().append('rect')
        .attr('height', 15)
        .attr('width', 300 / legend.length)
        .attr('class', 'heat-map-rect bordered')
        .attr('x', function (d, i) { return 30 + i * 300 / legend.length; })
        .attr('y', 0)
        .style("fill", function (d) {
            return color_scale(d / 1000 * max_value_map[selected_chemical]);
        })
    svg.append("text")
        .text("0")
        .attr("x", 20)
        .attr("y", 13)
    svg.append("text")
        .text(max_value_map[selected_chemical])
        .attr("x", 333)
        .attr("y", 13)
}

function init_max_value_map() {
    for (each_key in chemicals) {
        var each_chemical = chemicals[each_key];
        var this_chemical_values = [];
        for (each_sensor in sensor_data) {
            var this_sensor_data = sensor_data[each_sensor];
            var this_chemical_data = this_sensor_data[each_chemical];
            for (each_day in this_chemical_data) {
                for (each_hour in this_chemical_data[each_day]) {
                    this_chemical_values.push(this_chemical_data[each_day][each_hour]);
                }
            }
        }
        max_value_map[each_chemical] = d3.max(this_chemical_values);
    }
    console.log(max_value_map);
}

function handle_change_selection() {
    var obj_sensor = document.getElementsByName("sensor");
    var obj_month = document.getElementsByName("month");
    var obj_chemical = document.getElementsByName("chemical");
    for (var i = 0; i < obj_sensor.length; i++) {
        if (obj_sensor[i].checked) {
            selected_sensor = obj_sensor[i].value;
            console.log(selected_sensor);
        }
    }
    for (var i = 0; i < obj_month.length; i++) {
        if (obj_month[i].checked) {
            selected_month = obj_month[i].value;
            console.log(selected_month);
        }
    }
    for (var i = 0; i < obj_chemical.length; i++) {
        if (obj_chemical[i].checked) {
            selected_chemical = obj_chemical[i].value;
            console.log(selected_chemical);
        }
    }
    init_max_value_map();
    draw_heat_small();
    if (init == 1) {
        init = 0;
    }
}