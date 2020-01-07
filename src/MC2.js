var selected_sensor = undefined;
var selected_month = undefined;
var selected_chemical = undefined;
var selected_fac = undefined;
var init = 1;
var max_value_map = {};
var fac_sensor_map = {};

const month_key_map = { 4: '2016-04', 8: '2016-08', 12: '2016-12' };
const all_hours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
    '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
const month_to_days = {
    4: function () { var tmp = []; for (var i = 1; i <= 30; ++i) tmp.push(i); return tmp; },
    8: function () { var tmp = []; for (var i = 1; i <= 31; ++i) tmp.push(i); return tmp; },
    12: function () { var tmp = []; for (var i = 1; i <= 31; ++i) tmp.push(i); return tmp; }
};
const month_num_days = {
    4: 30,
    8: 31,
    12: 31
}
const chemicals = ["Appluimonia", "Chlorodinine", "Methylosmolene", "AGOC-3A"];
const color_range_map = {
    "Appluimonia": colorbrewer.YlOrRd[5]
    , "Chlorodinine": colorbrewer.Purples[5],
    "Methylosmolene": colorbrewer.Blues[5],
    "AGOC-3A": colorbrewer.Greens[5]
};
const sensor_loc = [
    [62, 21], [66, 35], [76, 41], [88, 45],
    [103, 43], [102, 22], [89, 3], [74, 7], [119, 42]
];
const fac_loc = {
    "Roadrunner Fitness Electronics": [89, 27],
    "Kasios Office Furniture": [90, 21],
    "Radiance ColourTek": [109, 26],
    "Indigo Sol Boards": [120, 22]
};
const fac_colors = {
    "Roadrunner Fitness Electronics": "blue",
    "Kasios Office Furniture": "green",
    "Radiance ColourTek": "purple",
    "Indigo Sol Boards": "red"
};


function draw_heat() {
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
    // console.log(dataset)
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
        .attr("onclick", function (d, i) {
            if (d.is_empty) return "";
            else {
                return "draw_wind_dir(\"" + d.date + "\",\"" + d.hour + "\")";
            }
        })
        .style("cursor", "pointer");
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

function calc_value(theta, speed) {
    return Math.exp(0.5 * speed * Math.cos(theta));
    // [TODO] 尝试不同的模型
}

function calc_by_id(dir, speed, fac) {
    fac_sensor_dir = fac_sensor_map[selected_sensor][fac]
}

function calc_dir(loc1, loc2) {
    // calculate the direction from loc1 to loc2
    dir_loc = [loc2[0] - loc1[0], loc2[1] - loc1[1]];
    theta = Math.atan(dir_loc[1] / dir_loc[0]);
    if (dir_loc[0] < 0) theta = theta + Math.PI;
    if (theta < 0) theta = theta + 2 * Math.PI;
    theta = Math.PI / 2 - theta;
    if (theta < 0) theta = theta + 2 * Math.PI;
    // console.log(theta / Math.PI * 180);
    return theta;
}

function init_fac_sensor_map() {
    for (var i = 1; i <= 9; ++i) {
        fac_sensor_map[i] = {};
        var this_sensor_loc = sensor_loc[i - 1];
        for (fac in fac_loc) {
            // console.log("init  " + i.toString() + "  " + fac)
            fac_sensor_map[i][fac] = calc_dir(fac_loc[fac], this_sensor_loc);
        }
    }
}

function draw_dir_curve() {
    var width = 1860;
    var height = 200;
    var padding = { "left": 50, "right": 10, "top": 20, "bottom": 20 };
    var dataset = {};
    var all_dataset = [];
    // for (each_year in all_data) {
    //     if (selected_year != "all" && each_year.toString() != selected_year) {
    //         console.log("not me");
    //         continue;
    //     }
    //     all_days = all_data[each_year];
    //     for (each_day in all_days) {
    //         if (cnt % (selected_year == "all" ? 20 : 5) == 0) {
    //             for (var i = 0; i < cities.length; i++) {
    //                 dataset[i].push({ 'x': cnt, 'y': all_days[each_day][selected_type][i] });
    //                 all_dataset.push({ 'x': cnt, 'y': all_days[each_day][selected_type][i] });
    //             }
    //         }
    //         cnt++;
    //     }
    // }
    // console.log(cnt);
    // console.log(dataset[0].length)
    for (fac in fac_loc) {
        var cnt = 0;
        console.log("processing  " + selected_sensor.toString() + "  " + fac)
        dataset[fac] = [];
        var addcnt_flag = false;
        for (each_day in wind_data) {
            if (parseInt(each_day.substr(5, 2)) != selected_month) {
                this_day = wind_data[each_day];
                for (each_hour in this_day) {
                    this_data = this_day[each_hour];
                    this_dir = this_data["direction"] / 180 * Math.PI;
                    theta = Math.abs(this_dir - fac_sensor_map[selected_sensor][fac])
                    if (theta > Math.PI) theta = 2 * Math.PI - theta;
                    this_value = calc_value(theta, this_data["speed"]);
                    all_dataset.push(this_value);
                }
                continue;
            }
            if (!addcnt_flag && selected_month == 8) {
                cnt += 24;
                addcnt_flag = true;
            }
            this_day = wind_data[each_day];
            var last_hour = -3;
            for (each_hour in this_day) {
                var int_hour = parseInt(each_hour);
                if (int_hour - last_hour != 3) {
                    cnt += parseInt((int_hour - last_hour) / 3) - 1;
                }
                this_data = this_day[each_hour];
                this_dir = this_data["direction"] / 180 * Math.PI;
                theta = Math.abs(this_dir - fac_sensor_map[selected_sensor][fac])
                if (theta > Math.PI) theta = 2 * Math.PI - theta;
                this_value = calc_value(theta, this_data["speed"]);
                dataset[fac].push({ 'x': cnt, 'y': this_value });
                all_dataset.push(this_value);
                cnt++;
                last_hour = int_hour;
            }
        }
    }
    console.log(cnt);
    // console.log(dataset["Roadrunner Fitness Electronics"].length);
    // console.log(all_dataset.length);
    if (init == 0) {
        d3.select("#curve").selectAll("#dir-svg").remove();
    }
    var dir_svg = d3.select("#curve")
        .append("svg")          //添加一个svg元素
        .attr("width", width)       //设定宽度
        .attr("height", height)    //设定高度
        .style("margin-top", 10)
        .attr("id", "dir-svg");
    //    .style("background-color", "#000000");
    var xScale = d3.scaleLinear()
        .domain(d3.extent(dataset[selected_fac], function (d) {
            return d.x;
        }))
        .range([0, width - padding.left - padding.right]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(all_dataset, function (d) {
            return d;
        })])
        .range([height - padding.top - padding.bottom, 0]);
    var xAxis = d3.axisBottom(xScale).ticks(0);
    var yAxis = d3.axisLeft(yScale).ticks(8);
    dir_svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
        .call(xAxis);
    dir_svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .call(yAxis);
    dir_svg.append("text")
        .text("sensor: " + selected_sensor.toString())
        .attr("text-anchor", "begin")
        .attr("dy", 12)
        .attr("dx", 40);
    var line = d3.line()
        .x(function (d) {
            return xScale(d.x)
        })
        .y(function (d) {
            return yScale(d.y);
        })
        .curve(d3.curveMonotoneX)
    for (fac in fac_loc) {
        if (fac == selected_fac) {
            dir_svg.append('path')
                .attr('class', 'line')
                .attr('stroke', fac_colors[fac])
                .attr('stroke-width', '3px')
                .attr('fill', 'none')
                .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
                .attr('d', line(dataset[fac]));
        }
    }
    for (var i = 0; i < month_num_days[selected_month]; ++i) {
        dir_svg.append("text")
            .text(i + 1)
            .attr("x", padding.left + i * 1800 / month_num_days[selected_month])
            .attr("y", 10 + height - padding.bottom)
            .attr("font-size", 10);
    }
}

