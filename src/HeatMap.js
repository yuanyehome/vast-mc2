var selected_sensor = undefined
var selected_month = undefined
var selected_chemical = undefined

const month_key_map = { 4: '2016-04', 8: '2016-08', 12: '2016-12' }

function draw_heat_small() {
    var rect_attr = { "width": 15, "height": 10, "rx": 2, "ry": 2 };
    var all_values = []
    var width = 700;
    var height = 700;
    var cell_size = 11;
    var padding = { "left": 70, "right": 10, "top": 30, "bottom": 20 };
    if (init == 0) {
        d3.select("#heat").select("svg").remove();
    }
    var dataset = {};
    var dataset_1d = [];
    var all_months = [];
    var legend = [];
    for (var i = 0; i < 48; ++i) {
        var tmp_year = (2015 + parseInt(i / 12)).toString();
        var tmp_month = (1 + i % 12).toString();
        if (tmp_month.length == 1) tmp_month = '0' + tmp_month;
        all_months.push(tmp_year + tmp_month);
        dataset[tmp_year.toString() + tmp_month.toString()] = {};
        for (var j = 1; j <= 31; ++j) {
            var str_j = j.toString();
            if (str_j.length == 1) str_j = '0' + str_j;
            dataset[tmp_year + tmp_month][str_j] = undefined;
        }
    }
    for (each_year in all_data) {
        all_days = all_data[each_year];
        for (each_day in all_days) {
            var this_month = each_day.substr(0, 6);
            var this_day = each_day.substr(6, 2);
            var selected_city_idx = 0;
            var this_month_idx;
            for (var tmp_idx = 0; tmp_idx < 6; ++tmp_idx) {
                if (cities[tmp_idx] == selected_city) {
                    selected_city_idx = tmp_idx;
                    break;
                }
            }
            for (var tmp_idx = 0; tmp_idx < 48; ++tmp_idx) {
                if (all_months[tmp_idx] == this_month) {
                    this_month_idx = tmp_idx;
                    break;
                }
            }
            // console.log("heat_data")
            // console.log(this_month);
            // console.log(this_day);
            // console.log(all_days[each_day][selected_type][selected_city_idx]);
            dataset[this_month][this_day] = all_days[each_day][selected_type][selected_city_idx];
            dataset_1d.push({
                "day": parseInt(this_day),
                "month": this_month,
                "value": all_days[each_day][selected_type][selected_city_idx],
                "row": this_month_idx
            })
            all_values.push(all_days[each_day][selected_type][selected_city_idx])
            // console.log(dataset)
        }
    }
    var x_scale = d3.scaleLinear()
        .domain([0, 31])
        .range([0, width - padding.left - padding.right]);
    var max_value = d3.max(all_values);
    for (var i = 1; i <= parseInt(max_value); ++i) {
        legend.push(i);
    }
    var color_range = colorbrewer.YlOrRd[6];
    var color_scale = d3.scaleQuantile()
        .domain([0, max_value])
        .range(color_range);
    var svg = d3.select("#heat")
        .append("svg")          //添加一个svg元素
        .attr("width", width)       //设定宽度
        .attr("height", height)    //设定高度
        .style("margin-top", 10)

    svg.selectAll('.heat-map-rect').data(dataset_1d)
        .enter().append('rect')
        .attr('height', rect_attr.height)
        .attr('width', rect_attr.width)
        .attr('class', 'heat-map-rect bordered')
        .attr('x', function (d) { return 35 + x_scale(d.day - 1); })
        .attr('y', function (d) { return padding.top + d.row * cell_size; })
        .attr('rx', rect_attr.rx)
        .attr('ry', rect_attr.ry)
        .style("fill", function (d, i) {
            return color_scale(d.value);
        })
    svg.selectAll('row-label').data(all_months)
        .enter().append('text')
        .attr('x', 0)
        .attr('y', function (d, i) { return padding.top + (i + 1) * cell_size - 2; })
        .text(function (d) { return d; })
        .attr("font-size", 10);
    svg.selectAll('col-label').data(all_days_in_month)
        .enter().append('text')
        .attr('x', function (d, i) { return 43 + x_scale(i) })
        .attr('y', padding.top - 5)
        .text(function (d) { return d; })
        .style("text-anchor", "middle")
        .attr("font-size", 10);
    console.log(legend)
    svg.selectAll('.legend').data(legend)
        .enter().append('rect')
        .attr('height', 15)
        .attr('width', 300 / legend.length)
        .attr('class', 'heat-map-rect bordered')
        .attr('x', function (d, i) { return 30 + i * 300 / legend.length; })
        .attr('y', 0)
        .style("fill", function (d) {
            return color_scale(d);
        })
    svg.append("text")
        .text("0")
        .attr("x", 20)
        .attr("y", 15)
    svg.append("text")
        .text((1 + parseInt(max_value / 6)) * 6)
        .attr("x", 333)
        .attr("y", 15)
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
    // draw_heat_small();
    if (init == 1) init = 0;
}