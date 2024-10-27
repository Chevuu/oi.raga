# **oi.raga**

Welcome to the **ooi.raga**, a simple multiplayer game where you control a cell, consume smaller cells to grow, and compete with other players in real-time. This project demonstrates real-time multiplayer functionality using WebSockets, efficient rendering with React and Konva, and basic game mechanics like collision detection and spatial partitioning.

(This project is still in development so the concepts above are implemented but vaguely and wrongly)

---

## **Table of Contents**

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Server Dependencies](#2-install-server-dependencies)
  - [3. Install Client Dependencies](#3-install-client-dependencies)
- [Running the Server](#running-the-server)
- [Running the Client](#running-the-client)
- [Gameplay Instructions](#gameplay-instructions)
- [Controls](#controls)
- [Project Structure](#project-structure)
- [Credits](#credits)

---

## **Features**

- **Real-Time Multiplayer**: Play with multiple players over WebSockets. (TO_DEPLOY)
- **Dynamic Scaling**: The viewport smoothly zooms out as your cell grows. (NOT_VERY_SMOOTH)
- **Mass-Based Mechanics**: Your cell's size is determined by its mass. 
- **Cell Consumption**: Eat smaller cells to increase your mass.
- **Blob Shooting**: Press 'W' to shoot a blob, sacrificing some mass. (BLOB_SHOULD_STAY)
- **Spatial Partitioning**: Efficient collision detection using a spatial hash grid. (FIX)
- **Random Cell Colors**: Cells spawn with vibrant colors, excluding shades of grey. (OPTIMIZE)
- **Mass Display**: Your current mass is displayed on the screen. (FIX_SIZE)
- **Minimap**: Navigate the large map with a helpful minimap.

---

## **Prerequisites**

- **Node.js**: Version 14 or higher.
- **Python**: Version 3.7 or higher.
- **Python Libraries**:
  - `websockets`
- **React**: For the client application.
- **Additional Libraries**:
  - `react-konva`
  - `konva`

---

## **Installation and Setup**

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/oi.raga.git
cd oi.raga
```

### **2. Install Server Dependencies**

Navigate to the `server` directory and install the required Python packages.

```bash
cd server
pip install websockets
```

### **3. Install Client Dependencies**

Navigate to the `client` directory and install the required npm packages.

```bash
cd ../client
npm install
```
This will install all dependencies listed in `package.json`, including `react`, `react-dom`, `react-konva`, and others.

## **Running the Server**

To start the server, run the following command in the server directory:

```bash
cd server
python server.py
```

The server will start listening on ws://localhost:6789 for WebSocket connections.

## **Running the Client**

In a new terminal window, navigate to the client directory and start the React application:

```bash
cd ../client
npm start
```

This will start the development server and open the application in your default web browser at `http://localhost:3000`.

---

## **Gameplay Instructions**

- **Objective**: Control your cell, consume smaller cells to grow, and compete with other players.
- **Movement**: Move your mouse to direct your cell.
- **Eating Cells**: Move over smaller cells to consume them and gain mass.
- **Blob Shooting**: Press the **'W'** key to shoot a blob in the direction of your mouse, sacrificing some mass.
- **Mass Display**: Your current mass is displayed in the bottom-left corner of the screen.
- **Zoom**: The viewport will zoom out smoothly as your cell grows larger, allowing you to see more of the map.

---

## **Controls**

- **Mouse Movement**: Controls the direction of your cell.
- **'W' Key**: Shoots a blob in the direction of the mouse, sacrificing 10 mass units.

---

## **Credits**

- **Inspiration**: [Agar.io](https://agar.io/)

---

## **Notes**

- **Performance Considerations**: The game uses spatial partitioning (spatial hash grid) to optimize collision detection with a large number of cells.
- **Customization**: Feel free to tweak parameters like map size, cell spawn rate, and visual styles to enhance the game.
- **Feedback**: Contributions and feedback are welcome!

---

Enjoy playing and developing this Agar.io clone!