from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/cloud_ingest", methods=["POST"])
def cloud_ingest():
    data = request.get_json()
    print("Received forwarded data:")
    print(data)
    return jsonify({"status": "received"}), 200

if __name__ == "__main__":
    app.run(port=9000)