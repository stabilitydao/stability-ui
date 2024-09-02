import { useState } from "react";

const AI = (): JSX.Element => {
  const [inputValue, setInputValue] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // const response = await fetch(
      //   "https://api.openai.com/v1/engines/davinci-codex/completions",
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: `Bearer YOUR_API_KEY`, // Замените YOUR_API_KEY на ваш ключ API
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       prompt: inputValue,
      //       max_tokens: 150,
      //     }),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error("Network response was not ok");
      // }

      // const data = await response.json();
      // setResponse(data.choices[0].text.trim());
      setResponse("123");
    } catch (error) {
      setError("Failed to fetch response");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Chat with GPT</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label
            htmlFor="input"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Your message:
          </label>
          <textarea
            id="input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            rows="4"
            style={{ width: "100%", padding: "10px" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Send"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};
export { AI };
