from influxdb_client import InfluxDBClient, Point, QueryApi
import numpy as np
from influxdb_client.client.write_api import SYNCHRONOUS
import psycopg2
import time
import csv
import openpyxl
from openpyxl import Workbook
import pickle



csv_file_path = 'Cards_inventory_Sheet1.csv'

# InfluxDB configuration
influx_url = "http://10.10.10.10:8086" 
bucket = 'CIPS'
influx_username = 'azin'
influx_password = 'azin@influx'
influx_token = 'hBdU3AQ0ixMsdq8R7q9uXPxfYW24CsNeMc3Avj5TvUuIfe_FlKg9IW9crN7fDzcdjk7MnuRPEzWdcpOdAw2x9Q=='

# PostgreSQL configuration
pg_host = '10.10.10.10'
pg_database = 'cips'
pg_user = 'azin'
pg_password = 'azin2415711'

# List of BLE devices

defined_ble_receivers = [
    "BLE_Receiver_1",
    "BLE_Receiver_2",
    "BLE_Receiver_3",
    "BLE_Receiver_4",
    "BLE_Receiver_5",
    "BLE_Receiver_6",
    "BLE_Receiver_7"
]

with open('Localization_27_11_2023.pkl', 'rb') as file:
    pdfs = pickle.load(file)

#with open('Localization.pkl', 'wb') as file:
 #   pickle.dump(pdfs, file)

rfid_to_ble_mapping = {}
aruco_to_ble_mapping = {}
with open(csv_file_path, 'r') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        ble_mac_address = row['BLE MAC address']
        rfid_epc = row['RFID tag number (EPC)']
        aruco_ID = row['ArUco 4x4 ID']
        if ble_mac_address and rfid_epc:
            rfid_to_ble_mapping[rfid_epc] = ble_mac_address
        if ble_mac_address and aruco_ID:
            aruco_to_ble_mapping[aruco_ID] = ble_mac_address


def localization(device_data):
   X = np.array([device_data])
   print(X)
   X[X == 0] = -120
   if (X[0][0]>=-80):
     print(1)
     return 1
   if (X[0][1]>=-79) and (X[0][2]<=-78):
     print(2)
     return 2
   else :
     log_probs = []
     for label, kde in pdfs:
       log_prob = kde.score_samples(X.reshape(1, -1))
       log_probs.append((label, log_prob))

   best_label_BLE, best_log_prob = max(log_probs, key=lambda x: x[1]) 
   sorted_log_probs = sorted(log_probs, key=lambda x: x[1], reverse=True)
   second_largest = sorted_log_probs[1][0]
   print(best_label_BLE, best_log_prob)
   print(second_largest, sorted_log_probs[1][1])
   if (best_label_BLE==1 and second_largest==3)or (best_label_BLE==3 and second_largest==1):
       best_label_BLE=2
   elif (best_label_BLE==1 and second_largest==4)or (best_label_BLE==4 and second_largest==1):
       best_label_BLE=2
   elif (best_label_BLE==2 and second_largest==4)or (best_label_BLE==4 and second_largest==2):
       best_label_BLE=2
   return best_label_BLE

