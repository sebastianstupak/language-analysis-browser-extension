import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [languageDifficulty, setLanguageDifficulty] = useState(0);

  useEffect(() => {
    console.log("Popup component mounted");
    browser.storage.local.get(["languageDifficulty"]).then((result) => {
      console.log("Retrieved language difficulty:", result.languageDifficulty);
      if (result.languageDifficulty !== undefined) {
        setLanguageDifficulty(result.languageDifficulty);
      }
    });
  }, []);

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDifficulty = parseFloat(e.target.value);
    console.log("Language difficulty changed:", newDifficulty);
    setLanguageDifficulty(newDifficulty);
    browser.storage.local
      .set({ languageDifficulty: newDifficulty })
      .then(() => {
        console.log("Language difficulty saved successfully");
        // Notify the background script
        browser.runtime.sendMessage({
          type: "DIFFICULTY_CHANGED",
          difficulty: newDifficulty,
        });
      });
  };

  return (
    <>
      <h1>Language Difficulty Analyzer</h1>
      <div className="card">
        <label htmlFor="languageDifficulty">
          Language Difficulty: {languageDifficulty.toFixed(2)}
        </label>
        <input
          type="range"
          id="languageDifficulty"
          min="0"
          max="1"
          step="0.01"
          value={languageDifficulty}
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
