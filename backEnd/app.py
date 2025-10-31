import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ml_model.model import MusicGenerator, create_midi
import random
import json

# --- Configuration ---
MODEL_PATH = "ml_model/music_model.h5"
NOTES_PATH = "ml_model/notes.json"
INT_TO_NOTE_PATH = "ml_model/int_to_note.json"
OUTPUT_DIR = "output"
SEQUENCE_LENGTH = 100

app = Flask(__name__, static_folder=OUTPUT_DIR)
CORS(app)  # Enable CORS for all routes

# --- Load Model ---
if not os.path.exists(MODEL_PATH):
    raise Exception(
        f"Model file not found at {MODEL_PATH}. Please train the model first.")
if not os.path.exists(NOTES_PATH):
    raise Exception(f"Notes file not found at {NOTES_PATH}.")
if not os.path.exists(INT_TO_NOTE_PATH):
    raise Exception(f"Int-to-note mapping not found at {INT_TO_NOTE_PATH}.")

music_generator = MusicGenerator(sequence_length=SEQUENCE_LENGTH)
music_generator.load(MODEL_PATH, NOTES_PATH, INT_TO_NOTE_PATH)

os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.route('/api/generate-music', methods=['POST'])
def generate_music_api():
    # The prompt from the frontend isn't used yet, but is received here.
    # data = request.get_json()
    # prompt = data.get('prompt')

    try:
        # Generate a random starting sequence from the learned notes
        start_index = random.randint(
            0, len(music_generator.notes) - SEQUENCE_LENGTH - 1)
        start_notes = music_generator.notes[start_index: start_index + SEQUENCE_LENGTH]

        # Generate the melody
        prediction_output = music_generator.generate_notes(
            start_notes, length=200)

        # Create a unique filename for the MIDI file
        output_filename = f"melody_{random.randint(1000, 9999)}.mid"
        output_filepath = os.path.join(OUTPUT_DIR, output_filename)
        create_midi(prediction_output, output_filepath)

        # Create a URL to access the generated file
        melody_url = request.host_url + \
            os.path.join(OUTPUT_DIR, output_filename)

        return jsonify({'success': True, 'melody': melody_url})
    except Exception as e:
        print(f"Error generating music: {e}")
        return jsonify({'success': False, 'error': 'Failed to generate music'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
