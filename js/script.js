document.addEventListener('DOMContentLoaded', () => {
  const rectangleSelector = document.getElementById('rectangle-selector');
  const roomSelector = document.getElementById('room-selector');
  const resultLabel = document.getElementById('apiResponse');
 const roomresultLabel = document.getElementById('roomapiResponse');
  const rectangle1 = document.getElementById('rectangle1');
  const rectangle2 = document.getElementById('rectangle2');
  const rectangle3 = document.getElementById('rectangle3');
  const rectangle4 = document.getElementById('rectangle4');
  const rectangle5 = document.getElementById('rectangle5');
  const rectangle6 = document.getElementById('rectangle6');
  const rectangle7 = document.getElementById('rectangle7');
  const rectangle8 = document.getElementById('rectangle8');
  const rectangle9 = document.getElementById('rectangle9');
  const rectangle10 = document.getElementById('rectangle10');
  const rectangle11 = document.getElementById('rectangle11');
  const rectangle12 = document.getElementById('rectangle12');

  // Define a mapping between user selections and API inputs
  const rectangleMappings = {
    CardId1: '1',
    CardId2: '2',
    CardId3: '3',
    CardId4: '4',
    CardId5: '5',
    CardId6: '6',
    CardId7: '7',
    CardId8: '8',
    CardId9: '9',
    CardId10: '10',
    CardId11: '11',
    CardId12: '12',
    CardId13: '13',
    CardId14: '14',
    CardId15: '15',
    CardId16: '16',
  };

  const roomMappings = {
    Room1: '1',
    Room2: '2',
    Room3: '3',
    Room4: '4',
    Room5: '5',
    Room6: '6',
  };

  roomSelector.addEventListener('change',() =>{
    const selectedRoom = roomSelector.value;
    console.log('Event triggered:', selectedRoom);
    const roomapiInput = roomMappings[selectedRoom];
    console.log(roomapiInput);
    console.log('Hi');
    if (roomapiInput) {
      fetch('http://10.10.10.10:3002/api/getCardCountByLocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stringValue: roomapiInput }), // Send the mapped input
      })
      .then((response) => response.json())
      .then((data) => {
        console.log('API Response:', data);
          if (data.error) {
            resultLabel.textContent = `API Response: Error: ${data.error}`;
          } else {
            clearTextOfRectangles();
            console.log('hello');
            rectangle7.style.backgroundColor = 'red';
            rectangle8.style.backgroundColor = 'red';
            rectangle9.style.backgroundColor = 'red';
            rectangle10.style.backgroundColor = 'red';
            rectangle11.style.backgroundColor = 'red';
            rectangle12.style.backgroundColor = 'red';
           roomresultLabel.textContent = `${data}`;
           if (roomapiInput== 3){
              rectangle9.style.backgroundColor = 'green';
              addTextToRectangle(rectangle9, `${data}`);
           }else if (roomapiInput== 4){
               rectangle10.style.backgroundColor = 'green';
              addTextToRectangle(rectangle10, `${data}`);
           }else if (roomapiInput== 5){
               rectangle11.style.backgroundColor = 'green';
              addTextToRectangle(rectangle11, `${data}`);
          }else if (roomapiInput== 2){
               rectangle8.style.backgroundColor = 'green';
              addTextToRectangle(rectangle8, `${data}`);
          }else if (roomapiInput== 1){
               rectangle7.style.backgroundColor = 'green';
              addTextToRectangle(rectangle7, `${data}`);
          }else if (roomapiInput== 6){
               rectangle12.style.backgroundColor = 'green';
              addTextToRectangle(rectangle12, `${data}`);
          }
        }
      })
    }
  });

function clearTextOfRectangles() {
    const rectangles = [
      rectangle7,
      rectangle8,
      rectangle9,
      rectangle10,
      rectangle11,
      rectangle12,
    ];

    rectangles.forEach((rectangle) => {
      // Clear existing labels from the rectangle
      while (rectangle.firstChild) {
        rectangle.removeChild(rectangle.firstChild);
      }
    });
  }


function addTextToRectangle(rectangle, text) {

    const labelElement = document.createElement('label');
    labelElement.textContent = text;
    labelElement.style.fontSize = '30px';
    labelElement.style.fontWeight = 'bold';
    rectangle.appendChild(labelElement);
  }


  rectangleSelector.addEventListener('change', () => {
    const selectedRectangle = rectangleSelector.value;
    console.log('Event triggered:', selectedRectangle);
    const apiInput = rectangleMappings[selectedRectangle];
    console.log(apiInput);
    if (apiInput) {
      // Send the mapped input to the API
      fetch('http://10.10.10.10:3002/api/getValue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stringValue: apiInput }), // Send the mapped input
      })
        .then((response) => response.json())
        .then((data) => {
	  console.log('API Response:', data);
          console.log('API Response:', data);
           console.log('API Response:', data);
          if (data.error) {
            resultLabel.textContent = `API Response: Error: ${data.error}`;
          } else {
            resultLabel.textContent = `API Response: ${data}`;

            rectangle1.style.backgroundColor = 'red';
            rectangle2.style.backgroundColor = 'red';
            rectangle3.style.backgroundColor = 'red';
            rectangle4.style.backgroundColor = 'red';
            rectangle5.style.backgroundColor = 'red';
            rectangle6.style.backgroundColor = 'red';
            rectangle1.className = 'custom-rectangle';
            rectangle2.className = 'custom-rectangle';
            rectangle3.className = 'custom-rectangle';
            rectangle4.className = 'custom-rectangle';
            rectangle5.className = 'custom-rectangle';
            rectangle6.className = 'custom-rectangle';
            console.log(data);
            if (data === 1) {
              console.log(data);
             // rectangle1.className = 'rectangle1'; 
             rectangle1.style.backgroundColor = 'green';
          } else if (data === 2) {
              console.log(data);
              //rectangle2.className = 'rectangle2'; 
              rectangle2.style.backgroundColor = 'green';
          } else if (data === 3) {
              console.log(data);
              //rectangle3.className = 'rectangle3'; 
              rectangle3.style.backgroundColor = 'green';
          } else if (data === 4) {
              console.log(data);
              //rectangle4.className = 'rectangle4'; 
              rectangle4.style.backgroundColor = 'green';
          }else if (data === 5) {
              console.log(data);
              //rectangle5.className = 'rectangle5'; 
              rectangle5.style.backgroundColor = 'green';
          }else if (data === 6) {
              console.log(data);
              //rectangle6.className = 'rectangle6'; 
              rectangle6.style.backgroundColor = 'green';
          }
          }
        })
        .catch((error) => {
          resultLabel.textContent = `API Response: Error: ${error.message}`;
        });
    }
  });
});
