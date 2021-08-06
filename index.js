// tagline code

const lyrics = [
  "We're no strangers to love",
  "You know the rules and so do I",
  "A full commitment's what I'm thinking of",
  "You wouldn't get this from any other guy",
  "I just wanna tell you how I'm feeling",
  "Gotta make you understand",
  "Never gonna give you up",
  "Never gonna let you down",
  "Never gonna run around and desert you",
  "Never gonna make you cry",
  "Never gonna say goodbye",
  "Never gonna tell a lie and hurt you",
  "We've known each other for so long",
  "Your heart's been aching, but",
  "You're too shy to say it",
  "Inside, we both know what's been going on",
  "We know the game and we're gonna play it",
  "And if you ask me how I'm feeling",
  "Don't tell me you're too blind to see",
  "Never gonna give you up",
  "Never gonna let you down",
  "Never gonna run around and desert you",
  "Never gonna make you cry",
  "Never gonna say goodbye",
  "Never gonna tell a lie and hurt you",
  "Never gonna give you up",
  "Never gonna let you down",
  "Never gonna run around and desert you",
  "Never gonna make you cry",
  "Never gonna say goodbye",
  "Never gonna tell a lie and hurt you",
  "(Ooh, give you up)",
  "(Ooh, give you up)",
  "Never gonna give, never gonna give",
  "(Give you up)",
  "Never gonna give, never gonna give",
  "(Give you up)",
  "We've known each other for so long",
  "Your heart's been aching, but",
  "You're too shy to say it",
  "Inside, we both know what's been going on",
  "We know the game and we're gonna play it",
  "I just wanna tell you how I'm feeling",
  "Gotta make you understand",
  "Never gonna give you up",
  "Never gonna let you down",
  "Never gonna run around and desert you",
  "Never gonna make you cry",
  "Never gonna say goodbye",
  "Never gonna tell a lie and hurt you",
  "Never gonna give you up",
  "Never gonna let you down",
  "Never gonna run around and desert you",
  "Never gonna make you cry",
  "Never gonna say goodbye",
  "Never gonna tell a lie and hurt you",
  "Never gonna give you up",
  "Never gonna let you down",
  "Never gonna run around and desert you",
  "Never gonna make you cry",
  "Never gonna say goodbye",
  "Never gonna tell a lie and hurt you",
  "Karaoke night over"
];

const currentLine = JSON.parse(window.localStorage.getItem("line"));

if (currentLine === null) {
  window.localStorage.setItem("line", "0");
} else if (currentLine >= 62) {
  window.localStorage.setItem("line", "62");
} else {
  window.localStorage.setItem("line", JSON.stringify(currentLine + 1));
}

document.getElementById("tagline").innerHTML =
  lyrics[JSON.parse(window.localStorage.getItem("line"))];
