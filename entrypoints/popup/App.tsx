import React, { useState, useEffect } from 'react';
import { useStoredValue } from '../../hooks/useStoredValue';
import "./App.css";
import { sendMessage } from 'webext-bridge/popup';

function App() {
  const {
    state: languageDifficulty,
    setState: setLanguageDifficulty,
    isLoading,
    error: storageError
  } = useStoredValue<number>('languageDifficulty', { initialValue: 0 });

  useEffect(() => {
    console.log('Popup component mounted');
  }, []);

  const handleDifficultyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDifficulty = parseFloat(e.target.value);
    console.log("Language difficulty changed:", newDifficulty);
   
    setLanguageDifficulty(newDifficulty);
    
    console.log('Attempting to send DIFFICULTY_CHANGED message');
    try {
      const response = await sendMessage("DIFFICULTY_CHANGED", {
        difficulty: newDifficulty
      }, "background");
      console.log('Response from background:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (storageError) {
    return <div>Error: {storageError.message}</div>;
  }

  return (
    <>
      <h1>Language Difficulty Analyzer</h1>
      <div className="card">
        <label htmlFor="languageDifficulty">
          Language Difficulty: {languageDifficulty?.toFixed(2) ?? '0.00'}
        </label>
        <input
          type="range"
          id="languageDifficulty"
          min="0"
          max="1"
          step="0.01"
          value={languageDifficulty ?? 0}
          onChange={handleDifficultyChange}
        />
      </div>
      <p className="read-the-docs">
        Adjust the slider to set the language difficulty threshold
      </p>
    </>
  );
}

export default App;