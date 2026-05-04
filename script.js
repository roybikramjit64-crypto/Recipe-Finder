const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

searchBtn.addEventListener("click", searchMeals);
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchMeals();
});

async function searchMeals() {
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        mealsContainer.innerHTML = "";
        resultHeading.textContent = "";
        errorContainer.textContent = "Please enter a search term";
        errorContainer.classList.remove("hidden");
        return;
    }

    try {
        resultHeading.textContent = `Searching for "${searchTerm}"...`;
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden");

        const response =  await fetch(`${SEARCH_URL}${searchTerm}`);
        const data = await response.json();
        console.log("data is here: ", data);
        if (data.meals === null) {
            resultHeading.textContent =``;
            mealsContainer.innerHTML = "";
            errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term!`;
            errorContainer.classList.remove("hidden");
        } else {
            resultHeading.textContent = `Search results for "${searchTerm}":`;
            displayMeals(data.meals);
            
        }
        searchInput.value = "";
    } catch (error) {
        errorContainer.textContent = "Something went wrong. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}

function displayMeals(meals) {
    mealsContainer.innerHTML = "";
    
    //loop through meals and create a card for each meal
    meals.forEach((meal) => {
        mealsContainer.innerHTML += `
            <div class="meal" data-meal-id="${meal.idMeal}">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="meal-info">
                    <h3 class="meal-title">${meal.strMeal}</h3>
                    ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
                </div>
            </div>
        `;
    });
}

async function handleMealClick(e) {
    const mealEl = e.target.closest(".meal");

    if (!mealEl) return;

    const mealId = mealEl.getAttribute("data-meal-id");

    try {
        const response = await fetch(`${LOOKUP_URL}${mealId}`);
        const data = await response.json();

        console.log(data);

        if (data.meals && data.meals[0]) {
            const meal = data.meals[0];

            const ingredients = [];

            for (let i = 1; i<=20; i++) {
                if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
                    ingredients.push({
                        ingredient: meal[`strIngredient${i}`],
                        measure: meal[`strMeasure${i}`]
                    });
                }
            }
        

            mealDetailsContent.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
                <h2 class="meal-details-title">${meal.strMeal}</h2>
                <div class="meal-details-category">
                    <span>${meal.strCategory || "Uncategorized"}</span>
                </div>
                <div class="meal-details-instructions">
                    <h3>Instructions</h3>
                    <p>${meal.strInstructions}</p>
                </div>
                <div class="meal-details-ingredients">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredients.map((item) =>`
                            <li><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="check-icon"><path fill="currentColor" d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-464a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm70.7 121.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"/></svg> ${item.measure} ${item.ingredient}</li>
                        `).join("")}
                    </ul>
                </div>
                ${
                    meal.strYoutube
                    ? `
                    <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="youtube-icon"><path fill="currentColor" d="M549.7 124.1C543.5 100.4 524.9 81.8 501.4 75.5 458.9 64 288.1 64 288.1 64S117.3 64 74.7 75.5C51.2 81.8 32.7 100.4 26.4 124.1 15 167 15 256.4 15 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8 42.6 11.5 213.4 11.5 213.4 11.5s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6l0-162.4 142.7 81.2-142.7 81.2z"/></svg> Watch Video
                    </a>   
                    `
                        : ""
                }
            `;

            mealDetails.classList.remove("hidden");
            mealDetails.scrollIntoView({ behavior: "smooth"});
        }

    } catch (error) {
        errorContainer.textContent = "Could not load recipe details. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}