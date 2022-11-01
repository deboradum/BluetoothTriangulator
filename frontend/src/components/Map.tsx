import React, { useEffect, useState } from 'react';
import h337 from 'heatmap.js';

import '../index.css';
import axios from 'axios';
import config from '../config';

function randomIntFromInterval(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// eslint-disable-next-line
function random_data_single(num_devices: number, nodes: any) {
  let devices = []
  while (num_devices--) {
    let node = nodes[Math.floor(Math.random() * 5)];
    let rssi = randomIntFromInterval(-90, -30)
    let point = singleNodePoint(node, rssi)
    devices.push(point)
  }

  return devices
}

// eslint-disable-next-line
function random_data_two(num_devices: number, nodes: any) {
  let devices = []
  while (num_devices--) {
    let nodeBC = nodes[0];
    let nodeBoC = nodes[Math.floor(Math.random() * 2) + 1];
    let rssi1 = randomIntFromInterval(-90, -30)
    let rssi2 = randomIntFromInterval(-90, -30)
    let point = twoNodesPoint(nodeBC, rssi1, nodeBoC, rssi2)
    devices.push(point)
  }

  return devices
}

// Returns the proximity to a node based on the RSSI. Proximity ranges from
// 0 to 1.
function getProximity(rssi: number) {
  const max_rssi = 100 // -90
  const min_rssi = 30 // -30
  const proximity = 1 - (Math.abs((rssi + min_rssi) / (max_rssi - min_rssi)))

  return proximity
}

// Returns a datapoint of where a device is scanned, if it is scanned by one
// node.
function singleNodePoint(node: any, rssi: number) {
  const angle = Math.random() * Math.PI * 2
  const radius = getProximity(rssi) * 150
  const new_x = node.x + Math.cos(angle) * radius
  const new_y = node.y + Math.sin(angle) * radius

  const datapoint = {
    x: new_x,
    y: new_y,
    value: 80, // Miss een random value geven?
    radius: 35, // Miss een random radius geven??
    blur: 0
  }

  return datapoint
}

// Returns the distance in pixels between two nodes.
function nodeDistance(node1: any, node2: any) {
  const x = Math.pow((node1.x - node2.x), 2)
  const y = Math.pow((node1.y - node2.y), 2)
  const sum = x + y

  const distance = Math.sqrt(sum)

  return distance
}


// Returns a datapoint of a device that is scanned by two nodes, based on the
// RSSI's.
function twoNodesPoint(node1: any, rssi1: number, node2: any, rssi2: number) {
  const prox1 = getProximity(rssi1)
  const prox2 = getProximity(rssi2)
  const dist = nodeDistance(node1, node2)

  const line_dist1 = prox1 * dist
  const line_dist2 = prox2 * dist
  const dx = Math.abs(node2.x - node1.x)
  const dy = Math.abs(node2.y - node1.y)

  const ratio1 = line_dist1 / dist
  const ratio2 = line_dist2 / dist

  let point1 = {
    x: 0,
    y: 0
  }
  let point2 = {
    x: 0,
    y: 0
  }

  if (node1.x >= node2.x && node1.y >= node2.y) {
    point1 = nodeDistOnLineRd(node1, ratio1, dy, dx)
    point2 = nodeDistOnLineLu(node2, ratio2, dy, dx)
  } else if (node1.x > node2.x && node1.y < node2.y) {
    point1 = nodeDistOnLineRu(node1, ratio1, dy, dx)
    point2 = nodeDistOnLineLd(node2, ratio2, dy, dx)
  } else if (node1.x < node2.x && node1.y > node2.y) {
    point1 = nodeDistOnLineLd(node1, ratio1, dy, dx)
    point2 = nodeDistOnLineRu(node2, ratio2, dy, dx)
  } else if (node1.x < node2.x && node1.y < node2.y) {
    point1 = nodeDistOnLineLu(node1, ratio1, dy, dx)
    point2 = nodeDistOnLineRd(node2, ratio2, dy, dx)
  }


  const angle = Math.random() * Math.PI * 2
  const radius = getProximity(-50) * 100
  const new_x = ((point1.x + point2.x) / 2) + Math.cos(angle) * radius
  const new_y = ((point1.y + point2.y) / 2) + Math.sin(angle) * radius

  const datapoint = {
    x: new_x,
    y: new_y,
    value: 80, // value variabel van..?
    radius: 25,
    blur: 0
  }

  return datapoint
}

// Returns the coordinates of the point on the line between two nodes, based on
// the RSSI of the scanned device.
// Line direction: Left up.
function nodeDistOnLineLu(node: any, ratio: number, dy: number, dx: number) {
  const new_y = node.y + (dy * ratio)
  const new_x = node.x + (dx * ratio)
  const coords = { x: new_x, y: new_y }

  return coords
}

// Returns the coordinates of the point on the line between two nodes, based on
// the RSSI of the scanned device.
// Line direction: Left down.
function nodeDistOnLineLd(node: any, ratio: number, dy: number, dx: number) {
  const new_y = node.y - (dy * ratio)
  const new_x = node.x + (dx * ratio)
  const coords = { x: new_x, y: new_y }

  return coords
}

// Returns the coordinates of the point on the line between two nodes, based on
// the RSSI of the scanned device.
// Line direction: Right up.
function nodeDistOnLineRu(node: any, ratio: number, dy: number, dx: number) {
  const new_y = node.y + (dy * ratio)
  const new_x = node.x - (dx * ratio)
  const coords = { x: new_x, y: new_y }

  return coords
}

// Returns the coordinates of the point on the line between two nodes, based on
// the RSSI of the scanned device.
// Line direction: Right down.
function nodeDistOnLineRd(node: any, ratio: number, dy: number, dx: number) {
  const new_y = node.y - (dy * ratio)
  const new_x = node.x - (dx * ratio)
  const coords = { x: new_x, y: new_y }

  return coords
}

// Returns a node heatmap point.
function createNode(x_coord: number, y_coord: number) {
  let node = {
    x: x_coord,
    y: y_coord,
    value: 100,
    radius: 10,
    blur: 0.01
  }

  return node
}

interface BlData {
  hashedAddress: string,
  seenBy: Value[]
}

interface Value {
  nodeId: number,
  rssi: number,
  timestamp: Date
}

function Map() {
  const nodes = [{ x: 1239, y: 585 }, { x: 1478, y: 330 }, { x: 1250, y: 355 }, { x: 1033, y: 208 }, { x: 461, y: 494 }]
  const nodePoints = [createNode(nodes[0].x, nodes[0].y), createNode(nodes[1].x, nodes[1].y), createNode(nodes[2].x, nodes[2].y), createNode(nodes[3].x, nodes[3].y), createNode(nodes[4].x, nodes[4].y)];

  function setPointData(data: BlData[]) {
    let newPoints = [...nodePoints]

    for (let element of data) {
      let dataPoint
      if (element.seenBy.length == 1) {
        dataPoint = singleNodePoint(nodes[element.seenBy[0].nodeId - 1].x, element.seenBy[0].rssi);
      } else {
        dataPoint = twoNodesPoint(nodes[element.seenBy[0].nodeId - 1], element.seenBy[0].rssi, nodes[element.seenBy[1].nodeId - 1], element.seenBy[1].rssi)
      }
      newPoints = [...newPoints, dataPoint]
    }

    return newPoints
  }


  useEffect(() => {
    let heatmapInstance = h337.create({
      container: document.querySelector('.HeatMap')!,
      radius: 40,
      maxOpacity: 1,
      minOpacity: 0,
      blur: 0.85,
      backgroundColor: 'rgba(255, 255, 255, 0)'
    });

    const fetchData = async () => {
      const result = await axios.get(process.env.REACT_APP_BACKEND_URL + '/bluetooth')

      const newPoints = setPointData(result.data)

      const heatMapData = {
        max: 100,
        min: 0,
        data: newPoints
      };

      heatmapInstance.setData(heatMapData);
    }

    fetchData().catch(console.error)

    // points = points.concat(random_data_single(50, points))
    // points = points.concat(random_data_two(10, points))
  }, []);

  return (
    <>  </>
  );
}

export default Map