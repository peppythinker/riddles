document.querySelectorAll(".reveal-btn").forEach(button => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;

    if (answer.classList.contains("hidden")) {
      answer.classList.remove("hidden");
      button.textContent = "Hide Answer";
    } else {
      answer.classList.add("hidden");
      button.textContent = "Show Answer";
    }
  });
});
