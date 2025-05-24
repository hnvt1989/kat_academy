from flask import Flask
from ..app import leila_bp # Adjusted import to get the blueprint

app = Flask(__name__)
app.register_blueprint(leila_bp)

# Vercel looks for the 'app' variable to start the Flask application.
# When deploying, Vercel will expose this as a serverless function.
