import pandas as pd
import time
import json

print("\033[32m[INFO]\033[0m Reading sensor data")
sensor_data = pd.read_excel('data/Sensor Data.xlsx')
print("\033[32m[INFO]\033[0m Reading speed data")
speed_data = pd.read_excel('data/Meteorological Data2.xlsx')
print("\033[32m[INFO]\033[0m Reading complete")
sensor_keys = sensor_data.keys()
speed_keys = speed_data.keys()
print("\033[32m[INFO]\033[0m sensor keys: " + str(sensor_keys))
print("\033[32m[INFO]\033[0m speed keys: " + str(speed_keys))

final_sensor_data = {}
final_speed_data = {}
for data_item in sensor_data.iterrows():
    data_item = data_item[1]
    monitor = data_item['Monitor']
    chemical = data_item['Chemical']
    date = data_item['Date Time ']
    reading = data_item['Reading']
    if not monitor in final_sensor_data.keys():
        final_sensor_data[monitor] = {}
    this_monitor = final_sensor_data[monitor]
    if not chemical in this_monitor.keys():
        this_monitor[chemical] = {}
    this_chemical = this_monitor[chemical]
    today = str(date.date())
    nowhour = date.hour
    if today not in this_chemical.keys():
        this_chemical[today] = {}
    this_day = this_chemical[today]
    this_day[nowhour] = reading
print("\033[32m[INFO]\033[0m Preprocess sensor data done!")

for data_item in speed_data.iterrows():
    data_item = data_item[1]
    date = data_item['Date']
    direction = data_item['Wind Direction']
    speed = data_item['Wind Speed (m/s)']
    if pd.isnull(date) or pd.isnull(direction) or pd.isnull(speed):
        print("\033[33m[WARNING]\033[33m There is a null value!")
        continue
    today = str(date.date())
    nowhour = date.hour
    if today not in final_speed_data.keys():
        final_speed_data[today] = {}
    final_speed_data[today][nowhour] = {}
    final_speed_data[today][nowhour]['direction'] = direction
    final_speed_data[today][nowhour]['speed'] = speed
print("\033[32m[INFO]\033[0m Preprocess speed data done!")

with open('processed_data/sensor_data.json', 'w') as f:
    json.dump(final_sensor_data, f)
with open('processed_data/speed_data.json', 'w') as f:
    json.dump(final_speed_data, f)
print("\033[32m[INFO]\033[0m Preprocess done!")