function draw_read_curve() {
    var read_data = sensor_data[selected_sensor][selected_chemical];
    var width = 1860;
    var height = 200;
    var padding = { "left": 50, "right": 10, "top": 20, "bottom": 20 };
    var dataset = [];
    var all_dataset = [];
    var cnt = 0;
    console.log("processing  " + selected_sensor.toString() + "  " + fac)
    var addcnt_flag = false;
    for (each_day in read_data) {
        this_day = read_data[each_day];
        if (parseInt(each_day.substr(5, 2)) != selected_month) {
            for (each_hour in this_day) {
                this_data = this_day[each_hour];
                all_dataset.push(this_data);
            }
            continue;
        }
        var last_hour = -1;
        for (each_hour in this_day) {
            var int_hour = parseInt(each_hour);
            cnt += int_hour - last_hour - 1;
            this_data = this_day[each_hour];
            dataset.push({ 'x': cnt, 'y': this_data });
            all_dataset.push(this_data);
            cnt++;
            last_hour = int_hour;
        }
    }
    console.log(cnt);
    if (init == 0) {
        d3.select("#curve").selectAll("#read-svg").remove();
    }
    var read_svg = d3.select("#curve")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("margin-top", 10)
        .attr("id", "read-svg");
    //  .style("background-color", "#000000");
    var xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, function (d) {
            return d.x;
        }))
        .range([0, width - padding.left - padding.right]);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(all_dataset, function (d) {
            return d;
        })])
        .range([height - padding.top - padding.bottom, 0]);
    var xAxis = d3.axisBottom(xScale).ticks(0);
    var yAxis = d3.axisLeft(yScale).ticks(8);
    read_svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + (height - padding.bottom) + ')')
        .call(xAxis);
    read_svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .call(yAxis);
    read_svg.append("text")
        .text("sensor: " + selected_sensor.toString() + " && " + "chemical: " + selected_chemical)
        .attr("text-anchor", "begin")
        .attr("dy", 12)
        .attr("dx", 40);
    var line = d3.line()
        .x(function (d) {
            return xScale(d.x)
        })
        .y(function (d) {
            return yScale(d.y);
        })
        .curve(d3.curveMonotoneX)
    read_svg.append('path')
        .attr('class', 'line')
        .attr('stroke', "black")
        .attr('stroke-width', '3px')
        .attr('fill', 'none')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .attr('d', line(dataset));
    for (var i = 0; i < month_num_days[selected_month]; ++i) {
        read_svg.append("text")
            .text(i + 1)
            .attr("x", padding.left + i * 1800 / month_num_days[selected_month])
            .attr("y", 10 + height - padding.bottom)
            .attr("font-size", 10);
    }
}

