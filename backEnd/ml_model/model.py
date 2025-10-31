import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from music21 import *
import json


class MusicGenerator:
    def __init__(self, sequence_length=100):
        self.sequence_length = sequence_length
        self.notes = []
        self.note_to_int = {}
        self.int_to_note = {}
        self.model = None

    def load(self, model_path, notes_path, int_to_note_path):
        """ Load the trained model and associated mappings. """
        self.model = load_model(model_path)
        with open(notes_path, 'r') as f:
            self.notes = json.load(f)
        with open(int_to_note_path, 'r') as f:
            self.int_to_note = json.load(f)
            # Create note_to_int from int_to_note
            self.note_to_int = {note: number for number,
                                note in self.int_to_note.items()}

    def prepare_sequences(self, notes):
        self.notes = notes
        # Create dictionary for mapping notes to integers
        unique_notes = sorted(set(notes))
        self.note_to_int = dict((note, number)
                                for number, note in enumerate(unique_notes))
        self.int_to_note = dict((number, note)
                                for number, note in enumerate(unique_notes))

        network_input = []
        network_output = []

        # Create input sequences and corresponding outputs
        for i in range(0, len(notes) - self.sequence_length, 1):
            sequence_in = notes[i:i + self.sequence_length]
            sequence_out = notes[i + self.sequence_length]
            network_input.append([self.note_to_int[char]
                                 for char in sequence_in])
            network_output.append(self.note_to_int[sequence_out])

        # Save the notes and mappings for later use in generation
        with open('ml_model/notes.json', 'w') as f:
            json.dump(self.notes, f)
        with open('ml_model/int_to_note.json', 'w') as f:
            # Convert integer keys to strings for JSON compatibility
            json.dump({str(k): v for k, v in self.int_to_note.items()}, f)

        n_patterns = len(network_input)
        n_vocab = len(unique_notes)

        # Reshape the input into a format compatible with LSTM layers
        network_input = np.reshape(
            network_input, (n_patterns, self.sequence_length, 1))

        # Normalize input
        network_input = network_input / float(n_vocab)

        # One-hot encode the output
        network_output = tf.keras.utils.to_categorical(network_output)

        return network_input, network_output, n_vocab

    def create_model(self, n_vocab):
        self.model = Sequential()
        self.model.add(LSTM(512, input_shape=(
            self.sequence_length, 1), return_sequences=True))
        self.model.add(Dropout(0.3))
        self.model.add(LSTM(512, return_sequences=True))
        self.model.add(Dropout(0.3))
        self.model.add(LSTM(512))
        self.model.add(Dense(256))
        self.model.add(Dropout(0.3))
        self.model.add(Dense(n_vocab, activation='softmax'))
        self.model.compile(loss='categorical_crossentropy',
                           optimizer='rmsprop')

    def train(self, network_input, network_output):
        # Consider adding model checkpointing to save the best model
        self.model.fit(network_input, network_output,
                       epochs=200, batch_size=64)
        # Save the model after training
        self.model.save('ml_model/music_model.h5')

    def generate_notes(self, start_notes, length=500):
        pattern = [self.note_to_int[char] for char in start_notes]
        prediction_output = []

        # Generate notes
        for _ in range(length):
            prediction_input = np.reshape(pattern, (1, len(pattern), 1))
            prediction_input = prediction_input / float(len(self.note_to_int))
            prediction = self.model.predict(prediction_input, verbose=0)

            # Get index with highest probability
            index = np.argmax(prediction)
            # self.int_to_note keys might be strings if loaded from json
            result = self.int_to_note[str(index)]
            prediction_output.append(result)

            # Remove first note and append prediction for next iteration
            pattern.append(index)
            pattern = pattern[1:]

        return prediction_output


def create_midi(prediction_output, filename):
    offset = 0
    output_notes = []

    # Create note and chord objects based on the values generated
    for pattern in prediction_output:
        try:
            # If it's a chord
            if ('.' in pattern) or pattern.isdigit():
                notes_in_chord = pattern.split('.')
                notes = []
                for current_note in notes_in_chord:
                    new_note = note.Note(int(current_note))
                    notes.append(new_note)
                new_chord = chord.Chord(notes)
                new_chord.offset = offset
                output_notes.append(new_chord)
            # If it's a note
            else:
                new_note = note.Note(pattern)
                new_note.offset = offset
                output_notes.append(new_note)
        except Exception as e:
            print(f"Error with note: {pattern}")
            continue

        # Increase offset for next note
        offset += 0.5

    midi_stream = stream.Stream(output_notes)
    midi_stream.write('midi', fp=filename)
