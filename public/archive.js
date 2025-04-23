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
});

// // Optional: Refresh every 30 seconds (to fetch any updates missed)
// function fetchData() {
//   fetch('/messages')
//     .then(response => response.json())
//     .then(data => {
//       const archiveContainer = document.getElementById('archive-container');
//       archiveContainer.innerHTML = ''; // Clear current messages

//       data.forEach(item => {
//         const messageElement = document.createElement('div');
//         messageElement.textContent = item.text;
//         archiveContainer.appendChild(messageElement);
//       });
//     })
//     .catch(err => console.error('Error fetching data:', err));
// }

function fetchData() {
  console.log("Fetching data..."); // Debug log to check if polling happens
  fetch('http://localhost:8080/messages') // Make sure the URL matches your server's URL
    .then(response => response.json())
    .then(data => {
      console.log("Received data:", data); // Debug log to check the received data
      const archiveContainer = document.getElementById('archive-container');
      archiveContainer.innerHTML = ''; // Clear the container before adding new data

      data.forEach(item => {
        const messageElement = document.createElement('div');
        messageElement.textContent = item.text;
        archiveContainer.appendChild(messageElement);
      });
    })
    .catch(err => console.error('Error fetching data:', err));
}

// Refresh every 30 seconds
setInterval(fetchData, 5000);

// Initial fetch to load data immediately on page load
fetchData();
