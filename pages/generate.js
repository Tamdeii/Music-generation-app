import { useState } from 'react';
import styles from '../styles/Generate.module.css';

export default function Generate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMelody, setGeneratedMelody] = useState(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      // TODO: Add API call to LSTM model here
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setGeneratedMelody(data.melody);
    } catch (error) {
      console.error('Error generating music:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Music Generation with LSTM</h1>
      
      <div className={styles.generationSection}>
        <button 
          className={styles.generateButton}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Music'}
        </button>

        {generatedMelody && (
          <div className={styles.resultSection}>
            <h2>Generated Melody</h2>
            {/* TODO: Add music player or visualization component */}
          </div>
        )}
      </div>
    </div>
  );
}
