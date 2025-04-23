
window.addEventListener("load", () => {
    fetch("/messages")
      .then((res) => res.json())
      .then((messages) => {
        const container = document.getElementById("archive-container");
  
        messages.forEach((msg) => {
          const div = document.createElement("div");
          div.className = "message";
          div.textContent = msg.text;
          //const time = new Date(msg.timestamp).toLocaleString();
          //div.innerHTML = `<strong>${time}</strong><br>${msg.text}`;
          container.appendChild(div);
        });
      })
      .catch((err) => {
        console.error("Error loading archive:", err);
      });
  });