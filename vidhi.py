from flask import Flask, request

app = Flask(__name__)

@app.route('/hbheartbeat', methods=['POST', 'PUT'])
def heartbeat():
    if request.method == 'POST' or request.method == 'PUT':
        data = request.json  # Assuming JSON payload
        print("Received payload:")
        print(data)
        return "Payload received", 200
    else:
        return "Method not allowed", 405

if __name__ == '__main__':
    app.run(host='localhost', port=8099)