function draw_wind_dir(date, hour) {
    console.log([date, hour]);


    // var obs = {};
    // var obs_arr = [];
    // for (key in sensor_data) {
    //     obs[key] = sensor_data[key][selected_chemical][date][hour];
    //     obs_arr.push(obs[key]);
    // }
    // let thresholds = d3.ticks(d3.min(obs_arr), d3.max(obs_arr), 5);
    // let color = d3.scaleSequential(d3.interpolateMagma)
    //     .domain(d3.extent(thresholds));
    // let contours = d3.contours()
    //     .size([500, 500])
    //     .thresholds(thresholds)
    //     (obs_arr);
    // console.log(obs_arr)
    // console.log(contours)

    var width = 900;
    var height = 500;
    d3.select("#wind").selectAll("svg").remove();
    var svg = d3.select("#wind").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("margin-top", 10);
    //    .style("background-color", "#000000");

    // svg.append("g").selectAll(".contour")
    //     .data(contours)
    //     .enter().append("path")
    //     .attr("class", "contour")
    //     .attr("d", d3.geoPath())
    //     .attr("stroke", function (d) { return color(d.value); })
    //     .attr("stroke-width", 5)
    //     .attr("fill", "none");


    svg.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .text("Time: " + date + "  " + hour + ": 00 && Chemical: " + selected_chemical)
        .attr("font-size", "24");
    if (wind_data[date] != undefined && wind_data[date][hour] != undefined) {
        var this_data = wind_data[date][hour];
        var arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        var defs = svg.append("defs");
        //添加marker标签及其属性
        var arrowMarker = defs.append("marker")
            .attr("id", "arrow")
            .attr("markerUnits", "userSpaceOnUse")
            .attr("markerWidth", 30)
            .attr("markerHeight", 30)
            .attr("viewBox", "0 0 12 12")
            .attr("refX", 6)
            .attr("refY", 6)
            .attr("orient", "auto")
        arrowMarker.append("path")
            .attr("d", arrow_path)
            .attr("fill", "#C0C0C0")
        //绘制直线
        var theta = this_data["direction"] / 180 * Math.PI;
        for (var i = 0; i < 9; ++i) {
            for (var j = 1; j < 5; ++j) {
                svg.append("line")
                    .attr("x1", 50 + i * 100)
                    .attr("y1", 50 + j * 100)
                    .attr("x2", 50 + i * 100 + 20 * Math.cos(Math.PI / 2 - theta))
                    .attr("y2", 50 + j * 100 - 20 * Math.sin(Math.PI / 2 - theta))
                    .attr("stroke", "#C0C0C0")
                    .attr("stroke-width", 5)
                    .attr("marker-end", "url(#arrow)");
            }
        }
    }
    // 扩大五倍，向上平移100
    for (var i = 0; i < 9; ++i) {
        svg.append("circle")
            .attr("cx", sensor_loc[i][0] * 5)
            .attr("cy", height - sensor_loc[i][1] * 5 - 100)
            .attr("r", 5)
            .style("fill", "#2E9AFE");
        svg.append("text")
            .attr("x", sensor_loc[i][0] * 5 - 25)
            .attr("y", height - sensor_loc[i][1] * 5 - 100 + 5)
            .text("S" + (i + 1).toString());
    }
    var i = 0;
    for (fac in fac_loc) {
        ++i;
        svg.append("rect")
            .attr("x", fac_loc[fac][0] * 5 - 5)
            .attr("y", height - fac_loc[fac][1] * 5 - 105)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#FF8000");
        svg.append("text")
            .attr("x", fac_loc[fac][0] * 5 - 5)
            .attr("y", height - fac_loc[fac][1] * 5 - 80)
            .text("F" + i.toString());
        svg.append("text")
            .attr("x", 700)
            .attr("y", 30 * i)
            .text("F" + i.toString() + ": " + fac)
            .attr("font-size", "14");
    }
}

function handle_change_selection() {
    var obj_sensor = document.getElementsByName("sensor");
    var obj_month = document.getElementsByName("month");
    var obj_chemical = document.getElementsByName("chemical");
    var obj_fac = document.getElementsByName("fac");
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
    for (var i = 0; i < obj_fac.length; i++) {
        if (obj_fac[i].checked) {
            selected_fac = obj_fac[i].value;
            console.log(selected_fac);
        }
    }
    init_max_value_map();
    draw_heat();
    init_fac_sensor_map();
    draw_dir_curve();
    draw_read_curve();
    if (init == 1) {
        init = 0;
    }
}