import englishWordRankings from "@/assets/word-ranking/en.json";

type WordRankings = { [key: string]: number };

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("Content script loaded");

    browser.runtime.onMessage.addListener((message, sender) => {
      console.log("Message received in content script:", message);
      if (message.type === "ANALYZE_PAGE") {
        const difficulty = message.difficulty;
        setTimeout(() => {
          try {
            analyzePage(difficulty);
            return Promise.resolve({ success: true });
          } catch (error) {
            console.error("Error analyzing page:", error);
            return Promise.resolve({ success: false, error: String(error) });
          }
        }, 1000); // 1 second delay
      }
    });

    function analyzePage(difficulty: number) {
      console.log("Analyzing page with difficulty:", difficulty);
      const sentences = document.body.innerText.match(/[^.!?]+[.!?]+/g) || [];
      console.log("Total sentences found:", sentences.length);

      if (sentences.length === 0) {
        console.warn("No sentences found on the page");
        return;
      }

      sentences.forEach((sentence, index) => {
        const words = sentence.match(/\b\w+\b/g) || [];
        const avgRank =
          words.reduce((sum, word) => {
            const rank =
              (englishWordRankings as WordRankings)[word.toLowerCase()] ||
              10001;
            return sum + rank;
          }, 0) / words.length;
        const normalizedDifficulty = avgRank / 10001;

        console.log(`Sentence ${index + 1}:`, {
          sentence: sentence.substring(0, 50) + "...",
          words: words.length,
          avgRank,
          normalizedDifficulty,
        });

        if (normalizedDifficulty <= difficulty) {
          highlightSentence(sentence);
        }
      });
    }

    function highlightSentence(sentence: string) {
      console.log("Highlighting sentence:", sentence.substring(0, 50) + "...");
      const range = document.createRange();
      const textNodes = getTextNodes(document.body);
      let highlighted = false;

      for (const node of textNodes) {
        const index = node.textContent!.indexOf(sentence);
        if (index !== -1) {
          try {
            range.setStart(node, index);
            range.setEnd(node, index + sentence.length);
            const span = document.createElement("span");
            span.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
            span.style.textDecoration = "underline";
            range.surroundContents(span);
            console.log("Sentence highlighted successfully");
            highlighted = true;
            break;
          } catch (error) {
            console.error("Error highlighting sentence:", error);
          }
        }
      }

      if (!highlighted) {
        console.warn("Failed to highlight sentence");
      }
    }

    function getTextNodes(node: Node): Text[] {
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        null
      );
      let currentNode;
      while ((currentNode = walker.nextNode())) {
        textNodes.push(currentNode as Text);
      }
      console.log("Total text nodes found:", textNodes.length);
      return textNodes;
    }
  },
});
