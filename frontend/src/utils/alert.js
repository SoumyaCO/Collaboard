export function showAlert(message) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert";
  alertDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.style.display='none'" class="close-button">&times;</button>
    `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.style.display = "none";
  }, 1500);
}
