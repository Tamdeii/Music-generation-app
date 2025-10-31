from model import MusicGenerator, create_midi
import sys
import json


def generate_music():
    # Initialize the model
    generator = MusicGenerator()

    # Load the trained model (you'll need to train the model first)
    # generator.model.load_weights('trained_weights.h5')

    # Generate some initial notes (this should be replaced with actual music data)
    start_notes = ['C4', 'E4', 'G4', 'C5']

    # Generate new music
    generated_notes = generator.generate_notes(start_notes)

    # Create MIDI file
    output_file = 'generated_music.mid'
    create_midi(generated_notes, output_file)

    # Return the generated notes as JSON
    return json.dumps({
        'notes': generated_notes,
        'file': output_file
    })


if __name__ == "__main__":
    result = generate_music()
    print(result)  # This will be captured by PythonShell in Node.js
