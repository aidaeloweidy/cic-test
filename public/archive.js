window.addEventListener("load", () => {
  fetch("/messages")
    .then((res) => res.json())
    .then((messages) => {
      const container = document.getElementById("archive-container");

      messages.forEach((msg) => {
        const div = document.createElement("div");
        div.className = "message";
        div.textContent = msg.text;
        container.appendChild(div);
      });
      container.scrollTop = container.scrollHeight;
    })
    .catch((err) => {
      console.error("Error loading archive:", err);
    });
});

// Function to handle socket updates for the archive
const socket = io("http://localhost:8080");

socket.on("updateArchive", (entry) => {
  const container = document.getElementById("archive-container");

  // Create a new div for the new message and add it to the archive container
  const newMessageDiv = document.createElement("div");
  newMessageDiv.className = "message";
  newMessageDiv.textContent = entry.text;

  container.appendChild(newMessageDiv);
  container.scrollTop = container.scrollHeight;
});


// function scrollToBottom() {
//   const container = document.getElementById('archive-container');
//   container.scrollTop = container.scrollHeight;
// }

//scrollToBottom();