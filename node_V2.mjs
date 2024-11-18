import mqtt from 'mqtt';
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import pkg from 'pg';
import { exec } from 'child_process';
import cors from 'cors';
import express from 'express';

const app = express();
const port = 3002;

const { Pool } = pkg;

const pool = new Pool({
  user: 'azin',
  host: 'localhost',
  database: 'cips',
  password: 'azin2415711',
  port: 5432,
});

app.use(express.json());
app.use(cors());

const mqttHost = 'mqtt://10.10.10.10';
const mqttTopics = ['CiTin/CIPS/BLE/devices/#', 'CiTin/ISL/RFID/reader_01/tag', 'CiTin/CIPS/ArUcos/devices/#'];


const influxUrl = 'http://10.10.10.10:8086';
const token = 'hBdU3AQ0ixMsdq8R7q9uXPxfYW24CsNeMc3Avj5TvUuIfe_FlKg9IW9crN7fDzcdjk7MnuRPEzWdcpOdAw2x9Q==';
const org = 'citin';
const bucket = 'CIPS';

const influxDB = new InfluxDB({ url: influxUrl, token: token });

const mqttClient = mqtt.connect(mqttHost);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttTopics.forEach(topic => {
    mqttClient.subscribe(topic);
    console.log(`Subscribed to MQTT topic: ${topic}`);
  });
});

mqttClient.on('message', (topic, message) => {
  const messageString = message.toString();
  let name, rssi, id, pointType;

  if (topic.startsWith('CiTin/CIPS/BLE/devices/')) {
    const parts = messageString.split(', ');
    name = parts[0].replace('Name: ', '');
    rssi = parseFloat(parts[1].replace('RSSI: ', ''));
    id = parts[2].replace('ID: ', '');
    pointType = 'BLEData';
  } else if (topic === 'CiTin/ISL/RFID/reader_01/tag') {
	console.log('RFID');
    const parts = messageString.split(', ');
    name = parts[0].replace('EPC: ', '');
    rssi = parseFloat(parts[1].replace('RSSI: ', ''));
    id = 'reader_01';
    pointType = 'RFIDData';
  } else if (topic === 'CiTin/CIPS/ArUcos/devices/CAM-06') {
        console.log('ArUcos');
     const idString = messageString.match(/IDs: (\d+( \d+)*)/);
    if (idString) {
      const ids = idString[1].split(' ').map(id => parseInt(id));
      pointType = 'ArUcoData';

      ids.forEach(arUcoId => {
        const point = new Point(pointType)
          .tag('Name', arUcoId.toString())
          .tag('ID', 'CAM-06')
          .intField('Validation', 1);

        const writeApi = influxDB.getWriteApi(org, bucket);

        writeApi.writePoint(point);

        writeApi
          .close()
          .then(() => {
            console.log(`ArUco ID ${arUcoId} data written to InfluxDB`);
          })
          .catch(error => {
            console.error(`Error closing writeApi: ${error}`);
          });
      });
    }
  } else if (topic === 'CiTin/CIPS/ArUcos/devices/CAM-03') {
        console.log('ArUcos');
     const idString = messageString.match(/IDs: (\d+( \d+)*)/);
    if (idString) {
      const ids = idString[1].split(' ').map(id => parseInt(id));
      pointType = 'ArUcoData';

      ids.forEach(arUcoId => {
        const point = new Point(pointType)
          .tag('Name', arUcoId.toString())
          .tag('ID', 'CAM-03')
          .intField('Validation', 1);

        const writeApi = influxDB.getWriteApi(org, bucket);

        writeApi.writePoint(point);

        writeApi
          .close()
          .then(() => {
            console.log(`ArUco ID ${arUcoId} data written to InfluxDB`);
          })
          .catch(error => {
            console.error(`Error closing writeApi: ${error}`);
          });
      });
    }
  }else if (topic === 'CiTin/CIPS/ArUcos/devices/CAM-04') {
        console.log('ArUcos');
     const idString = messageString.match(/IDs: (\d+( \d+)*)/);
    if (idString) {
      const ids = idString[1].split(' ').map(id => parseInt(id));
      pointType = 'ArUcoData';

      ids.forEach(arUcoId => {
        const point = new Point(pointType)
          .tag('Name', arUcoId.toString())
          .tag('ID', 'CAM-04')
          .intField('Validation', 1);

        const writeApi = influxDB.getWriteApi(org, bucket);

        writeApi.writePoint(point);

        writeApi
          .close()
          .then(() => {
            console.log(`ArUco ID ${arUcoId} data written to InfluxDB`);
          })
          .catch(error => {
            console.error(`Error closing writeApi: ${error}`);
          });
      });
    }
  }else if (topic === 'CiTin/CIPS/ArUcos/devices/CAM-05') {
        console.log('ArUcos');
     const idString = messageString.match(/IDs: (\d+( \d+)*)/);
    if (idString) {
      const ids = idString[1].split(' ').map(id => parseInt(id));
      pointType = 'ArUcoData';

      ids.forEach(arUcoId => {
        const point = new Point(pointType)
          .tag('Name', arUcoId.toString())
          .tag('ID', 'CAM-05')
          .intField('Validation', 1);

        const writeApi = influxDB.getWriteApi(org, bucket);

        writeApi.writePoint(point);

        writeApi
          .close()
          .then(() => {
            console.log(`ArUco ID ${arUcoId} data written to InfluxDB`);
          })
          .catch(error => {
            console.error(`Error closing writeApi: ${error}`);
          });
      });
    }
  }

  if (name !== undefined) {
    const point = new Point(pointType)
      .tag('Name', name);

    if (pointType === 'BLEData') {
      point.tag('ID', id);
      point.floatField('RSSI', rssi);
    } else if (pointType === 'RFIDData') {
      point.tag('ID', id);
      point.floatField('RSSI', rssi);
    }

  const writeApi = influxDB.getWriteApi(org, bucket);

  writeApi.writePoint(point);

  writeApi
    .close()
    .then(() => {
      console.log('Data written to InfluxDB');
    })
    .catch(error => {
      console.error(`Error closing writeApi: ${error}`);
    });
}
});




