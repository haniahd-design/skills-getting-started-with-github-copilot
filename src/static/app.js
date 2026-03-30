document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        let participantsList = "";
        if (details.participants.length > 0) {
          participantsList = details.participants.map(participant => `
            <li class="participant-item">
              <span class="participant-email">${participant}</span>
              <button class="delete-participant-btn" title="Remove participant" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(participant)}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#c62828" d="M7.05 19q-.625 0-1.062-.438Q5.55 18.125 5.55 17.5V7.5h-.8q-.325 0-.537-.213Q4 7.075 4 6.75q0-.325.213-.537Q4.425 6 4.75 6h4.05V5.25q0-.325.213-.537Q9.225 4.5 9.55 4.5h4.9q.325 0 .537.213.213.212.213.537V6h4.05q.325 0 .537.213.213.212.213.537 0 .325-.213.537-.212.213-.537.213h-.8v10q0 .625-.438 1.062Q17.575 19 16.95 19Zm0-1.5h9.9V7.5H7.05ZM9.55 6h4.9V5.25h-4.9ZM9.55 17.5q.325 0 .537-.213.213-.212.213-.537V9.25q0-.325-.213-.537-.212-.213-.537-.213-.325 0-.537.213-.213.212-.213.537v7.5q0 .325.213.537.212.213.537.213Zm4.9 0q.325 0 .537-.213.213-.212.213-.537V9.25q0-.325-.213-.537-.212-.213-.537-.213-.325 0-.537.213-.213.212-.213.537v7.5q0 .325.213.537.212.213.537.213Z"/></svg>
              </button>
            </li>
          `).join("");
        } else {
          participantsList = '<li class="participant-item"><em>No participants yet</em></li>';
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            <ul class="participants-list">
              ${participantsList}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete buttons
      document.querySelectorAll(".delete-participant-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const activity = decodeURIComponent(btn.getAttribute("data-activity"));
          const email = decodeURIComponent(btn.getAttribute("data-email"));
          if (!confirm(`Remove ${email} from ${activity}?`)) return;
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, {
              method: "DELETE"
            });
            const result = await response.json();
            if (response.ok) {
              fetchActivities();
              messageDiv.textContent = result.message;
              messageDiv.className = "success";
            } else {
              messageDiv.textContent = result.detail || "Failed to remove participant.";
              messageDiv.className = "error";
            }
            messageDiv.classList.remove("hidden");
            setTimeout(() => messageDiv.classList.add("hidden"), 5000);
          } catch (error) {
            messageDiv.textContent = "Error removing participant.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
            setTimeout(() => messageDiv.classList.add("hidden"), 5000);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
