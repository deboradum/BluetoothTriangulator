# BluetoothTriangulator
A Bluetooth location triangulator using ESP-32 microcontrollers

As the final product of my first year's bachelor computer science course at UvA, I created a Bluetooth triangulator using ESP-32 microcontrollers. 
The microcontrollers should be placed at various locations in a given area. Every 15 seconds the ESPs scan for Bluetooth signals. Via a distributed network
they transmit their data to an end node that sends the data to a server. Using the registered signal strength and overlap of the same device ID, a heatmap is generated that shows where most people currently are.

Registered MAC addresses are hashed and periodically deleted from the database in order to make the service as private as possible.

The microcontrollers are programmed in c++. For the frontend React & Typescript were used and for the backend Typescript & PostgreSQL. 
