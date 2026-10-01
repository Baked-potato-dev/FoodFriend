window.isUserLoggedIn = function () {
  return (
    localStorage.getItem("foodfriend_logged_in") === "true" &&
    !!localStorage.getItem("foodfriend_user_id")
  );
};

window.requireLogin = function () {
  if (!window.isUserLoggedIn()) {
    window.location.href = "account.html";
    return false;
  }
  return true;
};