///////////////////////////////////////////////////////////////////


app.post('/api/getValue', (req, res) => {
 console.log('Request received:', req.body);
  const stringValue = req.body.stringValue;

  // Query the database based on the received "number"
  const query = 'SELECT * FROM positioning WHERE card_id  = $1';
  const values = [stringValue];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'Database query failed' });
    } else {
      if (result.rows.length === 0) {
       // res.status(404).json({ error: 'Value not found for the given number' });
       res.status(200).json(0);
      } else {
        const lastIndex = result.rows.length - 1;
        const retrievedValue = result.rows[lastIndex].location_id;
        console.log(retrievedValue)
        console.log(values);
        res.status(200).json(retrievedValue);
      }
    }
  });
});






app.post('/api/getLocValue', (req, res) => {
  console.log('Request received:', req.body);
  const stringValue = req.body.value;
  console.log(stringValue);

  const query = 'SELECT * FROM positioning WHERE card_id  = $1';
  const values = [stringValue];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'Database query failed' });
    } else {

      if (result.rows.length === 0) {

       res.status(200).json(0);
      } else {
        const lastIndex = result.rows.length - 1;
        const retrievedValue = result.rows[lastIndex].location_id;


        console.log(retrievedValue)

     const geoJsonData = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                id: 'rectangle4',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419921058015802, 41.833635881442035],
                  [-8.419857581949827, 41.83362750200473],
                  [-8.419843586685602, 41.833684831708524],
                  [-8.419906866415005, 41.833692809150506],
                  [-8.419921058015802, 41.833635881442035], // Closing coordinate to complete the polygon
                 ]
                ],
               "type": "Polygon"
              },
             "id": 4
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle3',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419934998357775, 41.83358078163084 ],
                  [-8.419872050517625, 41.83357203730935 ],
                  [-8.419857703545404, 41.83362765291059 ],
                  [-8.419921353103973, 41.83363588851938 ],
                  [-8.419934998357775, 41.83358078163084 ]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 3
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle1',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419903605861435, 41.83344642013034],
                  [-8.419886437986463, 41.83351281207416],
                  [-8.419984130125556, 41.83352602460374],
                  [-8.420000969599528, 41.83345989165585],
                  [-8.419903605861435, 41.83344642013034]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 1
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle2',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419949495704373, 41.833521638331604],
            [-8.419886594062405,41.833513137277464],
            [-8.419871780085316,41.83357190572332],
            [-8.419934820274591,41.833580714148724],
            [-8.419949495704373,41.833521638331604]
                 ]
                ],
               "type": "Polygon"
              },
             "id":2
            }

          ]
        };