def csvData(csv_path, title):
    device_names = []
    with open(csv_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        if title=='BLE MAC address':
            for row in reader:
                mac_address = row[title]
                device_names.append(mac_address)
        elif title=='ArUco 4x4 ID':
            for row in reader:
                aruco_id = row[title]
                device_names.append(aruco_id)
        else:
            for row in reader:
                mac_address = row['RFID tag number (EPC)']
                device_names.append(mac_address)
    return device_names

# Create an InfluxDB client
influx_client = InfluxDBClient(url=influx_url, token=influx_token)

# Create a query API client
query_api = influx_client.query_api()

# Create a PostgreSQL connection
pg_connection = psycopg2.connect(
    host=pg_host,
    database=pg_database,
    user=pg_user,
    password=pg_password
)

defined_ble_devices = csvData(csv_file_path,'BLE MAC address')

rssi_data = [{receiver: {} for receiver in defined_ble_receivers} for device in defined_ble_devices]

defined_rfid_devices = csvData(csv_file_path,'RFID tag number (EPC)')

rfid_data = {device: [] for device in defined_rfid_devices}

defined_aruco_devices= csvData(csv_file_path,'ArUco 4x4 ID')

aruco_data = {device: [] for device in defined_aruco_devices}

workbook = Workbook()
sheet = workbook.active
headers = ['BLE Device', 'BLE RSSI', 'RFID Device', 'RFID RSSI', 'Aruco Device', 'Aruco Value']
sheet.append(headers)

while True:
    
    for device_index, device in enumerate(defined_ble_devices):
        for receiver_index, receiver in enumerate(defined_ble_receivers):
            rssi_data[device_index][receiver] = {}
    for device in defined_rfid_devices:
        rfid_data[device] = []
    for device in defined_aruco_devices:
        aruco_data[device] = []

    influx_query = 'from(bucket: "CIPS") |> range(start: -11s) |> filter(fn: (r) => r["_measurement"] == "BLEData" or r["_measurement"] == "RFIDData" or  r["_measurement"] == "ArUcoData" )'.format(bucket)
    results = query_api.query(org="citin", query=influx_query)
    #print(results)
    # Create a PostgreSQL cursor
    pg_cursor = pg_connection.cursor()

    # Process and insert the query result into PostgreSQL
    for table in results:
        for record in table.records:
            name=record['Name']
            id = record['ID']
            rssi = record.get_value()
            measurement = record['_measurement']
            print(f'RSSI: {rssi}')
            if measurement == "RFIDData":
                if name in defined_rfid_devices:
                    rfid_data[name].append(rssi)
            elif measurement == "ArUcoData":
                if name in defined_aruco_devices:
                    aruco_data[name].append(rssi)
            else:
                for device_index, device in enumerate(defined_ble_devices):
                    if name == device:
                        for receiver_index, receiver in enumerate(defined_ble_receivers):
                            if receiver in id:
                                rssi_data[device_index][receiver][name] = rssi


   #  for device, rssi_values in rfid_data.items():
     #    print(f"RFID data for {device}: {rssi_values}")

   # ble_device_arrays = [rssi_data[device_index] for device_index in range(len(defined_ble_devices))]
   # rssi_values = [localization(device_data) for device_data in ble_device_arrays]

    #ble_device_rssi = [[rssi_data[device][receiver] if device in rssi_data and receiver in rssi_data[device] else 0] for device in defined_ble_devices for receiver in defined_ble_receivers]
    #print("RSSI values for BLE devices:", ble_device_rssi)


    ble_device_rssi = []
    for device_index, device in enumerate(defined_ble_devices):
        device_data = [rssi_data[device_index][receiver].get(device, 0) for receiver in defined_ble_receivers]
        #print(localization(device_data))

        rfid_rssi = None
        rfid_device_epc = None

        if device in rfid_to_ble_mapping.values():
            rfid_device_epc = next(epc for epc, ble in rfid_to_ble_mapping.items() if ble == device)
            if rfid_device_epc in rfid_data:
                rfid_rssi = rfid_data[rfid_device_epc]

        device_data = [rssi_data[device_index][receiver].get(device, 0) for receiver in defined_ble_receivers]

        aruco_rssi = None
        aruco_id = None

        if device in aruco_to_ble_mapping.values():
            aruco_id = next(epc for epc, ble in aruco_to_ble_mapping.items() if ble == device)
            if aruco_id in aruco_data:
                aruco_rssi = aruco_data[aruco_id]

        print(f'BLE Device: {device}, BLE RSSI: {device_data}, RFID Device: {rfid_device_epc}, RFID RSSI: {rfid_rssi}, aruco Device: {aruco_id}, Aruco Value: {aruco_rssi}')

        device_data_str = str(device_data)
        rfid_rssi_str = str(rfid_rssi)
        aruco_rssi_str = str(aruco_rssi)

        row_data = [device, device_data_str, rfid_device_epc, rfid_rssi_str, aruco_id, aruco_rssi_str]
        sheet.append(row_data)
        workbook.save("device_data.xlsx")

        final_location=0
        if rfid_rssi != None and len(rfid_rssi)>0:
            final_location = 1
        elif aruco_id != None and len(aruco_rssi)>0:
            final_location = 1
        elif all(value == 0 for value in device_data) and final_location==0:
            final_location = 0
        else:
           final_location=localization(device_data)
          # final_location = 2

        if final_location != 0 and aruco_id != 0:
            insert_sql = """
            INSERT INTO positioning (card_id, location_id, timestamp)
            VALUES (%s, %s, NOW());
            """
            pg_cursor = pg_connection.cursor()
            pg_cursor.execute(insert_sql, (aruco_id, final_location))
            pg_connection.commit()
            pg_cursor.close()

    # Commit changes to PostgreSQL
    #pg_connection.commit()
    #pg_cursor.close()

    # Insert a new row into your PostgreSQL table
    #insert_sql = """INSERT INTO positioning (card_id, location_id, timestamp) VALUES (1, 1, NOW()); """

    #pg_cursor = pg_connection.cursor()
    #pg_cursor.execute(insert_sql)
    #pg_connection.commit()
    #pg_cursor.close()
    # Sleep for 10 seconds
    time.sleep(10)

