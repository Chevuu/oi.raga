import asyncio
import websockets
import json
import random
import math

PORT = 6789
connected_clients = set()
players = {}
cells = []
blobs = []
cell_id_counter = 0
blob_id_counter = 0
MAP_WIDTH = 10000
MAP_HEIGHT = 10000
MAX_CELLS = 10000

def generate_random_color():
    while True:
        r = random.randint(15, 240)
        g = random.randint(15, 240)
        b = random.randint(15, 240)
        if not (r == g == b):
            return f'#{r:02x}{g:02x}{b:02x}'

def get_radius(mass):
    return math.sqrt(mass) * 4

async def spawn_cells():
    global cell_id_counter
    while True:
        if len(cells) < MAX_CELLS:
            cell = {
                'id': cell_id_counter,
                'x': random.randint(0, MAP_WIDTH),
                'y': random.randint(0, MAP_HEIGHT),
                'mass': 1,
                'color': generate_random_color(),
            }
            cells.append(cell)
            cell_id_counter += 1
        await asyncio.sleep(0.01)

async def move_blobs():
    global blobs
    while True:
        for blob in blobs[:]:
            # Update position
            dx = blob['speed'] * math.cos(blob['angle'])
            dy = blob['speed'] * math.sin(blob['angle'])
            blob['x'] += dx
            blob['y'] += dy
            blob['distance_traveled'] += math.hypot(dx, dy)

            # Check for collisions with players
            for pid, player in list(players.items()):
                if pid != blob['ownerId']:
                    dx = player['x'] - blob['x']
                    dy = player['y'] - blob['y']
                    distance = math.hypot(dx, dy)
                    player_radius = get_radius(player['mass'])
                    blob_radius = get_radius(blob['mass'])
                    if distance < player_radius + blob_radius:
                        # Collision detected
                        player['mass'] -= blob['mass']
                        if player['mass'] <= 0:
                            # Player is eliminated
                            del players[pid]
                        if blob in blobs:
                            blobs.remove(blob)
                        break

            # Remove blob if it travels beyond 100 pixels
            if blob['distance_traveled'] >= 100:
                if blob in blobs:
                    blobs.remove(blob)
                continue

            # Remove blob if it goes out of bounds
            if blob['x'] < 0 or blob['x'] > MAP_WIDTH or blob['y'] < 0 or blob['y'] > MAP_HEIGHT:
                if blob in blobs:
                    blobs.remove(blob)
        await asyncio.sleep(0.05)

async def handler(websocket, path):
    global blob_id_counter
    player_id = id(websocket)
    connected_clients.add(websocket)
    players[player_id] = {'id': player_id, 'x': MAP_WIDTH // 2, 'y': MAP_HEIGHT // 2, 'mass': 20}

    await websocket.send(json.dumps({'playerId': player_id}))

    try:
        async for message in websocket:
            data = json.loads(message)
            if 'x' in data and 'y' in data:
                players[player_id]['x'] = data['x']
                players[player_id]['y'] = data['y']
            elif 'consumedCellId' in data:
                # Remove the consumed cell
                consumed_cells = [cell for cell in cells if cell['id'] == data['consumedCellId']]
                if consumed_cells:
                    cell_mass = consumed_cells[0]['mass']
                    cells[:] = [cell for cell in cells if cell['id'] != data['consumedCellId']]
                    # Increase player's mass
                    players[player_id]['mass'] += cell_mass
            elif 'fireBlob' in data and data['fireBlob']:
                # Create a new blob
                angle = data['angle']
                if players[player_id]['mass'] > 10:
                    players[player_id]['mass'] -= 10
                    blob = {
                        'id': blob_id_counter,
                        'x': players[player_id]['x'],
                        'y': players[player_id]['y'],
                        'mass': 10,
                        'angle': angle,
                        'speed': 10,  # Adjust speed as needed
                        'distance_traveled': 0,
                        'ownerId': player_id,
                    }
                    blobs.append(blob)
                    blob_id_counter += 1
    except websockets.ConnectionClosed:
        pass
    finally:
        connected_clients.remove(websocket)
        if player_id in players:
            del players[player_id]

async def broadcast_game_state():
    while True:
        if connected_clients:
            message = json.dumps({
                'players': list(players.values()),
                'cells': cells,
                'blobs': blobs,
            })
            await asyncio.gather(*(ws.send(message) for ws in connected_clients))
        await asyncio.sleep(0.1)

start_server = websockets.serve(handler, "0.0.0.0", PORT)

print(f"Server started on port {PORT}")

asyncio.ensure_future(spawn_cells())
asyncio.ensure_future(move_blobs())
asyncio.ensure_future(broadcast_game_state())
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()