//       res.status(200).json(geoJsonData);
console.log('now here');
        // Adjust latitudes and longitudes based on retrievedValue

        if (retrievedValue === 2) {

        const geoJsonData2 = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                id: 'rectangle4',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419921058015802, 41.833635881442035],
                  [-8.419857581949827, 41.83362750200473],
                  [-8.419843586685602, 41.833684831708524],
                  [-8.419906866415005, 41.833692809150506],
                  [-8.419921058015802, 41.833635881442035], // Closing coordinate to complete the polygon
                 ]
                ],
               "type": "Polygon"
              },
             "id": 4
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle3',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419934998357775, 41.83358078163084 ],
                  [-8.419872050517625, 41.83357203730935 ],
                  [-8.419857703545404, 41.83362765291059 ],
                  [-8.419921353103973, 41.83363588851938 ],
                  [-8.419934998357775, 41.83358078163084 ]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 3
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle1',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419903605861435, 41.83344642013034],
                  [-8.419886437986463, 41.83351281207416],
                  [-8.419984130125556, 41.83352602460374],
                  [-8.420000969599528, 41.83345989165585],
                  [-8.419903605861435, 41.83344642013034]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 1
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle2',
                color: 'blue',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419949495704373, 41.833521638331604],
            [-8.419886594062405,41.833513137277464],
            [-8.419871780085316,41.83357190572332],
            [-8.419934820274591,41.833580714148724],
            [-8.419949495704373,41.833521638331604]
                 ]
                ],
               "type": "Polygon"
              },
             "id":2 
            }

          ]
        };
res.status(200).json(geoJsonData2);
       }


 if (retrievedValue === 1) {

        const geoJsonData1 = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                id: 'rectangle4',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419921058015802, 41.833635881442035],
                  [-8.419857581949827, 41.83362750200473],
                  [-8.419843586685602, 41.833684831708524],
                  [-8.419906866415005, 41.833692809150506],
                  [-8.419921058015802, 41.833635881442035], // Closing coordinate to complete the polygon
                 ]
                ],
               "type": "Polygon"
              },
             "id": 4
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle3',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419934998357775, 41.83358078163084 ],
                  [-8.419872050517625, 41.83357203730935 ],
                  [-8.419857703545404, 41.83362765291059 ],
                  [-8.419921353103973, 41.83363588851938 ],
                  [-8.419934998357775, 41.83358078163084 ]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 3
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle1',
                color: 'blue',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419903605861435, 41.83344642013034],
                  [-8.419886437986463, 41.83351281207416],
                  [-8.419984130125556, 41.83352602460374],
                  [-8.420000969599528, 41.83345989165585],
                  [-8.419903605861435, 41.83344642013034]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 1
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle2',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419949495704373, 41.833521638331604],
            [-8.419886594062405,41.833513137277464],
            [-8.419871780085316,41.83357190572332],
            [-8.419934820274591,41.833580714148724],
            [-8.419949495704373,41.833521638331604]
                 ]
                ],
               "type": "Polygon"
              },
             "id":2
            }

          ]
        };
