// boggle.js file 
// The BoggleGame class is defined to handle the frontend functionality of the Boggle game.
class BoggleGame {
  /* make a new game at this DOM id */


  // The constructor initializes the game with a given boardId (the HTML element ID where the Boggle board will be displayed) and an optional secs parameter, which represents the game length in seconds. It sets up the timer to tick every second, initializes the score and a set to store unique words, and handles form submission for word input.
  constructor(boardId, secs = 60) {
    this.secs = secs; // game length
    this.showTimer();

    this.score = 0;
    this.words = new Set();
    this.board = $("#" + boardId);

    // every 1000 msec, "tick"
    this.timer = setInterval(this.tick.bind(this), 1000);

    $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
  }

  /* show word in list of words */
  // The showWord method adds a word to the list of words displayed on the page.
  showWord(word) {
    $(".words", this.board).append($("<li>", { text: word }));
  }

  /* show score in html */
  // The showScore method updates the displayed score on the page
  showScore() {
    $(".score", this.board).text(this.score);
  }

  /* show a status message */
  // The showMessage method displays a status message on the page. It is used to show messages like whether a word is valid or not.
  showMessage(msg, cls) {
    $(".msg", this.board)
      .text(msg)
      .removeClass()
      .addClass(`msg ${cls}`);
  }

  /* handle submission of word: if unique and valid, score & show */
  // The handleSubmit method handles the submission of words by the user. It checks if the word is unique and valid by making a request to the server's /check-word route. If the word is valid, it adds it to the list of words, updates the score, and displays a success message.
  async handleSubmit(evt) {
    evt.preventDefault();
    const $word = $(".word", this.board);

    let word = $word.val();
    if (!word) return;

    if (this.words.has(word)) {
      this.showMessage(`Already found ${word}`, "err");
      return;
    }

    // check server for validity
    const resp = await axios.get("/check-word", { params: { word: word }});
    if (resp.data.result === "not-word") {
      this.showMessage(`${word} is not a valid English word`, "err");
    } else if (resp.data.result === "not-on-board") {
      this.showMessage(`${word} is not a valid word on this board`, "err");
    } else {
      this.showWord(word);
      this.score += word.length;
      this.showScore();
      this.words.add(word);
      this.showMessage(`Added: ${word}`, "ok");
    }

    $word.val("").focus();
  }

  /* Update timer in DOM */
  // The showTimer method updates the displayed timer on the page.
  showTimer() {
    $(".timer", this.board).text(this.secs);
  }

  /* Tick: handle a second passing in game */
  // The tick method is called every second to update the timer. When the timer reaches 0, it stops the game and scores the final result by making a request to the server's /post-score route.
  async tick() {
    this.secs -= 1;
    this.showTimer();

    if (this.secs === 0) {
      clearInterval(this.timer);
      await this.scoreGame();
    }
  }

  /* end of game: score and update message. */
  // The scoreGame method is called when the game ends. It hides the word input form, sends the user's final score to the server, and displays a message indicating whether the user set a new high score.
  async scoreGame() {
    $(".add-word", this.board).hide();
    const resp = await axios.post("/post-score", { score: this.score });
    if (resp.data.brokeRecord) {
      this.showMessage(`New record: ${this.score}`, "ok");
    } else {
      this.showMessage(`Final score: ${this.score}`, "ok");
    }
  }
}