res.status(200).json(geoJsonData1);
       }


     if (retrievedValue === 3) {

        const geoJsonData3 = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                id: 'rectangle4',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419921058015802, 41.833635881442035],
                  [-8.419857581949827, 41.83362750200473],
                  [-8.419843586685602, 41.833684831708524],
                  [-8.419906866415005, 41.833692809150506],
                  [-8.419921058015802, 41.833635881442035], // Closing coordinate to complete the polygon
                 ]
                ],
               "type": "Polygon"
              },
             "id": 4
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle3',
                color: 'blue',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419934998357775, 41.83358078163084 ],
                  [-8.419872050517625, 41.83357203730935 ],
                  [-8.419857703545404, 41.83362765291059 ],
                  [-8.419921353103973, 41.83363588851938 ],
                  [-8.419934998357775, 41.83358078163084 ]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 3
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle1',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419903605861435, 41.83344642013034],
                  [-8.419886437986463, 41.83351281207416],
                  [-8.419984130125556, 41.83352602460374],
                  [-8.420000969599528, 41.83345989165585],
                  [-8.419903605861435, 41.83344642013034]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 1
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle2',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419949495704373, 41.833521638331604],
            [-8.419886594062405,41.833513137277464],
            [-8.419871780085316,41.83357190572332],
            [-8.419934820274591,41.833580714148724],
            [-8.419949495704373,41.833521638331604]
                 ]
                ],
               "type": "Polygon"
              },
             "id":2
            }

          ]
        };
res.status(200).json(geoJsonData3);
       }



 if (retrievedValue === 4) {

        const geoJsonData4 = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                id: 'rectangle4',
                color: 'blue',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419921058015802, 41.833635881442035],
                  [-8.419857581949827, 41.83362750200473],
                  [-8.419843586685602, 41.833684831708524],
                  [-8.419906866415005, 41.833692809150506],
                  [-8.419921058015802, 41.833635881442035], // Closing coordinate to complete the polygon
                 ]
                ],
               "type": "Polygon"
              },
             "id": 4
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle3',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419934998357775, 41.83358078163084 ],
                  [-8.419872050517625, 41.83357203730935 ],
                  [-8.419857703545404, 41.83362765291059 ],
                  [-8.419921353103973, 41.83363588851938 ],
                  [-8.419934998357775, 41.83358078163084 ]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 3
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle1',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419903605861435, 41.83344642013034],
                  [-8.419886437986463, 41.83351281207416],
                  [-8.419984130125556, 41.83352602460374],
                  [-8.420000969599528, 41.83345989165585],
                  [-8.419903605861435, 41.83344642013034]
                 ]
                ],
               "type": "Polygon"
              },
             "id": 1
            },
            {
              type: 'Feature',
              properties: {
                id: 'rectangle2',
                color: 'red',
              },
              geometry: {
                coordinates: [
                 [
                  [-8.419949495704373, 41.833521638331604],
            [-8.419886594062405,41.833513137277464],
            [-8.419871780085316,41.83357190572332],
            [-8.419934820274591,41.833580714148724],
            [-8.419949495704373,41.833521638331604]
                 ]
                ],
               "type": "Polygon"
              },
             "id":2
            }

          ]
        };
res.status(200).json(geoJsonData4);
       }





        //res.status(200).json({ lat: parseFloat(lat), lon: parseFloat(lon) });
      }
    }
  });
});




////////////////////////////////////////

app.post('/api/getCardCountByLocation', (req, res) => {
  console.log(req.body);
  const inputNumber = req.body.stringValue;
  console.log(inputNumber);
  // Subquery to get the latest timestamp for each card_id
   const maxUniqueIdsQuery = `
    WITH max_uniqueids AS (
      SELECT card_id, MAX(uniqueid) AS max_uniqueid
      FROM positioning
      GROUP BY card_id
    )
    SELECT m.card_id, p.location_id, m.max_uniqueid
    FROM max_uniqueids m
    INNER JOIN positioning p ON  m.max_uniqueid = p.uniqueid
  `;

  const countQuery = `
    SELECT  *
    FROM (${maxUniqueIdsQuery}) AS max_unique_ids
    WHERE location_id = $1
  `;

  const values = [inputNumber]; 

  pool.query(countQuery, values, (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'Database query failed' });
    } else {
      console.log('Intermediate result:', result.rows);
      const cardCount = result.rows.length;
      console.log(cardCount);
      res.status(200).json(cardCount);
     
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

